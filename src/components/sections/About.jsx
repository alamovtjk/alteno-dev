import { useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'

import myPhoto from '../../assets/photo.jpg'
const MY_PHOTO = myPhoto

export default function About() {
  const { t } = useLanguage()
  return (
    <section id="about" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="about-grid">
          {/* Photo */}
          <div className="photo-wrap reveal d1">
            <div className="photo-frame">
              <span className="corner tl"/><span className="corner tr"/>
              <span className="corner bl"/><span className="corner br"/>
              {MY_PHOTO ? (
                <img src={MY_PHOTO} alt={t.about.photoph} />
              ) : (
                <div className="photo-placeholder">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="18" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p>{t.about.photoph}</p>
                </div>
              )}
            </div>
            <div className="status">
              <span className="dot"/>
              <span>{t.about.status}</span>
            </div>
          </div>

          {/* Content */}
          <div className="about-content">
            <div className="eyebrow reveal d2"><span className="line"/>{t.about.eyebrow}</div>

            <h2 className="ub reveal d3">
              {t.about.hi} <span className="grad">{t.about.name}</span>
            </h2>
            <div className="role reveal d3">
              <b>{t.about.role}</b>
            </div>

            <div className="bio reveal d4">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
            </div>

            <div className="tech-label reveal d4">{t.about.stack}</div>
            <div className="tech reveal d5">
              <span className="tag-tech t-react"><span className="d"/>React</span>
              <span className="tag-tech t-next"><span className="d"/>Next.js</span>
              <span className="tag-tech t-figma"><span className="d"/>Figma</span>
              <span className="tag-tech t-tw"><span className="d"/>Tailwind</span>
              <span className="tag-tech t-node"><span className="d"/>Node.js</span>
              <span className="tag-tech t-fm"><span className="d"/>Framer Motion</span>
            </div>

            <div className="facts reveal d5">
              <div className="fact"><div className="n">5+</div><div className="l">{t.about.f1}</div></div>
              <div className="fact"><div className="n">50+</div><div className="l">{t.about.f2}</div></div>
              <div className="fact"><div className="n">100%</div><div className="l">{t.about.f3}</div></div>
            </div>

            <div className="about-cta reveal d6">
              <a className="btn btn-primary"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16v12H4z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M4 7l8 6 8-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t.about.btn1}
              </a>
              <a className="btn btn-ghost" href="#">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M7 11l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {t.about.btn2}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
