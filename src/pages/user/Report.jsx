import { useRef, useState } from 'react'
import { Camera, MapPin, Send } from 'lucide-react'
import api from '../../api/axios'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'

export default function Report() {
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [location, setLocation] = useState('')
  const [waterDepth, setWaterDepth] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    setBusy(true)
    try {
      const form = new FormData()
      if (file) form.append('image', file)
      form.append('location', location)
      if (waterDepth) form.append('water_depth', waterDepth)
      form.append('description', description)
      await api.post('/user/report', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMsg('Report submitted. Thank you!')
      setFile(null)
      setLocation('')
      setWaterDepth('')
      setDescription('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Failed to submit report')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div>
        <div className="text-2xl font-bold text-slate-900">Report Flooding</div>
        <div className="text-sm text-slate-600">Help us monitor flood conditions by reporting incidents</div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="font-semibold text-slate-900">New report</div>
          </CardHeader>
          <CardBody>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <div className="text-sm font-medium text-slate-700">Upload photo</div>
                <div
                  className="mt-2 grid cursor-pointer place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center hover:bg-slate-100"
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' ? fileRef.current?.click() : null)}
                >
                  <Camera className="h-6 w-6 text-slate-400" />
                  <div className="mt-2 text-sm font-medium text-slate-700">
                    {file ? file.name : 'Click to upload or drag & drop'}
                  </div>
                  <div className="text-xs text-slate-500">JPG, PNG (optional)</div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Location</label>
                <div className="relative mt-1">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 outline-none focus:border-blue-500"
                    placeholder="Enter area / landmark"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Estimated Water Depth (cm)</label>
                <input
                  value={waterDepth}
                  onChange={(e) => setWaterDepth(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="e.g. 30"
                  inputMode="decimal"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Provide details: water depth, blocked drains, flow, affected area…"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button disabled={busy} type="submit" className="min-w-[180px]">
                  <Send className="h-4 w-4" />
                  {busy ? 'Submitting…' : 'Submit report'}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setLocation('')
                    setWaterDepth('')
                    setDescription('')
                    setMsg('')
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                >
                  Clear
                </Button>
                {msg ? <span className="text-sm text-slate-700">{msg}</span> : null}
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="font-semibold text-slate-900">Why report?</div>
            </CardHeader>
            <CardBody className="space-y-2 text-sm text-slate-600">
              <div>- Help the community</div>
              <div>- Faster response</div>
              <div>- Real-time updates</div>
            </CardBody>
          </Card>
          <Card className="border-red-200 bg-red-50/40">
            <CardHeader>
              <div className="font-semibold text-red-700">Emergency?</div>
            </CardHeader>
            <CardBody>
              <div className="text-sm text-red-700">If you’re in immediate danger, call emergency services.</div>
              <div className="mt-3">
                <Button variant="danger" className="w-full" type="button">
                  Call 911
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

