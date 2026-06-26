import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

export default function MusicTab() {
  const [track,    setTrack]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const [form,     setForm]     = useState({ title: '', artist: '', file_url: '' })
  const [msg,      setMsg]      = useState('')
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('music').select('*').eq('active', true).single()
    if (data) {
      setTrack(data)
      setForm({ title: data.title || '', artist: data.artist || '', file_url: data.file_url || '' })
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const uploadFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg('')
    const ext  = file.name.split('.').pop()
    const path = `music/track_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
    if (error) { setMsg('Ошибка загрузки: ' + error.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
    setForm(p => ({ ...p, file_url: urlData.publicUrl }))
    setUploading(false)
    setMsg('Файл загружен ✓')
  }

  const save = async () => {
    setSaving(true)
    setMsg('')
    const payload = {
      title:    form.title.trim(),
      artist:   form.artist.trim(),
      file_url: form.file_url.trim(),
      active:   true,
    }
    if (track) {
      await supabase.from('music').update(payload).eq('id', track.id)
    } else {
      await supabase.from('music').insert([payload])
    }
    await load()
    setSaving(false)
    setMsg('Сохранено ✓')
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Музыка</h2>
          <p className="adm-tab-sub">Активный трек на сайте</p>
        </div>
      </div>

      <div className="adm-music-card">
        {/* Текущий трек */}
        {track && (
          <div className="adm-music-current">
            <div className="adm-music-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <div>
              <div className="adm-td-strong">{track.title || 'Без названия'}</div>
              <div className="adm-td-dim">{track.artist || 'Неизвестный артист'}</div>
              {track.file_url && (
                <audio controls src={track.file_url} className="adm-audio" />
              )}
            </div>
          </div>
        )}

        <div className="adm-divider" />

        {/* Форма редактирования */}
        <div className="adm-music-form">
          <div className="adm-row-2">
            <div className="adm-field">
              <label>Название трека</label>
              <input value={form.title} onChange={f('title')} placeholder="Hand Covers Bruise" />
            </div>
            <div className="adm-field">
              <label>Артист</label>
              <input value={form.artist} onChange={f('artist')} placeholder="Trent Reznor & Atticus Ross" />
            </div>
          </div>

          <div className="adm-field">
            <label>Загрузить новый файл (MP3)</label>
            <div className="adm-upload-row">
              <input
                type="file"
                accept="audio/mp3,audio/*"
                ref={fileRef}
                style={{ display: 'none' }}
                onChange={uploadFile}
              />
              <button
                className="adm-btn-ghost"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Загрузка...' : '📁 Выбрать файл'}
              </button>
              {form.file_url && (
                <span className="adm-file-ok">
                  ✓ {form.file_url.split('/').pop()}
                </span>
              )}
            </div>
          </div>

          <div className="adm-field">
            <label>Или вставь прямую ссылку на MP3</label>
            <input value={form.file_url} onChange={f('file_url')} placeholder="https://..." />
          </div>

          <div className="adm-music-footer">
            {msg && <span className={`adm-msg ${msg.includes('Ошибка') ? 'err' : 'ok'}`}>{msg}</span>}
            <button
              className="adm-btn-primary"
              onClick={save}
              disabled={saving || !form.title.trim()}
            >
              {saving ? 'Сохранение...' : 'Сохранить трек'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
