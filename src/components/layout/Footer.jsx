import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { LogoMarkFooter } from '../ui/Logo'

export default function Footer() {
  const { t } = useLanguage()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = (href) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <footer className="footer" style={{ position: 'relative', zIndex: 2 }}>
        <div className="shell">
          <div className="footer-grid">
            {/* Brand */}
            <div className="fbrand">
              <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: 12 }}>
                <LogoMarkFooter />
              </a>
              <p>{t.footer.desc}</p>
              <div className="socials">
                <a href="https://t.me/samiralamov" target="_blank" rel="noreferrer" aria-label="Telegram">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4L3 11l6 2 2 6 3-4 4 3z"/></svg>
                </a>
                <a href="https://instagram.com/alamovtjk" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href="https://github.com/alamovtjk" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-4 1.5-4-2-6-2m12 4v-3a3 3 0 0 0-1-2c3 0 5-2 5-5a4 4 0 0 0-1-3 4 4 0 0 0 0-3s-1 0-3 1a11 11 0 0 0-6 0C7 2 6 2 6 2a4 4 0 0 0 0 3 4 4 0 0 0-1 3c0 3 2 5 5 5a3 3 0 0 0-1 2v3"/></svg>
                </a>
                <a href="mailto:alamovsamir4@gmail.com" aria-label="Email">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="fcol">
              <h5 className="ub">{t.footer.col1}</h5>
              <a onClick={() => go('#services')}>{t.services.s1t}</a>
              <a onClick={() => go('#services')}>{t.services.s2t}</a>
              <a onClick={() => go('#services')}>{t.services.s3t}</a>
              <a onClick={() => go('#services')}>{t.services.s4t}</a>
            </div>

            {/* Company */}
            <div className="fcol">
              <h5 className="ub">{t.footer.col2}</h5>
              <a onClick={() => go('#studio')}>{t.footer.l_about}</a>
              <a onClick={() => go('#cases')}>{t.nav.cases}</a>
              <a onClick={() => go('#process')}>{t.nav.process}</a>
              <a onClick={() => go('#reviews')}>{t.nav.reviews}</a>
            </div>

            {/* Contact */}
            <div className="fcol">
              <h5 className="ub">{t.footer.col3}</h5>
              <a href="mailto:alamovsamir4@gmail.com">alamovsamir4@gmail.com</a>
              <a href="https://t.me/samiralamov" target="_blank" rel="noreferrer">@samiralamov</a>
              <a href="https://instagram.com/alamovtjk" target="_blank" rel="noreferrer">@alamovtjk</a>
              <a href="https://github.com/alamovtjk" target="_blank" rel="noreferrer">github/alamovtjk</a>
              <a>{t.footer.loc}</a>
            </div>
          </div>

          <div className="footer-bottom">
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
