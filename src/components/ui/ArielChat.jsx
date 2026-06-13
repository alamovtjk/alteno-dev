import { useState, useRef } from 'react'

const CHIPS = ['Тип проекта', 'Функции', 'Дизайн', 'Интеграции', 'Бюджет', 'Контакт']

function parseTz(content) {
  const match = content.match(/===TZ_START===([\s\S]*?)===TZ_END===/)
  if (!match) return null
  const block = match[1]
  const get = (key) => {
    const r = block.match(new RegExp(`${key}:\\s*(.+)`))
    return r ? r[1].trim() : '—'
  }
  return {
    client:       get('Клиент'),
    contact:      get('Контакт'),
    email:        get('Email'),
    type:         get('Тип'),
    sphere:       get('Сфера'),
    goal:         get('Цель'),
    features:     get('Функции'),
    design:       get('Дизайн'),
    integrations: get('Интеграции'),
    content:      get('Контент'),
    deadline:     get('Срок'),
    budget:       get('Бюджет'),
  }
}

function cleanContent(content) {
  return content.replace(/===TZ_START===[\s\S]*?===TZ_END===/g, '').trim()
}

function TzCard({ tz, onDownload, downloading, emailSent }) {
  const rows = [
    ['💼', 'Тип', tz.type],
    ['🏢', 'Сфера', tz.sphere],
    ['🎯', 'Цель', tz.goal],
    ['⚙️', 'Функции', tz.features],
    ['🎨', 'Дизайн', tz.design],
    ['🔗', 'Интеграции', tz.integrations],
    ['📁', 'Контент', tz.content],
    ['📅', 'Срок', tz.deadline],
    ['💰', 'Бюджет', tz.budget],
  ]
  return (
    <div className="tz-card">
      <div className="tz-card-head">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor"/>
        </svg>
        <span>ТЕХНИЧЕСКОЕ ЗАДАНИЕ</span>
      </div>
      <div className="tz-client">
        <span className="tz-label">Клиент</span>
        <strong>{tz.client}</strong>
        <span className="tz-contact">{tz.contact}</span>
        {tz.email && tz.email !== '—' && tz.email !== 'не указан' && (
          <span className="tz-contact">{tz.email}</span>
        )}
      </div>
      <div className="tz-rows">
        {rows.map(([icon, label, value]) => value && value !== '—' ? (
          <div key={label} className="tz-row">
            <span className="tz-row-icon">{icon}</span>
            <span className="tz-row-label">{label}</span>
            <span className="tz-row-val">{value}</span>
          </div>
        ) : null)}
      </div>
      <div className="tz-studio">
        <span>📞 AlTeNo Dev · @alamovtjk · alamovsamir4@gmail.com</span>
      </div>
      <div className="tz-actions">
        <button className="tz-dl-btn" onClick={onDownload} disabled={downloading}>
          {downloading ? (
            <><span className="tz-dl-spin" />Готовим...</>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor"/>
              </svg>
              Скачать .docx
            </>
          )}
        </button>
        {emailSent === true && (
          <span className="tz-email-ok">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22c55e"/>
            </svg>
            Отправлено на email
          </span>
        )}
      </div>
    </div>
  )
}

export default function ArielChat() {
  const [messages,    setMessages]    = useState([])
  const [input,       setInput]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [started,     setStarted]     = useState(false)
  const [done,        setDone]        = useState(false)
  const [tz,          setTz]          = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [emailSent,   setEmailSent]   = useState(null)

  const tzSentRef = useRef(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const scrollDown = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)

  const questionNum = Math.min(
    messages.filter(m => m.role === 'assistant').length, 10
  )

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

  const sendTz = async (tzData) => {
    if (tzSentRef.current) return
    tzSentRef.current = true
    try {
      const res = await fetch('/api/send-tz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tz: tzData }),
      })
      const data = await res.json()
      setEmailSent(data.emailSent === true)
    } catch {
      setEmailSent(false)
    }
  }

  const downloadDocx = async () => {
    if (!tz || downloading) return
    setDownloading(true)
    try {
      const res = await fetch('/api/send-tz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tz }),
      })
      const data = await res.json()
      if (data.docxBase64) {
        const bytes = Uint8Array.from(atob(data.docxBase64), c => c.charCodeAt(0))
        const blob = new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ТЗ_AlTeNo_Dev_${(tz.client || 'client').replace(/\s/g, '_')}.docx`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch { /* silent */ }
    setDownloading(false)
  }

  const reset = () => {
    setMessages([]); setInput(''); setLoading(false)
    setStarted(false); setDone(false); setTz(null)
    setEmailSent(null); tzSentRef.current = false
  }

  const startChat = async () => {
    setStarted(true); setLoading(true)
    try {
      const content = await callApi([])
      setMessages([{ role: 'assistant', content }])
    } catch {
      setMessages([{ role: 'assistant', content: 'Ошибка соединения. Попробуйте позже.' }])
    }
    setLoading(false); scrollDown()
    setTimeout(() => inputRef.current?.focus(), 150)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading || done) return
    const userMsg = { role: 'user', content: text }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs); setInput(''); setLoading(true); scrollDown()
    try {
      const content = await callApi(newMsgs)
      setMessages(prev => [...prev, { role: 'assistant', content }])
      const parsed = parseTz(content)
      if (parsed && !tzSentRef.current) {
        setTz(parsed)
        setDone(true)
        await sendTz(parsed)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ошибка. Попробуйте ещё раз.' }])
    }
    setLoading(false); scrollDown()
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
            {done ? '✓ ТЗ ГОТОВО' : `ВОПРОС ${questionNum}/10`}
          </span>
          <div className="ariel-pbar">
            <div className="ariel-pfill"
              style={{ width: `${done ? 100 : (questionNum / 10) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="ariel-msgs">

        {!started && !loading && (
          <div className="ariel-idle">
            <div className="ariel-idle-top">
              <p className="ariel-idle-title">Опишите ваш проект</p>
              <p className="ariel-idle-sub">
                AI задаст 10 вопросов о проекте, составит<br/>
                детальное ТЗ и отправит его вам на email
              </p>
              <div className="ariel-chips">
                {CHIPS.map(c => <span key={c} className="ariel-chip">{c}</span>)}
              </div>
            </div>
            <div className="ariel-orb">
              <div className="ao-ring r1" /><div className="ao-ring r2" />
              <div className="ao-core">AI</div>
            </div>
            <button className="ariel-start-btn" onClick={startChat}>
              ▸ НАЧАТЬ ДИАЛОГ
            </button>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLast  = i === messages.length - 1
          const isAriel = msg.role === 'assistant'
          const hasTz   = isLast && done && isAriel && tz
          const text    = cleanContent(msg.content)
          if (!text && !hasTz) return null
          return (
            <div key={i} className={`ariel-msg ariel-msg--${msg.role}`}>
              <div className="ariel-msg-label">{isAriel ? '▸ ARIEL' : '▸ ВЫ'}</div>
              <div className="ariel-msg-body">
                {text}
                {hasTz && (
                  <>
                    <div className="ariel-tz-badge">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                      </svg>
                      ТЗ отправлено в студию
                    </div>
                    <TzCard
                      tz={tz}
                      onDownload={downloadDocx}
                      downloading={downloading}
                      emailSent={emailSent}
                    />
                  </>
                )}
              </div>
            </div>
          )
        })}

        {done && (
          <div className="ariel-done-row">
            <button className="ariel-restart-btn" onClick={reset}>↺ Новый диалог</button>
          </div>
        )}

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
