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

/* Карточка — обложка и название. Описание, теги, год и ссылка
   живут на странице проекта, чтобы витрина оставалась картинкой. */
export default function ProjectCard({ row, to, accent }) {
  return (
    <Link
      to={to}
      className="pcard reveal"
      style={{ '--c': accent.c, '--grad': accent.grad }}
      aria-label={row.title}
    >
      <div className="pcard-media">
        {row.image_url
          ? <img src={row.image_url} alt="" loading="lazy" />
          : <MockUI />}
      </div>

      <span className="pcard-veil" aria-hidden="true" />

      <div className="pcard-cap">
        <h3 className="pcard-title ub">{row.title}</h3>
        <span className="pcard-go" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
