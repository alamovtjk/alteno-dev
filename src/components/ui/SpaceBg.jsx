/* Космический фон: клубящийся дым и спиральные галактики — всё векторное.
   Фильтр считается на маленьком холсте (600×400) и растягивается на экран:
   для размытого дыма разницы не видно, а стоит это в разы дешевле, чем
   turbulence во весь виден. Сам шум не анимируем — это дорого; вместо
   этого медленно ведём готовые слои. */

/* Снимки NASA (общественное достояние), подготовлены scripts/fetch-galaxies.mjs.
   Выводятся с mix-blend-mode: screen — чёрный фон кадра исчезает сам,
   а радиальная маска убирает квадратные края. */
/* depth — насколько галактика уезжает при прокрутке. Крупные ближе,
   поэтому идут быстрее; мелкие едва движутся, как далёкие. */
const GALAXIES = [
  { src: '/space/galaxy-1.webp', x: 13, y: 17, size: 190, rot: -14, op: .55, dur: 260, depth: 1.0 },
  { src: '/space/galaxy-2.webp', x: 79, y: 11, size: 140, rot: 22,  op: .45, dur: 320, depth: 0.6 },
  { src: '/space/galaxy-3.webp', x: 87, y: 63, size: 165, rot: -6,  op: .5,  dur: 290, depth: 0.85 },
  { src: '/space/galaxy-4.webp', x: 21, y: 78, size: 120, rot: 30,  op: .38, dur: 350, depth: 0.45 },
]

/* Обёртка отвечает за место и смещение от прокрутки, картинка — за вращение.
   Порознь потому, что одна трансформация перезаписала бы другую. */
function Galaxy({ g }) {
  return (
    <span
      className="gx-holder"
      style={{
        left: `${g.x}%`,
        top: `${g.y}%`,
        width: `${g.size}px`,
        height: `${g.size}px`,
        margin: `${-g.size / 2}px 0 0 ${-g.size / 2}px`,
        ['--gx-depth']: g.depth,
      }}
    >
      <img
        className="gx"
        src={g.src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        draggable="false"
        style={{
          opacity: g.op,
          ['--gx-rot']: `${g.rot}deg`,
          ['--gx-dur']: `${g.dur}s`,
        }}
      />
    </span>
  )
}

/* Две тарелки. Летят по своим траекториям и большую часть цикла невидимы —
   так появление остаётся редким и не превращается в мельтешение. */
const SHIPS = [
  { id: 's1', cls: 'ship-a', hue: '#c4b5fd', glow: 'rgba(167,139,250,.85)' },
  { id: 's2', cls: 'ship-b', hue: '#99f6e4', glow: 'rgba(45,212,191,.8)' },
]

function Ship({ s }) {
  return (
    <span className={`ship ${s.cls}`} aria-hidden="true">
      <svg viewBox="0 0 64 34" width="100%" height="100%">
        <defs>
          <radialGradient id={`${s.id}-beam`} cx="50%" cy="0%" r="70%">
            <stop offset="0%"   stopColor={s.glow} stopOpacity=".55" />
            <stop offset="100%" stopColor={s.glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${s.id}-hull`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={s.hue}  stopOpacity=".9" />
            <stop offset="100%" stopColor="#0d0d18" stopOpacity=".95" />
          </linearGradient>
        </defs>

        {/* луч под днищем */}
        <path d="M22 22 L42 22 L52 34 L12 34 Z" fill={`url(#${s.id}-beam)`} />

        {/* купол */}
        <path d="M22 15 A10 9 0 0 1 42 15 Z" fill={s.hue} opacity=".55" />
        <path d="M22 15 A10 9 0 0 1 42 15" fill="none" stroke={s.hue} strokeWidth="1.1" opacity=".9" />

        {/* корпус */}
        <ellipse cx="32" cy="17" rx="30" ry="6.5" fill={`url(#${s.id}-hull)`} />
        <ellipse cx="32" cy="17" rx="30" ry="6.5" fill="none" stroke={s.hue} strokeWidth="1" opacity=".75" />

        {/* огни по ободу */}
        <circle cx="14" cy="18.5" r="1.5" fill={s.hue} className="ship-lamp" />
        <circle cx="32" cy="19.4" r="1.5" fill={s.hue} className="ship-lamp" style={{ animationDelay: '.5s' }} />
        <circle cx="50" cy="18.5" r="1.5" fill={s.hue} className="ship-lamp" style={{ animationDelay: '1s' }} />
      </svg>
    </span>
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
        {GALAXIES.map(g => <Galaxy key={g.src} g={g} />)}
      </div>

      {SHIPS.map(s => <Ship key={s.id} s={s} />)}
    </>
  )
}
