import { useRef } from 'react'
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

const MAX_RY = 15   // поворот вокруг вертикали, °
const MAX_RX = 9    // наклон вперёд-назад, °

/* Карточка — скриншот в 3D-корпусе ноутбука. Описание, теги, год и ссылка
   живут на странице проекта. */
export default function ProjectCard({ row, to, accent }) {
  const sceneRef = useRef(null)

  /* Курсор внутри карточки крутит корпус; значения кладём в CSS-переменные,
     чтобы React не перерисовывался на каждое движение мыши. */
  const onMove = (e) => {
    const el = sceneRef.current
    if (!el || !window.matchMedia('(hover: hover)').matches) return
    const r  = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width  - 0.5
    const py = (e.clientY - r.top)  / r.height - 0.5
    el.style.setProperty('--ry', `${(px * MAX_RY).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-py * MAX_RX).toFixed(2)}deg`)
    el.style.setProperty('--sx', (px * 2).toFixed(3))
  }

  const onLeave = () => {
    const el = sceneRef.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--sx', '0')
  }

  return (
    <Link
      to={to}
      className="pcard reveal"
      style={{ '--c': accent.c, '--grad': accent.grad }}
      aria-label={row.title}
    >
      <div
        className="pcard-stage"
        ref={sceneRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <span className="pcard-halo" aria-hidden="true" />

        <div className="pcard-laptop">
          <div className="pcard-lid">
            <div className="pcard-bezel">
              <span className="pcard-cam" aria-hidden="true" />
              <div className="pcard-screen">
                {row.image_url
                  ? <img src={row.image_url} alt="" loading="lazy" />
                  : <MockUI />}
                <span className="pcard-shine" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="pcard-hinge" aria-hidden="true" />
          <div className="pcard-base" aria-hidden="true" />
          <span className="pcard-drop" aria-hidden="true" />
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
