import { useEffect, useState } from 'react'
import { MapPin, Phone, Save, UserCircle2 } from 'lucide-react'
import api from '../../api/axios'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { useAuth } from '../../context/AuthContext'

function Field({ label, icon: Icon, value, onChange, required = false, placeholder }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative mt-1">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        ) : null}
        <input
          className={`w-full rounded-xl border border-slate-200 bg-white py-2 ${Icon ? 'pl-9' : 'pl-3'} pr-3 outline-none focus:border-blue-500`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export default function Profile() {
  const { updateUser } = useAuth()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    name: '',
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
      setForm({
        name: res.data?.name || '',
        phone: res.data?.phone || '',
        address: res.data?.address || '',
        location: res.data?.location || '',
        state: res.data?.state || '',
        city: res.data?.city || '',
        pincode: res.data?.pincode || '',
      })
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  async function save(e) {
    e.preventDefault()
    setMsg('')
    setBusy(true)
    try {
      const res = await api.put('/user/profile', form)
      updateUser(res.data)
      setMsg('Profile updated.')
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Failed to update profile')
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
          <div className="text-2xl font-bold text-slate-900">Profile</div>
          <div className="text-sm text-slate-600">Manage your personal details</div>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader className="flex items-center justify-between">
          <div className="font-semibold text-slate-900">Details</div>
        </CardHeader>
        <CardBody>
          {msg ? (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {msg}
            </div>
          ) : null}
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={save}>
            <Field
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
              required
              icon={UserCircle2}
            />
            <Field
              label="Phone Number"
              value={form.phone}
              onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
              required
              icon={Phone}
            />
            <div className="md:col-span-2">
              <Field
                label="Address"
                value={form.address}
                onChange={(v) => setForm((p) => ({ ...p, address: v }))}
                required
                placeholder="House / Street / Area"
              />
            </div>
            <div className="md:col-span-2">
              <Field
                label="Location"
                value={form.location}
                onChange={(v) => setForm((p) => ({ ...p, location: v }))}
                required
                icon={MapPin}
                placeholder="GPS auto-detect or manual entry"
              />
            </div>
            <Field label="State" value={form.state} onChange={(v) => setForm((p) => ({ ...p, state: v }))} required />
            <Field label="City" value={form.city} onChange={(v) => setForm((p) => ({ ...p, city: v }))} required />
            <Field
              label="Pincode"
              value={form.pincode}
              onChange={(v) => setForm((p) => ({ ...p, pincode: v }))}
              required
            />

            <div className="md:col-span-2 flex justify-end">
              <Button disabled={busy} type="submit">
                <Save className="h-4 w-4" />
                {busy ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

