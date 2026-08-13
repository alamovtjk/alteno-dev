import { useEffect, useState } from 'react'
import '../admin.css'
import AdminLogin  from '../components/admin/AdminLogin'
import AdminLayout from '../components/admin/AdminLayout'
import { getSession, onAuthChange, logout } from '../lib/adminAuth'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [ready,   setReady]   = useState(false)

  /* Сессия живёт в Supabase, а не в sessionStorage: восстанавливаем её при
     загрузке и слушаем изменения, чтобы выход в другой вкладке тоже сработал. */
  useEffect(() => {
    let alive = true
    getSession().then(s => {
      if (!alive) return
      setSession(s)
      setReady(true)
    })
    return onAuthChange(s => setSession(s))
  }, [])

  if (!ready) return <div className="adm-loader">Загрузка...</div>
  if (!session) return <AdminLogin />
  return <AdminLayout onLogout={logout} />
}
