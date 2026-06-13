import { useState, useEffect, useRef } from 'react'
import ArielChat from './ArielChat'

export default function ArielFloat() {
  const [open, setOpen] = useState(false)
  const backdropRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  /* Подстраиваем высоту под реальный viewport когда открывается клавиатура */
  useEffect(() => {
    if (!open) return
    const vv = window.visualViewport
    if (!vv) return

    const adjust = () => {
      const el = backdropRef.current
      if (!el) return
      // На мобилке (≤600px) CSS сам держит layout — JS-resize вызывает прыжки
      if (window.innerWidth <= 600) return
      el.style.height = vv.height + 'px'
      el.style.top    = vv.offsetTop + 'px'
      el.style.bottom = 'auto'
    }

    vv.addEventListener('resize', adjust)
    vv.addEventListener('scroll', adjust)
    adjust()

    return () => {
      vv.removeEventListener('resize', adjust)
      vv.removeEventListener('scroll', adjust)
      // Сбрасываем inline стили при закрытии
      const el = backdropRef.current
      if (el) {
        el.style.height = ''
        el.style.top    = ''
        el.style.bottom = ''
      }
    }
  }, [open])

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        className="ariel-fab"
        onClick={() => setOpen(true)}
        aria-label="Открыть AI-ассистента Ариэль"
      >
        <span className="ariel-fab-ping" />
        <span className="ariel-fab-ring r1" />
        <span className="ariel-fab-ring r2" />
        <span className="ariel-fab-core">
          <svg viewBox="0 0 20 23" fill="none">
            <path d="M10 1L19 6v11L10 22 1 17V6z"
              fill="url(#afg)" stroke="#00d4ff" strokeWidth="1"/>
            <defs>
              <linearGradient id="afg" x1="1" y1="1" x2="19" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8c0eff" stopOpacity=".6"/>
                <stop offset="100%" stopColor="#00d4ff" stopOpacity=".4"/>
              </linearGradient>
            </defs>
          </svg>
        </span>
        <span className="ariel-fab-tip">Обсудить идею</span>
      </button>

      {/* Модалка */}
      {open && (
        <div
          ref={backdropRef}
          className="ariel-backdrop"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="ariel-modal">
            <button className="ariel-modal-close" onClick={() => setOpen(false)} aria-label="Закрыть">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" stroke="#00d4ff"/>
              </svg>
            </button>
            <ArielChat />
          </div>
        </div>
      )}
    </>
  )
}
