import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

/* Чат живёт 24 часа и сам стирается на сервере (см. tickSupportChat в
   telegram-bot.js на VPS) — тут просто читаем/пишем, пока строки есть. */
export default function SupportChat({ userId }) {
  const [messages, setMessages] = useState([])
  const [text,     setText]     = useState('')
  const [sending,  setSending]  = useState(false)
  const boxRef = useRef(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('support_messages')
      .select('*').eq('subscriber_user_id', userId).order('created_at')
    setMessages(data || [])
  }, [userId])

  useEffect(() => {
    load()
    const id = setInterval(load, 10000) // маленький чат — обычного опроса достаточно
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    setText('')
    await supabase.from('support_messages').insert({ subscriber_user_id: userId, sender: 'subscriber', text: value })
    await load()
    setSending(false)
  }

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Чат поддержки</h2>
          <p className="adm-tab-sub">Пишите Самиру напрямую — сообщения хранятся 24 часа</p>
        </div>
      </div>

      <div ref={boxRef} className="adm-chat-box">
        {messages.length === 0 && <div className="adm-empty">Пока нет сообщений — напишите первым</div>}
        {messages.map(m => (
          <div key={m.id} className={`adm-chat-msg ${m.sender === 'subscriber' ? 'adm-chat-msg-mine' : 'adm-chat-msg-theirs'}`}>
            <div className="adm-chat-bubble">{m.text}</div>
            <div className="adm-chat-time">{new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        ))}
      </div>

      <form className="adm-chat-form" onSubmit={send}>
        <input value={text} onChange={e => setText(e.target.value)} maxLength={2000} placeholder="Сообщение..." />
        <button className="adm-btn-primary" type="submit" disabled={sending || !text.trim()}>Отправить</button>
      </form>
    </div>
  )
}
