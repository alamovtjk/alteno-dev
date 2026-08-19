import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import '../admin.css'
import { getSession, onAuthChange, logout } from '../lib/adminAuth'
import { supabase } from '../lib/supabase'
import { MusicProvider, useMusic } from '../context/MusicContext'
import { safeUrl } from '../lib/safeUrl'
import SupportChat from '../components/ui/SupportChat'

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

/* ── Подписка ── */
function SubscriptionTab({ sub, loading }) {
  const active = sub?.status === 'active'
  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Моя подписка</h2>
        </div>
      </div>
      {loading ? (
        <div className="adm-loader">Загрузка...</div>
      ) : !sub ? (
        <p className="adm-field-hint">Подписка не найдена — если вы только что оплатили, подождите подтверждения от бота.</p>
      ) : (
        <>
          <div className="adm-field" style={{ marginBottom: 8 }}>
            <label>Статус</label>
            <div><span className={`adm-badge adm-badge-${sub.status}`}>{STATUS_LABEL[sub.status] || sub.status}</span></div>
          </div>
          <div className="adm-field" style={{ marginBottom: 20 }}>
            <label>Действует до</label>
            <div className="adm-td-strong">{fmtDate(sub.expires_at)}</div>
          </div>
          {active ? (
            <p className="adm-field-hint">Ссылку на закрытый Telegram-канал с уроками бот прислал в личные сообщения при подтверждении оплаты.</p>
          ) : (
            <p className="adm-field-hint">Подписка неактивна — чтобы продлить, напишите боту в Telegram.</p>
          )}
        </>
      )}
    </div>
  )
}

/* ── Команда (только чтение) ── */
function TeamTabReadOnly() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('team').select('*').order('order_index').then(({ data }) => { setRows(data || []); setLoading(false) })
  }, [])

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Команда AlTeNo Dev</h2>
          <p className="adm-tab-sub">{rows.length} участников</p>
        </div>
      </div>
      <div className="adm-team-list">
        {rows.map(row => (
          <div key={row.id} className="adm-team-row">
            <div className="adm-avatar-xs" style={{ background: row.blob }}>
              {row.avatar_url ? <img src={row.avatar_url} alt="" /> : row.initials}
            </div>
            <div className="adm-team-info">
              <div className="adm-td-strong">{row.name}</div>
              <div className="adm-td-dim">{row.role}</div>
            </div>
            <div className="adm-team-skills">
              {(row.skills || []).slice(0, 3).map(s => <span key={s} className="adm-tag">{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Портфолио (только чтение) ── */
function PortfolioTabReadOnly() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('portfolio').select('*').order('order_index').then(({ data }) => { setRows(data || []); setLoading(false) })
  }, [])

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Портфолио</h2>
          <p className="adm-tab-sub">{rows.length} проектов</p>
        </div>
      </div>
      <div className="adm-cards-grid">
        {rows.map(row => (
          <div key={row.id} className="adm-project-card">
            {row.image_url && <div className="adm-project-img"><img src={row.image_url} alt={row.title} /></div>}
            <div className="adm-project-body">
              <div className="adm-td-strong">{row.title}</div>
              <div className="adm-td-dim adm-clamp">{row.description}</div>
              <div className="adm-tags">{(row.tags || []).map(t => <span key={t} className="adm-tag">{t}</span>)}</div>
            </div>
            {safeUrl(row.link) && (
              <div className="adm-project-actions">
                <a href={safeUrl(row.link)} target="_blank" rel="noreferrer" className="adm-btn-sm">↗ Открыть</a>
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && <div className="adm-empty">Пока нет проектов</div>}
      </div>
    </div>
  )
}

/* ── Музыка ── */
function MusicTabInner() {
  const music = useMusic()
  if (!music?.enabled) return <div className="adm-tab"><p className="adm-field-hint">Музыка сейчас выключена в настройках сайта.</p></div>
  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Музыка</h2>
          <p className="adm-tab-sub">{music.track.title} — {music.track.artist}</p>
        </div>
      </div>
      <button className="adm-btn-primary" onClick={music.toggle}>
        {music.playing ? '⏸ Пауза' : '▶ Играть'}
      </button>
    </div>
  )
}

export default function Account() {
  const [session, setSession] = useState(null)
  const [ready,   setReady]   = useState(false)
  const [tab,     setTab]     = useState('subscription')

  useEffect(() => {
    let alive = true
    getSession().then(s => { if (alive) { setSession(s); setReady(true) } })
    return onAuthChange(s => setSession(s))
  }, [])

  const { sub, loading: subLoading } = useSubscriber(session?.user?.id)

  if (!ready) return <div className="adm-loader">Загрузка...</div>
  if (!session) return <Navigate to="/login" replace />

  const NAV = [
    { id: 'subscription', label: 'Подписка' },
    { id: 'team',         label: 'Команда' },
    { id: 'portfolio',    label: 'Портфолио' },
    { id: 'music',        label: 'Музыка' },
    { id: 'chat',         label: 'Чат поддержки' },
  ]

  return (
    <MusicProvider>
      <div className="adm-layout">
        <aside className="adm-sidebar">
          <div className="adm-sb-brand"><span style={{ fontWeight: 700 }}>Личный кабинет</span></div>
          <nav className="adm-nav">
            {NAV.map(n => (
              <button key={n.id} className={`adm-nav-item${tab === n.id ? ' active' : ''}`} onClick={() => setTab(n.id)}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="adm-sb-footer">
            <div className="adm-nav-item adm-nav-link" style={{ cursor: 'default', opacity: .7 }}>{session.user.email}</div>
            <button className="adm-nav-item adm-nav-logout" onClick={logout}>Выйти</button>
          </div>
        </aside>
        <main className="adm-main">
          {tab === 'subscription' && <SubscriptionTab sub={sub} loading={subLoading} />}
          {tab === 'team'         && <TeamTabReadOnly />}
          {tab === 'portfolio'    && <PortfolioTabReadOnly />}
          {tab === 'music'        && <MusicTabInner />}
          {tab === 'chat'         && <SupportChat userId={session.user.id} />}
        </main>
      </div>
    </MusicProvider>
  )
}
