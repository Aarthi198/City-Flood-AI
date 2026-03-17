/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading] = useState(false)

  function persist(nextToken, nextUser) {
    setToken(nextToken)
    setUser(nextUser)
    if (nextToken) localStorage.setItem('token', nextToken)
    else localStorage.removeItem('token')
    if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser))
    else localStorage.removeItem('user')
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    persist(data.token, data.user)
    return data.user
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    persist(data.token, data.user)
    return data.user
  }

  function logout() {
    persist(null, null)
  }

  function updateUser(patch) {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(patch || {}) }
      localStorage.setItem('user', JSON.stringify(next))
      return next
    })
  }

  const value = {
    user,
    token,
    loading,
    isAuthed: Boolean(token && user),
    login,
    register,
    updateUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

