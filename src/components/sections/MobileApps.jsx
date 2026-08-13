import { useRef, useEffect, useState, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'

/* Приложения студии в разработке — идут строками: 01, 02, ...
   Нечётные — телефон слева, чётные — справа.
   shots: экраны в /public/apps/<id>/, нормализованные под 9:16.
   Пустой массив — вместо галереи шиммер-скелетон, можно завести
   приложение ещё до готовых скриншотов. */
const APPS = [
  {
    id: 'rneft',
    name: 'R-NEFT',
    descKey: 'rneftD',
    featKeys: ['rneftF1', 'rneftF2', 'rneftF3', 'rneftF4'],
    accent: '#7c3aed',
    accent2: '#4f46e5',
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

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

/* Телефон с галереей: свайп пальцем, перетаскивание мышью,
   стрелки на десктопе, точки-индикаторы, наклон вслед за курсором. */
function PhoneGallery({ app, t }) {
  const shots = app.shots
  const many  = shots.length > 1
  const last  = shots.length - 1

  const [idx, setIdx]   = useState(0)
  const [drag, setDrag] = useState(0)     // смещение пальца в % ширины экрана
  const [held, setHeld] = useState(false) // пауза автопрокрутки
  const startX   = useRef(null)
  const widthRef = useRef(1)              // ширину меряем в pointerdown, не в рендере
  const tiltRef  = useRef(null)

  const go = useCallback((n) => {
    setIdx(prev => {
      const next = typeof n === 'function' ? n(prev) : n
      return next < 0 ? last : next > last ? 0 : next
    })
  }, [last])

  useEffect(() => {
    if (!many || held) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => go(i => i + 1), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [many, held, go])

  /* Наклон корпуса за курсором — только на десктопе.
     Углы и позиция блика идут в CSS-переменные, минуя ререндер React. */
  useEffect(() => {
    const el = tiltRef.current
    if (!el || window.innerWidth < 960) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e) => {
      const r  = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width  - 0.5
      const py = (e.clientY - r.top)  / r.height - 0.5
      el.style.setProperty('--ry', `${(px * 16).toFixed(2)}deg`)
      el.style.setProperty('--rx', `${(-py * 10).toFixed(2)}deg`)
      el.style.setProperty('--sx', (px * 2).toFixed(3))
    }
    const onLeave = () => {
      el.style.setProperty('--ry', '0deg')
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--sx', '0')
    }

    el.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

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

  const shift = -idx * 100 + drag

  return (
    <div className="mapp-stage">
      <span className="mapp-glow" aria-hidden="true" />

      <div className="mapp-tilt" ref={tiltRef}>
        {/* Кнопки на гранях: слева «Действие» и качелька громкости, справа питание */}
        <span className="mapp-btn mapp-btn-action" aria-hidden="true" />
        <span className="mapp-btn mapp-btn-volup" aria-hidden="true" />
        <span className="mapp-btn mapp-btn-voldn" aria-hidden="true" />
        <span className="mapp-btn mapp-btn-power" aria-hidden="true" />

        <div className="mapp-frame">
          <span className="mapp-sheen" aria-hidden="true" />

          {/* Dynamic Island лежит поверх скриншота — как на настоящем экране */}
          <span className="mapp-island" aria-hidden="true"><i /></span>

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
                      alt={`${app.name} — ${t.screen} ${i + 1}`}
                      draggable="false"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>

                {many && (
                  <>
                    <button type="button" className="mapp-arrow mapp-arrow-l"
                      onClick={() => go(i => i - 1)} aria-label={t.prev}>
                      <Chevron d="M15 5l-7 7 7 7" />
                    </button>
                    <button type="button" className="mapp-arrow mapp-arrow-r"
                      onClick={() => go(i => i + 1)} aria-label={t.next}>
                      <Chevron d="M9 5l7 7-7 7" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <span className="mapp-home" aria-hidden="true" />
        </div>
      </div>

      {many && (
        <div className="mapp-dots">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`mapp-dot${i === idx ? ' is-on' : ''}`}
              onClick={() => go(i)}
              aria-label={`${t.screen} ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AppRow({ app, index, t }) {
  return (
    <article
      className="mapp-row reveal"
      style={{ '--c': app.accent, '--c2': app.accent2 }}
    >
      <PhoneGallery app={app} t={t} />

      <div className="mapp-info">
        <span className="mapp-num">{String(index + 1).padStart(2, '0')}</span>

        <span className="mapp-badge">
          <span className="mapp-pulse" />
          {t.wip}
        </span>

        <h3 className="mapp-name ub">{app.name}</h3>
        <p className="mapp-desc">{t[app.descKey]}</p>

        <ul className="mapp-feats">
          {app.featKeys.map(k => (
            <li key={k}>
              <span className="mapp-feat-ico"><Check /></span>
              {t[k]}
            </li>
          ))}
        </ul>

        <div className="mapp-plat">
          <span className="mapp-plat-chip">iOS</span>
          <span className="mapp-plat-chip">Android</span>
        </div>
      </div>
    </article>
  )
}

export default function MobileApps() {
  const { t } = useLanguage()
  const a = t.apps

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

        <div className="mapp-list">
          {APPS.map((app, i) => (
            <AppRow key={app.id} app={app} index={i} t={a} />
          ))}
        </div>
      </div>
    </section>
  )
}
