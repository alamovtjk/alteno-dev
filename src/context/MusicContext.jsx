import { createContext, useContext, useRef, useState, useEffect } from 'react'

const MusicContext = createContext(null)

export function MusicProvider({ children }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = 0.4
    a.loop   = true

    a.play().then(() => setPlaying(true)).catch(() => {
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
    if (playing) { a.pause(); setPlaying(false) }
    else { try { await a.play(); setPlaying(true) } catch {} }
  }

  return (
    <MusicContext.Provider value={{ playing, toggle }}>
      <audio ref={audioRef} src="/music/track.mp3" loop />
      {children}
    </MusicContext.Provider>
  )
}

export const useMusic = () => useContext(MusicContext)
