import { supabase } from './supabase'

/**
 * Вход в админку через Supabase Auth.
 *
 * Раньше пароль сравнивался прямо в браузере и потому лежал открытым
 * текстом в собранном JS. Теперь проверяет сервер, а клиент получает
 * лишь временный токен — с ним же проходят записи в базу и хранилище,
 * которые закрыты для анонимов политиками RLS.
 */

export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session ?? null
}

/** Подписка на вход/выход — держит UI в согласии с реальной сессией */
export function onAuthChange(cb) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

export async function login(email, password) {
  if (!supabase) return { ok: false, error: 'Supabase не настроен' }
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function logout() {
  if (!supabase) return
  await supabase.auth.signOut()
}
