-- ═══════════════════════════════════════════════════════════════
-- ЗАКРЫТИЕ ДЫР, НАЙДЕННЫХ ПРИ АУДИТЕ 18.08.2026
--
-- Выполнять ПОСЛЕ security.sql, team_panel.sql, analytics.sql.
-- Проверено на живой базе: до этого файла обычный подписчик
-- (не админ, не член команды) мог одним POST-запросом опубликовать
-- запись в портфолио сразу со статусом approved — она немедленно
-- появлялась на публичном сайте.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Публикация в обход модерации (критично) ──
-- Было: "member manage own portfolio" for all using (owner_user_id = auth.uid())
--   • без проверки, что человек вообще член команды — подходил любой
--     зарегистрированный пользователь, включая подписчика курсов;
--   • status по умолчанию 'approved', а триггер стоял только на UPDATE,
--     поэтому INSERT проезжал модерацию целиком.

-- Триггер теперь и на вставку тоже. При INSERT OLD не существует,
-- поэтому не-админу принудительно ставим 'pending'.
create or replace function guard_moderation_status()
returns trigger
language plpgsql
as $$
begin
  if is_admin(auth.uid()) then
    return NEW;
  end if;
  if TG_OP = 'INSERT' then
    NEW.status := 'pending';
  elsif NEW.status = 'approved' then
    NEW.status := OLD.status;
  end if;
  return NEW;
end;
$$;

drop trigger if exists team_guard_status on team;
create trigger team_guard_status
  before insert or update on team
  for each row execute function guard_moderation_status();

drop trigger if exists portfolio_guard_status on portfolio;
create trigger portfolio_guard_status
  before insert or update on portfolio
  for each row execute function guard_moderation_status();

-- Писать может только тот, у кого реально есть карточка в команде.
drop policy if exists "member update own team" on team;
create policy "member update own team" on team for update to authenticated
  using  (owner_user_id = auth.uid() and is_team_member(auth.uid()))
  with check (owner_user_id = auth.uid() and is_team_member(auth.uid()));

drop policy if exists "member manage own portfolio" on portfolio;
create policy "member manage own portfolio" on portfolio for all to authenticated
  using  (owner_user_id = auth.uid() and is_team_member(auth.uid()))
  with check (owner_user_id = auth.uid() and is_team_member(auth.uid()));

-- ── 2. Аналитика была открыта всем вошедшим (высокий риск) ──
-- Было: to authenticated using (true) на SELECT и DELETE — любой
-- подписчик мог выгрузить всю историю посещений и удалить её целиком
-- одним запросом. Приложению удаление не нужно вообще.
drop policy if exists "auth read page_views"   on page_views;
drop policy if exists "auth delete page_views" on page_views;
create policy "admin read page_views" on page_views
  for select to authenticated using (is_admin(auth.uid()));

-- ── 3. Загрузка файлов членами команды (functional bug) ──
-- security.sql разрешал заливать в media только админу, но /panel даёт
-- команде менять аватар и картинки проектов — эти загрузки молча падали.
drop policy if exists "admin upload media" on storage.objects;
drop policy if exists "admin update media" on storage.objects;
create policy "staff upload media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (is_admin(auth.uid()) or is_team_member(auth.uid())));
create policy "staff update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (is_admin(auth.uid()) or is_team_member(auth.uid())));
-- Удаление файлов оставляем только админу (см. security.sql).

-- ── 4. Чат поддержки могли открыть не-подписчики (средний риск) ──
drop policy if exists "own or admin write support_messages" on support_messages;
create policy "own or admin write support_messages" on support_messages
  for insert to authenticated
  with check (
    (subscriber_user_id = auth.uid() and sender = 'subscriber'
       and exists (select 1 from subscribers s where s.user_id = auth.uid()))
    or (is_admin(auth.uid()) and sender = 'admin')
  );

-- ── 5. Email команды и служебные поля утекали анонимам ──
-- Публичный сайт читает team через select('*'), поэтому анонимам
-- уезжали email, owner_user_id и черновики pending_data. Отдаём
-- наружу только то, что реально показывается на /team.
create or replace view team_public as
  select id, name, role, initials, blob, skills, num, avatar_url,
         portfolio_url, order_index
  from team
  where status = 'approved';

grant select on team_public to anon, authenticated;
