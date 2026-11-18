import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../../../shared/ui'

export function StatCard({ to, icon, tone, label, n, children }: { to?: string; icon: IconName; tone: string; label: string; n: number; children: ReactNode }) {
  const body = <>
    <div className="flex items-center gap-2 text-[13px] font-medium text-gray-600"><span className={`w-8 h-8 flex items-center justify-center rounded-lg ${tone}`}><Icon n={icon} /></span>{label}</div>
    <div className="sn">{n}</div>
    <div className="small muted">{children}</div>
  </>
  return to ? <Link className="card stat" to={to}>{body}</Link> : <div className="card stat">{body}</div>
}
