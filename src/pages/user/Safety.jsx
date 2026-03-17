import { Shield, Home, Siren, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { Button } from '../../components/Button'

function Tip({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  )
}

export default function Safety() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">Flood Safety Tips</div>
          <div className="text-sm text-slate-600">Stay safe before, during, and after flooding</div>
        </div>
        <Button variant="outline" type="button">
          <Shield className="h-4 w-4" />
          Download guide
        </Button>
      </div>

      <div className="mt-5 space-y-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-white">
              <Shield className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900">Before a flood</div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Tip icon={Shield} title="Prepare emergency kit" desc="Water, flashlight, batteries, first aid, documents." />
            <Tip icon={Home} title="Protect your home" desc="Clear gutters, elevate valuables, secure electronics." />
            <Tip icon={Shield} title="Stay informed" desc="Enable alerts and follow official updates." />
            <Tip icon={Shield} title="Know evacuation routes" desc="Plan safe exits and meeting points." />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500 text-white">
              <Siren className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900">During a flood</div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Tip icon={Shield} title="Move to higher ground" desc="Avoid low-lying areas; follow evacuation orders." />
            <Tip icon={Shield} title="Avoid electrical hazards" desc="Do not touch wet electrical equipment." />
            <Tip icon={Shield} title="Never drive through water" desc="Turn around; most flood deaths happen in vehicles." />
            <Tip icon={Shield} title="Call for help" desc="Contact emergency services if you’re in danger." />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold text-slate-900">After a flood</div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Tip icon={Shield} title="Inspect safely" desc="Watch for structural damage and gas leaks." />
            <Tip icon={Shield} title="Avoid floodwater" desc="It may contain sewage and hidden debris." />
            <Tip icon={Shield} title="Document damage" desc="Take photos for claims and reporting." />
            <Tip icon={Shield} title="Clean up carefully" desc="Wear gloves/boots; disinfect surfaces." />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="font-semibold text-slate-900">Do’s and Don’ts</div>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> DO
              </div>
              <ul className="space-y-1 text-sm text-emerald-900/80">
                <li>- Keep emergency supplies ready</li>
                <li>- Turn off utilities if instructed</li>
                <li>- Listen to official announcements</li>
              </ul>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-800">
                <XCircle className="h-4 w-4" /> DON’T
              </div>
              <ul className="space-y-1 text-sm text-red-900/80">
                <li>- Walk through flowing water</li>
                <li>- Touch wet electrical devices</li>
                <li>- Ignore evacuation orders</li>
              </ul>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Emergency contacts</div>
              <div className="mt-1 text-2xl font-extrabold">911</div>
              <div className="text-sm text-white/85">Use local emergency services if available.</div>
            </div>
            <Button variant="secondary" type="button">
              Share safety tips
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

