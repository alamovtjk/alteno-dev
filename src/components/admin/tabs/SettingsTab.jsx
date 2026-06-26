import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const DEFAULTS = {
  company_name: 'AlTeNo Dev',
  tagline: 'AI Веб-студия из Душанбе',
  email: '',
  phone: '',
  telegram: '',
  instagram: '',
  github: '',
  whatsapp: '',
}

export default function SettingsTab() {
  const [form,    setForm]    = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('settings').select('key, value')
      if (data?.length) {
        const merged = { ...DEFAULTS }
        data.forEach(({ key, value }) => { merged[key] = value })
        setForm(merged)
      }
      setLoading(false)
    }
    load()
  }, [])

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const save = async () => {
    setSaving(true)
    setMsg('')
    const rows = Object.entries(form).map(([key, value]) => ({ key, value: value || '' }))
    await supabase.from('settings').upsert(rows, { onConflict: 'key' })
    setSaving(false)
    setMsg('Сохранено ✓')
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Настройки сайта</h2>
          <p className="adm-tab-sub">Контакты, соцсети, основная информация</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {msg && <span className="adm-msg ok">{msg}</span>}
          <button className="adm-btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="adm-settings-grid">

        {/* Основное */}
        <div className="adm-settings-block">
          <div className="adm-settings-block-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            Основное
          </div>
          <div className="adm-field">
            <label>Название компании</label>
            <input value={form.company_name} onChange={f('company_name')} placeholder="AlTeNo Dev" />
          </div>
          <div className="adm-field">
            <label>Подзаголовок</label>
            <input value={form.tagline} onChange={f('tagline')} placeholder="AI Веб-студия из Душанбе" />
          </div>
        </div>

        {/* Контакты */}
        <div className="adm-settings-block">
          <div className="adm-settings-block-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            Контакты
          </div>
          <div className="adm-field">
            <label>Email</label>
            <input value={form.email} onChange={f('email')} placeholder="hello@alteno.dev" type="email" />
          </div>
          <div className="adm-field">
            <label>Телефон</label>
            <input value={form.phone} onChange={f('phone')} placeholder="+992 XX XXX XXXX" />
          </div>
          <div className="adm-field">
            <label>WhatsApp</label>
            <input value={form.whatsapp} onChange={f('whatsapp')} placeholder="+992..." />
          </div>
        </div>

        {/* Соцсети */}
        <div className="adm-settings-block">
          <div className="adm-settings-block-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            Соцсети
          </div>
          <div className="adm-field">
            <label>Telegram</label>
            <div className="adm-input-prefix-wrap">
              <span className="adm-input-prefix">t.me/</span>
              <input value={form.telegram} onChange={f('telegram')} placeholder="username" className="adm-input-prefixed" />
            </div>
          </div>
          <div className="adm-field">
            <label>Instagram</label>
            <div className="adm-input-prefix-wrap">
              <span className="adm-input-prefix">instagram.com/</span>
              <input value={form.instagram} onChange={f('instagram')} placeholder="username" className="adm-input-prefixed" />
            </div>
          </div>
          <div className="adm-field">
            <label>GitHub</label>
            <div className="adm-input-prefix-wrap">
              <span className="adm-input-prefix">github.com/</span>
              <input value={form.github} onChange={f('github')} placeholder="username" className="adm-input-prefixed" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
