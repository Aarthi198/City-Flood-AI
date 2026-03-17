import { useEffect, useMemo, useRef, useState } from 'react'
import { LocateFixed, Map, Navigation, Search, ShieldCheck } from 'lucide-react'
import api from '../../api/axios'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { Button } from '../../components/Button'

const RISK_COLOR = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' }
const WATER_COLOR = { DANGER: '#ef4444', MODERATE: '#f59e0b', LOW: '#3b82f6' }

function Dot({ color }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
}

function haversineKm(a, b) {
  if (!a || !b) return null
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s1 = Math.sin(dLat / 2) ** 2
  const s2 = Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.asin(Math.sqrt(s1 + s2))
  return R * c
}

function normalizePoints(points) {
  if (!points?.length) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 }
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const p of points) {
    if (typeof p.lat !== 'number' || typeof p.lng !== 'number') continue
    minLat = Math.min(minLat, p.lat)
    maxLat = Math.max(maxLat, p.lat)
    minLng = Math.min(minLng, p.lng)
    maxLng = Math.max(maxLng, p.lng)
  }
  if (!Number.isFinite(minLat) || !Number.isFinite(minLng)) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 }
  const padLat = (maxLat - minLat || 0.01) * 0.12
  const padLng = (maxLng - minLng || 0.01) * 0.12
  return { minLat: minLat - padLat, maxLat: maxLat + padLat, minLng: minLng - padLng, maxLng: maxLng + padLng }
}

function toCanvasXY(p, bounds, w, h) {
  const { minLat, maxLat, minLng, maxLng } = bounds
  const x = ((p.lng - minLng) / (maxLng - minLng || 1)) * w
  const y = (1 - (p.lat - minLat) / (maxLat - minLat || 1)) * h
  return { x, y }
}

function Glow({ x, y, color, intensity = 0.5 }) {
  const r = 110 + intensity * 170
  const id = `g-${color.replace('#', '')}-${Math.round(intensity * 100)}`
  return (
    <>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="55%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </>
  )
}

function Pin({ x, y, color, glyph, onClick }) {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <circle cx={x} cy={y} r={18} fill="rgba(255,255,255,0.92)" stroke={color} strokeWidth={2} />
      <circle cx={x} cy={y} r={6} fill={color} />
      {glyph ? (
        <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="900" fill={color}>
          {glyph}
        </text>
      ) : null}
    </g>
  )
}

