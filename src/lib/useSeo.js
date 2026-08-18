import { useEffect } from 'react'

/* index.html даёт один статичный <title>/description/OG на все маршруты —
   Google видит их как дубликат контента на /projects, /team и каждой
   странице проекта. Страницы, которым есть что сказать уникального,
   зовут этот хук; на выходе (и там, где хук не вызван — например, Home)
   остаются значения по умолчанию из index.html. */

const DEFAULT_TITLE = 'AlTeNo Dev — AI Веб-студия из Душанбе'
const DEFAULT_DESC  = 'AlTeNo Dev — AI веб-студия из Душанбе. Создаём сайты, приложения и дизайн с максимальным использованием AI. Быстро, красиво, по доступной цене.'
const DEFAULT_IMAGE = 'https://alteno.dev/og-image.png'

function setMeta(selector, content) {
  const el = document.querySelector(selector)
  if (el) el.setAttribute('content', content)
}

function apply(title, description, image) {
  document.title = title
  setMeta('meta[name="description"]', description)
  setMeta('meta[property="og:title"]', title)
  setMeta('meta[property="og:description"]', description)
  setMeta('meta[property="og:image"]', image)
  setMeta('meta[name="twitter:title"]', title)
  setMeta('meta[name="twitter:description"]', description)
  setMeta('meta[name="twitter:image"]', image)
}

/**
 * @param {{title?: string, description?: string, image?: string}} opts
 *   title — без "— AlTeNo Dev", суффикс добавляется сам.
 */
export function useSeo({ title, description, image } = {}) {
  useEffect(() => {
    if (!title) return // страница ещё грузит данные (например, карточка проекта) — не мигаем дефолтом
    apply(`${title} — AlTeNo Dev`, description || DEFAULT_DESC, image || DEFAULT_IMAGE)
    return () => apply(DEFAULT_TITLE, DEFAULT_DESC, DEFAULT_IMAGE)
  }, [title, description, image])
}
