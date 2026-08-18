/**
 * Пережимает картинку в WebP прямо в браузере перед загрузкой в Storage —
 * баннеры/скриншоты часто приходят в виде тяжёлых PNG/JPEG с телефона,
 * а WebP при том же визуальном качестве обычно в 2–5 раз легче.
 *
 * maxWidth ограничивает сторону сверху (даунскейл лишнего разрешения),
 * quality 0.85 — точка, где потеря на глаз не видна даже при увеличении.
 */
export function toWebp(file, { maxWidth = 1600, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.naturalWidth)
      const w = Math.max(1, Math.round(img.naturalWidth * scale))
      const h = Math.max(1, Math.round(img.naturalHeight * scale))

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)

      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Не удалось сжать изображение')); return }
        const name = file.name.replace(/\.\w+$/, '') + '.webp'
        resolve(new File([blob], name, { type: 'image/webp' }))
      }, 'image/webp', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось прочитать изображение')) }
    img.src = url
  })
}
