import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import Header from './Header'
import Footer from './Footer'
import Cursor from '../ui/Cursor'
import MusicPlayer from '../ui/MusicPlayer'
import ArielFloat from '../ui/ArielFloat'

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    let rafId
    const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(rafId); lenis.destroy() }
  }, [])
}

// Глобальный менеджер анимаций появления
function useRevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '-60px 0px', threshold: 0.05 }
    )

    // Наблюдаем за всеми .reveal элементами (кроме Hero — он сам управляет)
    const observe = () => {
      document.querySelectorAll('.reveal:not(.in):not(#hero .reveal)').forEach(el => {
        observer.observe(el)
      })
    }

    // Небольшая задержка для полного рендера
    const id = setTimeout(observe, 100)

    // Секции с данными из Supabase (кейсы, отзывы, команда) монтируются позже —
    // добираем их карточки, иначе анимация появления к ним не применится
    const mo = new MutationObserver(observe)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(id)
      mo.disconnect()
      observer.disconnect()
    }
  }, [])
}

/* Переход на другую страницу должен начинаться сверху, а не с середины.
   Исключение — возврат на главную к конкретной секции (Header кладёт её в state). */
function useScrollTopOnNavigate() {
  const { pathname, state } = useLocation()
  useEffect(() => {
    if (state?.scrollTo) return
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, state])
}

export default function PublicLayout() {
  useRevealObserver()
  useLenis()
  useScrollTopOnNavigate()

  return (
    <div style={{ minHeight: '100vh' }}>
      <Cursor />
      {/* Анимированный фон — фиксированный за всем */}
      <div className="bg-stage" aria-hidden="true">
        <div className="blob v" />
        <div className="blob t" />
        <div className="blob b" />
      </div>

      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
      <ArielFloat />
      <MusicPlayer />
    </div>
  )
}
