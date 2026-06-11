import { useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import DeviceScene from '../ui/DeviceScene'

export default function Hero() {
  const { t } = useLanguage()
  const sectionRef = useRef(null)

  useEffect(() => {
    const sec = sectionRef.current
    if (!sec) return
    const id = setTimeout(() => {
      sec.classList.add('hero-active')
      sec.querySelectorAll('.reveal').forEach(el => el.classList.add('in'))
    }, 50)
    return () => clearTimeout(id)
  }, [])

  return (
    <section id="hero" ref={sectionRef} style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
      <div className="shell" style={{ overflow: 'visible' }}>
        <div className="hero-section">

          {/* Left — text */}
          <div className="hero-copy">
            <div className="badge reveal d1">
              <b>{t.hero.badge}</b>
              <span className="dot" />
            </div>

            <h1 className="ub hero-h1">
              <span className="s-line"><span className="s-inner s-d1">{t.hero.title}</span></span>
              <span className="s-line"><span className="s-inner grad s-d2">{t.hero.titleAccent}</span></span>
            </h1>

            <p className="sub reveal d3">{t.hero.sub}</p>

            <div className="hero-cta reveal d4">
              <button className="btn btn-primary"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                {t.hero.cta1}
              </button>
              <button className="btn btn-ghost"
                onClick={() => document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' })}>
                <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
                  <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
                {t.hero.cta2}
              </button>
            </div>

            <div className="hero-stats reveal d5">
              <div className="stat"><div className="num">{t.hero.stNum1}</div><div className="lbl">{t.hero.st1}</div></div>
              <div className="stat"><div className="num">{t.hero.stNum2}</div><div className="lbl">{t.hero.st2}</div></div>
              <div className="stat"><div className="num">{t.hero.stNum3}</div><div className="lbl">{t.hero.st3}</div></div>
            </div>
          </div>

          {/* Right — devices */}
          <div className="hero-visual reveal">
            <DeviceScene parallax={true} />
          </div>

        </div>
      </div>
    </section>
  )
}
