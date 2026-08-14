/* Космический фон: клубящийся дым и спиральные галактики — всё векторное.
   Фильтр считается на маленьком холсте (600×400) и растягивается на экран:
   для размытого дыма разницы не видно, а стоит это в разы дешевле, чем
   turbulence во весь виден. Сам шум не анимируем — это дорого; вместо
   этого медленно ведём готовые слои. */

const GALAXIES = [
  { id: 'g1', x: 12, y: 18, s: 1.15, rot: -18, hue: '#cdbcff', dur: 240 },
  { id: 'g2', x: 78, y: 12, s: 0.8,  rot: 24,  hue: '#bfe9ff', dur: 300 },
  { id: 'g3', x: 88, y: 62, s: 1.0,  rot: -8,  hue: '#a8f0dd', dur: 270 },
  { id: 'g4', x: 22, y: 76, s: 0.7,  rot: 34,  hue: '#e2d1ff', dur: 330 },
  { id: 'g5', x: 55, y: 40, s: 0.5,  rot: -30, hue: '#cfe4ff', dur: 360 },
]

function Galaxy({ g }) {
  return (
    <svg
      className="gx"
      style={{
        left: `${g.x}%`, top: `${g.y}%`,
        '--gx-scale': g.s,
        '--gx-rot': `${g.rot}deg`,
        '--gx-dur': `${g.dur}s`,
      }}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${g.id}-core`}>
          <stop offset="0%"   stopColor="#fff"    stopOpacity=".95" />
          <stop offset="35%"  stopColor={g.hue}   stopOpacity=".7" />
          <stop offset="100%" stopColor={g.hue}   stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${g.id}-halo`}>
          <stop offset="0%"   stopColor={g.hue} stopOpacity=".38" />
          <stop offset="70%"  stopColor={g.hue} stopOpacity=".08" />
          <stop offset="100%" stopColor={g.hue} stopOpacity="0" />
        </radialGradient>
        <filter id={`${g.id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      {/* Внешняя группа только ставит галактику в центр холста, внутренняя
          крутится. Разделено потому, что CSS-трансформация анимации
          перекрывает атрибут transform целиком. */}
      <g transform="translate(60 60)">
        <g className="gx-disk">
          <circle r="52" fill={`url(#${g.id}-halo)`} />
          <g filter={`url(#${g.id}-soft)`} fill="none" stroke={g.hue} strokeLinecap="round">
            <path d="M0 0 C 18 -6, 36 -2, 46 14"  strokeWidth="3.2" opacity=".55" />
            <path d="M0 0 C -18 6, -36 2, -46 -14" strokeWidth="3.2" opacity=".55" />
            <path d="M0 0 C 14 10, 30 14, 40 6"   strokeWidth="2.2" opacity=".35" />
            <path d="M0 0 C -14 -10, -30 -14, -40 -6" strokeWidth="2.2" opacity=".35" />
          </g>
          <circle r="13" fill={`url(#${g.id}-core)`} />
        </g>
      </g>
    </svg>
  )
}

export default function SpaceBg() {
  return (
    <>
      {/* Дым: два слоя фрактального шума разной частоты и цвета */}
      <svg className="neb" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="neb-teal" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0055 0.011" numOctaves="5" seed="17" />
            {/* последняя строка лепит альфу из шума: получаются рваные клубы */}
            <feColorMatrix type="matrix" values="
              0 0 0 0 0.06
              0 0 0 0 0.72
              0 0 0 0 0.62
              0 0 0 -1.7 1.0" />
          </filter>
          <filter id="neb-violet" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0042 0.009" numOctaves="5" seed="41" />
            <feColorMatrix type="matrix" values="
              0 0 0 0 0.47
              0 0 0 0 0.20
              0 0 0 0 0.86
              0 0 0 -1.8 1.05" />
          </filter>
          {/* маски собирают дым в облака, иначе он затянет весь экран ровно */}
          <radialGradient id="neb-mask-teal" cx="72%" cy="34%" r="58%">
            <stop offset="0%"   stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="neb-mask-violet" cx="18%" cy="26%" r="56%">
            <stop offset="0%"   stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="mask-teal"><rect width="600" height="400" fill="url(#neb-mask-teal)" /></mask>
          <mask id="mask-violet"><rect width="600" height="400" fill="url(#neb-mask-violet)" /></mask>
        </defs>

        <g className="neb-teal">
          <rect width="600" height="400" filter="url(#neb-teal)" mask="url(#mask-teal)" />
        </g>
        <g className="neb-violet">
          <rect width="600" height="400" filter="url(#neb-violet)" mask="url(#mask-violet)" />
        </g>
      </svg>

      <div className="gx-field" aria-hidden="true">
        {GALAXIES.map(g => <Galaxy key={g.id} g={g} />)}
      </div>
    </>
  )
}
