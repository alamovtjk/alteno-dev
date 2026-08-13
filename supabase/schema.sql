-- AlTeNo Dev — схема для нового Supabase-проекта
-- Выполнить целиком в Supabase Dashboard → SQL Editor → New query → Run

create table if not exists portfolio (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  tags text[] default '{}',
  image_url text,
  link text,
  order_index int default 0,
  created_at timestamptz default now()
);

create table if not exists team (
  id bigint generated always as identity primary key,
  name text not null,
  role text not null,
  initials text,
  blob text default '#7c3aed',
  skills text[] default '{}',
  num text,
  avatar_url text,
  email text,
  portfolio_url text,
  order_index int default 0,
  created_at timestamptz default now()
);

create table if not exists testimonials (
  id bigint generated always as identity primary key,
  name text not null,
  company text,
  text text not null,
  avatar_url text,
  order_index int default 0,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value text
);

create table if not exists music (
  id bigint generated always as identity primary key,
  title text,
  artist text,
  file_url text,
  active boolean default false,
  created_at timestamptz default now()
);

-- RLS: сайт пишет напрямую anon-ключом (доступ в /admin закрыт только паролем
-- на клиенте, не политиками БД) — включаем те же публичные политики, что были
-- на старом проекте, чтобы сайт продолжил работать как раньше.
alter table portfolio     enable row level security;
alter table team          enable row level security;
alter table testimonials  enable row level security;
alter table settings      enable row level security;
alter table music         enable row level security;

create policy "public read portfolio"  on portfolio     for select using (true);
create policy "public write portfolio" on portfolio     for all    using (true) with check (true);

create policy "public read team"       on team          for select using (true);
create policy "public write team"      on team          for all    using (true) with check (true);

create policy "public read testimonials"  on testimonials for select using (true);
create policy "public write testimonials" on testimonials for all    using (true) with check (true);

create policy "public read settings"   on settings      for select using (true);
create policy "public write settings"  on settings      for all    using (true) with check (true);

create policy "public read music"      on music         for select using (true);
create policy "public write music"     on music         for all    using (true) with check (true);

-- Storage: бакет "media" — сюда льются скриншоты портфолио, фото команды, mp3
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media"   on storage.objects for select using (bucket_id = 'media');
create policy "public upload media" on storage.objects for insert with check (bucket_id = 'media');
create policy "public update media" on storage.objects for update using (bucket_id = 'media');
create policy "public delete media" on storage.objects for delete using (bucket_id = 'media');
