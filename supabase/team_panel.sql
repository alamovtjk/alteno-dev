-- Личная панель команды: свои карточки/проекты, публикация только после
-- одобрения Самира. Выполнять ПОСЛЕ security.sql (нужна функция is_admin()).

-- ── Кто чем владеет + статус модерации ──
alter table team      add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
alter table team      add column if not exists status text not null default 'approved'; -- pending | approved | rejected
alter table team      add column if not exists pending_data jsonb;
alter table team      add column if not exists has_pending_edit boolean not null default false;
alter table team      add column if not exists notified_at timestamptz;

alter table portfolio add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
alter table portfolio add column if not exists status text not null default 'approved';
alter table portfolio add column if not exists pending_data jsonb;
alter table portfolio add column if not exists has_pending_edit boolean not null default false;
alter table portfolio add column if not exists notified_at timestamptz;

-- "Член команды" = у него есть своя карточка в team
create or replace function is_team_member(uid uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists(select 1 from team where owner_user_id = uid)
$$;

-- Заслон от самоодобрения: не-админ не может сам выставить себе
-- status='approved' (даже в обход интерфейса /panel, напрямую через API).
-- Остальные переходы (например, отправить отклонённую карточку повторно
-- на проверку — 'rejected' → 'pending') разрешены, это его собственная
-- строка и он не пытается опубликовать её без проверки.
create or replace function guard_moderation_status()
returns trigger
language plpgsql
as $$
begin
  if not is_admin(auth.uid()) and NEW.status = 'approved' then
    NEW.status := OLD.status;
  end if;
  return NEW;
end;
$$;

drop trigger if exists team_guard_status on team;
create trigger team_guard_status
  before update on team
  for each row execute function guard_moderation_status();

drop trigger if exists portfolio_guard_status on portfolio;
create trigger portfolio_guard_status
  before update on portfolio
  for each row execute function guard_moderation_status();

-- ── Чтение: публично видно только approved; админ и члены команды видят всё ──
drop policy if exists "public read team" on team;
create policy "read team" on team for select
  using (status = 'approved' or is_admin(auth.uid()) or is_team_member(auth.uid()));

drop policy if exists "public read portfolio" on portfolio;
create policy "read portfolio" on portfolio for select
  using (status = 'approved' or is_admin(auth.uid()) or is_team_member(auth.uid()));

-- ── Запись: админ — без ограничений (как в security.sql, переустанавливаем
--    на случай другого порядка выполнения файлов) ──
drop policy if exists "admin write team" on team;
create policy "admin write team" on team for all to authenticated
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

drop policy if exists "admin write portfolio" on portfolio;
create policy "admin write portfolio" on portfolio for all to authenticated
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- ── Запись: член команды — только свою строку ──
drop policy if exists "member update own team" on team;
create policy "member update own team" on team for update to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists "member manage own portfolio" on portfolio;
create policy "member manage own portfolio" on portfolio for all to authenticated
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
