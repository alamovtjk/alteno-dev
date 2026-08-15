import { Component } from 'react'

/* React пока не даёт перехватывать ошибки рендера хуком — только классом.
   Без этого один упавший компонент кладёт весь сайт белым экраном. */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '24px', gap: '16px', background: 'var(--bg, #06060f)', color: 'var(--text, #fff)',
      }}>
        <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700 }}>
          Что-то пошло не так
        </h1>
        <p style={{ color: 'var(--text-dim, rgba(255,255,255,.6))', maxWidth: 420 }}>
          Страница столкнулась с ошибкой. Обновите страницу — обычно это помогает.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Обновить страницу
        </button>
      </div>
    )
  }
}
