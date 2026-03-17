import { useEffect, useMemo, useState } from 'react'
import { LocateFixed, MapPin, Phone, Save, UserCircle2 } from 'lucide-react'
import api from '../../api/axios'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative mt-1">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        ) : null}
        {children}
      </div>
    </div>
  )
}

export default function ProfileSetup() {
  const { user, token, updateUser } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    location: '',
    state: '',
    city: '',
    pincode: '',
  })

  useEffect(() => {
    let alive = true
    async function load() {
      const res = await api.get('/user/profile')
      if (!alive) return
      setForm((prev) => ({
        ...prev,
        name: res.data?.name || prev.name,
        phone: res.data?.phone || '',
        address: res.data?.address || '',
        location: res.data?.location || '',
        state: res.data?.state || '',
        city: res.data?.city || '',
        pincode: res.data?.pincode || '',
      }))
    }
    if (token) load()
    return () => {
      alive = false
    }
  }, [token])

  const isComplete = useMemo(() => {
    return (
      form.name &&
      form.phone &&
      form.address &&
      form.location &&
      form.state &&
      form.city &&
      form.pincode
    )
  }, [form])

  async function detect() {
    setMsg('')
    if (!navigator.geolocation) {
      setMsg('GPS not supported in this browser.')
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setForm((p) => ({ ...p, location: `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}` }))
        setBusy(false)
      },
      () => {
        setMsg('Unable to fetch GPS location. Please enter manually.')
        setBusy(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  async function save(e) {
    e.preventDefault()
    setMsg('')
    setBusy(true)
    try {
      const res = await api.put('/user/profile', form)
      updateUser(res.data)
      setMsg('Profile saved successfully.')
      navigate('/user', { replace: true })
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Failed to save profile')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">Profile Setup</div>
          <div className="text-sm text-slate-600">Complete your details to access the dashboard</div>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-semibold text-slate-900">Personal details</div>
          <Button variant="outline" onClick={detect} disabled={busy} type="button">
            <LocateFixed className="h-4 w-4" />
            Auto-detect location
          </Button>
        </CardHeader>
        <CardBody>
          {msg ? (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {msg}
            </div>
          ) : null}

          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={save}>
            <Field label="Full Name" icon={UserCircle2}>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 outline-none focus:border-blue-500"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </Field>

            <Field label="Phone Number" icon={Phone}>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 outline-none focus:border-blue-500"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                required
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Address">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  required
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Location" icon={MapPin}>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 outline-none focus:border-blue-500"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Auto-detect using GPS or enter manually"
                  required
                />
              </Field>
            </div>

            <Field label="State">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                required
              />
            </Field>

            <Field label="City">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                required
              />
            </Field>

            <Field label="Pincode">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                value={form.pincode}
                onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                required
              />
            </Field>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-slate-600">
                {isComplete ? 'All required fields completed.' : 'Please fill all fields to continue.'}
              </div>
              <Button disabled={busy || !isComplete} type="submit">
                <Save className="h-4 w-4" />
                {busy ? 'Saving…' : 'Save & Continue'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

