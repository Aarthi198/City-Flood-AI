import { AlertTriangle, Info, Siren } from 'lucide-react'

const LEVEL = {
  LOW: {
    badge: 'bg-emerald-100 text-emerald-800',
    ring: 'border-emerald-200',
    icon: Info,
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  MEDIUM: {
    badge: 'bg-amber-100 text-amber-800',
    ring: 'border-amber-200',
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 text-amber-700',
  },
  HIGH: {
    badge: 'bg-red-100 text-red-800',
    ring: 'border-red-200',
    icon: Siren,
    iconBg: 'bg-red-100 text-red-700',
  },
}

export function AlertCard({ alert, onShowOnMap }) {
  const cfg = LEVEL[alert.risk_level] || LEVEL.MEDIUM
  const Icon = cfg.icon

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${cfg.ring}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${cfg.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold text-slate-900">{alert.message}</div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
              {alert.risk_level}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <div className="truncate">{alert.area}</div>
            <div className="text-xs">
              {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : ''}
            </div>
          </div>
          {onShowOnMap ? (
            <div className="mt-3">
              <button
                className="text-sm font-medium text-blue-700 hover:text-blue-800"
                onClick={() => onShowOnMap(alert)}
                type="button"
              >
                Show on map
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

