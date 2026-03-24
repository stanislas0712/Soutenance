import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/accounts/me/')
        .then(({ data }) => setUser(data))
        .catch(() => { localStorage.clear(); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/accounts/login/', { email, password })
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const me = await api.get('/accounts/me/')
    setUser(me.data)
    return me.data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  /* Helpers rôles */
  const isAdmin       = user?.role === 'ADMINISTRATEUR'
  const isGestionnaire= user?.role === 'GESTIONNAIRE'
  const isComptable   = user?.role === 'COMPTABLE'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isGestionnaire, isComptable }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
