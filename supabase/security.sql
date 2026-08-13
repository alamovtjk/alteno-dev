-- ═══════════════════════════════════════════════════════════════
-- ЗАКРЫТИЕ ЗАПИСИ ДЛЯ АНОНИМОВ
--
-- Сейчас политики разрешают "for all using (true)" — то есть любой,
-- кто взял публичный ключ из JS-бандла сайта, может создавать,
-- менять и удалять записи и файлы. Проверено: аноним создал и
-- удалил строку в portfolio и залил файл в storage.
--
-- ВАЖНО: выполнять только ПОСЛЕ того, как в админке появится вход
-- через Supabase Auth. Иначе админка перестанет сохранять —
-- она пишет тем же анонимным ключом.
-- ═══════════════════════════════════════════════════════════════

-- ── Таблицы: читать может любой, писать — только вошедший ──
drop policy if exists "public write portfolio"    on portfolio;
drop policy if exists "public write team"         on team;
drop policy if exists "public write testimonials" on testimonials;
drop policy if exists "public write settings"     on settings;
drop policy if exists "public write music"        on music;

create policy "auth write portfolio"    on portfolio
  for all to authenticated using (true) with check (true);
create policy "auth write team"         on team
  for all to authenticated using (true) with check (true);
create policy "auth write testimonials" on testimonials
  for all to authenticated using (true) with check (true);
create policy "auth write settings"     on settings
  for all to authenticated using (true) with check (true);
create policy "auth write music"        on music
  for all to authenticated using (true) with check (true);

-- ── Хранилище: скачивать может любой, заливать и удалять — только вошедший ──
drop policy if exists "public upload media" on storage.objects;
drop policy if exists "public update media" on storage.objects;
drop policy if exists "public delete media" on storage.objects;

create policy "auth upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "auth update media" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "auth delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- Политики чтения ("public read ...") намеренно оставлены:
-- публичный сайт обязан читать эти таблицы и картинки.
