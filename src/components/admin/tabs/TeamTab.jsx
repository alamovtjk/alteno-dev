import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

const EMPTY = {
  name: '', role: '', initials: '', blob: '#7c3aed',
  skills: '', num: '', avatar_url: '', email: '', portfolio_url: ''
}

const PRESET_COLORS = [
  '#7c3aed','#4f46e5','#0d9488','#10b981',
  '#8c2068','#16a34a','#0891b2','#dc2626',
]

function CardPreview({ form }) {
  const initials = form.initials || (form.name ? form.name.split(' ').map(w => w[0]).join('').slice(0,2) : '??')
  return (
    <div className="adm-card-preview">
      <div className="adm-card-preview-label">Предпросмотр карточки</div>
      <div className="adm-preview-card">
        <div className="adm-preview-num">{form.num || '??'}</div>
        <div className="adm-preview-avatar" style={{ background: form.blob }}>
          {form.avatar_url
            ? <img src={form.avatar_url} alt="" onError={e => e.target.style.display='none'} />
            : <span>{initials}</span>
          }
        </div>
        <div className="adm-preview-name">{form.name || 'Имя участника'}</div>
        <div className="adm-preview-role">{form.role || 'РОЛЬ'}</div>
        <div className="adm-preview-divider" />
        <div className="adm-preview-skills">
          {(form.skills || 'Навык 1, Навык 2').split(',').filter(s => s.trim()).map((s,i) => (
            <span key={i} className="adm-preview-skill">{s.trim()}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TeamTab() {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('team').select('*').order('order_index')
    if (error) setError(error.message)
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))

  const openNew  = () => { setForm({ ...EMPTY, num: String(rows.length + 1).padStart(2, '0') }); setEditing('new') }
  const openEdit = (row) => {
    setForm({ ...row, skills: (row.skills || []).join(', ') })
    setEditing(row)
  }
  const close = () => setEditing(null)

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `team/avatar_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      set('avatar_url', data.publicUrl)
    }
    setUploading(false)
  }

  const save = async () => {
    setSaving(true)
    const payload = {
      name:          form.name.trim(),
      role:          form.role.trim(),
      initials:      form.initials.trim() || form.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
      blob:          form.blob,
      skills:        form.skills.split(',').map(s => s.trim()).filter(Boolean),
      num:           form.num.trim(),
      avatar_url:    form.avatar_url.trim() || null,
      email:         form.email.trim()      || null,
      portfolio_url: form.portfolio_url.trim() || null,
    }
    if (editing === 'new') {
      await supabase.from('team').insert([{ ...payload, order_index: rows.length }])
    } else {
      await supabase.from('team').update(payload).eq('id', editing.id)
    }
    await load()
    setSaving(false)
    setEditing(null)
  }

  const del = async (id) => {
    if (!confirm('Удалить участника?')) return
    await supabase.from('team').delete().eq('id', id)
    setRows(r => r.filter(x => x.id !== id))
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>
  if (error)   return <div className="adm-loader adm-err-txt">{error}</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Команда</h2>
          <p className="adm-tab-sub">{rows.length} участников</p>
        </div>
        <button className="adm-btn-primary" onClick={openNew}>+ Добавить участника</button>
      </div>

      {rows.length === 0 ? (
        <div className="adm-empty-state">
          <div className="adm-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <p>Команда пуста — добавь первого участника</p>
          <button className="adm-btn-primary" onClick={openNew}>+ Добавить участника</button>
        </div>
      ) : (
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
                {(row.skills || []).slice(0,3).map(s => (
                  <span key={s} className="adm-tag">{s}</span>
                ))}
              </div>
              <div className="adm-td-actions">
                <button className="adm-btn-sm" onClick={() => openEdit(row)}>Редактировать</button>
                <button className="adm-btn-sm adm-btn-danger" onClick={() => del(row.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="adm-overlay" onClick={close}>
          <div className="adm-modal adm-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-hd">
              <h3>{editing === 'new' ? '+ Новый участник' : 'Редактировать участника'}</h3>
              <button className="adm-modal-x" onClick={close}>✕</button>
            </div>

            <div className="adm-modal-split">
              {/* Форма */}
              <div className="adm-modal-form-col">

                {/* Фото */}
                <div className="adm-avatar-upload-section">
                  <div
                    className="adm-avatar-upload-circle"
                    style={{ background: form.blob }}
                    onClick={() => fileRef.current?.click()}
                  >
                    {form.avatar_url
                      ? <img src={form.avatar_url} alt="" onError={e => e.target.style.display='none'} />
                      : <span>{form.initials || form.name?.split(' ').map(w=>w[0]).join('').slice(0,2) || '?'}</span>
                    }
                    <div className="adm-avatar-upload-overlay">
                      {uploading ? '...' : '📷'}
                    </div>
                  </div>
                  <div>
                    <button className="adm-btn-ghost adm-btn-sm-text" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? 'Загрузка...' : 'Загрузить фото'}
                    </button>
                    <div className="adm-field-hint">или вставь URL ниже</div>
                  </div>
                  <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}} onChange={uploadAvatar} />
                </div>

                {/* Цвет аватара */}
                <div className="adm-field">
                  <label>Цвет фона аватара</label>
                  <div className="adm-color-presets">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        className={`adm-color-dot${form.blob === c ? ' active' : ''}`}
                        style={{ background: c }}
                        onClick={() => set('blob', c)}
                      />
                    ))}
                    <input type="color" value={form.blob} onChange={f('blob')} className="adm-color-custom" title="Свой цвет" />
                  </div>
                </div>

                <div className="adm-row-2">
                  <div className="adm-field">
                    <label>Имя *</label>
                    <input value={form.name} onChange={f('name')} placeholder="Самир Аламов" autoFocus />
                  </div>
                  <div className="adm-field">
                    <label>Номер карточки</label>
                    <input value={form.num} onChange={f('num')} placeholder="01" maxLength={2} />
                  </div>
                </div>

                <div className="adm-field">
                  <label>Должность / Роль *</label>
                  <input value={form.role} onChange={f('role')} placeholder="CEO · Lead Developer" />
                </div>

                <div className="adm-field">
                  <label>Инициалы <span className="adm-field-hint">(2–3 буквы, если нет фото)</span></label>
                  <input value={form.initials} onChange={f('initials')} placeholder="СА" maxLength={3} />
                </div>

                <div className="adm-field">
                  <label>Навыки <span className="adm-field-hint">(через запятую)</span></label>
                  <input value={form.skills} onChange={f('skills')} placeholder="React, Node.js, AI, Architecture" />
                </div>

                <div className="adm-field">
                  <label>URL фото <span className="adm-field-hint">(если не загружал выше)</span></label>
                  <input value={form.avatar_url} onChange={f('avatar_url')} placeholder="https://..." />
                </div>

                <div className="adm-row-2">
                  <div className="adm-field">
                    <label>Email (для кнопки)</label>
                    <input value={form.email} onChange={f('email')} placeholder="email@example.com" type="email" />
                  </div>
                  <div className="adm-field">
                    <label>Ссылка портфолио</label>
                    <input value={form.portfolio_url} onChange={f('portfolio_url')} placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* Превью */}
              <CardPreview form={form} />
            </div>

            <div className="adm-modal-ft">
              <button className="adm-btn-ghost" onClick={close}>Отмена</button>
              <button
                className="adm-btn-primary"
                onClick={save}
                disabled={saving || !form.name.trim() || !form.role.trim()}
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
