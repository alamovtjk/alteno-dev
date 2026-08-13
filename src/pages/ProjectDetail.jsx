import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { fetchTable } from '../lib/supabase'
import { findBySlug, rowSlug } from '../lib/slug'

export default function ProjectDetail() {
  const { slug } = useParams()
  const { t } = useLanguage()
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTable('portfolio').then(data => {
      setRows(data)
      setLoading(false)
    })
  }, [])

  const project = findBySlug(rows, slug)

  if (loading) {
    return <section className="section page-section"><div className="shell" /></section>
  }

  /* Проект удалили или адрес набрали руками */
  if (!project) {
    return (
      <section className="section page-section" style={{ position: 'relative', zIndex: 2 }}>
        <div className="shell">
          <div className="cases-soon reveal in">
            <div className="cases-soon-icon">
              <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                <circle cx="24" cy="24" r="18"/><path d="M24 16v10M24 32h.01"/>
              </svg>
            </div>
            <h3 className="ub">{t.projects.notFoundT}</h3>
            <p>{t.projects.notFoundD}</p>
            <Link to="/projects" className="btn btn-primary" style={{ marginTop: 20 }}>
              {t.projects.backToAll}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const idx    = rows.findIndex(r => r.id === project.id)
  const next   = rows[(idx + 1) % rows.length]
  const isOnly = rows.length < 2
  const year   = project.created_at ? new Date(project.created_at).getFullYear() : null

  /* Скриншот ведёт на сайт проекта, если ссылка есть */
  const Shot = project.link ? 'a' : 'div'
  const shotProps = project.link
    ? { href: project.link, target: '_blank', rel: 'noreferrer' }
    : {}

  return (
    <section className="section pd-page" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">

        <Link to="/projects" className="pd-back reveal">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 19l-7-7 7-7"/>
          </svg>
          {t.projects.backToAll}
        </Link>

        <div className="pd-layout">

          {project.image_url && (
            <Shot {...shotProps} className="pd-hero reveal">
              <img src={project.image_url} alt={project.title} />
              {project.link && (
                <span className="pd-hero-hint">
                  {t.projects.visit}
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </span>
              )}
            </Shot>
          )}

          <div className="pd-side reveal">
            <h1 className="pd-title ub">{project.title}</h1>

            {project.tags?.length > 0 && (
              <div className="pd-tags">
                {project.tags.map(tg => <span key={tg} className="chip">{tg}</span>)}
              </div>
            )}

            <div className="pd-desc">
              {project.description
                ? project.description.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
                : <p>{t.projects.noDesc}</p>}
            </div>

            <div className="pd-meta">
              {year && (
                <div className="pd-row">
                  <span className="pd-row-l">{t.projects.year}</span>
                  <span className="pd-row-v">{year}</span>
                </div>
              )}
              {project.tags?.length > 0 && (
                <div className="pd-row">
                  <span className="pd-row-l">{t.projects.stack}</span>
                  <span className="pd-row-v">{project.tags.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="pd-actions">
              {project.link && (
                <a href={project.link} target="_blank" rel="noreferrer" className="btn btn-primary pd-visit">
                  {t.projects.visit}
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M7 7h10v10" stroke="#fff"/>
                  </svg>
                </a>
              )}
              <Link to="/#contact" className="btn btn-ghost pd-order" state={{ scrollTo: '#contact' }}>
                {t.projects.order}
              </Link>
            </div>

            {!isOnly && next && (
              <Link to={`/projects/${rowSlug(next, rows)}`} className="pd-next">
                <span className="pd-next-l">{t.projects.next}</span>
                <span className="pd-next-t">{next.title}</span>
                <span className="pd-next-a">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7"/>
                  </svg>
                </span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
