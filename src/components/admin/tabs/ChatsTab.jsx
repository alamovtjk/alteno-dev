import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

/* Группируем плоский список сообщений по подписчику, самые свежие — сверху. */
function groupBySubscriber(rows) {
  const map = new Map()
  for (const m of rows) {
    if (!map.has(m.subscriber_user_id)) map.set(m.subscriber_user_id, [])
    map.get(m.subscriber_user_id).push(m)
  }
  return [...map.entries()]
    .map(([userId, msgs]) => ({ userId, msgs, last: msgs[msgs.length - 1] }))
    .sort((a, b) => new Date(b.last.created_at) - new Date(a.last.created_at))
}

export default function ChatsTab() {
  const [threads, setThreads] = useState([])
  const [names,   setNames]   = useState({}) // user_id -> имя/email из subscribers
  const [loading, setLoading] = useState(true)
  const [active,  setActive]  = useState(null) // userId открытого диалога
  const [text,    setText]    = useState('')
  const [sending, setSending] = useState(false)
  const boxRef = useRef(null)

  const load = useCallback(async () => {
    const [msgsRes, subsRes] = await Promise.all([
      supabase.from('support_messages').select('*').order('created_at'),
      supabase.from('subscribers').select('user_id, full_name'),
    ])
    setThreads(groupBySubscriber(msgsRes.data || []))
    const map = {}
    for (const s of subsRes.data || []) map[s.user_id] = s.full_name
    setNames(map)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight })
  }, [active, threads])

  const thread = threads.find(t => t.userId === active)

  const send = async (e) => {
    e.preventDefault()
    const value = text.trim()
    if (!value || !active || sending) return
    setSending(true)
    setText('')
    await supabase.from('support_messages').insert({ subscriber_user_id: active, sender: 'admin', text: value })
    await load()
    setSending(false)
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Чаты поддержки</h2>
          <p className="adm-tab-sub">{threads.length} диалогов за последние 24 часа</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div className="adm-list">
          {threads.map(t => (
            <div
              key={t.userId}
              className="adm-review-card"
              style={{ cursor: 'pointer', borderColor: active === t.userId ? 'var(--adm-violet)' : undefined }}
              onClick={() => setActive(t.userId)}
            >
              <div className="adm-review-body">
                <div className="adm-td-strong">{names[t.userId] || 'Подписчик'}</div>
                <div className="adm-td-dim adm-clamp">{t.last.text}</div>
              </div>
            </div>
          ))}
          {threads.length === 0 && <div className="adm-empty">Пока никто не писал</div>}
        </div>

        <div>
          {!thread ? (
            <div className="adm-empty">Выберите диалог слева</div>
          ) : (
            <>
              <div ref={boxRef} className="adm-chat-box">
                {thread.msgs.map(m => (
                  <div key={m.id} className={`adm-chat-msg ${m.sender === 'admin' ? 'adm-chat-msg-mine' : 'adm-chat-msg-theirs'}`}>
                    <div className="adm-chat-bubble">{m.text}</div>
                    <div className="adm-chat-time">{new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
              </div>
              <form className="adm-chat-form" onSubmit={send}>
                <input value={text} onChange={e => setText(e.target.value)} maxLength={2000} placeholder="Ответить..." />
                <button className="adm-btn-primary" type="submit" disabled={sending || !text.trim()}>Отправить</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
