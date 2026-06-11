import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { LogoMark } from '../ui/Logo'

const LANGS = ['ru', 'tj', 'en']
const LABELS = { ru: 'РУ', tj: 'ТҶ', en: 'EN' }

export default function Header() {
  const { lang, setLang, t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { href: '#about', label: t.nav.about },
    { href: '#services', label: t.nav.services },
    { href: '#cases', label: t.nav.cases },
    { href: '#process', label: t.nav.process },
    { href: '#studio', label: t.nav.studio },
    { href: '#reviews', label: t.nav.reviews },
  ]

  const go = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  const langIdx = LANGS.indexOf(lang)

  return (
    <>
      {/* Progress bar */}
      <div className="progress" style={{ transform: `scaleX(${progress / 100})` }} />

      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="nav">
          {/* Logo */}
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
            {/* Language switcher */}
            <div className="lang" role="tablist">
              <span className="pill" style={{ transform: `translateX(${langIdx * 46}px)` }} />
              {LANGS.map(l => (
                <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>
                  {LABELS[l]}
                </button>
              ))}
            </div>

            {/* CTA */}
            <a className="btn btn-primary nav-cta" onClick={() => go('#contact')}>
              {t.nav.contact}
            </a>

            {/* Burger */}
            <button className={`burger${open ? ' open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`drawer${open ? ' open' : ''}`}>
        {navItems.map(item => (
          <a key={item.href} onClick={() => go(item.href)}>{item.label}</a>
        ))}
        <a onClick={() => go('#contact')}>{t.nav.contact}</a>
        <div className="lang" style={{ marginTop: 24, alignSelf: 'flex-start' }}>
          <span className="pill" style={{ transform: `translateX(${langIdx * 46}px)` }} />
          {LANGS.map(l => (
            <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>
              {LABELS[l]}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
