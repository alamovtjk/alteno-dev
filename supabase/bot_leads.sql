-- Список всех, кто хоть раз нажал /start в Telegram-боте — нужен, чтобы
-- рассылать новые видео/посты из канала с материалами (см. telegram-bot.js
-- на VPS). Пишет туда только бот сервисным ключом, RLS открывает только
-- чтение админу — по аналогии с subscribers.sql.
-- Выполнять ПОСЛЕ security.sql — нужна функция is_admin().

create table if not exists bot_leads (
  telegram_user_id bigint primary key,
  chat_id           bigint not null,
  username          text,
  first_name        text,
  created_at        timestamptz default now()
);

alter table bot_leads enable row level security;

create policy "admin read bot_leads" on bot_leads
  for select to authenticated
  using (is_admin(auth.uid()));
