/**
 * Пережимает локальные картинки под реальный размер отрисовки.
 * Идемпотентный: сравнивает с исходником и просто перезаписывает результат.
 *
 * Запуск: node scripts/optimize-assets.mjs
 */
import sharp from 'sharp'
import fs from 'fs'

const kb = (n) => (n / 1024).toFixed(1) + ' KB'

/* [исходник, результат, ширина, качество, «зачем»] */
const JOBS = [
  // Шапка: отрисовывается высотой 56px (32px на мобильном) — 2489px было в 12 раз больше
  ['src/assets/logo.png', 'src/assets/logo.webp', 480, 90, 'логотип в шапке'],
  // Фото в «О себе»: рамка ~434x578, берём с запасом под retina
  ['src/assets/photo.jpg', 'src/assets/photo.webp', 880, 80, 'фото в «О себе»'],
  // Сплэш перед загрузкой — виден меньше секунды, качество можно снизить
  ['public/splash/splash-desktop.png', 'public/splash/splash-desktop.webp', 1920, 72, 'сплэш десктоп'],
  ['public/splash/splash-mobile.png',  'public/splash/splash-mobile.webp',  1080, 72, 'сплэш мобильный'],
]

let before = 0, after = 0

for (const [src, out, width, quality, why] of JOBS) {
  if (!fs.existsSync(src)) { console.warn(`! нет исходника: ${src}`); continue }
  const inSize = fs.statSync(src).size
  const meta   = await sharp(src).metadata()

  await sharp(src)
    .resize({ width: Math.min(meta.width, width), withoutEnlargement: true })
    .webp({ quality })
    .toFile(out)

  const outSize = fs.statSync(out).size
  before += inSize
  after  += outSize
  console.log(
    `✓ ${why}\n    ${src}  ${meta.width}px ${kb(inSize)}` +
    `  →  ${out}  ${Math.min(meta.width, width)}px ${kb(outSize)}` +
    `  (−${(100 - (outSize / inSize) * 100).toFixed(0)}%)`
  )
}

/* PWA-иконка и og:image остаются PNG — соцсети и манифест ждут именно его,
   но 1024px избыточны: манифест объявляет 512. */
const ICON = 'public/logo.png'
if (fs.existsSync(ICON)) {
  const inSize = fs.statSync(ICON).size
  const buf = await sharp(ICON)
    .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()
  fs.writeFileSync(ICON, buf)
  before += inSize
  after  += buf.length
  console.log(
    `✓ PWA-иконка и og:image\n    ${ICON}  1024px ${kb(inSize)}  →  512px ${kb(buf.length)}` +
    `  (−${(100 - (buf.length / inSize) * 100).toFixed(0)}%)`
  )
}

console.log('─'.repeat(58))
console.log(`Итого: ${kb(before)} → ${kb(after)}  (−${(100 - (after / before) * 100).toFixed(0)}%)`)
