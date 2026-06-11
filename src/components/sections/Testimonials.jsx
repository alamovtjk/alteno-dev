import { useLanguage } from '../../context/LanguageContext'
import AnimatedCounter from '../ui/AnimatedCounter'

const numCards = [
  { n:50, s:'+', lKey:'num1l', cls:'n1', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg> },
  { n:98, s:'%', lKey:'num2l', cls:'n2', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> },
  { n:5,  s:'',  lKey:'num3l', cls:'n3', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> },
  { n:12, s:'',  lKey:'num4l', cls:'n4', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8 13l-2 8 6-3 6 3-2-8"/></svg> },
]

const reviewDefs = [
  { qKey:'rev1q', nKey:'rev1n', rKey:'rev1r', av:'АВ', c1:'#7c3aed', c2:'#2563eb' },
  { qKey:'rev2q', nKey:'rev2n', rKey:'rev2r', av:'МС', c1:'#0d9488', c2:'#9333ea' },
  { qKey:'rev3q', nKey:'rev3n', rKey:'rev3r', av:'ТР', c1:'#2563eb', c2:'#7c3aed' },
]

const Star = () => <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#f59e0b"/></svg>

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

        {/* Stats */}
        <div className="num-band">
          {numCards.map((c, i) => (
            <div key={i} className={`numcard ${c.cls} reveal`}>
              <span className="ni">{c.icon}</span>
              <div className="n"><AnimatedCounter value={c.n} suffix={c.s} duration={2} /></div>
              <div className="l">{t.reviews[c.lKey]}</div>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="reviews-grid">
          {reviewDefs.map((r, i) => (
            <div key={i} className="review reveal"
              style={{ '--c1': r.c1, '--c2': r.c2 }}>
              <div className="stars"><Star/><Star/><Star/><Star/><Star/></div>
              <p className="quote">"{t.reviews[r.qKey]}"</p>
              <div className="who">
                <span className="av"
                  style={{ background: `linear-gradient(135deg,${r.c1},${r.c2})` }}>
                  {r.av}
                </span>
                <div>
                  <b>{t.reviews[r.nKey]}</b>
                  <span>{t.reviews[r.rKey]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
