import { dmy } from '../../shared/lib/format'


export type Status = 'wait' | 'ok' | 'live' | 'done' | 'no' | 'cancel'
export interface Booking {
  id: number; title: string; roomId: number; by: string; groupId: number | null
  date: string; from: string; to: string; status: Status; sent: string
  reason?: { text: string; by: 'admin' | 'user'; at: string }
  fb?: { stars: number; text: string; at: string }
}

export const STAR_LABELS = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt']
export const STATUS: Record<Status, [label: string, cls: string]> = {
  wait: ['Chờ duyệt', 's-wait'], ok: ['Đã chấp nhận', 's-ok'], live: ['Đang diễn ra', 's-live'],
  done: ['Đã kết thúc', 's-done'], no: ['Không chấp nhận', 's-no'], cancel: ['Đã hủy', 's-cancel'],
}
export const STATUSES = Object.keys(STATUS) as Status[]

export const when = (b: Pick<Booking, 'date' | 'from' | 'to'>) => `${dmy(b.date)} ${b.from}–${b.to}`
export const code = (b: Booking) => `#BK-2611-${String(b.id).padStart(3, '0')}`
