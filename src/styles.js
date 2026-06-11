export const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)',
}

export const glassHover = {
  ...glass,
  background: 'rgba(255,255,255,0.09)',
  border: '1px solid rgba(255,255,255,0.15)',
}

export const glassNav = {
  background: 'rgba(8,12,24,0.85)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}

export const ACCENT = {
  violet: '#7c3aed',
  teal: '#0d9488',
  blue: '#2563eb',
}

export const BLOB = {
  1: { width:600, height:600, background:'radial-gradient(circle,#6d28d9 0%,#4c1d95 50%,transparent 70%)', opacity:0.55, animationDuration:'28s' },
  2: { width:500, height:500, background:'radial-gradient(circle,#0d9488 0%,#134e4a 50%,transparent 70%)', opacity:0.5, animationDuration:'34s', animationDelay:'-10s' },
  3: { width:420, height:420, background:'radial-gradient(circle,#2563eb 0%,#1e3a8a 50%,transparent 70%)', opacity:0.45, animationDuration:'22s', animationDelay:'-18s' },
}
