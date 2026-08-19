import { createContext, useContext, useRef, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MusicContext = createContext(null)

/* Локальный трек — пока не загружен активный из админки */
const FALLBACK = { title: 'Hand Covers Bruise', artist: 'Trent Reznor & Atticus Ross', file_url: '/music/track.m4a' }

/* Громкость по умолчанию — до того, как из settings придёт своя.
   Хранится в БД процентом (0–100), здесь уже в долях (0–1) для <audio>. */
const DEFAULT_VOLUME = 0.4

export function MusicProvider({ children }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [track,   setTrack]   = useState(FALLBACK)
  const [volume,  setVolume]  = useState(DEFAULT_VOLUME)
  const [enabled, setEnabled] = useState(true)
  const [ready,   setReady]   = useState(false) // настройки из settings подгружены

  /* Активный трек из админки; при ошибке остаёмся на локальном файле */
  useEffect(() => {
    if (!supabase) { setReady(true); return }
    let cancelled = false

    Promise.all([
      supabase.from('music').select('*').eq('active', true).limit(1),
      supabase.from('settings').select('key, value').in('key', ['music_volume', 'music_enabled']),
    ]).then(([musicRes, settingsRes]) => {
      if (cancelled) return

      const row = musicRes.data?.[0]
      if (!musicRes.error && row?.file_url) {
        setTrack({
          title:    row.title  || FALLBACK.title,
          artist:   row.artist || FALLBACK.artist,
          file_url: row.file_url,
        })
      }

      if (!settingsRes.error) {
        for (const { key, value } of settingsRes.data || []) {
          if (key === 'music_volume' && value !== '') {
            const pct = Number(value)
            if (Number.isFinite(pct)) setVolume(Math.min(100, Math.max(0, pct)) / 100)
          }
          if (key === 'music_enabled' && value !== '') {
            setEnabled(value !== 'false')
          }
        }
      }
      setReady(true)
    })

    return () => { cancelled = true }
  }, [])

  /* Автостарт: сразу, либо на первом действии пользователя. Ждём ready,
     иначе трек на долю секунды заиграет с дефолтной громкостью, а потом
     дёрнется на настроенную. Перезапускается при смене трека/громкости. */
  useEffect(() => {
    const a = audioRef.current
    if (!a || !ready) return

    a.volume = volume
    a.loop   = true

    /* playing тут не трогаем: пока музыка выключена, кнопки для неё скрыты,
       так что устаревшее true никому не видно, а a.pause() и так глушит звук */
    if (!enabled) { a.pause(); return }

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
  }, [track.file_url, ready, enabled, volume])

  const toggle = async () => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    /* play() отклоняется, если браузер ещё не считает жест пользователя
       достаточным основанием для звука — молча остаёмся на паузе */
    else { try { await a.play(); setPlaying(true) } catch { /* автоплей заблокирован */ } }
  }

  return (
    <MusicContext.Provider value={{ playing, toggle, track, enabled }}>
      {/* preload="none" — трек весит мегабайты и не нужен, пока музыку не включили */}
      <audio ref={audioRef} src={track.file_url} loop preload="none" />
      {children}
    </MusicContext.Provider>
  )
}

export const useMusic = () => useContext(MusicContext)
