import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { LogoMarkFooter } from '../ui/Logo'

const ICONS = {
  telegram:  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4L3 11l6 2 2 6 3-4 4 3z"/></svg>,
  instagram: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>,
  github:    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-4 1.5-4-2-6-2m12 4v-3a3 3 0 0 0-1-2c3 0 5-2 5-5a4 4 0 0 0-1-3 4 4 0 0 0 0-3s-1 0-3 1a11 11 0 0 0-6 0C7 2 6 2 6 2a4 4 0 0 0 0 3 4 4 0 0 0-1 3c0 3 2 5 5 5a3 3 0 0 0-1 2v3"/></svg>,
  email:     <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>,
  whatsapp:  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.8 9.2c.4 2.4 2.6 4.6 5 5l1-1.4 1.8.8-.4 1.6c-2.6.5-6.6-2.7-7.6-6l1.5-.6.8 1.8-.9 1"/></svg>,
  phone:     <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4z"/></svg>,
}

/* Порядок соцсетей в подвале; какие есть в настройках — те и рисуем */
const SOCIAL_ORDER = ['telegram', 'instagram', 'github', 'email']
const CONTACT_ORDER = ['email', 'telegram', 'instagram', 'github', 'phone', 'whatsapp']

export default function Footer() {
  const { t } = useLanguage()
  const { links } = useSettings()
  const navigate = useNavigate()
  const isHome   = useLocation().pathname === '/'
  const [showTop, setShowTop] = useState(false)

  const isExternal = (key) => key !== 'email' && key !== 'phone'

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* На подстраницах секций главной нет — уводим на главную с якорем в state */
  const go = (href) => {
    if (isHome) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    else navigate('/', { state: { scrollTo: href } })
  }

  return (
    <>
      <footer className="footer" style={{ position: 'relative', zIndex: 2 }}>
        <div className="shell">
          <div className="footer-grid">
            {/* Brand */}
            <div className="fbrand reveal">
              <a href="/" onClick={e => {
                  e.preventDefault()
                  if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' })
                  else navigate('/')
                }}
                style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: 12 }}>
                <LogoMarkFooter />
              </a>
              <p>{t.footer.desc}</p>
              <div className="socials">
                {SOCIAL_ORDER.filter(k => links[k]).map(k => (
                  <a key={k} href={links[k].href} aria-label={k}
                    target={isExternal(k) ? '_blank' : undefined}
                    rel={isExternal(k) ? 'noreferrer' : undefined}>
                    {ICONS[k]}
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="fcol reveal">
              <h5 className="ub">{t.footer.col1}</h5>
              <a onClick={() => go('#services')}>{t.services.s1t}</a>
              <a onClick={() => go('#services')}>{t.services.s2t}</a>
              <a onClick={() => go('#services')}>{t.services.s3t}</a>
              <a onClick={() => go('#services')}>{t.services.s4t}</a>
            </div>

            {/* Company */}
            <div className="fcol reveal">
              <h5 className="ub">{t.footer.col2}</h5>
              <a onClick={() => go('#studio')}>{t.footer.l_about}</a>
              <Link to="/projects">{t.projects.navLabel}</Link>
              <a onClick={() => go('#process')}>{t.nav.process}</a>
              <Link to="/team">{t.nav.team}</Link>
              <a onClick={() => go('#reviews')}>{t.nav.reviews}</a>
            </div>

            {/* Contact */}
            <div className="fcol reveal">
              <h5 className="ub">{t.footer.col3}</h5>
              {CONTACT_ORDER.filter(k => links[k]).map(k => (
                <a key={k} href={links[k].href}
                  target={isExternal(k) ? '_blank' : undefined}
                  rel={isExternal(k) ? 'noreferrer' : undefined}>
                  {links[k].label}
                </a>
              ))}
              <a>Душанбе, Таджикистан</a>
            </div>
          </div>

          <div className="footer-bottom reveal">
            <span>{t.footer.rights}</span>
            <span>Unbounded × Manrope · Glassmorphism</span>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      <button className={`totop${showTop ? ' show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </button>
    </>
  )
}
