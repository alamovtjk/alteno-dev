import { useState } from 'react'
import '../admin.css'
import AdminLogin  from '../components/admin/AdminLogin'
import AdminLayout from '../components/admin/AdminLayout'
import { isAuthed } from '../lib/adminAuth'

export default function Admin() {
  const [authed, setAuthed] = useState(isAuthed())

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />
  return <AdminLayout onLogout={() => setAuthed(false)} />
}
