import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

/* Иконка колонки меняется по громкости — обратная связь без цифр */
function VolumeIcon({ value, muted }) {
  if (muted || value === 0) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    )
  }
  if (value < 50) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 010 7" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 010 7" />
      <path d="M18.5 5.5a9 9 0 010 13" />
    </svg>
  )
}

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

export default function MusicTab() {
  const [track,    setTrack]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const [form,     setForm]     = useState({ title: '', artist: '', file_url: '' })
  const [msg,      setMsg]      = useState('')
  const fileRef = useRef(null)

  /* Звук сайта — отдельная настройка от самого трека, живёт в settings */
  const [volume,     setVolume]     = useState(40)
  const [enabled,    setEnabled]    = useState(true)
  const [soundSaving, setSoundSaving] = useState(false)
  const [soundMsg,    setSoundMsg]    = useState('')
  const previewRef = useRef(null)

  const load = async () => {
    setLoading(true)
    const [musicRes, settingsRes] = await Promise.all([
      supabase.from('music').select('*').eq('active', true).maybeSingle(),
      supabase.from('settings').select('key, value').in('key', ['music_volume', 'music_enabled']),
    ])
    if (musicRes.data) {
      setTrack(musicRes.data)
      setForm({
        title:    musicRes.data.title    || '',
        artist:   musicRes.data.artist   || '',
        file_url: musicRes.data.file_url || '',
      })
    }
    for (const { key, value } of settingsRes.data || []) {
      if (key === 'music_volume' && value !== '') {
        const n = Number(value)
        if (Number.isFinite(n)) setVolume(Math.min(100, Math.max(0, n)))
      }
      if (key === 'music_enabled' && value !== '') setEnabled(value !== 'false')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  /* Прослушка на текущей громкости — так видно, что реально услышит посетитель */
  useEffect(() => {
    if (previewRef.current) previewRef.current.volume = volume / 100
  }, [volume])

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

  const saveSound = async () => {
    setSoundSaving(true)
    setSoundMsg('')
    const { error } = await supabase.from('settings').upsert(
      [
        { key: 'music_volume',  value: String(volume) },
        { key: 'music_enabled', value: String(enabled) },
      ],
      { onConflict: 'key' }
    )
    setSoundSaving(false)
    setSoundMsg(error ? 'Ошибка: ' + error.message : 'Сохранено ✓')
    setTimeout(() => setSoundMsg(''), 3000)
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Музыка</h2>
          <p className="adm-tab-sub">
            {track ? 'Активный трек на сайте' : 'Трек ещё не задан — играет файл по умолчанию'}
          </p>
        </div>
      </div>

      {/* ── Управление звуком: громкость и вкл/выкл для всех посетителей ── */}
      <div className="adm-sound-card">
        <div className="adm-sound-hd">
          <div>
            <h3 className="adm-sound-title">Звук на сайте</h3>
            <p className="adm-tab-sub">Громкость и автозапуск фоновой музыки для всех посетителей</p>
          </div>
          <label className="adm-switch" aria-label="Музыка на сайте">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
            <span className="adm-switch-track"><span className="adm-switch-thumb" /></span>
          </label>
        </div>

        <div className={`adm-volume-row${enabled ? '' : ' is-off'}`}>
          <span className="adm-volume-icon"><VolumeIcon value={volume} muted={!enabled} /></span>
          <input
            type="range"
            min="0" max="100"
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            disabled={!enabled}
            className="adm-slider"
            style={{ '--fill': `${volume}%` }}
            aria-label="Громкость"
          />
          <span className="adm-volume-num">{volume}%</span>
        </div>

        <p className="adm-field-hint">
          {enabled
            ? 'Играет автоматически при заходе на сайт (или после первого клика, если браузер блокирует автозапуск).'
            : 'Кнопка и плеер музыки скрыты на сайте — посетители не увидят их вообще.'}
        </p>

        {track?.file_url && (
          <div className="adm-sound-preview">
            <span className="adm-field-hint">Прослушать на этой громкости:</span>
            <audio ref={previewRef} controls src={track.file_url} className="adm-audio" />
          </div>
        )}

        <div className="adm-music-footer">
          {soundMsg && <span className={`adm-msg ${soundMsg.startsWith('Ошибка') ? 'err' : 'ok'}`}>{soundMsg}</span>}
          <button className="adm-btn-primary" onClick={saveSound} disabled={soundSaving}>
            {soundSaving ? 'Сохранение...' : 'Сохранить звук'}
          </button>
        </div>
      </div>

      {/* ── Сам трек ── */}
      <div className="adm-music-card">
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
            </div>
          </div>
        )}

        <div className="adm-divider" />

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
                <span className="adm-btn-icon"><UploadIcon /></span>
                {uploading ? 'Загрузка...' : 'Выбрать файл'}
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
