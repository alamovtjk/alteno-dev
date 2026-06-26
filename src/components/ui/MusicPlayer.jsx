import { useRef, useState, useEffect } from 'react'

// ─── Когда будет admin — заменить на fetch('/api/track') ───────────────────
const TRACK = {
  title:  'Название трека',   // ← поменяй
  artist: 'AlTeNo Dev',       // ← поменяй
  src:    '/music/track.mp3', // ← положи файл в public/music/track.mp3
}
// ───────────────────────────────────────────────────────────────────────────

export default function MusicPlayer() {
  const audioRef  = useRef(null)
  const [playing,  setPlaying]  = useState(false)
  const [progress, setProgress] = useState(0)
  const [current,  setCurrent]  = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted,    setMuted]    = useState(false)
  const [visible,  setVisible]  = useState(true)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = 0.35
    a.loop   = true
  }, [])

  const toggle = async () => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      try {
        await a.play()
        setPlaying(true)
      } catch {}
    }
  }

  const onTimeUpdate = () => {
    const a = audioRef.current
    if (!a || !a.duration) return
    setCurrent(a.currentTime)
    setProgress(a.currentTime / a.duration)
  }

  const onLoaded = () => {
    setDuration(audioRef.current?.duration || 0)
  }

  const seek = (e) => {
    const a = audioRef.current
    if (!a) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration
  }

  const fmt = (s) => {
    const m = Math.floor(s / 60)
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  if (!visible) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={TRACK.src}
        muted={muted}
        loop
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoaded}
      />

      <div className={`mp-wrap${playing ? ' mp-on' : ''}`}>
        {/* Закрыть */}
        <button className="mp-close" onClick={() => { audioRef.current?.pause(); setVisible(false) }} aria-label="Закрыть плеер">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Верхняя строка */}
        <div className="mp-row">

        {/* Эквалайзер */}
        <div className="mp-eq" aria-hidden="true">
          <span /><span /><span /><span />
        </div>

        {/* Инфо о треке */}
        <div className="mp-info">
          <div className="mp-title">{TRACK.title}</div>
          <div className="mp-artist">{TRACK.artist}</div>
        </div>

        {/* Кнопки */}
        <div className="mp-controls">
          {/* Mute */}
          <button className="mp-icon-btn" onClick={() => setMuted(m => !m)} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>
            {muted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          {/* Play / Pause */}
          <button className="mp-play-btn" onClick={toggle} aria-label={playing ? 'Пауза' : 'Играть'}>
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
            )}
          </button>
        </div>
        </div>{/* /mp-row */}

        {/* Прогресс-бар */}
        <div className="mp-seek" onClick={seek} role="progressbar" aria-valuenow={Math.round(progress * 100)}>
          <div className="mp-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Время */}
        <div className="mp-time">
          <span>{fmt(current)}</span>
          <span>{duration ? fmt(duration) : '--:--'}</span>
        </div>
      </div>
    </>
  )
}
