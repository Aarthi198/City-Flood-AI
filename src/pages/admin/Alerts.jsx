import { useEffect, useState } from 'react'
import { Send, Siren } from 'lucide-react'
import { io } from 'socket.io-client'
import api from '../../api/axios'
import { AlertCard } from '../../components/AlertCard'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([])
  const [message, setMessage] = useState('')
  const [area, setArea] = useState('Downtown')
  const [riskLevel, setRiskLevel] = useState('MEDIUM')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      const res = await api.get('/user/alerts')
      if (!alive) return
      setAlerts(res.data)
    }
    load()

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    const socket = io(socketUrl, { transports: ['websocket'] })
    socket.on('alert:new', (a) => setAlerts((prev) => [a, ...prev]))
    return () => {
      alive = false
      socket.disconnect()
    }
  }, [])

  async function send(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await api.post('/admin/alert', { message, area, risk_level: riskLevel })
      setAlerts((prev) => [res.data, ...prev])
      setMessage('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send alert')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-600 text-white">
          <Siren className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">Alert Center</div>
          <div className="text-sm text-slate-600">Broadcast warnings to citizens (realtime)</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="font-semibold text-slate-900">Send alert</div>
          </CardHeader>
          <CardBody>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <form className="space-y-3" onSubmit={send}>
              <div>
                <label className="text-sm font-medium text-slate-700">Area</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Risk level</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Message</label>
                <textarea
                  className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="E.g. Road closure due to flooding, avoid routes..."
                  required
                />
              </div>
              <Button className="w-full" disabled={busy} type="submit">
                <Send className="h-4 w-4" />
                {busy ? 'Sending…' : 'Send alert'}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-3 lg:col-span-2">
          {alerts.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </div>
      </div>
    </div>
  )
}

