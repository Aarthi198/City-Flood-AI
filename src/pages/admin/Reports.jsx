import { useEffect, useState } from 'react'
import { ClipboardList, Image as ImageIcon } from 'lucide-react'
import api from '../../api/axios'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { Button } from '../../components/Button'

const STATUS = ['PENDING', 'IN_REVIEW', 'VERIFIED', 'RESOLVED']

export default function Reports() {
  const [reports, setReports] = useState([])
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let alive = true
    async function load() {
      const res = await api.get('/admin/reports')
      if (!alive) return
      setReports(res.data)
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  async function updateStatus(id, status) {
    setBusyId(id)
    try {
      const res = await api.put(`/admin/reports/${id}`, { status })
      setReports((prev) => prev.map((r) => (r.id === id ? res.data : r)))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div>
        <div className="text-2xl font-bold text-slate-900">Citizen Reports</div>
        <div className="text-sm text-slate-600">Submitted incidents from users</div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4">
        {reports.length ? (
          reports.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-700" />
                  <div className="font-semibold text-slate-900">{r.location}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    r.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : r.status === 'IN_REVIEW'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {r.status}
                </span>
              </CardHeader>
              <CardBody className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="text-sm text-slate-700">{r.description}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                      Depth: {r.water_depth != null ? `${r.water_depth} cm` : '—'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                      Report #{r.id}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {STATUS.map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant={r.status === s ? 'primary' : 'outline'}
                        className="px-3 py-1.5"
                        onClick={() => updateStatus(r.id, s)}
                        disabled={busyId === r.id}
                      >
                        {busyId === r.id && r.status !== s ? 'Updating…' : s.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  {r.image ? (
                    <a
                      className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      href={(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + r.image}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + r.image}
                        alt="Report"
                        className="h-28 w-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="grid h-28 place-items-center rounded-xl border border-dashed border-slate-200 bg-white text-slate-500">
                      <div className="flex items-center gap-2 text-sm">
                        <ImageIcon className="h-4 w-4" />
                        No image
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <Card>
            <CardBody className="text-sm text-slate-600">No reports yet.</CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}