export default function FloodMap() {
  const [tab, setTab] = useState('risk')
  const [riskData, setRiskData] = useState(null)
  const [waterData, setWaterData] = useState(null)
  const [selected, setSelected] = useState(null)
  const [location, setLocation] = useState('City Center')
  const [userPos, setUserPos] = useState(null)
  const [geoError, setGeoError] = useState('')
  const centerReq = useRef(0)

  useEffect(() => {
    let alive = true
    async function load() {
      const res = await api.get('/user/risk-map', { params: { location } })
      if (!alive) return
      setRiskData(res.data)
      setSelected(null)
    }
    load()
    return () => {
      alive = false
    }
  }, [location])

  useEffect(() => {
    let alive = true
    async function loadWater() {
      if (tab !== 'water') return
      const res = await api.get('/user/flood-status')
      if (!alive) return
      setWaterData(res.data)
    }
    loadWater()
    return () => {
      alive = false
    }
  }, [tab])

  const mapCenter = useMemo(() => {
    const c = riskData?.center
    if (c?.lat && c?.lng) return { lat: c.lat, lng: c.lng }
    return { lat: 13.0827, lng: 80.2707 }
  }, [riskData?.center])

  const riskPoints = useMemo(() => (riskData?.points || []).slice(0, 50), [riskData])
  const safeZones = useMemo(() => (riskData?.safe_zones || []).slice(0, 50), [riskData])
  const waterPoints = useMemo(() => (waterData?.points || []).slice(0, 50), [waterData])

  const nearbySafeZones = useMemo(() => {
    if (!selected) return []
    const base = userPos || { lat: selected.lat, lng: selected.lng }
    const list = safeZones
      .map((z) => ({
        ...z,
        distance_km: haversineKm(base, { lat: z.lat, lng: z.lng }),
      }))
      .sort((a, b) => (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9))
      .slice(0, 5)
    return list
  }, [safeZones, selected, userPos])

  function detectUserAndCenter() {
    setGeoError('')
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported in this browser.')
      return
    }
    const reqId = ++centerReq.current
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (reqId !== centerReq.current) return
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        if (reqId !== centerReq.current) return
        setGeoError('Unable to fetch location. Please allow GPS permission.')
      },
      { enableHighAccuracy: true, timeout: 9000 }
    )
  }

  function waterBucket(cm) {
    const v = Number(cm || 0)
    if (v >= 60) return { label: 'DANGER', color: WATER_COLOR.DANGER }
    if (v >= 25) return { label: 'MODERATE', color: WATER_COLOR.MODERATE }
    return { label: 'LOW', color: WATER_COLOR.LOW }
  }

  function directionsTo(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`
    window.open(url, '_blank', 'noreferrer')
  }

  const zoneStatus = useMemo(() => {
    if (!selected) return null
    if (selected.kind === 'safe') return { label: 'SAFE', badge: 'bg-emerald-100 text-emerald-800' }
    if (selected.kind === 'risk') {
      if (selected.risk_level === 'HIGH') return { label: 'DANGER', badge: 'bg-red-100 text-red-800' }
      if (selected.risk_level === 'MEDIUM') return { label: 'MONITORING', badge: 'bg-amber-100 text-amber-800' }
      return { label: 'SAFE', badge: 'bg-emerald-100 text-emerald-800' }
    }
    const bucket = waterBucket(selected.water_level)
    const badge =
      bucket.label === 'DANGER'
        ? 'bg-red-100 text-red-800'
        : bucket.label === 'MODERATE'
          ? 'bg-amber-100 text-amber-800'
          : 'bg-blue-100 text-blue-800'
    return { label: bucket.label, badge }
  }, [selected])

  const allForBounds = useMemo(() => {
    const pts = []
    for (const p of riskPoints) pts.push(p)
    for (const p of waterPoints) pts.push(p)
    for (const z of safeZones) pts.push(z)
    if (userPos) pts.push(userPos)
    if (!pts.length) pts.push(mapCenter)
    return pts
  }, [riskPoints, waterPoints, safeZones, userPos, mapCenter])

  const bounds = useMemo(() => normalizePoints(allForBounds), [allForBounds])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">Flood Risk Map</div>
          <div className="text-sm text-slate-600">Real-time flood monitoring across the city</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            >
              <option>City Center</option>
              <option>Downtown</option>
              <option>River Park</option>
              <option>Main St</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant={tab === 'risk' ? 'primary' : 'outline'}
                onClick={() => setTab('risk')}
                type="button"
              >
                Risk level
              </Button>
              <Button
                variant={tab === 'water' ? 'primary' : 'outline'}
                onClick={() => setTab('water')}
                type="button"
              >
                Water level
              </Button>
              <Button
                variant={tab === 'safe' ? 'primary' : 'outline'}
                onClick={() => setTab('safe')}
                type="button"
              >
                Safe zones
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Map className="h-4 w-4" /> Click a marker to view details
            </div>
          </CardHeader>
          <CardBody>
            {geoError ? (
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {geoError}
              </div>
            ) : null}

            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <svg viewBox="0 0 1000 620" className="h-full w-full">
                <defs>
                  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="55%" stopColor="#eef2f7" />
                    <stop offset="100%" stopColor="#f1f5f9" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="1000" height="620" fill="url(#bg)" />
                <g opacity="0.28">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 62} x2="1000" y2={i * 62} stroke="#cbd5e1" strokeWidth="1" />
                  ))}
                  {Array.from({ length: 17 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * 62} y1="0" x2={i * 62} y2="620" stroke="#cbd5e1" strokeWidth="1" />
                  ))}
                </g>

                {tab === 'risk'
                  ? riskPoints.map((p) => {
                      const color = RISK_COLOR[p.risk_level] || '#64748b'
                      const intensity = Math.max(0.25, Math.min(1, Number(p.risk_score || 0) / 100))
                      const { x, y } = toCanvasXY(p, bounds, 1000, 620)
                      return (
                        <g key={`risk-${p.id}`}>
                          <Glow x={x} y={y} color={color} intensity={intensity} />
                          <Pin x={x} y={y} color={color} glyph="!" onClick={() => setSelected({ ...p, kind: 'risk' })} />
                        </g>
                      )
                    })
                  : null}

                {tab === 'water'
                  ? waterPoints.map((p) => {
                      const bucket = waterBucket(p.water_depth)
                      const intensity = Math.max(0.25, Math.min(1, Number(p.water_depth || 0) / 120))
                      const { x, y } = toCanvasXY(p, bounds, 1000, 620)
                      return (
                        <g key={`water-${p.id}`}>
                          <Glow x={x} y={y} color={bucket.color} intensity={intensity} />
                          <Pin x={x} y={y} color={bucket.color} glyph="≈" onClick={() => setSelected({ ...p, kind: 'water', water_level: p.water_depth })} />
                        </g>
                      )
                    })
                  : null}

                {tab === 'safe'
                  ? safeZones.map((z) => {
                      const { x, y } = toCanvasXY(z, bounds, 1000, 620)
                      return (
                        <g key={`safe-${z.id}`}>
                          <Glow x={x} y={y} color={RISK_COLOR.LOW} intensity={0.45} />
                          <Pin x={x} y={y} color={RISK_COLOR.LOW} glyph="✓" onClick={() => setSelected({ ...z, kind: 'safe' })} />
                        </g>
                      )
                    })
                  : null}

                {userPos ? (() => {
                  const { x, y } = toCanvasXY(userPos, bounds, 1000, 620)
                  return (
                    <g key="user">
                      <Glow x={x} y={y} color="#3b82f6" intensity={0.35} />
                      <circle cx={x} cy={y} r={10} fill="#3b82f6" opacity="0.95" />
                      <circle cx={x} cy={y} r={16} fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.7" />
                    </g>
                  )
                })() : null}
              </svg>

              <button
                type="button"
                onClick={detectUserAndCenter}
                className="absolute right-3 top-3 z-[600] inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur hover:bg-white"
              >
                <LocateFixed className="h-4 w-4 text-blue-700" />
                Center map
              </button>

              <div className="pointer-events-none absolute bottom-3 left-3 rounded-2xl border border-slate-200 bg-white/90 p-3 text-xs backdrop-blur">
                <div className="font-semibold text-slate-900">Legend</div>
                <div className="mt-2 space-y-1 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Dot color={RISK_COLOR.HIGH} /> High risk
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot color={RISK_COLOR.MEDIUM} /> Medium risk
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot color={RISK_COLOR.LOW} /> Low risk / Safe
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot color="#3b82f6" /> Your location
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="font-semibold text-slate-900">Zone details</div>
          </CardHeader>
          <CardBody>
            {selected ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900">
                      {selected.kind === 'safe' ? selected.name : selected.location}
                    </div>
                    {selected.kind === 'risk' ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Dot color={RISK_COLOR[selected.risk_level] || '#64748b'} />
                        <span className="font-medium text-slate-700">{selected.risk_level}</span>
                      </div>
                    ) : selected.kind === 'water' ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Dot color={waterBucket(selected.water_level).color} />
                        <span className="font-medium text-slate-700">Water</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="font-medium">Safe</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${zoneStatus?.badge || 'bg-slate-100 text-slate-800'}`}>
                      {zoneStatus?.label || '—'}
                    </span>
                    <div className="text-xs text-slate-500">
                      {selected.timestamp ? `Updated ${new Date(selected.timestamp).toLocaleString()}` : '—'}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-white p-2">
                      <div className="text-xs text-slate-500">Water level</div>
                      <div className="font-semibold text-slate-900">
                        {selected.water_level != null ? `${(Number(selected.water_level || 0) / 100).toFixed(2)} m` : '—'}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white p-2">
                      <div className="text-xs text-slate-500">Rainfall</div>
                      <div className="font-semibold text-slate-900">
                        {selected.rainfall != null ? `${Math.round(selected.rainfall)} mm` : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      className="w-full"
                      type="button"
                      onClick={() => directionsTo(selected.lat, selected.lng)}
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500">Nearby safe zones</div>
                  <div className="mt-2 space-y-2">
                    {nearbySafeZones.map((z) => (
                      <div
                        key={z.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-slate-800">{z.name}</div>
                          <div className="truncate text-xs text-slate-500">{z.address}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-slate-500">
                            {z.distance_km != null ? `${z.distance_km.toFixed(1)} km` : '—'}
                          </div>
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            onClick={() => directionsTo(z.lat, z.lng)}
                            aria-label={`Directions to ${z.name}`}
                          >
                            <Navigation className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
                Click on a zone marker to view details
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

