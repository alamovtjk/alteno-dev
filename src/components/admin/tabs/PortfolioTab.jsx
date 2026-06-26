import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

const EMPTY = { title: '', description: '', tags: '', image_url: '', link: '' }

export default function PortfolioTab() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('portfolio').select('*').order('order_index')
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const openNew  = () => { setForm(EMPTY); setEditing('new') }
  const openEdit = (row) => {
    setForm({ ...row, tags: (row.tags || []).join(', ') })
    setEditing(row)
  }
  const close = () => setEditing(null)

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
      await supabase.from('portfolio').insert([{ ...payload, order_index: rows.length }])
    } else {
      await supabase.from('portfolio').update(payload).eq('id', editing.id)
    }
    await load()
    setSaving(false)
    setEditing(null)
  }

  const del = async (id) => {
    if (!confirm('Удалить проект?')) return
    await supabase.from('portfolio').delete().eq('id', id)
    setRows(r => r.filter(x => x.id !== id))
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Портфолио</h2>
          <p className="adm-tab-sub">{rows.length} проектов</p>
        </div>
        <button className="adm-btn-primary" onClick={openNew}>+ Добавить проект</button>
      </div>

      <div className="adm-cards-grid">
        {rows.map(row => (
          <div key={row.id} className="adm-project-card">
            {row.image_url && (
              <div className="adm-project-img">
                <img src={row.image_url} alt={row.title} />
              </div>
            )}
            <div className="adm-project-body">
              <div className="adm-td-strong">{row.title}</div>
              <div className="adm-td-dim adm-clamp">{row.description}</div>
              <div className="adm-tags">
                {(row.tags || []).map(t => <span key={t} className="adm-tag">{t}</span>)}
              </div>
            </div>
            <div className="adm-project-actions">
              {row.link && <a href={row.link} target="_blank" rel="noreferrer" className="adm-btn-sm">↗ Открыть</a>}
              <button className="adm-btn-sm" onClick={() => openEdit(row)}>Ред.</button>
              <button className="adm-btn-sm adm-btn-danger" onClick={() => del(row.id)}>Удал.</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="adm-empty">Нет проектов — нажми «+ Добавить проект»</div>}
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
                <input value={form.title} onChange={f('title')} placeholder="AlTeNo Dev — сайт студии" />
              </div>
              <div className="adm-field">
                <label>Описание</label>
                <textarea value={form.description} onChange={f('description')} placeholder="Краткое описание проекта..." rows={3} />
              </div>
              <div className="adm-field">
                <label>Теги (через запятую)</label>
                <input value={form.tags} onChange={f('tags')} placeholder="React, Figma, SEO" />
              </div>
              <div className="adm-field">
                <label>URL изображения</label>
                <input value={form.image_url} onChange={f('image_url')} placeholder="https://..." />
              </div>
              <div className="adm-field">
                <label>Ссылка на проект</label>
                <input value={form.link} onChange={f('link')} placeholder="https://..." />
              </div>
            </div>
            <div className="adm-modal-ft">
              <button className="adm-btn-ghost" onClick={close}>Отмена</button>
              <button
                className="adm-btn-primary"
                onClick={save}
                disabled={saving || !form.title.trim()}
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
