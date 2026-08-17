import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../admin.css'
import logoImg from '../assets/logo.webp'
import { login } from '../lib/adminAuth'

/* Тот же экран, что AdminLogin, но для студентов: тот же Supabase Auth,
   просто другой пункт назначения после входа. */
export default function Login() {
  const navigate = useNavigate()
  const [email,   setEmail]   = useState('')
  const [pwd,     setPwd]     = useState('')
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !pwd) return
    setLoading(true)
    setErr('')
    const { ok, error } = await login(email, pwd)
    if (ok) {
      navigate('/account')
      return
    }
    setErr(error === 'Invalid login credentials' ? 'Неверная почта или пароль' : error)
    setLoading(false)
  }

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="adm-login-logo">
          <img className="adm-logo-img" src={logoImg} alt="AlTeNo Dev" />
        </div>
        <p className="adm-login-hint">Личный кабинет ученика</p>

        <form className="adm-login-form" onSubmit={submit}>
          <div className="adm-field">
            <label htmlFor="acc-email">Почта</label>
            <input
              id="acc-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr('') }}
              placeholder="you@example.com"
              autoFocus
              className={err ? 'adm-input-err' : ''}
            />
          </div>

          <div className="adm-field">
            <label htmlFor="acc-pwd">Пароль</label>
            <input
              id="acc-pwd"
              type="password"
              autoComplete="current-password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setErr('') }}
              placeholder="Пароль из Telegram"
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

        <p className="adm-field-hint" style={{ textAlign: 'center', marginTop: 16 }}>
          Ещё нет доступа? <Link to="/">На главную</Link>, там есть кнопка «Обучение».
        </p>
      </div>
    </div>
  )
}
