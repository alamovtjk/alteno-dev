import { useState } from 'react'
import { login } from '../../lib/adminAuth'

export default function AdminLogin({ onLogin }) {
  const [pwd,     setPwd]     = useState('')
  const [err,     setErr]     = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!pwd) return
    setLoading(true)
    setErr(false)
    setTimeout(() => {
      if (login(pwd)) { onLogin() }
      else { setErr(true); setLoading(false) }
    }, 500)
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
            <label htmlFor="adm-pwd">Пароль</label>
            <input
              id="adm-pwd"
              type="password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setErr(false) }}
              placeholder="Введите пароль администратора"
              autoFocus
              className={err ? 'adm-input-err' : ''}
            />
            {err && <span className="adm-err-msg">Неверный пароль</span>}
          </div>
          <button
            type="submit"
            className="adm-btn-primary adm-btn-full"
            disabled={loading || !pwd}
          >
            {loading ? 'Проверка...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
