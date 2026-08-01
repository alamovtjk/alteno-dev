/* Акценты по кругу — карточки в ряду не повторяют цвет соседа */
export const ACCENTS = [
  { c: 'var(--violet)',  grad: 'linear-gradient(135deg,#7c3aed,#4f46e5)' },
  { c: 'var(--teal)',    grad: 'linear-gradient(135deg,#0d9488,#14b8a6)' },
  { c: 'var(--blue)',    grad: 'linear-gradient(135deg,#2563eb,#38bdf8)' },
  { c: 'var(--fuchsia)', grad: 'linear-gradient(135deg,#9333ea,#c026d3)' },
]

export const accentFor = (i) => ACCENTS[i % ACCENTS.length]
