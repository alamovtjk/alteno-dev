import { useLanguage } from '../../context/LanguageContext'

export default function Portfolio() {
  const { t } = useLanguage()

  return (
    <section id="cases" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{t.cases.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {t.cases.t1} <span className="grad">{t.cases.t2}</span>
          </h2>
          <p className="sec-sub reveal">{t.cases.sub}</p>
        </div>

        <div className="cases-soon reveal">
          <div className="cases-soon-icon">
            <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
              <rect x="6" y="10" width="36" height="28" rx="4"/>
              <path d="M6 18h36"/>
              <circle cx="13" cy="14" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="19" cy="14" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="25" cy="14" r="1.5" fill="currentColor" stroke="none"/>
              <path d="M16 28l4 4 12-10"/>
            </svg>
          </div>
          <h3 className="ub">{t.cases.soonT}</h3>
          <p>{t.cases.soonD}</p>
          <div className="cases-soon-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </section>
  )
}
