-- Аналитика посещений — выполнить в Supabase Dashboard → SQL Editor → New query → Run
--
-- Одна таблица: каждая загрузка страницы пишет сюда строку анонимно.
-- Аноним может только ВСТАВЛЯТЬ (INSERT) — читать список посещений может
-- только вошедший в /admin (тот же принцип, что и в security.sql: анон-ключ
-- лежит в JS-бандле сайта, поэтому у него не должно быть прав на чтение).
-- "Сейчас на сайте" считается отдельно, через Supabase Realtime Presence —
-- эфемерные данные, без таблицы и без записи на диск.

create table if not exists page_views (
  id bigint generated always as identity primary key,
  path text not null,
  visitor_id text not null,
  created_at timestamptz default now()
);

create index if not exists page_views_created_at_idx on page_views (created_at desc);

alter table page_views enable row level security;

create policy "anon insert page_views" on page_views
  for insert to anon with check (true);

create policy "auth read page_views" on page_views
  for select to authenticated using (true);

create policy "auth delete page_views" on page_views
  for delete to authenticated using (true);
