import { useState } from 'react'
import { login } from '../../lib/adminAuth'

export default function AdminLogin() {
  const [email,   setEmail]   = useState('')
  const [pwd,     setPwd]     = useState('')
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  /* Успешный вход не трогает состояние здесь: Admin слушает Supabase
     и переключит экран сам, когда появится сессия. */
  const submit = async (e) => {
    e.preventDefault()
    if (!email || !pwd) return
    setLoading(true)
    setErr('')
    const { ok, error } = await login(email, pwd)
    if (!ok) {
      setErr(error === 'Invalid login credentials' ? 'Неверная почта или пароль' : error)
      setLoading(false)
    }
  }

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="adm-login-logo">
          <span className="adm-logo-brand">AlTeNo</span>
          <span className="adm-logo-tag">Admin</span>
        </div>
        <p className="adm-login-hint">Панель управления сайтом</p>

        <form className="adm-login-form" onSubmit={submit}>
          <div className="adm-field">
            <label htmlFor="adm-email">Почта</label>
            <input
              id="adm-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr('') }}
              placeholder="admin@example.com"
              autoFocus
              className={err ? 'adm-input-err' : ''}
            />
          </div>

          <div className="adm-field">
            <label htmlFor="adm-pwd">Пароль</label>
            <input
              id="adm-pwd"
              type="password"
              autoComplete="current-password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setErr('') }}
              placeholder="Пароль администратора"
              className={err ? 'adm-input-err' : ''}
            />
            {err && <span className="adm-err-msg">{err}</span>}
          </div>

          <button
            type="submit"
            className="adm-btn-primary adm-btn-full"
            disabled={loading || !email || !pwd}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
