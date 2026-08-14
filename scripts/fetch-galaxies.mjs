/**
 * Тянет снимки галактик из открытого архива NASA и готовит их под фон.
 *
 * Изображения NASA — общественное достояние, использовать можно свободно.
 * На сайте они выводятся с mix-blend-mode: screen, поэтому чёрный фон кадра
 * исчезает сам и вырезать его не нужно.
 *
 * Запуск: node scripts/fetch-galaxies.mjs
 */
import sharp from 'sharp'
import fs from 'fs'

const OUT  = 'public/space'
const SIZE = 300          // на экране галактика не больше ~240px
const Q    = 78

const WANT = [
  { file: 'galaxy-1.webp', nasaId: 'PIA04629',                        note: 'Messier 83' },
  { file: 'galaxy-2.webp', nasaId: 'PIA10200',                        note: 'Whirlpool M51' },
  { file: 'galaxy-3.webp', nasaId: 'PIA15630',                        note: 'Pinwheel M101' },
  { file: 'galaxy-4.webp', nasaId: 'GSFC_20171208_Archive_e002154',   note: 'Barred spiral' },
]

fs.mkdirSync(OUT, { recursive: true })

for (const item of WANT) {
  const meta = await (await fetch(`https://images-api.nasa.gov/asset/${item.nasaId}`)).json()
  const urls = (meta.collection?.items || []).map(i => i.href)
  const src  = urls.find(u => /~medium\.jpg$/.test(u)) || urls.find(u => /~small\.jpg$/.test(u))
  if (!src) { console.error(`✗ ${item.note}: не нашёл файл`); continue }

  const buf = Buffer.from(await (await fetch(src.replace(/^http:/, 'https:'))).arrayBuffer())
  const m   = await sharp(buf).metadata()

  /* Кадрируем по центру квадратом — галактика почти всегда в середине кадра */
  const side = Math.min(m.width, m.height)
  const out  = await sharp(buf)
    .extract({
      left: Math.round((m.width  - side) / 2),
      top:  Math.round((m.height - side) / 2),
      width: side, height: side,
    })
    .resize(SIZE, SIZE)
    .webp({ quality: Q })
    .toBuffer()

  fs.writeFileSync(`${OUT}/${item.file}`, out)
  console.log(
    `✓ ${item.note.padEnd(16)} ${m.width}x${m.height} → ${SIZE}px, ` +
    `${(out.length / 1024).toFixed(1)} KB  (${item.file})`
  )
}

const total = fs.readdirSync(OUT).reduce((s, f) => s + fs.statSync(`${OUT}/${f}`).size, 0)
console.log('─'.repeat(52))
console.log(`итого: ${(total / 1024).toFixed(1)} KB`)
