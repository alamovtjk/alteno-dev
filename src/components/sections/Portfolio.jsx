import { useRef, useEffect } from 'react'
import { useInView } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'

const Arrow = () => (
  <span className="arrow">
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  </span>
)

// CSS custom-property objects (React style props must be objects, NOT strings)
const cases = [
  {
    name: 'FinTrack Pro', catKey: 'c1cat', descKey: 'c1d', year: '2025', featured: true,
    vars: { '--c': '#7c3aed', '--grad': 'linear-gradient(120deg,#4c1d95,#2563eb 60%,#0d9488)' },
    panes: [
      { left:'6%',  top:'22%', width:'30%', height:'56%' },
      { left:'40%', top:'22%', width:'26%', height:'26%' },
      { left:'40%', top:'52%', width:'26%', height:'26%' },
      { left:'70%', top:'22%', width:'24%', height:'56%' },
    ],
    bars: [
      { left:'9%', top:'30%', width:'18%', height:'8px' },
      { left:'9%', top:'40%', width:'12%', height:'8px' },
    ],
    dots: [{ left:'73%', top:'30%', width:'26px', height:'26px' }],
  },
  {
    name: 'Lumina Shop', catKey: 'c2cat', year: '2025',
    vars: { '--c': '#9333ea', '--grad': 'linear-gradient(140deg,#6d28d9,#9333ea)' },
    panes: [
      { left:'10%', top:'16%', width:'80%', height:'24%' },
      { left:'10%', top:'48%', width:'37%', height:'36%' },
      { left:'53%', top:'48%', width:'37%', height:'36%' },
    ],
    bars: [{ left:'14%', top:'24%', width:'30%', height:'7px' }], dots: [],
  },
  {
    name: 'MediCore', catKey: 'c3cat', year: '2024',
    vars: { '--c': '#0d9488', '--grad': 'linear-gradient(140deg,#134e4a,#0d9488 70%,#2563eb)' },
    panes: [
      { left:'10%', top:'18%', width:'28%', height:'64%' },
      { left:'44%', top:'18%', width:'46%', height:'28%' },
      { left:'44%', top:'54%', width:'46%', height:'28%' },
    ],
    bars: [], dots: [{ left:'16%', top:'26%', width:'24px', height:'24px' }],
  },
  {
    name: 'ArcSpace', catKey: 'c4cat', year: '2024',
    vars: { '--c': '#2563eb', '--grad': 'linear-gradient(140deg,#1e3a8a,#2563eb 60%,#7c3aed)' },
    panes: [
      { left:'12%', top:'20%', width:'76%', height:'30%' },
      { left:'12%', top:'56%', width:'24%', height:'26%' },
      { left:'40%', top:'56%', width:'24%', height:'26%' },
      { left:'68%', top:'56%', width:'20%', height:'26%' },
    ],
    bars: [], dots: [],
  },
  {
    name: 'NovaPay', catKey: 'c5cat', year: '2025',
    vars: { '--c': '#7c3aed', '--grad': 'linear-gradient(140deg,#5b21b6,#7c3aed 65%,#0d9488)' },
    panes: [
      { left:'14%', top:'16%', width:'72%', height:'20%' },
      { left:'14%', top:'44%', width:'72%', height:'40%' },
    ],
    bars: [
      { left:'18%', top:'54%', width:'40%', height:'8px' },
      { left:'18%', top:'64%', width:'26%', height:'8px' },
    ],
    dots: [],
  },
  {
    name: 'GreenRoot', catKey: 'c6cat', year: '2023',
    vars: { '--c': '#0d9488', '--grad': 'linear-gradient(140deg,#134e4a,#15803d 70%,#0d9488)' },
    panes: [
      { left:'10%', top:'20%', width:'38%', height:'60%' },
      { left:'54%', top:'20%', width:'36%', height:'28%' },
    ],
    bars: [{ left:'14%', top:'30%', width:'26%', height:'8px' }],
    dots: [{ left:'60%', top:'56%', width:'40px', height:'40px' }],
  },
]

function CaseCard({ c, featured }) {
  const { t } = useLanguage()
  return (
    <a
      className={`case${featured ? ' featured' : ''} reveal`}
      href="#"
      onClick={e => e.preventDefault()}
      style={c.vars}
    >
      <div className="thumb" style={{ background: c.vars['--grad'] }}>
        <div className="thumb-inner">
          <div className="mock">
            {c.panes.map((p, i) => <span key={`p${i}`} className="pane" style={p} />)}
            {c.bars.map((b, i)  => <span key={`b${i}`} className="bar"  style={b} />)}
            {c.dots.map((d, i)  => <span key={`d${i}`} className="dot"  style={d} />)}
          </div>
        </div>
        <div className="meta">
          <span className="cat">{t.cases[c.catKey]}</span>
          <span className="year">{c.year}</span>
        </div>
        <div className="case-foot">
          <div>
            <h3>{c.name}</h3>
            {featured && c.descKey && <p>{t.cases[c.descKey]}</p>}
          </div>
          <Arrow />
        </div>
      </div>
    </a>
  )
}

export default function Portfolio() {
  const { t } = useLanguage()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!inView) return
    ref.current?.querySelectorAll('.reveal').forEach(el => el.classList.add('in'))
  }, [inView])

  const [featured, ...rest] = cases

  return (
    <section id="cases" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell" ref={ref}>
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{t.cases.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {t.cases.t1} <span className="grad">{t.cases.t2}</span>
          </h2>
          <p className="sec-sub reveal">{t.cases.sub}</p>
        </div>

        <CaseCard c={featured} featured />

        <div className="case-grid">
          {rest.map((c, i) => <CaseCard key={i} c={c} />)}
        </div>
      </div>
    </section>
  )
}
