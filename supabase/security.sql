-- ═══════════════════════════════════════════════════════════════
-- ЗАКРЫТИЕ ЗАПИСИ ДЛЯ АНОНИМОВ + ВВЕДЕНИЕ РОЛИ "АДМИН"
--
-- Сейчас политики разрешают "for all using (true)" — то есть любой,
-- кто взял публичный ключ из JS-бандла сайта, может создавать,
-- менять и удалять записи и файлы. Проверено: аноним создал и
-- удалил строку в portfolio и залил файл в storage.
--
-- Первая версия этого файла закрывала запись на "любой вошедший через
-- Supabase Auth" — этого хватало, пока Auth-пользователь мог быть только
-- один: сам админ. С появлением студенческих аккаунтов (см.
-- subscribers.sql) это перестаёт быть верным: студент, вошедший на
-- /account, — тоже "authenticated" пользователь Supabase, и без правки
-- ниже он мог бы писать в portfolio/team/testimonials/settings/music
-- наравне с админом. Поэтому вместо "to authenticated" везде используется
-- is_admin(auth.uid()) — таблица admins явно перечисляет, кто админ.
--
-- ВАЖНО: выполнять только ПОСЛЕ того, как в админке появится вход
-- через Supabase Auth. Иначе админка перестанет сохранять —
-- она пишет тем же анонимным ключом.
-- ═══════════════════════════════════════════════════════════════

-- ── Роль "админ" ──
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email   text
);
alter table admins enable row level security;

-- Функция должна существовать раньше политик, которые её вызывают.
create or replace function is_admin(uid uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists(select 1 from admins where user_id = uid)
$$;

drop policy if exists "admin read admins" on admins;
create policy "admin read admins" on admins for select to authenticated
  using (is_admin(auth.uid()));

-- Единственный на сегодня админ — текущий логин в /admin
insert into admins (user_id, email)
select id, email from auth.users where email = 'alamovsamir4@gmail.com'
on conflict (user_id) do nothing;

-- ── Таблицы: читать может любой, писать — только админ ──
drop policy if exists "public write portfolio"    on portfolio;
drop policy if exists "public write team"         on team;
drop policy if exists "public write testimonials" on testimonials;
drop policy if exists "public write settings"     on settings;
drop policy if exists "public write music"        on music;
drop policy if exists "auth write portfolio"      on portfolio;
drop policy if exists "auth write team"           on team;
drop policy if exists "auth write testimonials"   on testimonials;
drop policy if exists "auth write settings"       on settings;
drop policy if exists "auth write music"          on music;

create policy "admin write portfolio"    on portfolio
  for all to authenticated using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin write team"         on team
  for all to authenticated using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin write testimonials" on testimonials
  for all to authenticated using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin write settings"     on settings
  for all to authenticated using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "admin write music"        on music
  for all to authenticated using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- ── Хранилище: скачивать может любой, заливать и удалять — только админ ──
drop policy if exists "public upload media" on storage.objects;
drop policy if exists "public update media" on storage.objects;
drop policy if exists "public delete media" on storage.objects;
drop policy if exists "auth upload media"   on storage.objects;
drop policy if exists "auth update media"   on storage.objects;
drop policy if exists "auth delete media"   on storage.objects;

create policy "admin upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and is_admin(auth.uid()));
create policy "admin update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and is_admin(auth.uid()));
create policy "admin delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and is_admin(auth.uid()));

-- Политики чтения ("public read ...") намеренно оставлены:
-- публичный сайт обязан читать эти таблицы и картинки.
