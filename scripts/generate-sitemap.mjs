import { writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { rowSlug } from '../src/lib/slug.js'

/* Раньше в sitemap.xml были только 3 статичных маршрута — ни один проект
   не был перечислен, поисковики находили /projects/:slug только по
   ссылкам внутри самого сайта. Слаг не хранится в БД (см. slug.js —
   строится из title на лету), поэтому sitemap собираем тем же способом:
   тянем portfolio и прогоняем через ту же функцию, что и сам сайт. */

const url = process.env.VITE_SUPABASE_URL || 'https://abinmkwfzvcjdaxxmtsy.supabase.co'
const key = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tzVsh_R11vTFLm59FhH-pA_rH70oPiS'
const supabase = createClient(url, key)

const SITE = 'https://alteno.dev'

const { data: portfolio, error } = await supabase.from('portfolio').select('*').order('order_index')
if (error) {
  console.error('Не смог получить portfolio из Supabase:', error.message)
  process.exit(1)
}

const iso = (d) => (d ? new Date(d).toISOString().slice(0, 10) : undefined)

const urls = [
  { loc: `${SITE}/`,         changefreq: 'weekly',  priority: '1.0' },
  { loc: `${SITE}/projects`, changefreq: 'weekly',  priority: '0.8' },
  { loc: `${SITE}/team`,     changefreq: 'monthly', priority: '0.6' },
  ...portfolio.map((row) => ({
    loc: `${SITE}/projects/${rowSlug(row, portfolio)}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: iso(row.created_at),
  })),
]

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) =>
    `  <url>\n` +
    `    <loc>${u.loc}</loc>\n` +
    (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
    `    <changefreq>${u.changefreq}</changefreq>\n` +
    `    <priority>${u.priority}</priority>\n` +
    `  </url>\n`
  ).join('') +
  `</urlset>\n`

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
console.log(`✓ sitemap.xml: ${urls.length} адресов (${portfolio.length} проектов)`)
