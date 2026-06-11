import logoImg from '../../assets/logo.png'

// ── Логотип в шапке ──────────────────────────────────────
export function LogoMark() {
  return (
    <div className="logo-pill">
      <img className="logo-img" src={logoImg} alt="AlTeNo Dev" />
    </div>
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
