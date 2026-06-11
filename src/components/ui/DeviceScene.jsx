import { useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'

function DesktopScreen({ d }) {
  return (
    <div className="dsc-wrap">
      <nav className="dsc-nav">
        <span className="dsc-logo">AlTeNo</span>
        <div className="dsc-links">
          {d.nav.map((item, i) => <span key={i}>{item}</span>)}
        </div>
        <span className="dsc-cta-btn">{d.cta}</span>
      </nav>
      <div className="dsc-hero">
        <div className="dsc-tag">{d.tag}</div>
        <div className="dsc-h1">{d.h1a}</div>
        <div className="dsc-h1 dsc-accent">{d.h1b}</div>
        <div className="dsc-h1 dsc-accent">{d.h1c}</div>
        <div className="dsc-sub">{d.sub}</div>
        <div className="dsc-btns">
          <span className="dsc-btn-p">{d.btnP}</span>
          <span className="dsc-btn-g">{d.btnG}</span>
        </div>
      </div>
      <div className="dsc-cards">
        <div className="dsc-card">
          <div className="dsc-ci dsc-ci-v" />
          <div className="dsc-ct">{d.c1}</div>
          <div className="dsc-cs">{d.c1s}</div>
        </div>
        <div className="dsc-card">
          <div className="dsc-ci dsc-ci-t" />
          <div className="dsc-ct">{d.c2}</div>
          <div className="dsc-cs">{d.c2s}</div>
        </div>
        <div className="dsc-card">
          <div className="dsc-ci dsc-ci-b" />
          <div className="dsc-ct">{d.c3}</div>
          <div className="dsc-cs">{d.c3s}</div>
        </div>
      </div>
    </div>
  )
}

function TabletScreen({ d }) {
  return (
    <div className="psc-wrap">
      <div className="psc-header">
        <div>
          <div className="psc-greeting">{d.greeting}</div>
          <div className="psc-logo">{d.dashboard}</div>
        </div>
        <div className="psc-avatar" />
      </div>
      <div className="psc-stats">
        <div className="psc-stat"><div className="psc-num">47</div><div className="psc-lbl">{d.st1}</div></div>
        <div className="psc-stat"><div className="psc-num">98%</div><div className="psc-lbl">{d.st2}</div></div>
        <div className="psc-stat"><div className="psc-num">5★</div><div className="psc-lbl">{d.st3}</div></div>
      </div>
      <div className="psc-section">{d.activeProj}</div>
      <div className="psc-item">
        <div className="psc-dot psc-dv" /><span>{d.p1}</span>
        <span className="psc-badge psc-b-v">{d.p1s}</span>
      </div>
      <div className="psc-item">
        <div className="psc-dot psc-dt" /><span>{d.p2}</span>
        <span className="psc-badge psc-b-t">{d.p2s}</span>
      </div>
      <div className="psc-item">
        <div className="psc-dot psc-db" /><span>{d.p3}</span>
        <span className="psc-badge psc-b-g">{d.p3s}</span>
      </div>
      <div className="psc-item">
        <div className="psc-dot psc-dg" /><span>{d.p4}</span>
        <span className="psc-badge psc-b-y">{d.p4s}</span>
      </div>
    </div>
  )
}

function MobileScreen({ d }) {
  return (
    <div className="phsc-wrap">
      <div className="phsc-island" />
      <div className="phsc-header">
        <span className="phsc-time">9:41</span>
        <div className="phsc-hi">{d.hi}</div>
        <div className="phsc-sub">{d.ready}</div>
      </div>
      <div className="phsc-card">
        <div className="phsc-card-tag">{d.activeBadge}</div>
        <div className="phsc-card-title">e-Commerce</div>
        <div className="phsc-card-sub">{d.deadline}</div>
        <div className="phsc-progress"><div className="phsc-bar" /></div>
        <div className="phsc-pct">{d.progress}</div>
      </div>
      <div className="phsc-row">
        <div className="phsc-mini"><div className="phsc-mini-ico" /><div>{d.t1}</div></div>
        <div className="phsc-mini"><div className="phsc-mini-ico phsc-ico-t" /><div>{d.t2}</div></div>
        <div className="phsc-mini"><div className="phsc-mini-ico phsc-ico-b" /><div>{d.t3}</div></div>
      </div>
      <div className="phsc-homebar" />
    </div>
  )
}

export default function DeviceScene({ parallax = true }) {
  const { t } = useLanguage()
  const d = t.devices
  const wrapRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const scene = sceneRef.current
    if (!wrap || !scene || !parallax || window.innerWidth < 960) return

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect()
      const cx = ((e.clientX - r.left) / r.width - 0.5) * 4
      const cy = ((e.clientY - r.top) / r.height - 0.5) * 2.5
      scene.style.transform = `rotateY(${cx}deg) rotateX(${-cy}deg)`
    }
    const onLeave = () => { scene.style.transform = '' }

    wrap.addEventListener('mousemove', onMove, { passive: true })
    wrap.addEventListener('mouseleave', onLeave)
    return () => {
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [parallax])

  return (
    <div className="dv-wrap" ref={wrapRef}>
      <div className="dv-scene" ref={sceneRef}>

        <div className="dv dv-ipad">
          <div className="dv-frame">
            <div className="dv-cam" />
            <div className="dv-scr"><TabletScreen d={d} /></div>
            <div className="dv-homebar" />
          </div>
        </div>

        <div className="dv dv-mon">
          <div className="dv-mon-disp">
            <div className="dv-topbar">
              <span className="dv-dot r" /><span className="dv-dot y" /><span className="dv-dot g" />
              <span className="dv-url">alteno.dev</span>
            </div>
            <div className="dv-scr dv-scr-mon"><DesktopScreen d={d} /></div>
          </div>
          <div className="dv-mon-neck" />
          <div className="dv-mon-foot" />
        </div>

        <div className="dv dv-phone">
          <div className="dv-frame dv-phone-frame">
            <div className="dv-scr dv-scr-phone"><MobileScreen d={d} /></div>
          </div>
        </div>

      </div>
    </div>
  )
}
