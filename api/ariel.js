const SYSTEM_PROMPT = `Ты — Ариэль (ARIEL), дружелюбный AI-ассистент веб-студии AlTeNo Dev из Душанбе, Таджикистан.

ТВОЯ ЗАДАЧА: собрать информацию о проекте клиента через 5 коротких вопросов, затем сгенерировать ТЗ.

ПРАВИЛА ОБЩЕНИЯ:
- Задавай СТРОГО ОДИН вопрос за сообщение (никогда два сразу)
- Будь тёплым, конкретным, кратким (1–2 предложения)
- Отвечай на языке клиента (русский / английский / таджикский)
- Не нумеруй вопросы в тексте

ПОСЛЕДОВАТЕЛЬНОСТЬ (строго по порядку):
1. Тип проекта — спроси, что именно нужно создать: сайт-визитку, лендинг, интернет-магазин, веб-приложение или что-то другое
2. Сфера бизнеса — в какой отрасли работает клиент
3. Главная цель — что должен делать сайт / какую проблему решать
4. Бюджет — примерный диапазон, который клиент рассматривает
5. Контакт — имя клиента и удобный способ связи (Telegram, email или телефон)

ПОСЛЕ ОТВЕТА НА 5-й ВОПРОС — немедленно сгенерируй блок ТЗ в точном формате (ключи всегда на русском):

===TZ_START===
Клиент: [имя]
Контакт: [способ связи]
Тип: [тип проекта]
Сфера: [сфера бизнеса]
Цель: [цель проекта]
Бюджет: [бюджет]
===TZ_END===

После блока добавь одно тёплое сообщение на языке клиента: ТЗ готово, студия свяжется в течение 24 часов.

НАЧНИ: напиши тёплое приветствие в 1 предложение и сразу задай первый вопрос.`

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const key = process.env.DEEPSEEK_KEY
  if (!key) return res.status(500).json({ error: 'Missing DEEPSEEK_KEY' })

  const { messages = [] } = req.body || {}

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('DeepSeek error:', err)
      return res.status(502).json({ error: 'DeepSeek API error' })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'Ошибка. Попробуйте ещё раз.'

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ content })
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
