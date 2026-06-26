import { useRef, useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const PARTICLES = [
  { id:0,  x:6,  y:10, s:2,   c:'#7c3aed', dur:7, del:0   },
  { id:1,  x:20, y:55, s:1.5, c:'#10b981', dur:9, del:1   },
  { id:2,  x:30, y:22, s:1,   c:'#7c3aed', dur:5, del:2   },
  { id:3,  x:44, y:80, s:2.5, c:'#10b981', dur:8, del:0.5 },
  { id:4,  x:55, y:12, s:1,   c:'#4f46e5', dur:9, del:3   },
  { id:5,  x:63, y:90, s:2,   c:'#7c3aed', dur:6, del:1.5 },
  { id:6,  x:76, y:35, s:1.5, c:'#10b981', dur:8, del:2.5 },
  { id:7,  x:85, y:65, s:1,   c:'#7c3aed', dur:5, del:0.8 },
  { id:8,  x:92, y:18, s:2,   c:'#10b981', dur:7, del:3.5 },
  { id:9,  x:36, y:95, s:1.5, c:'#4f46e5', dur:9, del:1.2 },
  { id:10, x:50, y:48, s:1,   c:'#7c3aed', dur:6, del:4   },
  { id:11, x:13, y:72, s:2,   c:'#10b981', dur:8, del:2   },
  { id:12, x:97, y:58, s:1.5, c:'#7c3aed', dur:5, del:0.3 },
  { id:13, x:69, y:4,  s:1,   c:'#10b981', dur:7, del:3.2 },
  { id:14, x:25, y:16, s:2,   c:'#4f46e5', dur:9, del:1.8 },
  { id:15, x:80, y:88, s:1,   c:'#7c3aed', dur:6, del:0.6 },
]

function buildRing(blob) {
  return `conic-gradient(from 0deg, ${blob}, #4f46e5, #a78bfa, ${blob})`
}

export default function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('team')
      .select('*')
      .order('order_index')
      .then(({ data }) => {
        setMembers(data || [])
        setLoading(false)
      })
  }, [])

  if (loading || members.length === 0) return null

  return <TeamCarousel members={members} />
}

function TeamCarousel({ members }) {
  const N      = members.length
  const ALL    = [...members, ...members, ...members]

  const trackRef  = useRef(null)
  const [active, setActive] = useState(0)
  const jumping   = useRef(false)
  const jumpTimer = useRef(null)

  const scrollToIdx = useCallback((i, smooth = true) => {
    const el = trackRef.current
    if (!el) return
    const cards = el.querySelectorAll('.team-card-outer')
    const card  = cards[i]
    if (!card) return
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2
    if (smooth) el.scrollTo({ left, behavior: 'smooth' })
    else        el.scrollLeft = left
  }, [])

  const scrollTo = useCallback((i) => {
    const logical = ((i % N) + N) % N
    scrollToIdx(logical + N, true)
  }, [N, scrollToIdx])

  useEffect(() => {
    requestAnimationFrame(() => scrollToIdx(N, false))
  }, [N, scrollToIdx])

  const detectActive = useCallback(() => {
    if (jumping.current) return
    const el = trackRef.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    const cards  = el.querySelectorAll('.team-card-outer')
    let minDist  = Infinity, idx = 0
    cards.forEach((card, i) => {
      const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center)
      if (dist < minDist) { minDist = dist; idx = i }
    })
    setActive(idx % N)
    clearTimeout(jumpTimer.current)
    jumpTimer.current = setTimeout(() => {
      if (jumping.current || (idx >= N && idx < N * 2)) return
      const targetIdx  = idx < N ? idx + N : idx - N
      const targetCard = cards[targetIdx]
      if (!targetCard) return
      jumping.current = true
      el.scrollLeft = targetCard.offsetLeft - (el.clientWidth - targetCard.offsetWidth) / 2
      setTimeout(() => { jumping.current = false }, 60)
    }, 60)
  }, [N])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', detectActive, { passive: true })
    return () => el.removeEventListener('scroll', detectActive)
  }, [detectActive])

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
    el.addEventListener('mousedown',  onDown)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('mouseup',    onUp)
    el.addEventListener('mousemove',  onMove)
    return () => {
      el.removeEventListener('mousedown',  onDown)
      el.removeEventListener('mouseleave', onUp)
      el.removeEventListener('mouseup',    onUp)
      el.removeEventListener('mousemove',  onMove)
    }
  }, [])

  const prev = () => scrollTo(active - 1)
  const next = () => scrollTo(active + 1)

  return (
    <section id="team" className="section team-section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="team-bg" aria-hidden="true">
        <div className="team-grid" />
        {PARTICLES.map(p => (
          <div key={p.id} className="team-particle" style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.s}px`, height: `${p.s}px`,
            background: p.c, color: p.c,
            animationDelay: `${p.del}s`,
            animationDuration: `${p.dur}s`,
          }} />
        ))}
      </div>

      <div className="shell" style={{ position: 'relative', zIndex: 1 }}>
        <div className="sec-label reveal d1">// КОМАНДА</div>
        <h2 className="sec-h2 reveal d2">
          Люди, которые <span className="grad">строят результат</span>
        </h2>
        <p className="sec-sub reveal d3">
          Небольшая, но сильная команда — каждый специалист в своём деле.
        </p>
      </div>

      <div className="team-carousel-wrap reveal d4" style={{ position: 'relative', zIndex: 1 }}>
        <div className="team-track" ref={trackRef}>
          {ALL.map((m, i) => {
            const isActive = active === i % N
            const ring = buildRing(m.blob || '#7c3aed')
            return (
              <div key={i} className={`team-card-outer${isActive ? ' active' : ''}`}>
                <div className="team-card">
                  <div className="tc-blob" style={{ background: m.blob || '#7c3aed' }} />
                  <div className="team-card-num">{m.num}</div>
                  <div className="team-card-top">
                    <div className="tc-ring-wrap">
                      <div className="tc-ring" style={{ background: ring }} />
                      <div className="tc-ring-gap" />
                      <div className="team-avatar" style={{ background: `linear-gradient(135deg, ${m.blob || '#7c3aed'} 0%, #0d0d16 130%)` }}>
                        {m.avatar_url
                          ? <img src={m.avatar_url} alt={m.name} />
                          : <span>{m.initials || m.name?.slice(0,2)}</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="team-card-body">
                    <div className="team-name">{m.name}</div>
                    <div className="team-role">{m.role}</div>
                    <div className="team-divider-line" />
                    <div className="team-skills">
                      {(m.skills || []).map(s => <span key={s} className="team-skill">{s}</span>)}
                    </div>
                    <div className="team-icons">
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="tc-icon" aria-label="Email">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                      {m.portfolio_url && (
                        <a href={m.portfolio_url} target="_blank" rel="noreferrer" className="tc-icon" aria-label="Portfolio">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="team-nav">
          <button className="team-arr" onClick={prev} aria-label="Предыдущий">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="team-dots">
            {members.map((_, i) => (
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
