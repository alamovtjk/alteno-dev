import { useEffect } from 'react'
import Lenis from 'lenis'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Services from './components/sections/Services'
import Portfolio from './components/sections/Portfolio'
import Process from './components/sections/Process'
import Studio from './components/sections/Studio'
import Testimonials from './components/sections/Testimonials'
import Contact from './components/sections/Contact'
import Cursor from './components/ui/Cursor'

// Бегущая строка технологий
function Ticker() {
  const items = ['React', 'Next.js', 'TypeScript', 'Figma', 'UI/UX', 'Branding', 'Node.js', 'Tailwind', 'Framer Motion', 'SEO']
  const all = [...items, ...items]
  return (
    <div className="ticker" style={{ position: 'relative', zIndex: 2 }}>
      <div className="ticker-track">
        {all.map((s, i) => <span key={i}>{s}</span>)}
      </div>
    </div>
  )
}

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
      document.querySelectorAll('.reveal:not(#hero .reveal)').forEach(el => {
        observer.observe(el)
      })
    }

    // Небольшая задержка для полного рендера
    const id = setTimeout(observe, 100)
    return () => {
      clearTimeout(id)
      observer.disconnect()
    }
  }, [])
}

function AppInner() {
  useRevealObserver()
  useLenis()

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
        <Hero />
        <Ticker />
        <About />
        <Services />
        <Portfolio />
        <Process />
        <Studio />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
