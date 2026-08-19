import { useEffect, useState } from 'react'
import '../admin.css'
import AdminLogin  from '../components/admin/AdminLogin'
import AdminLayout from '../components/admin/AdminLayout'
import { getSession, onAuthChange, logout, isAdmin } from '../lib/adminAuth'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [admin,   setAdmin]   = useState(false)
  const [ready,   setReady]   = useState(false)

  /* Сессия живёт в Supabase, а не в sessionStorage: восстанавливаем её при
     загрузке и слушаем изменения, чтобы выход в другой вкладке тоже сработал. */
  useEffect(() => {
    let alive = true
    const check = async (s) => {
      const ok = s ? await isAdmin(s.user.id) : false
      if (!alive) return
      setSession(s)
      setAdmin(ok)
      setReady(true)
    }
    getSession().then(check)
    return onAuthChange((s) => { setReady(false); check(s) })
  }, [])

  if (!ready) return <div className="adm-loader">Загрузка...</div>
  if (!session) return <AdminLogin />

  /* Вход общий с учениками и командой — сессия сама по себе ничего не значит.
     Не админ видит объяснение, а не панель. */
  if (!admin) {
    return (
      <div className="adm-login-wrap">
        <div className="adm-login-card">
          <p className="adm-login-hint">Панель управления сайтом</p>
          <p className="adm-field-hint">
            У аккаунта {session.user.email} нет прав администратора.
            Личный кабинет ученика — <a href="/account">/account</a>,
            панель команды — <a href="/panel">/panel</a>.
          </p>
          <button className="adm-btn-ghost adm-btn-full" style={{ marginTop: 16 }} onClick={logout}>
            Выйти
          </button>
        </div>
      </div>
    )
  }

  return <AdminLayout onLogout={logout} />
}
