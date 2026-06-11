import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'

export default function Process() {
  const { t } = useLanguage()

  const steps = [
    { cls: 'p1', tKey: 'pr1t', durKey: 'pr1dur', dKey: 'pr1d' },
    { cls: 'p2', tKey: 'pr2t', durKey: 'pr2dur', dKey: 'pr2d' },
    { cls: 'p3', tKey: 'pr3t', durKey: 'pr3dur', dKey: 'pr3d' },
    { cls: 'p4', tKey: 'pr4t', durKey: 'pr4dur', dKey: 'pr4d' },
  ]

  return (
    <section id="process" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="proc-grid">
          {/* Left sticky */}
          <div className="proc-left">
            <div className="eyebrow reveal"><span className="line" />{t.process.eyebrow}</div>
            <h2 className="ub reveal">
              {t.process.t1} <span className="grad">{t.process.t2}</span>
            </h2>
            <p className="reveal">{t.process.lead}</p>

            {/* Animated rings */}
            <div className="rings reveal">
              <motion.span className="ring r1"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
              <motion.span className="ring r2"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
              <motion.span className="ring r3"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} />
              <span className="ring r4" />
              <span className="ring-core">A</span>
            </div>
          </div>

          {/* Steps */}
          <div className="steps">
            {steps.map((s, i) => (
              <div key={i} className={`step ${s.cls} reveal`}
                style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
                <span className="pnum ub">{String(i + 1).padStart(2, '0')}</span>
                <div className="step-body">
                  <h4 className="ub">
                    {t.process[s.tKey]}
                    <span className="dur">{t.process[s.durKey]}</span>
                  </h4>
                  <p>{t.process[s.dKey]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
