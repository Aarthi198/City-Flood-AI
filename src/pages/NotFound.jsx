import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export default function NotFound() {
  return (
    <div className="grid min-h-full place-items-center px-4 py-10">
      <div className="text-center">
        <div className="text-3xl font-extrabold text-slate-900">404</div>
        <div className="mt-1 text-sm text-slate-600">Page not found</div>
        <div className="mt-4">
          <Link to="/user">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

