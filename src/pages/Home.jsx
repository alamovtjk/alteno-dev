import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Services from '../components/sections/Services'
import Portfolio from '../components/sections/Portfolio'
import Process from '../components/sections/Process'
import Studio from '../components/sections/Studio'
import Team from '../components/sections/Team'
import Testimonials from '../components/sections/Testimonials'
import Contact from '../components/sections/Contact'

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

/* Переход «страница проекта → пункт меню» ведёт на главную с якорем в state.
   Секции с данными из Supabase появляются не сразу, поэтому ждём элемент. */
function useScrollToSection() {
  const { state } = useLocation()
  useEffect(() => {
    const target = state?.scrollTo
    if (!target) return

    let tries = 0
    const tick = () => {
      const el = document.querySelector(target)
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
      if (++tries < 20) setTimeout(tick, 100)
    }
    tick()
  }, [state])
}

export default function Home() {
  useScrollToSection()

  return (
    <>
      <Hero />
      <Ticker />
      <About />
      <Services />
      <Portfolio />
      <Process />
      <Studio />
      <Team />
      <Testimonials />
      <Contact />
    </>
  )
}
