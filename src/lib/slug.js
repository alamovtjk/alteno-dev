const MAP = {
  а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i',
  й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t',
  у:'u', ф:'f', х:'h', ц:'c', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'',
  э:'e', ю:'yu', я:'ya',
  // таджикские
  ғ:'gh', ӣ:'i', қ:'q', ӯ:'u', ҳ:'h', ҷ:'j',
}

/**
 * Адрес проекта строится из названия — отдельная колонка в БД не нужна.
 * «Сайт студии» → «sayt-studii»
 */
export function slugify(str = '') {
  const s = str
    .toLowerCase()
    .split('')
    .map(ch => (ch in MAP ? MAP[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'project'
}

/**
 * Слаг строки списка. Одинаковые названия развели бы на один адрес,
 * поэтому дубликатам дописываем id.
 */
export function rowSlug(row, rows = []) {
  const base = slugify(row.title)
  const twins = rows.filter(r => slugify(r.title) === base)
  return twins.length > 1 ? `${base}-${row.id}` : base
}

export function findBySlug(rows, slug) {
  return rows.find(r => rowSlug(r, rows) === slug) || null
}
