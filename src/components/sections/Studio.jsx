import { useLanguage } from '../../context/LanguageContext'

const vals = [
  { cls: 'v1', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>, tKey:'v1t', dKey:'v1d' },
  { cls: 'v2', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M2 12h20"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>, tKey:'v2t', dKey:'v2d' },
  { cls: 'v3', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 8l9-5 9 5-9 5z"/></svg>, tKey:'v3t', dKey:'v3d' },
  { cls: 'v4', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>, tKey:'v4t', dKey:'v4d' },
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
              <span className="m-av">СА</span>
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
      </div>
    </section>
  )
}
