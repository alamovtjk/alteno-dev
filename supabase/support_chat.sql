-- Чат поддержки: один приватный диалог "подписчик ⇄ Самир" на каждого
-- подписчика. Живёт 24 часа — чистит VPS-бот по крону, тут только структура
-- и права. Выполнять после security.sql и subscribers.sql.

create table if not exists support_messages (
  id                  bigint generated always as identity primary key,
  subscriber_user_id  uuid not null references auth.users(id) on delete cascade,
  sender              text not null check (sender in ('subscriber', 'admin')),
  text                text not null,
  notified_at         timestamptz,
  created_at          timestamptz default now()
);

alter table support_messages enable row level security;

-- Подписчик видит и пишет только в свой диалог; админ видит и пишет во все.
create policy "own or admin read support_messages" on support_messages
  for select to authenticated
  using (subscriber_user_id = auth.uid() or is_admin(auth.uid()));

create policy "own or admin write support_messages" on support_messages
  for insert to authenticated
  with check (
    (subscriber_user_id = auth.uid() and sender = 'subscriber')
    or (is_admin(auth.uid()) and sender = 'admin')
  );

-- Удаление — только сервисным ключом с VPS (автоочистка), обычным
-- пользователям (в т.ч. админу через интерфейс) удалять не из чего: строки
-- сами исчезают через 24 часа.
