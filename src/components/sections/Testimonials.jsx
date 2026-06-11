import { useLanguage } from '../../context/LanguageContext'
import AnimatedCounter from '../ui/AnimatedCounter'

const numCards = [
  { n:50,  s:'+', lKey:'num1l', cls:'n1', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg> },
  { n:100, s:'%', lKey:'num2l', cls:'n2', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> },
  { n:4,   s:'',  lKey:'num3l', cls:'n3', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> },
  { n:1,   s:'',  lKey:'num4l', cls:'n4', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8 13l-2 8 6-3 6 3-2-8"/></svg> },
]

export default function Testimonials() {
  const { t } = useLanguage()

  return (
    <section id="reviews" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{t.reviews.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {t.reviews.t1} <span className="grad">{t.reviews.t2}</span>
          </h2>
          <p className="sec-sub reveal">{t.reviews.sub}</p>
        </div>

        {/* Stats — реальные цифры */}
        <div className="num-band">
          {numCards.map((c, i) => (
            <div key={i} className={`numcard ${c.cls} reveal`}>
              <span className="ni">{c.icon}</span>
              <div className="n"><AnimatedCounter value={c.n} suffix={c.s} duration={2} /></div>
              <div className="l">{t.reviews[c.lKey]}</div>
            </div>
          ))}
        </div>

        {/* Отзывы — скоро */}
        <div className="cases-soon reveal" style={{ marginTop: 48 }}>
          <div className="cases-soon-icon">
            <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
              <path d="M8 14a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H28l-6 6v-6H12a4 4 0 0 1-4-4V14z"/>
              <path d="M16 22h16M16 28h10"/>
            </svg>
          </div>
          <h3 className="ub">{t.reviews.soonT}</h3>
          <p>{t.reviews.soonD}</p>
          <div className="cases-soon-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </section>
  )
}
