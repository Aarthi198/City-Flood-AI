import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('user@cityflood.ai')
  const [password, setPassword] = useState('user123')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = await login(email, password)
      if (u.role === 'USER' && u.profile_completed === false) {
        navigate('/user/profile-setup', { replace: true })
      } else {
        navigate(u.role === 'ADMIN' ? '/admin' : '/user', { replace: true })
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-full place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">Welcome back</div>
            <div className="text-sm text-slate-600">Sign in to CityFloodAI</div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          <Button className="w-full" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              No account?{' '}
              <Link className="font-medium text-blue-700 hover:text-blue-800" to="/register">
                Create one
              </Link>
            </span>
            <button
              type="button"
              className="font-medium text-slate-700 hover:text-slate-900"
              onClick={() => {
                setEmail('admin@cityflood.ai')
                setPassword('admin123')
              }}
            >
              Use admin demo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

