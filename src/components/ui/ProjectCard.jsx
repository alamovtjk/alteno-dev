import { Link } from 'react-router-dom'

/* Заглушка вместо скриншота — стеклянный мок интерфейса на градиенте акцента */
function MockUI() {
  return (
    <div className="pcard-mock" aria-hidden="true">
      <span className="pcard-mock-pane" style={{ left: '9%',  top: '20%', width: '32%', height: '24%' }} />
      <span className="pcard-mock-pane" style={{ left: '9%',  top: '50%', width: '32%', height: '30%' }} />
      <span className="pcard-mock-pane" style={{ left: '47%', top: '20%', width: '44%', height: '60%' }} />
      <span className="pcard-mock-bar"  style={{ left: '52%', top: '30%', width: '28%' }} />
      <span className="pcard-mock-bar"  style={{ left: '52%', top: '41%', width: '18%' }} />
      <span className="pcard-mock-dot"  style={{ left: '52%', top: '56%' }} />
    </div>
  )
}

export default function ProjectCard({ row, to, accent, label }) {
  const year = row.created_at ? new Date(row.created_at).getFullYear() : null
  const tags = (row.tags || []).slice(0, 3)

  return (
    <Link
      to={to}
      className="pcard reveal"
      style={{ '--c': accent.c, '--grad': accent.grad }}
    >
      <div className="pcard-media">
        <div className="pcard-media-in">
          {row.image_url
            ? <img src={row.image_url} alt={row.title} loading="lazy" />
            : <MockUI />}
        </div>
        {year && <span className="pcard-year">{year}</span>}
      </div>

      <div className="pcard-body">
        <h3 className="pcard-title ub">{row.title}</h3>
        {row.description && <p className="pcard-desc">{row.description}</p>}
        {tags.length > 0 && (
          <div className="pcard-tags">
            {tags.map(tg => <span key={tg} className="pcard-tag">{tg}</span>)}
          </div>
        )}
      </div>

      <div className="pcard-foot">
        <span className="pcard-cta">{label}</span>
        <span className="pcard-arrow">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
