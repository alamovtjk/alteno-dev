import { useMusic } from '../../context/MusicContext'

export default function MusicPlayer() {
  const { playing, toggle } = useMusic()

  return (
    <button
      className={`mp-toggle${playing ? ' mp-on' : ''}`}
      onClick={toggle}
      aria-label={playing ? 'Выключить музыку' : 'Включить музыку'}
      title={playing ? 'Выключить музыку' : 'Включить музыку'}
    >
      {playing ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6"  y="4" width="4" height="16" rx="1.5"/>
          <rect x="14" y="4" width="4" height="16" rx="1.5"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
      )}
    </button>
  )
}
