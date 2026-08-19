/**
 * Ссылки на проекты и портфолио вводят люди (команда через /panel, админ
 * через /admin) и мы вставляем их прямо в href. Без проверки туда можно
 * положить `javascript:...` — и код выполнится у каждого, кто кликнет,
 * включая самого админа в его же панели, где в localStorage лежит сессия.
 *
 * Пропускаем только http/https и mailto. Всё остальное — null, ссылка
 * просто не отрисуется.
 */
const ALLOWED = ['http:', 'https:', 'mailto:']

export function safeUrl(value) {
  const raw = (value || '').trim()
  if (!raw) return null
  try {
    const u = new URL(raw, window.location.origin)
    return ALLOWED.includes(u.protocol) ? raw : null
  } catch {
    return null
  }
}
