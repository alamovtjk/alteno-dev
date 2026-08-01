import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { fetchTable } from '../../lib/supabase'
import { rowSlug } from '../../lib/slug'
import { accentFor } from '../../lib/accents'
import ProjectCard from '../ui/ProjectCard'

/* На главной — витрина, полный список живёт на /projects */
const PREVIEW_COUNT = 6

export default function Portfolio() {
  const { t } = useLanguage()
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTable('portfolio').then(data => {
      setRows(data)
      setLoading(false)
    })
  }, [])

  const preview = rows.slice(0, PREVIEW_COUNT)

  return (
    <section id="cases" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{t.cases.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {t.cases.t1} <span className="grad">{t.cases.t2}</span>
          </h2>
          <p className="sec-sub reveal">{t.cases.sub}</p>
        </div>

        {preview.length > 0 ? (
          <>
            <div className="pcard-grid">
              {preview.map((row, i) => (
                <ProjectCard
                  key={row.id}
                  row={row}
                  to={`/projects/${rowSlug(row, rows)}`}
                  accent={accentFor(i)}
                  label={t.projects.view}
                />
              ))}
            </div>

            <div className="sec-more reveal">
              <Link to="/projects" className="btn btn-ghost">
                {t.projects.seeAll}
                {rows.length > PREVIEW_COUNT && (
                  <span className="sec-more-n">{rows.length}</span>
                )}
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </>
        ) : loading ? null : (
          <div className="cases-soon reveal">
            <div className="cases-soon-icon">
              <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                <rect x="6" y="10" width="36" height="28" rx="4"/>
                <path d="M6 18h36"/>
                <circle cx="13" cy="14" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="19" cy="14" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="25" cy="14" r="1.5" fill="currentColor" stroke="none"/>
                <path d="M16 28l4 4 12-10"/>
              </svg>
            </div>
            <h3 className="ub">{t.cases.soonT}</h3>
            <p>{t.cases.soonD}</p>
            <div className="cases-soon-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
