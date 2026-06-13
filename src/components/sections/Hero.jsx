import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import DeviceScene from '../ui/DeviceScene'

function TypewriterH1({ line1, line2 }) {
  const [t1, setT1] = useState('')
  const [t2, setT2] = useState('')
  const [phase, setPhase] = useState(0) // 0=idle 1=typing line1 2=typing line2 3=done

  useEffect(() => {
    let iv1, iv2, tStart, tPause, tLoop

    function loopLine2() {
      tPause = setTimeout(() => {
        setT2('')
        setPhase(2)
        let j = 0
        iv2 = setInterval(() => {
          j++
          setT2(line2.slice(0, j))
          if (j >= line2.length) {
            clearInterval(iv2)
            setPhase(3)
            tLoop = setTimeout(loopLine2, 6200)
          }
        }, 58)
      }, 380)
    }

    // первая строка — один раз, потом остаётся
    setT1(''); setT2(''); setPhase(0)
    tStart = setTimeout(() => {
      setPhase(1)
      let i = 0
      iv1 = setInterval(() => {
        i++
        setT1(line1.slice(0, i))
        if (i >= line1.length) {
          clearInterval(iv1)
          loopLine2()
        }
      }, 68)
    }, 650)

    return () => {
      clearTimeout(tStart); clearTimeout(tPause); clearTimeout(tLoop)
      clearInterval(iv1); clearInterval(iv2)
    }
  }, [line1, line2])

  return (
    <h1 className="ub hero-h1" style={{ position: 'relative' }}>
      {/* Невидимый призрак — держит высоту h1 постоянной */}
      <span aria-hidden="true" style={{ visibility: 'hidden', display: 'block', pointerEvents: 'none' }}>
        <span className="tw-line">{line1}</span>
        <span className="tw-line"><span className="grad">{line2}</span></span>
      </span>
      {/* Анимированный текст поверх */}
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <span className="tw-line">
          {t1}
          {phase === 1 && <span className="tw-cur" />}
        </span>
        <span className="tw-line">
          <span className="grad">{t2}</span>
          {(phase === 2 || phase === 3) && <span className="tw-cur" style={{ opacity: phase === 3 ? 0 : 1 }} />}
        </span>
      </span>
    </h1>
  )
}

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

            <TypewriterH1 line1={t.hero.title} line2={t.hero.titleAccent} />

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
