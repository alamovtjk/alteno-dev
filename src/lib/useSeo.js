import { useEffect } from 'react'

/* index.html даёт один статичный <title>/description/OG на все маршруты —
   Google видит их как дубликат контента на /projects, /team и каждой
   странице проекта. Страницы, которым есть что сказать уникального,
   зовут этот хук; на выходе (и там, где хук не вызван — например, Home)
   возвращаются значения по умолчанию из index.html. */

const SITE = 'https://alteno.dev'
const DEFAULT_TITLE = 'AlTeNo Dev — AI Веб-студия из Душанбе'
const DEFAULT_DESC  = 'AlTeNo Dev — AI веб-студия из Душанбе. Создаём сайты, приложения и дизайн с максимальным использованием AI. Быстро, красиво, по доступной цене.'
const DEFAULT_IMAGE = `${SITE}/og-image.png`

function setMeta(selector, content) {
  const el = document.querySelector(selector)
  if (el) el.setAttribute('content', content)
}

/* JSON-LD страницы живёт отдельным тегом с своим id: Organization и WebSite
   из index.html трогать нельзя, они общие для всего сайта. */
const LD_ID = 'seo-route-jsonld'
function setJsonLd(data) {
  let el = document.getElementById(LD_ID)
  if (!data) { el?.remove(); return }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = LD_ID
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function apply({ title, description, image, imageAlt, url, type }) {
  document.title = title
  setMeta('meta[name="description"]', description)
  setMeta('meta[property="og:title"]', title)
  setMeta('meta[property="og:description"]', description)
  setMeta('meta[property="og:image"]', image)
  setMeta('meta[property="og:image:alt"]', imageAlt)
  setMeta('meta[property="og:url"]', url)
  setMeta('meta[property="og:type"]', type)
  setMeta('meta[name="twitter:title"]', title)
  setMeta('meta[name="twitter:description"]', description)
  setMeta('meta[name="twitter:image"]', image)
  setMeta('meta[name="twitter:image:alt"]', imageAlt)
}

const defaults = () => ({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESC,
  image: DEFAULT_IMAGE,
  imageAlt: 'AlTeNo Dev — AI веб-студия из Душанбе',
  url: `${SITE}/`,
  type: 'website',
})

/**
 * @param {object} opts
 * @param {string} [opts.title]       без «— AlTeNo Dev», суффикс добавляется сам
 * @param {string} [opts.description]
 * @param {string} [opts.image]
 * @param {string} [opts.type]        'website' (по умолчанию) или 'article'
 * @param {object} [opts.jsonLd]      Schema.org для конкретной страницы
 */
export function useSeo({ title, description, image, type, jsonLd } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : null

  useEffect(() => {
    // Страница ещё грузит данные (например, карточка проекта) — не мигаем дефолтом
    if (!title) return

    const fullTitle = `${title} — AlTeNo Dev`
    apply({
      title: fullTitle,
      description: description || DEFAULT_DESC,
      image: image || DEFAULT_IMAGE,
      imageAlt: title,
      url: SITE + window.location.pathname,
      type: type || 'website',
    })
    if (ld) setJsonLd(JSON.parse(ld))

    return () => {
      apply(defaults())
      setJsonLd(null)
    }
  }, [title, description, image, type, ld])
}

/** Хлебные крошки для Google — путь до страницы в выдаче */
export function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE + it.path,
    })),
  }
}
