import logoImg from '../../assets/logo.png'

// ── Логотип в шапке ──────────────────────────────────────
export function LogoMark() {
  return (
    <img
      src={logoImg}
      alt="AlTeNo Dev"
      style={{ height: 56, width: 'auto', display: 'block' }}
    />
  )
}

// ── Логотип в футере ──────────────────────────────────────
export function LogoMarkFooter() {
  return (
    <img
      src={logoImg}
      alt="AlTeNo Dev"
      style={{ height: 36, width: 'auto', display: 'block' }}
    />
  )
}
