import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

/* SPA без SSR всегда отдаёт 200 на любой путь — статус не подделать.
   Единственный сигнал поисковику "не индексируй" — meta robots, ставим
   его только пока страница открыта и убираем при уходе. */
function useNoindex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])
}

export default function NotFound() {
  const { t } = useLanguage()
  useNoindex()

  return (
    <section className="section page-section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{
          fontFamily: "'Unbounded', sans-serif", fontWeight: 800,
          fontSize: 'clamp(64px,12vw,140px)', lineHeight: 1,
          background: 'linear-gradient(90deg,var(--violet-l),var(--teal-l))',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>404</div>
        <h1 className="sec-title ub" style={{ marginBottom: '10px' }}>{t.notFound.title}</h1>
        <p className="sec-sub" style={{ margin: '0 auto 32px' }}>{t.notFound.sub}</p>
        <Link to="/" className="btn btn-primary">{t.notFound.cta}</Link>
      </div>
    </section>
  )
}
