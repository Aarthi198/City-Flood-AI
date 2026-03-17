import { useEffect, useState } from 'react'
import { Droplet, Save } from 'lucide-react'
import api from '../../api/axios'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { Button } from '../../components/Button'

const STATUS = ['OK', 'WARNING', 'BLOCKED']

export default function Drainage() {
  const [items, setItems] = useState([])
  const [busyId, setBusyId] = useState(null)

  async function load() {
    const res = await api.get('/admin/drainage')
    setItems(res.data)
  }

  useEffect(() => {
    load()
  }, [])

  async function save(item) {
    setBusyId(item.id)
    try {
      const res = await api.put(`/admin/drainage/${item.id}`, {
        status: item.status,
        flow_rate: item.flow_rate,
      })
      setItems((prev) => prev.map((p) => (p.id === item.id ? res.data : p)))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div>
        <div className="text-2xl font-bold text-slate-900">Drainage Monitoring</div>
        <div className="text-sm text-slate-600">Track flow rates and blockage status</div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4">
        {items.map((d) => (
          <Card key={d.id}>
            <CardHeader className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-700" />
                <div className="font-semibold text-slate-900">{d.location}</div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  d.status === 'BLOCKED'
                    ? 'bg-red-100 text-red-800'
                    : d.status === 'WARNING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {d.status}
              </span>
            </CardHeader>
            <CardBody className="grid grid-cols-1 items-end gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs font-semibold text-slate-500">Flow rate</div>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={d.flow_rate ?? ''}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p) => (p.id === d.id ? { ...p, flow_rate: e.target.value } : p))
                    )
                  }
                  placeholder="e.g. 12.5"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Status</div>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={d.status}
                  onChange={(e) =>
                    setItems((prev) => prev.map((p) => (p.id === d.id ? { ...p, status: e.target.value } : p)))
                  }
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => save(d)} disabled={busyId === d.id} type="button">
                  <Save className="h-4 w-4" />
                  {busyId === d.id ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

