import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { fetchTable } from '../lib/supabase'
import { rowSlug } from '../lib/slug'
import { accentFor } from '../lib/accents'
import ProjectCard from '../components/ui/ProjectCard'

export default function Projects() {
  const { t } = useLanguage()
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [tag,     setTag]     = useState(null)

  useEffect(() => {
    fetchTable('portfolio').then(data => {
      setRows(data)
      setLoading(false)
    })
  }, [])

  const tags = useMemo(() => {
    const all = rows.flatMap(r => r.tags || [])
    return [...new Set(all)]
  }, [rows])

  const shown = tag ? rows.filter(r => (r.tags || []).includes(tag)) : rows

  return (
    <section className="section page-section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />{t.projects.eyebrow}</div>
          <h2 className="sec-title ub reveal">
            {t.projects.t1} <span className="grad">{t.projects.t2}</span>
          </h2>
          <p className="sec-sub reveal">{t.projects.sub}</p>
        </div>

        {tags.length > 0 && (
          <div className="proj-filters reveal">
            <button className={`proj-filter${tag === null ? ' on' : ''}`} onClick={() => setTag(null)}>
              {t.projects.all} <span className="proj-filter-n">{rows.length}</span>
            </button>
            {tags.map(tg => (
              <button key={tg} className={`proj-filter${tag === tg ? ' on' : ''}`} onClick={() => setTag(tg)}>
                {tg}
                <span className="proj-filter-n">{rows.filter(r => (r.tags || []).includes(tg)).length}</span>
              </button>
            ))}
          </div>
        )}

        {shown.length > 0 ? (
          <div className="pcard-grid">
            {shown.map((row, i) => (
              <ProjectCard
                key={row.id}
                row={row}
                to={`/projects/${rowSlug(row, rows)}`}
                accent={accentFor(i)}
              />
            ))}
          </div>
        ) : loading ? null : (
          <div className="cases-soon reveal">
            <div className="cases-soon-icon">
              <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                <rect x="6" y="10" width="36" height="28" rx="4"/>
                <path d="M6 18h36"/>
                <path d="M16 28l4 4 12-10"/>
              </svg>
            </div>
            <h3 className="ub">{t.cases.soonT}</h3>
            <p>{t.cases.soonD}</p>
            <div className="cases-soon-dots"><span /><span /><span /></div>
          </div>
        )}
      </div>
    </section>
  )
}
