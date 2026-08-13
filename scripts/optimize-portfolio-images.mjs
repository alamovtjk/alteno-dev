/**
 * Пережимает картинки кейсов в Supabase Storage: ресайз под реальный
 * размер отрисовки, webp вместо png/jpeg и годовой Cache-Control
 * (по умолчанию бакет отдаёт no-cache — браузер качал их каждый заход).
 *
 * Запуск: node scripts/optimize-portfolio-images.mjs
 */
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fs from 'fs'

/* Ключи берём из окружения или из .env.local — в репозитории их нет */
function envFromLocal() {
  const out = {}
  if (!fs.existsSync('.env.local')) return out
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}
const env = { ...envFromLocal(), ...process.env }
const URL = env.VITE_SUPABASE_URL
const KEY = env.VITE_SUPABASE_ANON_KEY
if (!URL || !KEY) {
  console.error('Нужны VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (окружение или .env.local)')
  process.exit(1)
}
const supabase = createClient(URL, KEY)

const BUCKET    = 'media'
const MAX_WIDTH = 1280          // hero на детальной странице шире не бывает
const QUALITY   = 78
const CACHE     = '31536000'    // 1 год — имя файла меняется при каждой перезаливке

const storagePathOf = (publicUrl) => {
  const marker = `/object/public/${BUCKET}/`
  const i = publicUrl.indexOf(marker)
  return i === -1 ? null : publicUrl.slice(i + marker.length)
}

const { data: rows, error } = await supabase
  .from('portfolio').select('id, title, image_url').order('order_index')
if (error) { console.error('Не читается portfolio:', error.message); process.exit(1) }

let before = 0, after = 0

for (const row of rows) {
  if (!row.image_url) { console.log(`— ${row.title}: без картинки, пропуск`); continue }
  if (row.image_url.endsWith('.webp')) { console.log(`— ${row.title}: уже webp, пропуск`); continue }

  const oldPath = storagePathOf(row.image_url)
  if (!oldPath) { console.warn(`! ${row.title}: не разобрал путь, пропуск`); continue }

  const res = await fetch(row.image_url)
  if (!res.ok) { console.warn(`! ${row.title}: не скачалась (${res.status})`); continue }
  const input = Buffer.from(await res.arrayBuffer())

  const meta = await sharp(input).metadata()
  const out  = await sharp(input)
    .resize({ width: Math.min(meta.width, MAX_WIDTH), withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer()

  const newPath = `portfolio/${row.id}_${Date.now()}.webp`
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(newPath, out, { contentType: 'image/webp', cacheControl: CACHE, upsert: true })
  if (upErr) { console.error(`✗ ${row.title}: заливка — ${upErr.message}`); continue }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(newPath)
  const { error: dbErr } = await supabase
    .from('portfolio').update({ image_url: pub.publicUrl }).eq('id', row.id)
  if (dbErr) { console.error(`✗ ${row.title}: запись в БД — ${dbErr.message}`); continue }

  await supabase.storage.from(BUCKET).remove([oldPath])

  before += input.length
  after  += out.length
  const pct = (100 - (out.length / input.length) * 100).toFixed(0)
  console.log(
    `✓ ${row.title}: ${(input.length / 1024).toFixed(0)} KB → ` +
    `${(out.length / 1024).toFixed(0)} KB  (−${pct}%)  ${meta.width}px → ${Math.min(meta.width, MAX_WIDTH)}px`
  )
}

if (before) {
  console.log('─'.repeat(52))
  console.log(
    `Итого: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB ` +
    `(−${(100 - (after / before) * 100).toFixed(0)}%), Cache-Control ${CACHE}s`
  )
}
