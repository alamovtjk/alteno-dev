import { useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'

const MEMBERS = [
  {
    id: 1,
    name: 'Самир Аламов',
    role: 'CEO · Lead Developer',
    skills: ['React', 'Node.js', 'AI', 'Architecture'],
    avatar: null,
    initials: 'СА',
    gradient: 'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)',
  },
  {
    id: 2,
    name: 'Алекс Демо',
    role: 'UI/UX Designer',
    skills: ['Figma', 'Framer', 'Branding', 'Motion'],
    avatar: null,
    initials: 'АД',
    gradient: 'linear-gradient(135deg,#0d9488 0%,#0891b2 100%)',
  },
  {
    id: 3,
    name: 'Лейла Демо',
    role: 'Frontend Developer',
    skills: ['React', 'TypeScript', 'Tailwind', 'Three.js'],
    avatar: null,
    initials: 'ЛД',
    gradient: 'linear-gradient(135deg,#8c2068 0%,#7c3aed 100%)',
  },
  {
    id: 4,
    name: 'Тимур Демо',
    role: 'Project Manager',
    skills: ['Agile', 'Analytics', 'Strategy', 'CRM'],
    avatar: null,
    initials: 'ТД',
    gradient: 'linear-gradient(135deg,#0b6012 0%,#0d9488 100%)',
  },
]

export default function Team() {
  const { t } = useLanguage()
  const trackRef = useRef(null)

  // Drag-to-scroll на десктопе
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let isDown = false, startX = 0, scrollLeft = 0

    const onDown = (e) => {
      isDown = true
      el.classList.add('drag')
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }
    const onUp = () => { isDown = false; el.classList.remove('drag') }
    const onMove = (e) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      el.scrollLeft = scrollLeft - (x - startX) * 1.4
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

      <div className="team-track-wrap">
        <div className="team-track" ref={trackRef}>
          {MEMBERS.map((m) => (
            <div className="team-card" key={m.id}>
              <div className="team-avatar" style={{ background: m.gradient }}>
                {m.avatar
                  ? <img src={m.avatar} alt={m.name} />
                  : <span>{m.initials}</span>
                }
              </div>
              <div className="team-info">
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <div className="team-skills">
                  {m.skills.map(s => <span key={s} className="team-skill">{s}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
