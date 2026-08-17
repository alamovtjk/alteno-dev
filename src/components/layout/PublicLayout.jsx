import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Cursor from '../ui/Cursor'
import MusicPlayer from '../ui/MusicPlayer'
import ArielFloat from '../ui/ArielFloat'
import SpaceBg from '../ui/SpaceBg'
import { trackPageView, joinPresence } from '../../lib/analytics'

/* Шаг повторения звёздных плиток — тот же, что в CSS.
   Смещение сворачиваем по модулю шага: узор бесшовный, поэтому сдвиг
   никогда не выходит за одну плитку, и слои не нужно делать огромными. */
const SKY_LAYERS = [
  { varName: '--sky-far',  tile: 240, speed: 0.05 },
  { varName: '--sky-mid',  tile: 320, speed: 0.12 },
  { varName: '--sky-near', tile: 520, speed: 0.24 },
]

const wrap = (v, m) => ((v % m) + m) % m

/* Параллакс звёзд на нативном скролле — без сглаживающей библиотеки,
   чтобы прокрутка отвечала на ввод сразу, без задержки. */
function useSkyParallax() {
  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wide    = window.matchMedia('(min-width: 768px)').matches
    if (reduced || !wide) return

    let ticking = false
    const apply = () => {
      ticking = false
      const scroll = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? scroll / max : 0

      for (const { varName, tile, speed } of SKY_LAYERS) {
        root.style.setProperty(varName, `${-wrap(scroll * speed, tile).toFixed(2)}px`)
      }
      root.style.setProperty('--sky-depth', String(Math.min(scroll / 2400, 1).toFixed(3)))
      /* Галактики — объекты, а не бесшовный узор: их нельзя сворачивать по
         модулю, иначе будут выпрыгивать. Ведём их по прогрессу страницы,
         поэтому за весь скролл они смещаются на ограниченное расстояние. */
      root.style.setProperty('--sky-prog', String(progress.toFixed(4)))
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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

/* index.html один на все маршруты (SPA), поэтому canonical в нём статичный
   (на главную). Поисковики читают DOM после рендера — подправляем тег под
   реальный путь, чтобы /projects и /team не считались дублями главной. */
function useCanonical() {
  const { pathname } = useLocation()
  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]')
    if (link) link.href = window.location.origin + pathname
  }, [pathname])
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

/* Одна запись на переход между страницами + отметка "на сайте" на время вкладки */
function useAnalytics() {
  const { pathname } = useLocation()
  useEffect(() => { trackPageView(pathname) }, [pathname])
  useEffect(() => joinPresence(), [])
}

export default function PublicLayout() {
  useRevealObserver()
  useSkyParallax()
  useScrollTopOnNavigate()
  useCanonical()
  useAnalytics()

  return (
    <div style={{ minHeight: '100vh' }}>
      <Cursor />
      {/* Анимированный фон — фиксированный за всем */}
      {/* Космос за всей страницей: туманности + три слоя звёзд,
          которые уезжают с разной скоростью при прокрутке */}
      <div className="bg-stage" aria-hidden="true">
        <SpaceBg />
        <div className="blob v" />
        <div className="blob t" />
        <div className="blob b" />
        <div className="sky sky-far" />
        <div className="sky sky-mid" />
        <div className="sky sky-near" />
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
