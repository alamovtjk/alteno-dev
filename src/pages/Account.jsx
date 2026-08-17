import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import '../admin.css'
import { getSession, onAuthChange, logout } from '../lib/adminAuth'
import { supabase } from '../lib/supabase'

const STATUS_LABEL = {
  pending:   'Ожидает подтверждения',
  active:    'Активна',
  expired:   'Истекла',
  cancelled: 'Отозвана',
}

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '—'

function useSubscriber(userId) {
  const [sub,     setSub]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let alive = true
    supabase.from('subscribers').select('*').eq('user_id', userId).maybeSingle()
      .then(({ data }) => { if (alive) { setSub(data); setLoading(false) } })
    return () => { alive = false }
  }, [userId])

  return { sub, loading }
}

export default function Account() {
  const [session, setSession] = useState(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    let alive = true
    getSession().then(s => {
      if (!alive) return
      setSession(s)
      setReady(true)
    })
    return onAuthChange(s => setSession(s))
  }, [])

  const { sub, loading: subLoading } = useSubscriber(session?.user?.id)

  if (!ready) return <div className="adm-loader">Загрузка...</div>
  if (!session) return <Navigate to="/login" replace />

  const active = sub?.status === 'active'

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card" style={{ maxWidth: 440 }}>
        <p className="adm-login-hint">Личный кабинет</p>
        <h2 className="adm-tab-title" style={{ marginBottom: 20 }}>{session.user.email}</h2>

        {subLoading ? (
          <div className="adm-loader">Загрузка...</div>
        ) : !sub ? (
          <p className="adm-field-hint">Подписка не найдена — если ты только что оплатил, подожди подтверждения от бота.</p>
        ) : (
          <>
            <div className="adm-field" style={{ marginBottom: 8 }}>
              <label>Статус</label>
              <div>
                <span className={`adm-badge adm-badge-${sub.status}`}>{STATUS_LABEL[sub.status] || sub.status}</span>
              </div>
            </div>
            <div className="adm-field" style={{ marginBottom: 20 }}>
              <label>Действует до</label>
              <div className="adm-td-strong">{fmtDate(sub.expires_at)}</div>
            </div>

            {active ? (
              <p className="adm-field-hint">
                Ссылку на закрытый Telegram-канал с уроками бот прислал тебе в личные сообщения
                при подтверждении оплаты.
              </p>
            ) : (
              <p className="adm-field-hint">
                Подписка неактивна — чтобы продлить, напиши боту заявок в Telegram.
              </p>
            )}
          </>
        )}

        <button className="adm-btn-ghost adm-btn-full" style={{ marginTop: 24 }} onClick={logout}>
          Выйти
        </button>
      </div>
    </div>
  )
}
