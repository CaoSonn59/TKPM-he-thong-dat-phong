import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

export const Stars = ({ n, className = '' }: { n: number; className?: string }) => (
  <span role="img" aria-label={`${n} trên 5 sao`} className={`text-amber-600 tracking-[2px] ${className}`}>
    {'★'.repeat(n)}<span className="text-gray-300">{'★'.repeat(5 - n)}</span>
  </span>
)

export function Empty({ icon = 'search', tone = 'bg-gray-100 text-gray-500', title, text, children }: {
  icon?: IconName; tone?: string; title: string; text?: string; children?: ReactNode
}) {
  return (
    <div className="state">
      <span className={`w-12 h-12 flex items-center justify-center rounded-full ${tone}`}><Icon n={icon} /></span>
      <div className="font-semibold">{title}</div>
      {text && <p className="muted max-w-[360px]">{text}</p>}
      {children}
    </div>
  )
}
