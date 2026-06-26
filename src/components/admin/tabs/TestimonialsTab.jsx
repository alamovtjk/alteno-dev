import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

const EMPTY = { name: '', company: '', text: '', avatar_url: '' }

export default function TestimonialsTab() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('testimonials').select('*').order('order_index')
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const openNew  = () => { setForm(EMPTY); setEditing('new') }
  const openEdit = (row) => { setForm(row); setEditing(row) }
  const close    = () => setEditing(null)

  const save = async () => {
    setSaving(true)
    const payload = {
      name:       form.name.trim(),
      company:    form.company.trim()    || null,
      text:       form.text.trim(),
      avatar_url: form.avatar_url.trim() || null,
    }
    if (editing === 'new') {
      await supabase.from('testimonials').insert([{ ...payload, order_index: rows.length }])
    } else {
      await supabase.from('testimonials').update(payload).eq('id', editing.id)
    }
    await load()
    setSaving(false)
    setEditing(null)
  }

  const del = async (id) => {
    if (!confirm('Удалить отзыв?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    setRows(r => r.filter(x => x.id !== id))
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Отзывы</h2>
          <p className="adm-tab-sub">{rows.length} отзывов</p>
        </div>
        <button className="adm-btn-primary" onClick={openNew}>+ Добавить отзыв</button>
      </div>

      <div className="adm-list">
        {rows.map(row => (
          <div key={row.id} className="adm-review-card">
            <div className="adm-review-avatar">
              {row.avatar_url
                ? <img src={row.avatar_url} alt={row.name} />
                : <span>{(row.name || '?')[0]}</span>
              }
            </div>
            <div className="adm-review-body">
              <div className="adm-td-strong">{row.name} <span className="adm-td-dim">— {row.company}</span></div>
              <div className="adm-review-text">«{row.text}»</div>
            </div>
            <div className="adm-td-actions">
              <button className="adm-btn-sm" onClick={() => openEdit(row)}>Ред.</button>
              <button className="adm-btn-sm adm-btn-danger" onClick={() => del(row.id)}>Удал.</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="adm-empty">Нет отзывов — нажми «+ Добавить отзыв»</div>}
      </div>

      {editing && (
        <div className="adm-overlay" onClick={close}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-hd">
              <h3>{editing === 'new' ? 'Новый отзыв' : 'Редактировать отзыв'}</h3>
              <button className="adm-modal-x" onClick={close}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-row-2">
                <div className="adm-field">
                  <label>Имя клиента *</label>
                  <input value={form.name} onChange={f('name')} placeholder="Иван Иванов" />
                </div>
                <div className="adm-field">
                  <label>Компания</label>
                  <input value={form.company} onChange={f('company')} placeholder="ООО «Бизнес»" />
                </div>
              </div>
              <div className="adm-field">
                <label>Текст отзыва *</label>
                <textarea value={form.text} onChange={f('text')} placeholder="Отличная работа! Сайт готов в срок..." rows={4} />
              </div>
              <div className="adm-field">
                <label>URL фото (необязательно)</label>
                <input value={form.avatar_url} onChange={f('avatar_url')} placeholder="https://..." />
              </div>
            </div>
            <div className="adm-modal-ft">
              <button className="adm-btn-ghost" onClick={close}>Отмена</button>
              <button
                className="adm-btn-primary"
                onClick={save}
                disabled={saving || !form.name.trim() || !form.text.trim()}
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
