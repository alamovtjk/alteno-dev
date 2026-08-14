import { useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { fetchTable } from '../../lib/supabase'

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

/* Карточка участника — одна и та же в карусели и в статичном ряду */
function TeamCard({ m }) {
  const blob = m.blob || '#7c3aed'
  return (
    <div className="team-card">
      <div className="tc-blob" style={{ background: blob }} />
      <div className="team-card-num">{m.num}</div>
      <div className="team-card-top">
        <div className="tc-ring-wrap">
          <div className="tc-ring" style={{ background: buildRing(blob) }} />
          <div className="tc-ring-gap" />
          <div className="team-avatar" style={{ background: `linear-gradient(135deg, ${blob} 0%, #0d0d16 130%)` }}>
            {m.avatar_url
              ? <img src={m.avatar_url} alt={m.name} />
              : <span>{m.initials || m.name?.slice(0, 2)}</span>}
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
  )
}

/* Карусель зацикливается через тройной массив, поэтому при одном-двух
   участниках человек оказался бы виден рядом с самим собой. */
const MIN_FOR_CAROUSEL = 3

function TeamRow({ members }) {
  return (
    <div className="team-row reveal">
      {members.map(m => (
        <div key={m.id} className="team-card-outer active">
          <TeamCard m={m} />
        </div>
      ))}
    </div>
  )
}

export default function Team() {
  const { t } = useLanguage()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTable('team').then(data => {
      setMembers(data)
      setLoading(false)
    })
  }, [])

  return (
    <section id="team" className="section team-section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="team-bg" aria-hidden="true">
        {/* Звёзды идут глобальным слоем за всей страницей и просвечивают
            сквозь полупрозрачный фон секции. Здесь — только то, что делает
            этот участок космоса особенным. */}
        <div className="team-nebula" />
        <span className="team-shoot team-shoot-1" />
        <span className="team-shoot team-shoot-2" />

        {/* Орбиты — главный акцент раздела, отсюда и название студии */}
        <div className="team-orbit team-orbit-lg">
          <span className="team-orbit-ring" />
          <span className="team-orbit-spin"><i /></span>
        </div>
        <div className="team-orbit team-orbit-sm">
          <span className="team-orbit-ring" />
          <span className="team-orbit-spin"><i /></span>
        </div>
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
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{t.team.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {t.team.t1} <span className="grad">{t.team.t2}</span>
          </h2>
          <p className="sec-sub reveal">{t.team.sub}</p>
        </div>
      </div>

      {members.length > 0 ? (
        <>
          {members.length >= MIN_FOR_CAROUSEL
            ? <TeamCarousel members={members} labels={t.team} />
            : <TeamRow members={members} />}
          {/* Проектор: карточки выше выглядят спроецированными с этой площадки */}
          <div className="shell" style={{ position: 'relative', zIndex: 1 }}>
            <div className="holo reveal">
              <span className="holo-beam" aria-hidden="true" />
              <span className="holo-ring holo-ring-3" aria-hidden="true" />
              <span className="holo-ring holo-ring-2" aria-hidden="true" />
              <span className="holo-ring holo-ring-1" aria-hidden="true" />
              <span className="holo-core" aria-hidden="true" />

              <Link to="/team" className="btn btn-ghost holo-btn">
                {t.team.seeAll}
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </>
      ) : loading ? null : (
        <div className="shell" style={{ position: 'relative', zIndex: 1 }}>
          <div className="cases-soon reveal" style={{ marginTop: 64 }}>
            <div className="cases-soon-icon">
              <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                <circle cx="18" cy="17" r="6"/>
                <path d="M8 39c0-5.5 4.5-10 10-10s10 4.5 10 10"/>
                <circle cx="33" cy="19" r="5"/>
                <path d="M33 29c4.4 0 8 3.6 8 8"/>
              </svg>
            </div>
            <h3 className="ub">{t.team.soonT}</h3>
            <p>{t.team.soonD}</p>
            <div className="cases-soon-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function TeamCarousel({ members, labels }) {
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
    <div className="team-carousel-wrap reveal" style={{ position: 'relative', zIndex: 1 }}>
        <div className="team-track" ref={trackRef}>
          {ALL.map((m, i) => {
            const isActive = active === i % N
            return (
              <div key={i} className={`team-card-outer${isActive ? " active" : ""}`}>
                <TeamCard m={m} />
              </div>
            )
          })}
        </div>

        <div className="team-nav">
          <button className="team-arr" onClick={prev} aria-label={labels.prev}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="team-dots">
            {members.map((_, i) => (
              <button key={i} className={`team-dot${active === i ? ' on' : ''}`} onClick={() => scrollTo(i)} aria-label={`${labels.card} ${i + 1}`} />
            ))}
          </div>
          <button className="team-arr" onClick={next} aria-label={labels.next}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
    </div>
  )
}
