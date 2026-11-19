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

// Thanh xám nhấp nháy giữ chỗ khi đang tải (tắt hiệu ứng nếu người dùng bật giảm chuyển động).
export const Skeleton = ({ className = '' }: { className?: string }) =>
  <span aria-hidden="true" className={`block h-3.5 rounded bg-gray-200 motion-safe:animate-pulse ${className}`} />

// Các dòng giả cho bảng đang tải; mỗi phần tử của `cols` là class độ rộng của thanh trong một ô.
export const SkeletonRows = ({ cols, rows = 8 }: { cols: string[]; rows?: number }) => <>
  {Array.from({ length: rows }, (_, i) => <tr key={i}>{cols.map((w, j) => <td key={j}><Skeleton className={w} /></td>)}</tr>)}
</>

// Khung giữ chỗ cho trang dạng thẻ số liệu + nội dung (Tổng quan, Báo cáo) khi đang tải.
export const StatsSkeleton = ({ cards = 4 }: { cards?: number }) => <>
  <div className="stats" aria-busy="true">
    {Array.from({ length: cards }, (_, i) => <div key={i} className="card stat"><Skeleton className="w-32" /><Skeleton className="w-14 h-8! my-2" /><Skeleton className="w-24" /></div>)}
  </div>
  <section className="card p-5 flex flex-col gap-3.5">{[0, 1, 2, 3, 4].map(i => <Skeleton key={i} className={i % 2 ? 'w-5/6' : 'w-full'} />)}</section>
  <p className="sr-only" role="status">Đang tải dữ liệu…</p>
</>
