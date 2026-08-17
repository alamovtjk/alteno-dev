-- Подписчики платных видео-уроков.
-- Выполнять ПОСЛЕ security.sql — нужна функция is_admin(), которую он создаёт.

create table if not exists subscribers (
  id                bigint generated always as identity primary key,
  user_id           uuid unique references auth.users(id) on delete cascade,
  full_name         text,
  telegram_user_id  bigint,
  telegram_username text,
  plan              text default 'monthly',
  status            text default 'pending', -- pending | active | expired | cancelled
  started_at        timestamptz,
  expires_at        timestamptz,
  created_at        timestamptz default now()
);

alter table subscribers enable row level security;

-- Своя строка — себе, все строки — админу. Без публичного чтения:
-- в отличие от portfolio/team, это платёжные/контактные данные людей,
-- у сайта нет причины отдавать их анонимам.
create policy "self or admin read subscribers" on subscribers
  for select to authenticated
  using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "admin write subscribers" on subscribers
  for all to authenticated
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
