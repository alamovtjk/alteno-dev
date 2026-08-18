import { useState, useEffect, useCallback, useRef } from 'react'
import '../admin.css'
import { getSession, onAuthChange, logout } from '../lib/adminAuth'
import { supabase, invalidateTable } from '../lib/supabase'
import { toWebp } from '../lib/image'

const PRESET_COLORS = [
  '#7c3aed','#4f46e5','#0d9488','#10b981',
  '#8c2068','#16a34a','#0891b2','#dc2626',
]

const STATUS_LABEL = { pending: 'на проверке', approved: 'опубликовано', rejected: 'отклонено' }

/* Пока карточка/проект уже одобрены и видны на сайте, новая правка не
   переписывает их напрямую — копится в pending_data, пока Самир не
   подтвердит. Это то, что реально редактируется в форме. */
const draftOf = (row) => (row.has_pending_edit && row.pending_data) ? row.pending_data : row

function StatusNote({ row }) {
  if (row.has_pending_edit) return <p className="adm-field-hint">✏️ Есть правки на проверке у Самира — сайт пока показывает старую версию.</p>
  if (row.status === 'pending')  return <p className="adm-field-hint">🕒 Ждёт первой проверки Самиром.</p>
  if (row.status === 'rejected') return <p className="adm-field-hint">❌ Отклонено. Поправь и сохрани — уйдёт на повторную проверку.</p>
  return <p className="adm-field-hint">✅ Опубликовано на сайте.</p>
}

