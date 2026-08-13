import { Link } from 'react-router-dom'

/* Заглушка вместо скриншота — стеклянный мок интерфейса на градиенте акцента */
function MockUI() {
  return (
    <div className="pcard-mock" aria-hidden="true">
      <span className="pcard-mock-pane" style={{ left: '7%',  top: '16%', width: '30%', height: '26%' }} />
      <span className="pcard-mock-pane" style={{ left: '7%',  top: '50%', width: '30%', height: '32%' }} />
      <span className="pcard-mock-pane" style={{ left: '43%', top: '16%', width: '50%', height: '66%' }} />
      <span className="pcard-mock-bar"  style={{ left: '48%', top: '28%', width: '30%' }} />
      <span className="pcard-mock-bar"  style={{ left: '48%', top: '40%', width: '20%' }} />
      <span className="pcard-mock-dot"  style={{ left: '48%', top: '56%' }} />
    </div>
  )
}

/* Карточка — скриншот в рамке ноутбука и название. Описание, теги, год
   и ссылка живут на странице проекта. */
export default function ProjectCard({ row, to, accent }) {
  return (
    <Link
      to={to}
      className="pcard reveal"
      style={{ '--c': accent.c, '--grad': accent.grad }}
      aria-label={row.title}
    >
      <div className="pcard-stage">
        <span className="pcard-halo" aria-hidden="true" />

        <div className="pcard-laptop">
          <div className="pcard-lid">
            <div className="pcard-screen">
              {row.image_url
                ? <img src={row.image_url} alt="" loading="lazy" />
                : <MockUI />}
            </div>
          </div>
          <div className="pcard-base" aria-hidden="true" />
        </div>
      </div>

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
