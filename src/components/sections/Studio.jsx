import { useLanguage } from '../../context/LanguageContext'
import AnimatedCounter from '../ui/AnimatedCounter'

const vals = [
  { cls: 'v1', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>, tKey:'v1t', dKey:'v1d' },
  { cls: 'v2', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M2 12h20"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>, tKey:'v2t', dKey:'v2d' },
  { cls: 'v3', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 8l9-5 9 5-9 5z"/></svg>, tKey:'v3t', dKey:'v3d' },
  { cls: 'v4', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>, tKey:'v4t', dKey:'v4d' },
]

const numCards = [
  { n:50, s:'+', lKey:'st1', cls:'n1', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg> },
  { n:98, s:'%', lKey:'st2', cls:'n2', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> },
  { n:5,  s:'',  lKey:'st3', cls:'n3', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> },
  { n:12, s:'',  lKey:'st4', cls:'n4', icon:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8 13l-2 8 6-3 6 3-2-8"/></svg> },
]

export default function Studio() {
  const { t } = useLanguage()

  return (
    <section id="studio" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{t.studio.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {t.studio.t1} <span className="grad">{t.studio.t2}</span>
          </h2>
          <p className="sec-sub reveal">{t.studio.sub}</p>
        </div>

        <div className="studio-layout">
          {/* Manifesto */}
          <div className="manifesto reveal">
            <div className="quote-mark">"</div>
            <p>{t.studio.manifesto}</p>
            <div className="sign">
              <span className="m-av">AN</span>
              <span className="who">
                <b>{t.studio.signname}</b>
                <span>{t.studio.signrole}</span>
              </span>
            </div>
          </div>

          {/* Values */}
          <div className="values">
            {vals.map((v, i) => (
              <div key={i} className={`val ${v.cls} reveal`}>
                <span className="vi">{v.icon}</span>
                <h4 className="ub">{t.studio[v.tKey]}</h4>
                <p>{t.studio[v.dKey]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="num-band">
          {numCards.map((c, i) => (
            <div key={i} className={`numcard ${c.cls} reveal`}>
              <span className="ni">{c.icon}</span>
              <div className="n">
                <AnimatedCounter value={c.n} suffix={c.s} duration={2} />
              </div>
              <div className="l">{t.studio[c.lKey]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
