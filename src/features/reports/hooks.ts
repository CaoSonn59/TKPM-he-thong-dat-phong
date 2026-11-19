// Tính số liệu báo cáo (SRP): trang ReportsPage chỉ lo hiển thị.
import { dmy } from '../../shared/lib/format'
import { useBookings } from '../bookings/hooks'
import type { Booking, Status } from '../bookings/model'
import { useGroupName } from '../groups/hooks'
import { useRoomOf } from '../rooms/hooks'
import type { Pt } from './components/LineChart'

export interface ReportFilter { from: string; to: string; rooms: string[]; groups: string[] }

export function useReport(f: ReportFilter, unit: 1 | 7) {
  const bookings = useBookings()
  const roomOf = useRoomOf()
  const groupName = useGroupName()
  const valid = !!f.from && !!f.to && f.from <= f.to
  const list = !valid ? [] : bookings
    .filter(b => b.date >= f.from && b.date <= f.to && (!f.rooms.length || f.rooms.includes(String(b.roomId))) && (!f.groups.length || f.groups.includes(String(b.groupId))))
    .sort((a, b) => (b.date + b.from).localeCompare(a.date + a.from))
  const count = (key: (b: Booking) => string): [string, number][] =>
    Object.entries(list.reduce<Record<string, number>>((m, b) => { const k = key(b); m[k] = (m[k] ?? 0) + 1; return m }, {})).sort((a, b) => b[1] - a[1])
  const byRoom = count(b => roomOf(b.roomId).name), byGroup = count(b => groupName(b.groupId))
  const n = (...s: Status[]) => list.filter(b => s.includes(b.status)).length
  const acc = n('ok', 'live', 'done'), rej = n('no', 'cancel'), wait = n('wait')

  const days: string[] = []
  if (valid) for (const d = new Date(f.from + 'T00:00Z'); days.length < 366 && d.toISOString().slice(0, 10) <= f.to; d.setUTCDate(d.getUTCDate() + 1)) days.push(d.toISOString().slice(0, 10))
  const byTime: Pt[] = Array.from({ length: Math.ceil(days.length / unit) }, (_, i) => {
    const ds = days.slice(i * unit, i * unit + unit)
    return { label: unit === 1 ? dmy(ds[0]).slice(0, 5) : `${ds[0].slice(8)}–${dmy(ds[ds.length - 1]).slice(0, 5)}`, v: list.filter(b => ds.includes(b.date)).length }
  })
  const maxRoom = Math.max(1, ...byRoom.map(r => r[1])), maxGroup = Math.max(1, ...byGroup.map(r => r[1]))
  return { valid, list, byRoom, byGroup, byTime, n, acc, rej, wait, maxRoom, maxGroup }
}
