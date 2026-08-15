import { supabase } from './supabase'

const VID_KEY = 'alteno_vid'

/* Случайный id в localStorage — не привязан к личности, живёт только
   чтобы не считать одного человека с открытыми вкладками за нескольких. */
export function getVisitorId() {
  try {
    let id = localStorage.getItem(VID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VID_KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}

/* Одна строка на загрузку страницы. Анон-ключ может только вставлять
   (см. supabase/analytics.sql) — прочитать список чужих посещений им нельзя. */
export function trackPageView(path) {
  if (!supabase) return
  supabase.from('page_views').insert([{ path, visitor_id: getVisitorId() }]).then(() => {})
}

const PRESENCE_CHANNEL = 'site-presence'

/* Посетитель отмечается "на сайте" через Supabase Realtime Presence —
   без таблицы, без записи на диск. Presence сам уберёт его из списка,
   как только вкладка закроется или порвётся соединение. */
export function joinPresence() {
  if (!supabase) return () => {}
  const channel = supabase.channel(PRESENCE_CHANNEL, {
    config: { presence: { key: getVisitorId() } },
  })
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') channel.track({ online_at: new Date().toISOString() })
  })
  return () => { supabase.removeChannel(channel) }
}

/* Для админки: только наблюдает за чужим присутствием и не отмечается сама —
   иначе открытая вкладка /admin всегда прибавляла бы +1 к счётчику посетителей. */
export function watchPresenceCount(onChange) {
  if (!supabase) { onChange(0); return () => {} }
  const channel = supabase.channel(PRESENCE_CHANNEL, {
    config: { presence: { key: `admin_${Math.random().toString(36).slice(2)}` } },
  })
  const update = () => onChange(Object.keys(channel.presenceState()).length)
  channel.on('presence', { event: 'sync' }, update)
  channel.subscribe()
  return () => { supabase.removeChannel(channel) }
}
