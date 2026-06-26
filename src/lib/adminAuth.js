const KEY = 'alteno_admin_v1'

export const isAuthed = () => sessionStorage.getItem(KEY) === 'ok'

export const login = (pwd) => {
  if (pwd === import.meta.env.VITE_ADMIN_PASSWORD) {
    sessionStorage.setItem(KEY, 'ok')
    return true
  }
  return false
}

export const logout = () => sessionStorage.removeItem(KEY)
