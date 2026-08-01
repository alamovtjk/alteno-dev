import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key) ? createClient(url, key) : null

/**
 * Читает таблицу, не падая, если Supabase не сконфигурен или запрос упал.
 * Возвращает [] — публичные секции сами решают, что показать вместо данных.
 */
export async function fetchTable(table, { order = 'order_index' } = {}) {
  if (!supabase) return []
  const { data, error } = await supabase.from(table).select('*').order(order)
  if (error) {
    console.warn(`[supabase] ${table}:`, error.message)
    return []
  }
  return data || []
}
