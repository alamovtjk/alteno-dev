import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { toWebp } from '../../../lib/image'

/* Совпадает с DEFAULT_SETTINGS в SettingsContext — админка показывает то,
   что реально отрисовано на сайте, пока настройки не сохранены */
const DEFAULTS = {
  company_name: 'AlTeNo Dev',
  tagline: 'AI Веб-студия из Душанбе',
  email: 'alamovsamir4@gmail.com',
  phone: '',
  telegram: 'samiralamov',
  instagram: 'alamovtjk',
  github: 'alamovtjk',
  whatsapp: '',
  sub_price: '',
  sub_requisites: '',
  ad_enabled: 'false',
  ad_image_url: '',
  ad_image_mobile_url: '',
  ad_link: '',
}

export default function SettingsTab() {
  const [form,      setForm]      = useState(DEFAULTS)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState('')
  const [uploading, setUploading] = useState('') // '' | 'desktop' | 'mobile'
  const fileRef       = useRef(null)
  const fileMobileRef = useRef(null)

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
  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))

  /* Десктоп 1200×300 (4:1) — 1600px по ширине с запасом на retina.
     Мобильный 800×400 (2:1) — обрезка та же пропорция, что на телефоне
     реально показывается (см. .promo-slot в alteno.css), просто меньше
     разрешение, раз и так занимает четверть экрана. */
  const uploadAdImage = (field, maxWidth) => async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const kind = field === 'ad_image_url' ? 'desktop' : 'mobile'
    setUploading(kind)
    const upload = await toWebp(file, { maxWidth, quality: 0.85 }).catch(() => file)
    const ext  = upload.name.split('.').pop()
    const path = `promo/slot_${kind}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, upload, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      set(field, data.publicUrl)
    }
    setUploading('')
    e.target.value = ''
  }

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

        {/* Подписка на видео-уроки */}
        <div className="adm-settings-block">
          <div className="adm-settings-block-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Подписка
          </div>
          <p className="adm-field-hint" style={{ marginBottom: 8 }}>
            Показывает бот студенту перед оплатой — правится тут, без обращения ко мне.
          </p>
          <div className="adm-field">
            <label>Цена подписки (1 месяц)</label>
            <input value={form.sub_price} onChange={f('sub_price')} placeholder="напр. 50 сомони" />
          </div>
          <div className="adm-field">
            <label>Реквизиты для оплаты</label>
            <textarea value={form.sub_requisites} onChange={f('sub_requisites')} placeholder="Карта: 0000 0000 0000 0000, Алиф Банк, получатель — Самир А." rows={3} />
          </div>
        </div>

        {/* Рекламный баннер */}
        <div className="adm-settings-block">
          <div className="adm-settings-block-title" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              Реклама
            </span>
            <label className="adm-switch" aria-label="Показывать баннер на сайте">
              <input type="checkbox" checked={form.ad_enabled === 'true'} onChange={e => set('ad_enabled', e.target.checked ? 'true' : 'false')} />
              <span className="adm-switch-track"><span className="adm-switch-thumb" /></span>
            </label>
          </div>
          <p className="adm-field-hint" style={{ marginBottom: 8 }}>
            Показывается на главной между «Портфолио» и разделом про приложения.
            Два отдельных баннера — сайт сам покажет нужный по ширине экрана.
          </p>

          <div className="adm-field">
            <label>Баннер для десктопа <span className="adm-field-hint">(1200×300px, пропорция 4:1)</span></label>
            <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={uploadAdImage('ad_image_url', 1600)} />
            {form.ad_image_url && (
              <div className="adm-project-img" style={{ marginBottom: 10, aspectRatio: '4 / 1' }}>
                <img src={form.ad_image_url} alt="" onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}
            <button className="adm-btn-ghost" onClick={() => fileRef.current?.click()} disabled={!!uploading}>
              {uploading === 'desktop' ? 'Загрузка...' : '🖥 Загрузить для десктопа'}
            </button>
          </div>

          <div className="adm-field">
            <label>Баннер для телефона <span className="adm-field-hint">(800×400px, пропорция 2:1)</span></label>
            <input type="file" accept="image/*" ref={fileMobileRef} style={{ display: 'none' }} onChange={uploadAdImage('ad_image_mobile_url', 900)} />
            {form.ad_image_mobile_url && (
              <div className="adm-project-img" style={{ marginBottom: 10, aspectRatio: '2 / 1', maxWidth: 260 }}>
                <img src={form.ad_image_mobile_url} alt="" onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}
            <button className="adm-btn-ghost" onClick={() => fileMobileRef.current?.click()} disabled={!!uploading}>
              {uploading === 'mobile' ? 'Загрузка...' : '📱 Загрузить для телефона'}
            </button>
            <div className="adm-field-hint" style={{ marginTop: 6 }}>Необязательно — если не загрузить, на телефоне обрежется десктопная картинка по центру.</div>
          </div>

          <div className="adm-field">
            <label>Ссылка при клике</label>
            <input value={form.ad_link} onChange={f('ad_link')} placeholder="https://..." />
          </div>
        </div>

      </div>
    </div>
  )
}