/* ── Моя карточка ── */
function MyCard({ row, onSaved }) {
  const d = draftOf(row)
  const [form, setForm] = useState({
    name: d.name || '', role: d.role || '', initials: d.initials || '', blob: d.blob || '#7c3aed',
    skills: (d.skills || []).join(', '), num: d.num || '',
    avatar_url: d.avatar_url || '', email: d.email || '', portfolio_url: d.portfolio_url || '',
  })
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const upload = await toWebp(file, { maxWidth: 500, quality: 0.85 }).catch(() => file)
    const ext  = upload.name.split('.').pop()
    const path = `team/avatar_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, upload, { upsert: true })
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
    if (row.status === 'approved') {
      // Уже видна всем на /team — не трогаем, копим черновик до одобрения.
      await supabase.from('team').update({ pending_data: payload, has_pending_edit: true }).eq('id', row.id)
    } else {
      // Ещё никогда не была одобрена (pending) или отклонена — правим
      // напрямую и (пере)отправляем на проверку.
      await supabase.from('team').update({ ...payload, status: 'pending' }).eq('id', row.id)
    }
    invalidateTable('team')
    setSaving(false)
    onSaved()
  }

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Моя карточка</h2>
          <p className="adm-tab-sub">Так вы выглядите на публичной странице «Команда»</p>
        </div>
        <span className={`adm-badge adm-badge-${row.has_pending_edit ? 'pending' : row.status}`}>
          {row.has_pending_edit ? 'правка на проверке' : STATUS_LABEL[row.status]}
        </span>
      </div>

      <StatusNote row={row} />

      <div className="adm-avatar-upload-section">
        <div className="adm-avatar-upload-circle" style={{ background: form.blob }} onClick={() => fileRef.current?.click()}>
          {form.avatar_url
            ? <img src={form.avatar_url} alt="" onError={e => e.target.style.display='none'} />
            : <span>{form.initials || form.name?.split(' ').map(w=>w[0]).join('').slice(0,2) || '?'}</span>}
          <div className="adm-avatar-upload-overlay">{uploading ? '...' : '📷'}</div>
        </div>
        <div>
          <button className="adm-btn-ghost adm-btn-sm-text" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Загрузка...' : 'Загрузить фото'}
          </button>
          <div className="adm-field-hint">или вставь URL ниже</div>
        </div>
        <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}} onChange={uploadAvatar} />
      </div>

      <div className="adm-field">
        <label>Цвет фона аватара</label>
        <div className="adm-color-presets">
          {PRESET_COLORS.map(c => (
            <button key={c} className={`adm-color-dot${form.blob === c ? ' active' : ''}`} style={{ background: c }} onClick={() => set('blob', c)} />
          ))}
          <input type="color" value={form.blob} onChange={f('blob')} className="adm-color-custom" title="Свой цвет" />
        </div>
      </div>

      <div className="adm-row-2">
        <div className="adm-field">
          <label>Имя *</label>
          <input value={form.name} onChange={f('name')} placeholder="Имя Фамилия" />
        </div>
        <div className="adm-field">
          <label>Номер карточки</label>
          <input value={form.num} onChange={f('num')} placeholder="02" maxLength={2} />
        </div>
      </div>

      <div className="adm-field">
        <label>Должность / Роль *</label>
        <input value={form.role} onChange={f('role')} placeholder="Frontend Developer" />
      </div>

      <div className="adm-field">
        <label>Инициалы <span className="adm-field-hint">(если нет фото)</span></label>
        <input value={form.initials} onChange={f('initials')} placeholder="ИФ" maxLength={3} />
      </div>

      <div className="adm-field">
        <label>Навыки <span className="adm-field-hint">(через запятую)</span></label>
        <input value={form.skills} onChange={f('skills')} placeholder="React, Figma, SEO" />
      </div>

      <div className="adm-row-2">
        <div className="adm-field">
          <label>Email</label>
          <input value={form.email} onChange={f('email')} placeholder="you@example.com" type="email" />
        </div>
        <div className="adm-field">
          <label>Ссылка на портфолио</label>
          <input value={form.portfolio_url} onChange={f('portfolio_url')} placeholder="https://..." />
        </div>
      </div>

      <div className="adm-modal-ft" style={{ padding: '16px 0 0', borderTop: 'none' }}>
        <button className="adm-btn-primary" onClick={save} disabled={saving || !form.name.trim() || !form.role.trim()}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}

/* ── Мои проекты ── */
const PORTFOLIO_EMPTY = { title:'', description:'', tags:'', image_url:'', link:'' }

function MyProjects({ userId }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(PORTFOLIO_EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('portfolio').select('*').eq('owner_user_id', userId).order('created_at', { ascending: false })
    setRows(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const openNew  = () => { setForm(PORTFOLIO_EMPTY); setEditing('new') }
  const openEdit = (row) => {
    const d = draftOf(row)
    setForm({ title: d.title || '', description: d.description || '', tags: (d.tags || []).join(', '), image_url: d.image_url || '', link: d.link || '' })
    setEditing(row)
  }
  const close = () => setEditing(null)

  const uploadImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const upload = await toWebp(file, { maxWidth: 1400, quality: 0.85 }).catch(() => file)
    const ext  = upload.name.split('.').pop()
    const path = `portfolio/case_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, upload, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      setForm(p => ({ ...p, image_url: data.publicUrl }))
    }
    setUploading(false)
    e.target.value = ''
  }

  const save = async () => {
    setSaving(true)
    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      tags:        form.tags.split(',').map(s => s.trim()).filter(Boolean),
      image_url:   form.image_url.trim() || null,
      link:        form.link.trim()      || null,
    }
    if (editing === 'new') {
      await supabase.from('portfolio').insert([{ ...payload, owner_user_id: userId, status: 'pending' }])
    } else if (editing.status === 'approved') {
      await supabase.from('portfolio').update({ pending_data: payload, has_pending_edit: true }).eq('id', editing.id)
    } else {
      await supabase.from('portfolio').update({ ...payload, status: 'pending' }).eq('id', editing.id)
    }
    invalidateTable('portfolio')
    await load()
    setSaving(false)
    setEditing(null)
  }

  const del = async (id) => {
    if (!confirm('Удалить проект?')) return
    await supabase.from('portfolio').delete().eq('id', id)
    invalidateTable('portfolio')
    load()
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Мои проекты</h2>
          <p className="adm-tab-sub">{rows.length} проектов в портфолио</p>
        </div>
        <button className="adm-btn-primary" onClick={openNew}>+ Добавить проект</button>
      </div>

      <div className="adm-cards-grid">
        {rows.map(row => (
          <div key={row.id} className="adm-project-card">
            {row.image_url && <div className="adm-project-img"><img src={row.image_url} alt={row.title} /></div>}
            <div className="adm-project-body">
              <div className="adm-td-strong">
                {row.title}
                <span className={`adm-badge adm-badge-${row.has_pending_edit ? 'pending' : row.status}`}>
                  {row.has_pending_edit ? 'правка' : STATUS_LABEL[row.status]}
                </span>
              </div>
              <div className="adm-td-dim adm-clamp">{row.description}</div>
            </div>
            <div className="adm-project-actions">
              <button className="adm-btn-sm" onClick={() => openEdit(row)}>Ред.</button>
              <button className="adm-btn-sm adm-btn-danger" onClick={() => del(row.id)}>Удал.</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="adm-empty">Пока нет проектов — нажми «+ Добавить проект»</div>}
      </div>

      {editing && (
        <div className="adm-overlay" onClick={close}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-hd">
              <h3>{editing === 'new' ? 'Новый проект' : 'Редактировать проект'}</h3>
              <button className="adm-modal-x" onClick={close}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field">
                <label>Название *</label>
                <input value={form.title} onChange={f('title')} placeholder="Название проекта" />
              </div>
              <div className="adm-field">
                <label>Описание</label>
                <textarea value={form.description} onChange={f('description')} placeholder="Краткое описание..." rows={3} />
              </div>
              <div className="adm-field">
                <label>Теги (через запятую)</label>
                <input value={form.tags} onChange={f('tags')} placeholder="React, Figma" />
              </div>
              <div className="adm-field">
                <label>Изображение</label>
                <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={uploadImage} />
                {form.image_url && <div className="adm-project-img" style={{ marginBottom: 10 }}><img src={form.image_url} alt="" /></div>}
                <button className="adm-btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Загрузка...' : '📷 Загрузить изображение'}
                </button>
              </div>
              <div className="adm-field">
                <label>Ссылка на проект</label>
                <input value={form.link} onChange={f('link')} placeholder="https://..." />
              </div>
            </div>
            <div className="adm-modal-ft">
              <button className="adm-btn-ghost" onClick={close}>Отмена</button>
              <button className="adm-btn-primary" onClick={save} disabled={saving || !form.title.trim()}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Вся команда (только чтение) ── */
function WholeTeam() {
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
          <h2 className="adm-tab-title">Вся команда</h2>
          <p className="adm-tab-sub">Только просмотр — свою карточку правьте во вкладке «Моя карточка»</p>
        </div>
      </div>
      <div className="adm-team-list">
        {rows.map(row => (
          <div key={row.id} className="adm-team-row">
            <div className="adm-avatar-xs" style={{ background: row.blob }}>
              {row.avatar_url ? <img src={row.avatar_url} alt="" /> : row.initials}
            </div>
            <div className="adm-team-info">
              <div className="adm-td-strong">
                {row.name}
                {row.status !== 'approved' && <span className={`adm-badge adm-badge-${row.status}`}>{STATUS_LABEL[row.status]}</span>}
              </div>
              <div className="adm-td-dim">{row.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Точка входа ── */
export default function Panel() {
  const [session, setSession] = useState(null)
  const [ready,   setReady]   = useState(false)
  const [row,     setRow]     = useState(null)
  const [rowLoading, setRowLoading] = useState(true)
  const [tab, setTab] = useState('card')

  useEffect(() => {
    let alive = true
    getSession().then(s => { if (alive) { setSession(s); setReady(true) } })
    return onAuthChange(s => setSession(s))
  }, [])

  const loadRow = useCallback(async () => {
    if (!session?.user?.id) return
    setRowLoading(true)
    const { data } = await supabase.from('team').select('*').eq('owner_user_id', session.user.id).maybeSingle()
    setRow(data)
    setRowLoading(false)
  }, [session])

  useEffect(() => { loadRow() }, [loadRow])

  if (!ready) return <div className="adm-loader">Загрузка...</div>
  if (!session) return <div className="adm-login-wrap"><div className="adm-login-card"><p className="adm-login-hint">Нужно войти — <a href="/login">/login</a></p></div></div>
  if (rowLoading) return <div className="adm-loader">Загрузка...</div>
  if (!row) return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <p className="adm-login-hint">Эта панель — для команды AlTeNo Dev</p>
        <p className="adm-field-hint">У аккаунта {session.user.email} нет карточки в команде. Если это ошибка — напишите Самиру.</p>
        <button className="adm-btn-ghost adm-btn-full" style={{ marginTop: 16 }} onClick={logout}>Выйти</button>
      </div>
    </div>
  )

  const NAV = [
    { id: 'card',     label: 'Моя карточка' },
    { id: 'projects', label: 'Мои проекты' },
    { id: 'team',     label: 'Вся команда' },
  ]

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sb-brand"><span style={{ fontWeight: 700 }}>Панель команды</span></div>
        <nav className="adm-nav">
          {NAV.map(n => (
            <button key={n.id} className={`adm-nav-item${tab === n.id ? ' active' : ''}`} onClick={() => setTab(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="adm-sb-footer">
          <a href="/team" target="_blank" rel="noreferrer" className="adm-nav-item adm-nav-link">Публичная страница команды</a>
          <button className="adm-nav-item adm-nav-logout" onClick={logout}>Выйти</button>
        </div>
      </aside>
      <main className="adm-main">
        {tab === 'card'     && <MyCard row={row} onSaved={loadRow} />}
        {tab === 'projects' && <MyProjects userId={session.user.id} />}
        {tab === 'team'      && <WholeTeam />}
      </main>
    </div>
  )
}
