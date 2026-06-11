import { useLanguage } from '../../context/LanguageContext'
import DeviceScene from '../ui/DeviceScene'

const IcoUiux = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="6" height="6" rx="1.5"/>
    <rect x="10" y="2" width="6" height="6" rx="1.5"/>
    <rect x="2" y="10" width="6" height="6" rx="1.5"/>
    <path d="M13 10v6M10 13h6"/>
  </svg>
)
const IcoWeb = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5l-3 4 3 4M13 5l3 4-3 4M10 3l-2 12"/>
  </svg>
)
const IcoMob = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="1" width="8" height="16" rx="2"/>
    <path d="M8 14h2"/>
  </svg>
)

export default function Services() {
  const { t } = useLanguage()

  const tags = ['React', 'Next.js', 'Figma', 'TypeScript', 'Flutter', 'Node.js', 'UI/UX', 'SEO']

  const svcLabels = [
    { Icon: IcoUiux, nameKey: 'c1', mod: 'uiux' },
    { Icon: IcoWeb,  nameKey: 'c2', mod: 'web'  },
    { Icon: IcoMob,  nameKey: 'c3', mod: 'mob'  },
  ]

  return (
    <section id="services" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{t.services.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {t.services.t1} <span className="grad">{t.services.t2}</span>
          </h2>
          <p className="sec-sub reveal">{t.services.sub}</p>
        </div>

        <div className="dv-stage reveal">
          <div className="dv-svc-labels">
            {svcLabels.map(({ Icon, nameKey, mod }) => (
              <div key={mod} className={`dv-svc-lbl dv-svc-lbl--${mod}`}>
                <span className="dv-svc-ico"><Icon /></span>
                <span className="dv-svc-name">{t.devices[nameKey]}</span>
              </div>
            ))}
          </div>

          <DeviceScene parallax={true} />

          <div className="dv-tags">
            {tags.map((tag, i) => <span key={i} className="dv-tag">{tag}</span>)}
          </div>
        </div>
      </div>
    </section>
  )
}
