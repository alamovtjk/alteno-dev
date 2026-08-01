import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const SettingsContext = createContext(null)

/* Значения по умолчанию = то, что было захардкожено до подключения админки.
   Если таблица settings пустая или недоступна — сайт выглядит как раньше. */
const DEFAULT_SETTINGS = {
  company_name: 'AlTeNo Dev',
  tagline:      'AI Веб-студия из Душанбе',
  email:        'alamovsamir4@gmail.com',
  phone:        '',
  telegram:     'samiralamov',
  instagram:    'alamovtjk',
  github:       'alamovtjk',
  whatsapp:     '',
}

/* В админке поля с префиксом (t.me/, instagram.com/, github.com/), но вставить
   могут и полную ссылку — приводим к чистому нику в обоих случаях. */
function handle(value, host) {
  const v = (value || '').trim()
  if (!v) return ''
  return v
    .replace(/^https?:\/\//i, '')
    .replace(new RegExp(`^(www\\.)?${host}/`, 'i'), '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
}

/* Только цифры и ведущий + — для tel: и wa.me */
const digits = (v) => (v || '').replace(/[^\d+]/g, '')

/* Готовые ссылки для Footer и Contact; отсутствующие контакты дают null */
function deriveLinks(s) {
  const tg = handle(s.telegram,  't\\.me')
  const ig = handle(s.instagram, 'instagram\\.com')
  const gh = handle(s.github,    'github\\.com')
  const wa = digits(s.whatsapp)
  const ph = digits(s.phone)

  return {
    email:     s.email ? { href: `mailto:${s.email}`, label: s.email } : null,
    telegram:  tg ? { href: `https://t.me/${tg}`,         label: `@${tg}` } : null,
    instagram: ig ? { href: `https://instagram.com/${ig}`, label: `@${ig}` } : null,
    github:    gh ? { href: `https://github.com/${gh}`,    label: gh }       : null,
    whatsapp:  wa ? { href: `https://wa.me/${wa.replace('+', '')}`, label: s.whatsapp } : null,
    phone:     ph ? { href: `tel:${ph}`, label: s.phone } : null,
  }
}

const FALLBACK = { settings: DEFAULT_SETTINGS, links: deriveLinks(DEFAULT_SETTINGS) }

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    supabase.from('settings').select('key, value').then(({ data, error }) => {
      if (cancelled || error || !data?.length) return
      const merged = { ...DEFAULT_SETTINGS }
      // Пустые значения из БД не затирают дефолты
      data.forEach(({ key, value }) => { if (value) merged[key] = value })
      setSettings(merged)
    })
    return () => { cancelled = true }
  }, [])

  const value = useMemo(() => ({ settings, links: deriveLinks(settings) }), [settings])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext) ?? FALLBACK
