import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

const EMPTY = {
  name: '', role: '', initials: '', blob: '#7c3aed',
  skills: '', num: '', avatar_url: '', email: '', portfolio_url: ''
}

export default function TeamTab() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('team').select('*').order('order_index')
    if (error) setError(error.message)
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const openNew  = () => { setForm(EMPTY); setEditing('new') }
  const openEdit = (row) => {
    setForm({ ...row, skills: (row.skills || []).join(', ') })
    setEditing(row)
  }
  const close = () => setEditing(null)

  const save = async () => {
    setSaving(true)
    const payload = {
      name:          form.name.trim(),
      role:          form.role.trim(),
      initials:      form.initials.trim(),
      blob:          form.blob,
      skills:        form.skills.split(',').map(s => s.trim()).filter(Boolean),
      num:           form.num.trim(),
      avatar_url:    form.avatar_url.trim() || null,
      email:         form.email.trim()     || null,
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
        <button className="adm-btn-primary" onClick={openNew}>+ Добавить</button>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>№</th><th>Аватар</th><th>Имя</th><th>Роль</th><th>Навыки</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td><code className="adm-mono">{row.num}</code></td>
                <td>
                  <div className="adm-avatar-xs" style={{ background: row.blob }}>
                    {row.avatar_url ? <img src={row.avatar_url} alt="" /> : row.initials}
                  </div>
                </td>
                <td className="adm-td-strong">{row.name}</td>
                <td className="adm-td-dim">{row.role}</td>
                <td className="adm-td-dim">{(row.skills || []).join(', ')}</td>
                <td className="adm-td-actions">
                  <button className="adm-btn-sm" onClick={() => openEdit(row)}>Ред.</button>
                  <button className="adm-btn-sm adm-btn-danger" onClick={() => del(row.id)}>Удал.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="adm-empty">Нет участников — нажми «+ Добавить»</div>}
      </div>

      {editing && (
        <div className="adm-overlay" onClick={close}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-hd">
              <h3>{editing === 'new' ? 'Новый участник' : 'Редактировать'}</h3>
              <button className="adm-modal-x" onClick={close}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-row-2">
                <div className="adm-field">
                  <label>Имя *</label>
                  <input value={form.name} onChange={f('name')} placeholder="Самир Аламов" />
                </div>
                <div className="adm-field">
                  <label>Номер</label>
                  <input value={form.num} onChange={f('num')} placeholder="01" maxLength={2} />
                </div>
              </div>
              <div className="adm-field">
                <label>Роль *</label>
                <input value={form.role} onChange={f('role')} placeholder="CEO · Lead Developer" />
              </div>
              <div className="adm-row-2">
                <div className="adm-field">
                  <label>Инициалы</label>
                  <input value={form.initials} onChange={f('initials')} placeholder="СА" maxLength={3} />
                </div>
                <div className="adm-field">
                  <label>Цвет аватара</label>
                  <div className="adm-color-row">
                    <input type="color" value={form.blob} onChange={f('blob')} />
                    <span className="adm-mono">{form.blob}</span>
                  </div>
                </div>
              </div>
              <div className="adm-field">
                <label>Навыки (через запятую)</label>
                <input value={form.skills} onChange={f('skills')} placeholder="React, Node.js, AI, Architecture" />
              </div>
              <div className="adm-field">
                <label>URL фото (необязательно)</label>
                <input value={form.avatar_url} onChange={f('avatar_url')} placeholder="https://..." />
              </div>
              <div className="adm-row-2">
                <div className="adm-field">
                  <label>Email</label>
                  <input value={form.email} onChange={f('email')} placeholder="email@example.com" type="email" />
                </div>
                <div className="adm-field">
                  <label>Portfolio URL</label>
                  <input value={form.portfolio_url} onChange={f('portfolio_url')} placeholder="https://..." />
                </div>
              </div>
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
