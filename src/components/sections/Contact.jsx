import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'

const TG_TOKEN   = import.meta.env.VITE_TG_TOKEN   || ''
const TG_CHAT_ID = import.meta.env.VITE_TG_CHAT_ID || ''
const RL_KEY      = 'alteno_rl'
const MAX_PER_DAY = 2

const SOCIAL = [
  {
    key: 'email',
    href: 'mailto:alamovsamir4@gmail.com',
    label: 'alamovsamir4@gmail.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
      </svg>
    ),
  },
  {
    key: 'tg',
    href: 'https://t.me/samiralamov',
    label: '@samiralamov',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 4L3 11l6 2 2 6 3-4 4 3z"/>
      </svg>
    ),
  },
  {
    key: 'ig',
    href: 'https://instagram.com/alamovtjk',
    label: '@alamovtjk',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12" r="4.5"/>
        <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    key: 'gh',
    href: 'https://github.com/alamovtjk',
    label: 'alamovtjk',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-4 1.5-4-2-6-2m12 4v-3a3 3 0 0 0-1-2c3 0 5-2 5-5a4 4 0 0 0-1-3 4 4 0 0 0 0-3s-1 0-3 1a11 11 0 0 0-6 0C7 2 6 2 6 2a4 4 0 0 0 0 3 4 4 0 0 0-1 3c0 3 2 5 5 5a3 3 0 0 0-1 2v3"/>
      </svg>
    ),
  },
]

function getRLData() {
  try { return JSON.parse(localStorage.getItem(RL_KEY) || '{}') } catch { return {} }
}
function getTodayCount() {
  const data = getRLData()
  const today = new Date().toDateString()
  return data.date === today ? (data.count || 0) : 0
}
function recordSubmission() {
  const today = new Date().toDateString()
  localStorage.setItem(RL_KEY, JSON.stringify({ date: today, count: getTodayCount() + 1 }))
}

async function sendNotifications(form) {
  const now = new Date().toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const text =
    `🆕 *Новая заявка — AlTeNo Dev*\n\n` +
    `👤 *Имя:* ${form.name}\n` +
    `📞 *Контакт:* ${form.contact}\n` +
    `📝 *Задача:* ${form.task || '—'}\n\n` +
    `⏰ ${now}`

  await Promise.allSettled([
    TG_TOKEN && TG_CHAT_ID
      ? fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'Markdown' }),
        }).catch(() => {})
      : Promise.resolve(),

    fetch('https://formsubmit.co/ajax/alamovsamir4@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: form.name,
        contact: form.contact,
        task: form.task || '—',
        _subject: '🆕 Новая заявка — AlTeNo Dev',
        _template: 'table',
      }),
    }).catch(() => {}),
  ])
}

export default function Contact() {
  const { t } = useLanguage()
  const [form, setForm]       = useState({ name: '', contact: '', task: '' })
  const [sending, setSending] = useState(false)
  const [status, setStatus]   = useState('idle')

  useEffect(() => {
    if (getTodayCount() >= MAX_PER_DAY) setStatus('limited')
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.contact || sending || status !== 'idle') return
    if (getTodayCount() >= MAX_PER_DAY) { setStatus('limited'); return }

    setSending(true)
    await sendNotifications(form)
    recordSubmission()
    setSending(false)
    setForm({ name: '', contact: '', task: '' })
    setStatus('success')
    if (getTodayCount() < MAX_PER_DAY) setTimeout(() => setStatus('idle'), 4200)
  }

  return (
    <section id="contact" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="banner reveal">
          <div className="banner-inner">

            {/* Left */}
            <div className="b-head">
              <div className="eyebrow"><span className="line" />{t.contact.eyebrow}</div>
              <h2 className="ub">
                {t.contact.t1} <span className="grad">{t.contact.t2}</span>
              </h2>
              <p className="lead">{t.contact.lead}</p>

              <div className="checks">
                {[t.contact.ch1, t.contact.ch2, t.contact.ch3, t.contact.ch4].map((ch, i) => (
                  <div key={i} className="check">
                    <span className="tick">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </span>
                    <span>{ch}</span>
                  </div>
                ))}
              </div>

              <div className="contacts-row">
                {SOCIAL.map(s => (
                  <a key={s.key} className="clink" href={s.href}
                    target={s.key !== 'email' ? '_blank' : undefined} rel="noreferrer">
                    {s.icon}
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="form-card">
              {status === 'success' && (
                <div className="success-state show">
                  <div className="ring2">
                    <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 className="ub">{t.contact.sucT}</h3>
                  <p>{t.contact.sucD}</p>
                </div>
              )}

              {status === 'limited' && (
                <div className="success-state show" style={{ '--ring-c': '#f59e0b' }}>
                  <div className="ring2" style={{ borderColor: 'rgba(245,158,11,.4)', background: 'rgba(245,158,11,.1)' }}>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" stroke="#f59e0b" strokeLinecap="round">
                      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    </svg>
                  </div>
                  <h3 className="ub" style={{ fontSize: 18 }}>{t.contact.limitT}</h3>
                  <p>{t.contact.limitD}</p>
                </div>
              )}

              <form onSubmit={submit} noValidate style={{ opacity: status !== 'idle' ? 0 : 1, pointerEvents: status !== 'idle' ? 'none' : 'auto', transition: 'opacity .3s' }}>
                <div className="field">
                  <label>{t.contact.lname}</label>
                  <input type="text" required placeholder={t.contact.pname}
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="field">
                  <label>{t.contact.lcontact}</label>
                  <input type="text" required placeholder={t.contact.pcontact}
                    value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
                </div>
                <div className="field">
                  <label>{t.contact.ltask}</label>
                  <textarea placeholder={t.contact.ptask}
                    value={form.task} onChange={e => setForm({ ...form, task: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary"
                  disabled={sending} style={{ opacity: sending ? .65 : 1 }}>
                  {sending ? '...' : t.contact.submit}
                  {!sending && (
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 5l7 7-7 7" stroke="#fff"/>
                    </svg>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
