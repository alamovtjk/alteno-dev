import { useRef, useEffect, useState, useCallback } from 'react'

const MEMBERS = [
  { id:1, name:'Самир Аламов',  role:'CEO · Lead Developer',  skills:['React','Node.js','AI','Architecture'], initials:'СА', gradient:'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)',  num:'01' },
  { id:2, name:'Алекс Демо',   role:'UI/UX Designer',         skills:['Figma','Framer','Branding','Motion'],  initials:'АД', gradient:'linear-gradient(135deg,#0d9488 0%,#0891b2 100%)',  num:'02' },
  { id:3, name:'Лейла Демо',   role:'Frontend Developer',     skills:['React','TypeScript','Tailwind','Three.js'], initials:'ЛД', gradient:'linear-gradient(135deg,#8c2068 0%,#7c3aed 100%)', num:'03' },
  { id:4, name:'Тимур Демо',   role:'Project Manager',        skills:['Agile','Analytics','Strategy','CRM'], initials:'ТД', gradient:'linear-gradient(135deg,#16a34a 0%,#0d9488 100%)',  num:'04' },
]

const N   = MEMBERS.length
const ALL = [...MEMBERS, ...MEMBERS, ...MEMBERS] // 3 copies for infinite loop

export default function Team() {
  const trackRef = useRef(null)
  const [active, setActive]   = useState(0)
  const jumping  = useRef(false)

  // Low-level scroll to a rendered card index
  const scrollToIdx = useCallback((i, smooth = true) => {
    const el = trackRef.current
    if (!el) return
    const cards = el.querySelectorAll('.team-card')
    const card  = cards[i]
    if (!card) return
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2
    if (smooth) { el.scrollTo({ left, behavior: 'smooth' }) }
    else         { el.scrollLeft = left }
  }, [])

  // Navigate to a logical index 0-3 (always targets middle copy)
  const scrollTo = useCallback((i) => {
    const logical = ((i % N) + N) % N   // wrap negative
    scrollToIdx(logical + N, true)
  }, [scrollToIdx])

  // On mount: jump to middle copy so both sides have cards visible
  useEffect(() => {
    requestAnimationFrame(() => scrollToIdx(N, false))
  }, [scrollToIdx])

  // Scroll listener: detect active card + infinite loop
  const detectActive = useCallback(() => {
    if (jumping.current) return
    const el = trackRef.current
    if (!el) return

    const center = el.scrollLeft + el.clientWidth / 2
    const cards  = el.querySelectorAll('.team-card')
    let minDist  = Infinity, idx = 0
    cards.forEach((card, i) => {
      const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center)
      if (dist < minDist) { minDist = dist; idx = i }
    })

    setActive(idx % N)

    // Silently jump to matching card in middle copy when in edge copies
    if (idx < N || idx >= N * 2) {
      const targetIdx  = idx < N ? idx + N : idx - N
      const targetCard = cards[targetIdx]
      if (targetCard) {
        jumping.current = true
        el.scrollLeft   = targetCard.offsetLeft - (el.clientWidth - targetCard.offsetWidth) / 2
        setTimeout(() => { jumping.current = false }, 80)
      }
    }
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', detectActive, { passive: true })
    return () => el.removeEventListener('scroll', detectActive)
  }, [detectActive])

  // Drag-to-scroll on desktop
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let down = false, startX = 0, sl = 0
    const onDown = (e) => { down = true; el.classList.add('drag'); startX = e.pageX - el.offsetLeft; sl = el.scrollLeft }
    const onUp   = ()  => { down = false; el.classList.remove('drag') }
    const onMove = (e) => {
      if (!down) return
      e.preventDefault()
      el.scrollLeft = sl - (e.pageX - el.offsetLeft - startX) * 1.4
    }
    el.addEventListener('mousedown', onDown)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('mouseup',   onUp)
    el.addEventListener('mousemove', onMove)
    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mouseleave', onUp)
      el.removeEventListener('mouseup',   onUp)
      el.removeEventListener('mousemove', onMove)
    }
  }, [])

  const prev = () => scrollTo(active - 1)
  const next = () => scrollTo(active + 1)

  return (
    <section id="team" className="section team-section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="sec-label reveal d1">// КОМАНДА</div>
        <h2 className="sec-h2 reveal d2">
          Люди, которые <span className="grad">строят результат</span>
        </h2>
        <p className="sec-sub reveal d3">
          Небольшая, но сильная команда — каждый специалист в своём деле.
        </p>
      </div>

      <div className="team-carousel-wrap reveal d4">
        <div className="team-track" ref={trackRef}>
          {ALL.map((m, i) => (
            <div key={i} className={`team-card${active === i % N ? ' active' : ''}`}>
              <div className="team-card-num">{m.num}</div>
              <div className="team-card-top">
                <div className="team-avatar" style={{ background: m.gradient }}>
                  {m.avatar
                    ? <img src={m.avatar} alt={m.name} />
                    : <span>{m.initials}</span>
                  }
                </div>
              </div>
              <div className="team-card-body">
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <div className="team-divider" />
                <div className="team-skills">
                  {m.skills.map(s => <span key={s} className="team-skill">{s}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="team-nav">
          <button className="team-arr" onClick={prev} aria-label="Предыдущий">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="team-dots">
            {MEMBERS.map((_, i) => (
              <button key={i} className={`team-dot${active === i ? ' on' : ''}`} onClick={() => scrollTo(i)} aria-label={`Карточка ${i + 1}`} />
            ))}
          </div>
          <button className="team-arr" onClick={next} aria-label="Следующий">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
