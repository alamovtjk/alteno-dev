/**
 * Скриншоты приложения сняты 9:16, а экран iPhone выше. Вместо размытой
 * подложки достраиваем сверху полосу цветом самого кадра — там окажется
 * статус-бар, и переход остаётся незаметным.
 *
 * Запуск: node scripts/pad-app-screens.mjs
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const DIR    = 'public/apps/rneft'
const TARGET = 240 / 467     // пропорция экрана в макете
const SAMPLE = 6             // сколько верхних строк усредняем

const files = fs.readdirSync(DIR).filter(f => /^0\d\.webp$/.test(f)).sort()
if (!files.length) { console.error('Не нашёл исходники 0N.webp в ' + DIR); process.exit(1) }

for (const [i, file] of files.entries()) {
  const src  = path.join(DIR, file)
  const meta = await sharp(src).metadata()

  const stats = await sharp(src)
    .extract({ left: 0, top: 0, width: meta.width, height: SAMPLE })
    .stats()
  const [r, g, b] = stats.channels.map(c => Math.round(c.mean))

  const targetH = Math.round(meta.width / TARGET)
  const padTop  = targetH - meta.height
  if (padTop <= 0) { console.log(`— ${file}: достраивать нечего`); continue }

  const out = path.join(DIR, `screen-${i + 1}.webp`)
  await sharp(src)
    .extend({ top: padTop, bottom: 0, left: 0, right: 0, background: { r, g, b } })
    .webp({ quality: 84 })
    .toFile(out)

  const kb = (fs.statSync(out).size / 1024).toFixed(1)
  console.log(
    `✓ ${file} ${meta.width}x${meta.height} → ${path.basename(out)} ` +
    `${meta.width}x${targetH} (+${padTop}px сверху, rgb(${r},${g},${b}), ${kb} KB)`
  )
}
