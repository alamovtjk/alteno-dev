/**
 * Отправка заявки из формы контактов в Telegram.
 *
 * Раньше браузер стучался в api.telegram.org напрямую, поэтому токен бота
 * лежал в собранном JS под именем VITE_TG_TOKEN и был виден любому. Здесь
 * он берётся из серверного окружения и наружу не попадает.
 */

const MAX = { name: 120, contact: 200, task: 2000 }

const clean = (v, limit) => String(v ?? '').trim().slice(0, limit)

/* У Telegram Markdown ломается на служебных символах в пользовательском тексте */
const esc = (s) => s.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1')

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const token  = process.env.TG_TOKEN
  const chatId = process.env.TG_CHAT_ID
  if (!token || !chatId) {
    console.error('contact: не заданы TG_TOKEN / TG_CHAT_ID')
    return res.status(500).json({ error: 'Notifications are not configured' })
  }

  const name    = clean(req.body?.name,    MAX.name)
  const contact = clean(req.body?.contact, MAX.contact)
  const task    = clean(req.body?.task,    MAX.task)

  if (!name || !contact) {
    return res.status(400).json({ error: 'name and contact are required' })
  }

  const now = new Date().toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const text =
    `🆕 *Новая заявка — AlTeNo Dev*\n\n` +
    `👤 *Имя:* ${esc(name)}\n` +
    `📞 *Контакт:* ${esc(contact)}\n` +
    `📝 *Задача:* ${esc(task || '—')}\n\n` +
    `⏰ ${esc(now)}`

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'MarkdownV2' }),
    })
    if (!tg.ok) {
      console.error('contact: Telegram ответил', tg.status, await tg.text())
      return res.status(502).json({ error: 'Telegram error' })
    }
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('contact:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
