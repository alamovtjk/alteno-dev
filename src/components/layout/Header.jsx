import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useMusic } from '../../context/MusicContext'
import { LogoMark } from '../ui/Logo'

const LANGS  = ['ru', 'tj', 'en']
const LABELS = { ru: 'РУ', tj: 'ТҶ', en: 'EN' }

export default function Header() {
  const { lang, setLang, t } = useLanguage()
  const [scrolled,  setScrolled]  = useState(false)
  const [open,      setOpen]      = useState(false)
  const [progress,  setProgress]  = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const doc   = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* закрываем drawer по ESC */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  /* блокируем скролл и скрываем FAB пока drawer открыт */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    document.body.classList.toggle('drawer-open', open)
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('drawer-open')
    }
  }, [open])

  const navItems = [
    { href: '#about',    label: t.nav.about    },
    { href: '#services', label: t.nav.services  },
    { href: '#cases',    label: t.nav.cases     },
    { href: '#process',  label: t.nav.process   },
    { href: '#studio',   label: t.nav.studio    },
    { href: '#reviews',  label: t.nav.reviews   },
  ]

  const go = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  const { playing, toggle: toggleMusic } = useMusic()
  const langIdx = LANGS.indexOf(lang)

  return (
    <>
      {/* Прогресс-бар */}
      <div className="progress" style={{ transform: `scaleX(${progress / 100})` }} />

      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="nav">
          {/* Лого */}
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoMark />
          </a>

          {/* Desktop nav */}
          <nav className="nav-links">
            {navItems.map(item => (
              <a key={item.href} onClick={() => go(item.href)}>{item.label}</a>
            ))}
          </nav>

          <div className="nav-right">
            <div className="lang" role="tablist">
              <span className="pill" style={{ left: `calc(5px + ${langIdx} * ((100% - 10px) / 3))` }} />
              {LANGS.map(l => (
                <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>
                  {LABELS[l]}
                </button>
              ))}
            </div>
            <a className="btn btn-primary nav-cta" onClick={() => go('#contact')}>
              {t.nav.contact}
            </a>
            <button className={`burger${open ? ' open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop — клик закрывает drawer */}
      <div className={`scrim${open ? ' show' : ''}`} onClick={() => setOpen(false)} />

      {/* Mobile drawer */}
      <div className={`drawer${open ? ' open' : ''}`}>

        {/* Шапка drawer */}
        <div className="drawer-head">
          <span className="drawer-eyebrow">Навигация</span>
          <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Закрыть">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Ссылки */}
        <nav className="drawer-nav">
          {navItems.map(item => (
            <a key={item.href} className="drawer-link" onClick={() => go(item.href)}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA кнопка */}
        <div className="drawer-cta-wrap">
          <button className="btn btn-primary drawer-cta-btn" onClick={() => go('#contact')}>
            {t.nav.contact}
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="#fff"/>
            </svg>
          </button>
        </div>

        {/* Музыка */}
        <div className="drawer-music" onClick={toggleMusic}>
          <div className="drawer-music-left">
            <div className={`drawer-music-icon${playing ? ' on' : ''}`}>
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6"  y="4" width="4" height="16" rx="1.5"/>
                  <rect x="14" y="4" width="4" height="16" rx="1.5"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              )}
            </div>
            <div>
              <div className="drawer-music-title">Музыка</div>
              <div className="drawer-music-sub">Hand Covers Bruise</div>
            </div>
          </div>
          <div className={`drawer-music-toggle${playing ? ' on' : ''}`}>
            <span />
          </div>
        </div>

        {/* Язык */}
        <div className="drawer-foot">
          <span className="drawer-foot-label">Язык</span>
          <div className="lang">
            <span className="pill" style={{ left: `calc(5px + ${langIdx} * ((100% - 10px) / 3))` }} />
            {LANGS.map(l => (
              <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>
                {LABELS[l]}
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
