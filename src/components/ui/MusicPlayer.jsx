import { useRef, useState, useEffect } from 'react'

// Когда будет admin — заменить src на fetch из API
const TRACK = {
  src: '/music/track.mp3',
}

export default function MusicPlayer() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = 0.4
    a.loop   = true

    // Пробуем автоплей сразу
    a.play().then(() => setPlaying(true)).catch(() => {
      // Браузер заблокировал — запускаем при первом взаимодействии
      const start = () => {
        a.play().then(() => setPlaying(true)).catch(() => {})
      }
      const opts = { once: true, passive: true }
      document.addEventListener('click',      start, opts)
      document.addEventListener('scroll',     start, opts)
      document.addEventListener('keydown',    start, opts)
      document.addEventListener('touchstart', start, opts)
    })
  }, [])

  const toggle = async () => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      try { await a.play(); setPlaying(true) } catch {}
    }
  }

  return (
    <>
      <audio ref={audioRef} src={TRACK.src} loop />
      <button
        className={`mp-toggle${playing ? ' mp-on' : ''}`}
        onClick={toggle}
        aria-label={playing ? 'Выключить музыку' : 'Включить музыку'}
        title={playing ? 'Выключить музыку' : 'Включить музыку'}
      >
        {playing ? (
          /* Пауза */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6"  y="4" width="4" height="16" rx="1.5"/>
            <rect x="14" y="4" width="4" height="16" rx="1.5"/>
          </svg>
        ) : (
          /* Нота */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
        )}
      </button>
    </>
  )
}
