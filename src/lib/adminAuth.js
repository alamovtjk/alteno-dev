const KEY = 'alteno_admin_v1'

export const isAuthed = () => sessionStorage.getItem(KEY) === 'ok'

export const login = (pwd) => {
  const expected = (import.meta.env.VITE_ADMIN_PASSWORD || '').trim()
  if (expected && pwd.trim() === expected) {
    sessionStorage.setItem(KEY, 'ok')
    return true
  }
  return false
}

export const logout = () => sessionStorage.removeItem(KEY)
