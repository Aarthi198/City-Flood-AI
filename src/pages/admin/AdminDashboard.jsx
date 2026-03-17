import { useEffect, useState } from 'react'
import { Activity, Droplet, Gauge, TriangleAlert, RefreshCw } from 'lucide-react'
import api from '../../api/axios'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'

function Metric({ icon: Icon, label, value, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  }
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className={`rounded-xl border px-2 py-2 ${tones[tone] || tones.blue}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 text-xs font-medium text-slate-500">{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      </CardBody>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    const res = await api.get('/admin/dashboard')
    setStats(res.data)
  }

  useEffect(() => {
    load()
  }, [])

  async function refreshRisk() {
    setBusy(true)
    try {
      await api.post('/flood/predict', { location: 'Downtown' })
      await load()
    } finally {
      setBusy(false)
    }
  }

  const level = stats?.risk_level || 'LOW'
  const tone = level === 'HIGH' ? 'red' : level === 'MEDIUM' ? 'amber' : 'emerald'

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">Admin Dashboard</div>
          <div className="text-sm text-slate-600">Operations overview and live monitoring</div>
        </div>
        <Button onClick={refreshRisk} disabled={busy} type="button">
          <RefreshCw className="h-4 w-4" />
          {busy ? 'Refreshing…' : 'Refresh risk'}
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Droplet} label="Rainfall" value={`${Math.round(stats?.rainfall ?? 0)} mm`} tone="blue" />
        <Metric icon={Gauge} label="Risk score" value={`${Math.round(stats?.risk_score ?? 0)}%`} tone={tone} />
        <Metric icon={TriangleAlert} label="Active blockages" value={stats?.active_blockages ?? 0} tone="amber" />
        <Metric icon={Activity} label="Pending reports" value={stats?.pending_reports ?? 0} tone="red" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className={level === 'HIGH' ? 'border-red-200 bg-red-50/40' : 'lg:col-span-2'}>
          <CardHeader className="flex items-center justify-between">
            <div className="font-semibold text-slate-900">Current risk</div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                level === 'HIGH'
                  ? 'bg-red-100 text-red-800'
                  : level === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {level}
            </span>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-slate-700">
              Last updated:{' '}
              <span className="font-medium">
                {stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : '—'}
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${level === 'HIGH' ? 'bg-red-500' : level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.max(5, Math.min(100, Math.round(stats?.risk_score ?? 0)))}%` }}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="font-semibold text-slate-900">Admin tips</div>
          </CardHeader>
          <CardBody className="space-y-2 text-sm text-slate-600">
            <div>- Review citizen reports and assign status</div>
            <div>- Monitor drainage blockages (BLOCKED)</div>
            <div>- Send alerts for affected areas</div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

