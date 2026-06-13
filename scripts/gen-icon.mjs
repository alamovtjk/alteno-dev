import sharp from 'sharp'

// Вертикальный логотип AlTeNo — квадратный, как в скриншоте пользователя
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="white"/>

  <!-- Al — фиолетовый, верх -->
  <text x="256" y="178"
    text-anchor="middle"
    font-family="Arial Black, Arial Bold, Helvetica Neue, sans-serif"
    font-weight="900"
    font-size="150"
    fill="#8220cc">Al</text>

  <!-- горизонтальная черта (перекладина T) -->
  <rect x="146" y="196" width="220" height="14" fill="#82186e"/>

  <!-- Te — тёмно-маджента, середина -->
  <text x="256" y="338"
    text-anchor="middle"
    font-family="Arial Black, Arial Bold, Helvetica Neue, sans-serif"
    font-weight="900"
    font-size="150"
    fill="#82186e">Te</text>

  <!-- No — тёмно-зелёный, низ -->
  <text x="256" y="478"
    text-anchor="middle"
    font-family="Arial Black, Arial Bold, Helvetica Neue, sans-serif"
    font-weight="900"
    font-size="150"
    fill="#165916">No</text>
</svg>`

const buf = Buffer.from(svg)

await sharp(buf).resize(512, 512).png().toFile('public/logo.png')
await sharp(buf).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(buf).resize(180, 180).png().toFile('public/apple-touch-icon.png')

console.log('✓ logo.png (512x512)')
console.log('✓ icon-192.png (192x192)')
console.log('✓ apple-touch-icon.png (180x180)')
