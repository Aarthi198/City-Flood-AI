export function Card({ className = '', children }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }) {
  return <div className={`border-b border-slate-100 px-4 py-3 ${className}`}>{children}</div>
}

export function CardBody({ className = '', children }) {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>
}

