import { useRef, useEffect, useState, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'

/* Приложения студии в разработке.
   shots — экраны в /public/apps/<id>/, нормализованные под 9:16.
   Пустой массив — внутри корпуса крутится скелетон вместо галереи,
   так что новое приложение можно добавить ещё до готовых скриншотов. */
const APPS = [
  {
    id: 'rneft',
    name: 'R-NEFT',
    note: 'Бонусы и карта АЗС',
    accent: 'var(--violet)',
    glow: 'rgba(124,58,237,.28)',
    shots: [
      '/apps/rneft/01.webp',
      '/apps/rneft/02.webp',
      '/apps/rneft/03.webp',
      '/apps/rneft/04.webp',
    ],
  },
]

const SWIPE_THRESHOLD = 45   // px — за сколько считаем свайп состоявшимся
const AUTOPLAY_MS     = 3800

/* Каркас интерфейса, пока скриншотов нет */
function AppSkeleton() {
  return (
    <div className="mapp-skel" aria-hidden="true">
      <div className="mapp-skel-hd">
        <span className="mapp-sk mapp-sk-avatar" />
        <span className="mapp-sk mapp-sk-line" style={{ width: '46%' }} />
      </div>
      <span className="mapp-sk mapp-sk-hero" />
      <div className="mapp-skel-row">
        <span className="mapp-sk mapp-sk-tile" />
        <span className="mapp-sk mapp-sk-tile" />
        <span className="mapp-sk mapp-sk-tile" />
      </div>
      <span className="mapp-sk mapp-sk-line" style={{ width: '62%' }} />
      <span className="mapp-sk mapp-sk-line" style={{ width: '84%' }} />
      <span className="mapp-sk mapp-sk-line" style={{ width: '52%' }} />
    </div>
  )
}

const Chevron = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

/* Телефон с галереей экранов: свайп пальцем, перетаскивание мышью,
   стрелки на десктопе, точки-индикаторы под корпусом. */
function Phone({ app, label }) {
  const shots = app.shots
  const many  = shots.length > 1
  const last  = shots.length - 1

  const [idx, setIdx]   = useState(0)
  const [drag, setDrag] = useState(0)     // смещение пальца в % ширины экрана
  const [held, setHeld] = useState(false) // пауза автопрокрутки
  const startX = useRef(null)
  const widthRef = useRef(1)              // ширину меряем в pointerdown, не в рендере

  const go = useCallback((n) => {
    setIdx(prev => {
      const next = typeof n === 'function' ? n(prev) : n
      return next < 0 ? last : next > last ? 0 : next
    })
  }, [last])

  /* Автопрокрутка — на паузе, пока курсор внутри или идёт свайп */
  useEffect(() => {
    if (!many || held) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => go(i => i + 1), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [many, held, go])

  const onDown = (e) => {
    if (!many) return
    startX.current   = e.clientX
    widthRef.current = e.currentTarget.offsetWidth || 1
    setHeld(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    if (startX.current === null) return
    setDrag(((e.clientX - startX.current) / widthRef.current) * 100)
  }
  const onUp = () => {
    if (startX.current === null) return
    const px = (drag / 100) * widthRef.current
    if (Math.abs(px) > SWIPE_THRESHOLD) go(i => i + (px < 0 ? 1 : -1))
    startX.current = null
    setDrag(0)
    setHeld(false)
  }

  /* Во время перетаскивания трек следует за пальцем, потом — плавный доводчик */
  const shift = -idx * 100 + drag

  return (
    <div className="mapp-item reveal" style={{ '--c': app.accent, '--glow': app.glow }}>
      <div className="mapp-phone">
        <div className="mapp-frame">
          <span className="mapp-island" />

          <div className="mapp-scr">
            {shots.length === 0 ? <AppSkeleton /> : (
              <div
                className="mapp-slider"
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onMouseEnter={() => setHeld(true)}
                onMouseLeave={() => { if (startX.current === null) setHeld(false) }}
              >
                <div
                  className={`mapp-track${drag ? ' is-dragging' : ''}`}
                  style={{ transform: `translate3d(${shift}%,0,0)` }}
                >
                  {shots.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`${app.name} — экран ${i + 1}`}
                      draggable="false"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>

                {many && (
                  <>
                    <button type="button" className="mapp-arrow mapp-arrow-l"
                      onClick={() => go(i => i - 1)} aria-label="Предыдущий экран">
                      <Chevron d="M15 5l-7 7 7 7" />
                    </button>
                    <button type="button" className="mapp-arrow mapp-arrow-r"
                      onClick={() => go(i => i + 1)} aria-label="Следующий экран">
                      <Chevron d="M9 5l7 7-7 7" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <span className="mapp-homebar" />
        </div>

        {/* Точки живут вне экрана — у .mapp-scr стоит overflow:hidden */}
        {many && (
          <div className="mapp-dots">
            {shots.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`mapp-dot${i === idx ? ' is-on' : ''}`}
                onClick={() => go(i)}
                aria-label={`Экран ${i + 1}`}
              />
            ))}
          </div>
        )}

        <span className="mapp-shadow" aria-hidden="true" />
      </div>

      <div className="mapp-meta">
        <span className="mapp-badge">
          <span className="mapp-pulse" />
          {label}
        </span>
        <h3 className="mapp-name ub">{app.name}</h3>
        {app.note && <p className="mapp-note">{app.note}</p>}
      </div>
    </div>
  )
}

export default function MobileApps() {
  const { t } = useLanguage()
  const a = t.apps
  const wrapRef  = useRef(null)
  const sceneRef = useRef(null)

  /* Тот же параллакс, что у DeviceScene — на десктопе телефоны ведут за курсором */
  useEffect(() => {
    const wrap  = wrapRef.current
    const scene = sceneRef.current
    if (!wrap || !scene || window.innerWidth < 960) return

    const onMove = (e) => {
      const r  = wrap.getBoundingClientRect()
      const cx = ((e.clientX - r.left) / r.width  - 0.5) * 7
      const cy = ((e.clientY - r.top)  / r.height - 0.5) * 4
      scene.style.transform = `rotateY(${cx}deg) rotateX(${-cy}deg)`
    }
    const onLeave = () => { scene.style.transform = '' }

    wrap.addEventListener('mousemove', onMove, { passive: true })
    wrap.addEventListener('mouseleave', onLeave)
    return () => {
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section id="apps" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{a.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {a.t1} <span className="grad">{a.t2}</span>
          </h2>
          <p className="sec-sub reveal">{a.sub}</p>
        </div>

        <div className="mapp-wrap" ref={wrapRef}>
          <div className="mapp-scene" ref={sceneRef}>
            {APPS.map(app => (
              <Phone key={app.id} app={app} label={a.wip} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
