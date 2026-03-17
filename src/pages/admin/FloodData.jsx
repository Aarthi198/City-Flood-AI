import { useEffect, useMemo, useState } from 'react'
import { Activity, CloudRain, Gauge, HeartPulse, Waves } from 'lucide-react'
import api from '../../api/axios'
import { Card, CardBody, CardHeader } from '../../components/Card'

function Spark({ values = [] }) {
  const max = Math.max(1, ...values)
  return (
    <div className="flex h-10 items-end gap-1">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-2 rounded-t bg-blue-500/70"
          style={{ height: `${Math.max(3, Math.round((v / max) * 40))}px` }}
        />
      ))}
    </div>
  )
}

export default function FloodData() {
  const [items, setItems] = useState([])

  useEffect(() => {
    let alive = true
    async function load() {
      const res = await api.get('/admin/flood-data', { params: { limit: 80 } })
      if (!alive) return
      setItems(res.data)
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const latest = items[0]
  const rainfallSeries = useMemo(() => items.slice(0, 12).map((x) => x.rainfall).reverse(), [items])
  const scoreSeries = useMemo(() => items.slice(0, 12).map((x) => x.risk_score).reverse(), [items])

  const level = latest?.risk_level || 'LOW'
  const badge =
    level === 'HIGH'
      ? 'bg-red-100 text-red-800'
      : level === 'MEDIUM'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-emerald-100 text-emerald-800'

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center gap-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white">
          <Waves className="h-6 w-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">Flood Data</div>
          <div className="text-sm text-slate-600">Latest ML predictions and sensor/weather snapshots</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                <CloudRain className="h-5 w-5" />
              </div>
              <div className="text-xs text-slate-500">last record</div>
            </div>
            <div className="mt-3 text-xs font-semibold text-slate-500">Rainfall</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{Math.round(latest?.rainfall ?? 0)} mm</div>
            <div className="mt-3">
              <Spark values={rainfallSeries} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-800">
                <Gauge className="h-5 w-5" />
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge}`}>{level}</span>
            </div>
            <div className="mt-3 text-xs font-semibold text-slate-500">Risk score</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{Math.round(latest?.risk_score ?? 0)}%</div>
            <div className="mt-3">
              <Spark values={scoreSeries} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div className="text-xs text-slate-500">services</div>
            </div>
            <div className="mt-3 text-xs font-semibold text-slate-500">System health</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">OK</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">DB</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">API</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">Socket</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                <Activity className="h-5 w-5" />
              </div>
              <div className="text-xs text-slate-500">records</div>
            </div>
            <div className="mt-3 text-xs font-semibold text-slate-500">Stored entries</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{items.length}</div>
            <div className="mt-3 text-xs text-slate-500">Use “Refresh risk” on dashboard to append new predictions.</div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader className="flex items-center justify-between">
          <div className="font-semibold text-slate-900">Recent flood records</div>
          <div className="text-xs text-slate-500">Showing latest {items.length}</div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs font-semibold text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Rainfall (mm)</th>
                  <th className="py-2 pr-4">Risk score</th>
                  <th className="py-2 pr-4">Risk level</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {items.map((x) => (
                  <tr key={x.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-xs text-slate-500">
                      {x.timestamp ? new Date(x.timestamp).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 pr-4 font-medium text-slate-900">{x.location}</td>
                    <td className="py-2 pr-4">{Math.round(x.rainfall)}</td>
                    <td className="py-2 pr-4">{Math.round(x.risk_score)}%</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          x.risk_level === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : x.risk_level === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {x.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

