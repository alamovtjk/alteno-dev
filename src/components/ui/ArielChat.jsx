import { useState, useRef } from 'react'

const TG_TOKEN   = import.meta.env.VITE_TG_TOKEN   || ''
const TG_CHAT_ID = import.meta.env.VITE_TG_CHAT_ID || ''

const CHIPS = ['Тип сайта', 'Сфера', 'Цель', 'Бюджет', 'Контакт']

function parseTz(content) {
  const match = content.match(/===TZ_START===([\s\S]*?)===TZ_END===/)
  if (!match) return null
  const block = match[1]
  const get = (key) => {
    const r = block.match(new RegExp(`${key}:\\s*(.+)`))
    return r ? r[1].trim() : '—'
  }
  return {
    client:  get('Клиент'),
    contact: get('Контакт'),
    type:    get('Тип'),
    sphere:  get('Сфера'),
    goal:    get('Цель'),
    budget:  get('Бюджет'),
  }
}

async function sendTzToTelegram(tz) {
  if (!TG_TOKEN || !TG_CHAT_ID) return
  const now = new Date().toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const text =
    `🤖 *Новое ТЗ — ARIEL × AlTeNo Dev*\n\n` +
    `👤 *Клиент:* ${tz.client}\n` +
    `📞 *Контакт:* ${tz.contact}\n` +
    `💼 *Тип проекта:* ${tz.type}\n` +
    `🏢 *Сфера:* ${tz.sphere}\n` +
    `🎯 *Цель:* ${tz.goal}\n` +
    `💰 *Бюджет:* ${tz.budget}\n\n` +
    `⏰ ${now}`
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'Markdown' }),
  }).catch(() => {})
}

function cleanContent(content) {
  return content.replace(/===TZ_START===[\s\S]*?===TZ_END===/g, '').trim()
}

export default function ArielChat() {
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [started,   setStarted]   = useState(false)
  const [done,      setDone]      = useState(false)
  const tzSentRef = useRef(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const scrollDown = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)

  // Номер вопроса = кол-во сообщений ассистента
  const questionNum = Math.min(messages.filter(m => m.role === 'assistant').length, 5)

  const callApi = async (msgs) => {
    const res = await fetch('/api/ariel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs }),
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return data.content || 'Ошибка. Попробуйте ещё раз.'
  }

  const reset = () => {
    setMessages([])
    setInput('')
    setLoading(false)
    setStarted(false)
    setDone(false)
    tzSentRef.current = false
  }

  const startChat = async () => {
    setStarted(true)
    setLoading(true)
    try {
      const content = await callApi([])
      setMessages([{ role: 'assistant', content }])
    } catch {
      setMessages([{ role: 'assistant', content: 'Ошибка соединения. Попробуйте позже.' }])
    }
    setLoading(false)
    scrollDown()
    setTimeout(() => inputRef.current?.focus(), 150)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading || done) return

    const userMsg = { role: 'user', content: text }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    scrollDown()

    try {
      const content = await callApi(newMsgs)
      setMessages(prev => [...prev, { role: 'assistant', content }])

      const tz = parseTz(content)
      if (tz && !tzSentRef.current) {
        tzSentRef.current = true
        setDone(true)
        await sendTzToTelegram(tz)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ошибка. Попробуйте ещё раз.' }])
    }
    setLoading(false)
    scrollDown()
    if (!done) setTimeout(() => inputRef.current?.focus(), 100)
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="ariel-panel">
      <span className="cb cb-tl" /><span className="cb cb-tr" />
      <span className="cb cb-bl" /><span className="cb cb-br" />

      {/* Header */}
      <div className="ariel-header">
        <svg className="ariel-hex-icon" viewBox="0 0 20 23" fill="none">
          <path d="M10 1L19 6v11L10 22 1 17V6z" stroke="#00d4ff" strokeWidth="1.2"/>
        </svg>
        <span className="ariel-logo-text">ARIEL_OS</span>
        <span className="ariel-sep">// PROJECT_INTAKE</span>
        {started && !done && (
          <button className="ariel-reset-btn" onClick={reset} title="Начать заново">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        )}
        <span className="ariel-status-dot" style={{ marginLeft: started && !done ? '0' : 'auto' }} />
      </div>

      {/* Progress */}
      {started && (
        <div className="ariel-progress-row">
          <span className="ariel-progress-label">
            {done ? '✓ ТЗ ГОТОВО' : `ВОПРОС ${questionNum}/5`}
          </span>
          <div className="ariel-pbar">
            <div className="ariel-pfill"
              style={{ width: `${done ? 100 : (questionNum / 5) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="ariel-msgs">

        {/* Idle screen */}
        {!started && !loading && (
          <div className="ariel-idle">
            <div className="ariel-idle-top">
              <p className="ariel-idle-title">Опишите вашу идею</p>
              <p className="ariel-idle-sub">
                AI-ассистент задаст 5 коротких вопросов<br/>
                и подготовит готовое ТЗ для студии
              </p>
              <div className="ariel-chips">
                {CHIPS.map(c => (
                  <span key={c} className="ariel-chip">{c}</span>
                ))}
              </div>
            </div>
            <div className="ariel-orb">
              <div className="ao-ring r1" />
              <div className="ao-ring r2" />
              <div className="ao-core">AI</div>
            </div>
            <button className="ariel-start-btn" onClick={startChat}>
              ▸ НАЧАТЬ ДИАЛОГ
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => {
          const isLast  = i === messages.length - 1
          const isAriel = msg.role === 'assistant'
          const hasTz   = isLast && done && isAriel
          const text    = cleanContent(msg.content)
          if (!text && !hasTz) return null
          return (
            <div key={i} className={`ariel-msg ariel-msg--${msg.role}`}>
              <div className="ariel-msg-label">{isAriel ? '▸ ARIEL' : '▸ ВЫ'}</div>
              <div className="ariel-msg-body">
                {text}
                {hasTz && (
                  <div className="ariel-tz-badge">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                    </svg>
                    ТЗ отправлено в студию
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Done — restart button */}
        {done && (
          <div className="ariel-done-row">
            <button className="ariel-restart-btn" onClick={reset}>
              ↺ Новый диалог
            </button>
          </div>
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="ariel-msg ariel-msg--assistant">
            <div className="ariel-msg-label">▸ ARIEL</div>
            <div className="ariel-msg-body">
              <span className="ariel-typing"><span /><span /><span /></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {started && !done && (
        <div className="ariel-input-row">
          <input
            ref={inputRef}
            className="ariel-input"
            placeholder="Введите ответ..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={loading}
            autoComplete="off"
          />
          <button className="ariel-send-btn" onClick={send} disabled={loading || !input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
