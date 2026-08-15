import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key) ? createClient(url, key) : null

/* Портфолио/команда/отзывы читаются и на главной, и на отдельных страницах
   списков — при переходах между ними без перезагрузки не дёргаем Supabase
   заново, пока кэш свежий. Админка правит эти таблицы нечасто, 2 минуты
   не заметны, а лишних запросов на каждый клик по меню становится 0. */
const CACHE_TTL = 2 * 60 * 1000

function readCache(key) {
  try {
    const hit = JSON.parse(localStorage.getItem(key))
    if (hit && Date.now() - hit.t < CACHE_TTL) return hit.data
  } catch { /* localStorage недоступен или битый JSON — просто идём в сеть */ }
  return null
}

/**
 * Читает таблицу, не падая, если Supabase не сконфигурен или запрос упал.
 * Возвращает [] — публичные секции сами решают, что показать вместо данных.
 */
export async function fetchTable(table, { order = 'order_index' } = {}) {
  if (!supabase) return []
  const cacheKey = `alteno_cache_${table}_${order}`
  const cached = readCache(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase.from(table).select('*').order(order)
  if (error) {
    console.warn(`[supabase] ${table}:`, error.message)
    return []
  }
  try { localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), data: data || [] })) } catch { /* тихо: кэш — не критичный путь */ }
  return data || []
}

/* Админка и публичный сайт — один origin, один localStorage. Без сброса
   после сохранения в /admin посетитель мог бы до 2 минут видеть старые
   данные, если кэш успел прогреться до правки. */
export function invalidateTable(table) {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`alteno_cache_${table}_`)) localStorage.removeItem(key)
    }
  } catch { /* localStorage недоступен — нечего сбрасывать */ }
}
