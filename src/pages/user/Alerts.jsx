import { useEffect, useMemo, useState } from 'react'
import { Bell, Settings2 } from 'lucide-react'
import { io } from 'socket.io-client'
import api from '../../api/axios'
import { AlertCard } from '../../components/AlertCard'
import { Card, CardBody } from '../../components/Card'
import { Button } from '../../components/Button'

const FILTERS = ['ALL', 'HIGH', 'MEDIUM', 'LOW']

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('ALL')

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

  const stats = useMemo(() => {
    const total = alerts.length
    const high = alerts.filter((a) => a.risk_level === 'HIGH').length
    const med = alerts.filter((a) => a.risk_level === 'MEDIUM').length
    const low = alerts.filter((a) => a.risk_level === 'LOW').length
    return { total, high, med, low }
  }, [alerts])

  const shown = useMemo(() => {
    if (filter === 'ALL') return alerts
    return alerts.filter((a) => a.risk_level === filter)
  }, [alerts, filter])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">Emergency Alerts</div>
          <div className="text-sm text-slate-600">Real-time notifications and warnings</div>
        </div>
        <Button variant="outline" type="button">
          <Settings2 className="h-4 w-4" />
          Notification settings
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card>
          <CardBody>
            <div className="text-xs font-semibold text-slate-500">Total alerts</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</div>
          </CardBody>
        </Card>
        <Card className="border-red-200 bg-red-50/40">
          <CardBody>
            <div className="text-xs font-semibold text-red-700">Critical</div>
            <div className="mt-1 text-2xl font-bold text-red-700">{stats.high}</div>
          </CardBody>
        </Card>
        <Card className="border-amber-200 bg-amber-50/40">
          <CardBody>
            <div className="text-xs font-semibold text-amber-800">Warning</div>
            <div className="mt-1 text-2xl font-bold text-amber-800">{stats.med}</div>
          </CardBody>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardBody>
            <div className="text-xs font-semibold text-emerald-800">Info</div>
            <div className="mt-1 text-2xl font-bold text-emerald-800">{stats.low}</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {f === 'ALL' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {shown.length ? (
          shown.map((a) => <AlertCard key={a.id} alert={a} />)
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <Bell className="h-6 w-6 text-slate-400" />
            <div className="mt-2 text-sm font-medium text-slate-700">No alerts</div>
            <div className="text-sm text-slate-500">You’re all caught up.</div>
          </div>
        )}
      </div>
    </div>
  )
}

