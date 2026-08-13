import { createContext, useContext, useRef, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MusicContext = createContext(null)

/* Локальный трек — пока не загружен активный из админки */
const FALLBACK = { title: 'Hand Covers Bruise', artist: 'Trent Reznor & Atticus Ross', file_url: '/music/track.m4a' }

export function MusicProvider({ children }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [track,   setTrack]   = useState(FALLBACK)

  /* Активный трек из админки; при ошибке остаёмся на локальном файле */
  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    supabase
      .from('music')
      .select('*')
      .eq('active', true)
      .limit(1)
      .then(({ data, error }) => {
        if (cancelled || error) return
        const row = data?.[0]
        if (row?.file_url) {
          setTrack({
            title:    row.title  || FALLBACK.title,
            artist:   row.artist || FALLBACK.artist,
            file_url: row.file_url,
          })
        }
      })
    return () => { cancelled = true }
  }, [])

  /* Автостарт: сразу, либо на первом действии пользователя.
     Перезапускается при смене трека, чтобы новый src тоже заиграл. */
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = 0.4
    a.loop   = true

    const listeners = []
    a.play().then(() => setPlaying(true)).catch(() => {
      const start = () => {
        a.play().then(() => setPlaying(true)).catch(() => {})
      }
      const opts = { once: true, passive: true }
      for (const ev of ['click', 'scroll', 'keydown', 'touchstart']) {
        document.addEventListener(ev, start, opts)
        listeners.push([ev, start])
      }
    })

    return () => {
      for (const [ev, fn] of listeners) document.removeEventListener(ev, fn)
    }
  }, [track.file_url])

  const toggle = async () => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { try { await a.play(); setPlaying(true) } catch {} }
  }

  return (
    <MusicContext.Provider value={{ playing, toggle, track }}>
      {/* preload="none" — трек весит мегабайты и не нужен, пока музыку не включили */}
      <audio ref={audioRef} src={track.file_url} loop preload="none" />
      {children}
    </MusicContext.Provider>
  )
}

export const useMusic = () => useContext(MusicContext)
