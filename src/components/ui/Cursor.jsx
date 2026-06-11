import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    if (window.innerWidth < 960) return

    const dot = dotRef.current
    const glow = glowRef.current
    let mx = -100, my = -100
    let gx = -100, gy = -100
    let raf

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
    }

    const loop = () => {
      gx += (mx - gx) * 0.08
      gy += (my - gy) * 0.08
      dot.style.transform = `translate(${mx}px, ${my}px)`
      glow.style.transform = `translate(${gx}px, ${gy}px)`
      raf = requestAnimationFrame(loop)
    }

    const onOver = (e) => {
      if (e.target.closest('a,button,.btn,.case,.svc,.val,.tag-tech,.fcard')) {
        dot.dataset.hover = '1'
        glow.dataset.hover = '1'
      }
    }
    const onOut = (e) => {
      if (e.target.closest('a,button,.btn,.case,.svc,.val,.tag-tech,.fcard')) {
        delete dot.dataset.hover
        delete glow.dataset.hover
      }
    }

    document.body.classList.add('has-cursor')
    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    raf = requestAnimationFrame(loop)

    return () => {
      document.body.classList.remove('has-cursor')
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="cur-dot" ref={dotRef} aria-hidden="true" />
      <div className="cur-glow" ref={glowRef} aria-hidden="true" />
    </>
  )
}
