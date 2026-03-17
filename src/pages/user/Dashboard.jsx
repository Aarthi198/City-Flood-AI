import { useEffect, useMemo, useState } from 'react'
import { MapPinned, Shield, Siren, Droplet, Thermometer, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'

function StatCard({ icon: Icon, label, value, helper, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl border px-2 py-2 ${tones[tone] || tones.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-xs text-slate-500">{helper}</div>
      </div>
      <div className="mt-3 text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
        <div className="h-1.5 w-2/3 rounded-full bg-slate-300" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [location, setLocation] = useState('Downtown')
  const [status, setStatus] = useState(null)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    let alive = true
    async function load() {
      const [s, a] = await Promise.all([
        api.get('/user/flood-status', { params: { location } }),
        api.get('/user/alerts'),
      ])
      if (!alive) return
      setStatus(s.data)
      setAlerts(a.data.slice(0, 3))
    }
    load()
    return () => {
      alive = false
    }
  }, [location])

  const risk = useMemo(() => {
    const level = status?.risk_level || 'MEDIUM'
    const cfg = {
      LOW: { badge: 'bg-emerald-100 text-emerald-800', tone: 'emerald' },
      MEDIUM: { badge: 'bg-amber-100 text-amber-800', tone: 'amber' },
      HIGH: { badge: 'bg-red-100 text-red-800', tone: 'red' },
    }[level] || { badge: 'bg-slate-100 text-slate-800', tone: 'blue' }
    return { level, ...cfg }
  }, [status])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">Welcome Back!</div>
          <div className="text-sm text-slate-600">{new Date().toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Area</span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option>Downtown</option>
            <option>City Center</option>
            <option>River Park</option>
            <option>Main St</option>
          </select>
        </div>
      </div>

      <Card className="mt-5 overflow-hidden border-amber-200 bg-amber-50/60">
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-800">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-semibold text-slate-900">Current Flood Risk Level</div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${risk.badge}`}>
                  {risk.level}
                </span>
              </div>
              <div className="text-sm text-slate-700">
                Stay alert and monitor conditions. Prepare for possible evacuation.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/user/map">
              <Button variant="primary">
                <MapPinned className="h-4 w-4" />
                View Flood Map
              </Button>
            </Link>
            <Link to="/user/safety">
              <Button variant="outline">
                <Shield className="h-4 w-4" />
                Safety Tips
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Droplet}
          label="Rainfall Level"
          value={`${Math.round(status?.rainfall ?? 0)} mm`}
          helper="Last hour"
          tone="blue"
        />
        <StatCard icon={Siren} label="Risk score" value={`${Math.round(status?.risk_score ?? 0)}%`} helper="ML estimate" tone={risk.tone} />
        <StatCard icon={MapPinned} label="Nearest Safe Zone" value="0.8 km" helper="Community Center" tone="emerald" />
        <StatCard icon={Thermometer} label="Temperature" value="28°C" helper="Humidity: 85%" tone="amber" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-amber-700" />
              <div className="font-semibold text-slate-900">Recent Alerts</div>
            </div>
            <Link className="text-sm font-medium text-blue-700 hover:text-blue-800" to="/user/alerts">
              View all
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {alerts.length ? (
              alerts.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-900">{a.message}</div>
                    <span className="text-xs text-slate-500">
                      {a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{a.area}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-600">No alerts yet.</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="font-semibold text-slate-900">Quick Actions</div>
          </CardHeader>
          <CardBody className="space-y-2">
            <Link to="/user/report" className="block">
              <Button className="w-full" variant="primary">
                Report Flood
              </Button>
            </Link>
            <Link to="/user/map" className="block">
              <Button className="w-full" variant="outline">
                View Map
              </Button>
            </Link>
            <Link to="/user/safety" className="block">
              <Button className="w-full" variant="outline">
                Safety Tips
              </Button>
            </Link>

            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="text-xs font-semibold text-red-700">Emergency Contact</div>
              <div className="mt-1 text-2xl font-extrabold text-red-700">911</div>
              <div className="text-xs text-red-700/80">Available 24/7</div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

