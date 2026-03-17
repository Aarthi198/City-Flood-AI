import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Button } from '../components/Button'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('New User')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      await register(name, email, password)
      navigate('/user', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Register failed')
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
            <div className="text-lg font-bold text-slate-900">Create account</div>
            <div className="text-sm text-slate-600">Citizen access for reports & alerts</div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              minLength={6}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
              minLength={6}
            />
          </div>

          <Button className="w-full" disabled={busy} type="submit">
            {busy ? 'Creating…' : 'Create account'}
          </Button>

          <div className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link className="font-medium text-blue-700 hover:text-blue-800" to="/login">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

