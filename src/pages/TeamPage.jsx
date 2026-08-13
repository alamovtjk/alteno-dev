import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { fetchTable } from '../lib/supabase'

function initials(m) {
  if (m.initials) return m.initials
  return (m.name || '')
    .trim().split(/\s+/).slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '').join('')
}

function MemberCard({ m }) {
  const blob = m.blob || '#7c3aed'

  return (
    <div className="tp-card reveal" style={{ '--c': blob }}>
      <div className="tp-glow" style={{ background: blob }} />

      <div className="tp-avatar" style={{ background: `linear-gradient(135deg, ${blob} 0%, #0d0d16 130%)` }}>
        {m.avatar_url
          ? <img src={m.avatar_url} alt={m.name} onError={e => { e.target.style.display = 'none' }} />
          : <span>{initials(m)}</span>}
      </div>

      <div className="tp-name ub">{m.name}</div>
      <div className="tp-role">{m.role}</div>

      {m.skills?.length > 0 && (
        <div className="tp-skills">
          {m.skills.map(s => <span key={s} className="tp-skill">{s}</span>)}
        </div>
      )}

      <div className="tp-icons">
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
  )
}

export default function TeamPage() {
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
    <section className="section page-section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <Link to="/" className="pd-back reveal">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 19l-7-7 7-7"/>
          </svg>
          {t.projects.backHome}
        </Link>

        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{t.team.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {t.team.t1} <span className="grad">{t.team.t2}</span>
          </h2>
          <p className="sec-sub reveal">{t.team.sub}</p>
        </div>

        {members.length > 0 ? (
          <>
            <div className="tp-grid">
              {members.map(m => <MemberCard key={m.id} m={m} />)}
            </div>

            <div className="tp-cta reveal">
              <h3 className="ub">{t.team.joinT}</h3>
              <p>{t.team.joinD}</p>
              <Link to="/#contact" state={{ scrollTo: '#contact' }} className="btn btn-primary">
                {t.team.joinBtn}
              </Link>
            </div>
          </>
        ) : loading ? null : (
          <div className="cases-soon reveal">
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
            <div className="cases-soon-dots"><span /><span /><span /></div>
          </div>
        )}
      </div>
    </section>
  )
}
