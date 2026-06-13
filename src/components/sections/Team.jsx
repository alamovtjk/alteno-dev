import { useRef, useEffect, useState, useCallback } from 'react'

const MEMBERS = [
  {
    id: 1,
    name: 'Самир Аламов',
    role: 'CEO · Lead Developer',
    skills: ['React', 'Node.js', 'AI', 'Architecture'],
    initials: 'СА',
    gradient: 'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)',
    num: '01',
  },
  {
    id: 2,
    name: 'Алекс Демо',
    role: 'UI/UX Designer',
    skills: ['Figma', 'Framer', 'Branding', 'Motion'],
    initials: 'АД',
    gradient: 'linear-gradient(135deg,#0d9488 0%,#0891b2 100%)',
    num: '02',
  },
  {
    id: 3,
    name: 'Лейла Демо',
    role: 'Frontend Developer',
    skills: ['React', 'TypeScript', 'Tailwind', 'Three.js'],
    initials: 'ЛД',
    gradient: 'linear-gradient(135deg,#8c2068 0%,#7c3aed 100%)',
    num: '03',
  },
  {
    id: 4,
    name: 'Тимур Демо',
    role: 'Project Manager',
    skills: ['Agile', 'Analytics', 'Strategy', 'CRM'],
    initials: 'ТД',
    gradient: 'linear-gradient(135deg,#16a34a 0%,#0d9488 100%)',
    num: '04',
  },
]

export default function Team() {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)

  const detectActive = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    const cards = el.querySelectorAll('.team-card')
    let minDist = Infinity, idx = 0
    cards.forEach((card, i) => {
      const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center)
      if (dist < minDist) { minDist = dist; idx = i }
    })
    setActive(idx)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', detectActive, { passive: true })
    detectActive()
    return () => el.removeEventListener('scroll', detectActive)
  }, [detectActive])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let isDown = false, startX = 0, scrollLeft = 0
    const onDown = (e) => {
      isDown = true; el.classList.add('drag')
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }
    const onUp = () => { isDown = false; el.classList.remove('drag') }
    const onMove = (e) => {
      if (!isDown) return
      e.preventDefault()
      el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.4
    }
    el.addEventListener('mousedown', onDown)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mousemove', onMove)
    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mouseleave', onUp)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mousemove', onMove)
    }
  }, [])

  const scrollTo = useCallback((i) => {
    const el = trackRef.current
    if (!el) return
    const cards = el.querySelectorAll('.team-card')
    const card = cards[i]
    if (!card) return
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [])

  const prev = () => scrollTo(Math.max(0, active - 1))
  const next = () => scrollTo(Math.min(MEMBERS.length - 1, active + 1))

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
          {MEMBERS.map((m, i) => (
            <div
              key={m.id}
              className={`team-card${active === i ? ' active' : ''}`}
              onClick={() => scrollTo(i)}
            >
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
          <button className="team-arr" onClick={prev} disabled={active === 0} aria-label="Предыдущий">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="team-dots">
            {MEMBERS.map((_, i) => (
              <button key={i} className={`team-dot${active === i ? ' on' : ''}`} onClick={() => scrollTo(i)} aria-label={`Карточка ${i + 1}`} />
            ))}
          </div>
          <button className="team-arr" onClick={next} disabled={active === MEMBERS.length - 1} aria-label="Следующий">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
