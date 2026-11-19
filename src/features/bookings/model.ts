import { dmy } from '../../shared/lib/format'
import type { GroupMember } from '../groups/model'

export type Status = 'wait' | 'ok' | 'live' | 'done' | 'no' | 'cancel'
export interface Booking {
  id: number; code?: string; title: string; roomId: number; by: string; groupId: number | null
  roomName?: string; byName?: string; groupName?: string
  date: string; from: string; to: string; status: Status; sent: string
  reason?: { text: string; by?: 'admin' | 'user'; at: string } // by: không rõ khi backend không lưu ai hủy
  fb?: { stars: number; text: string; tags?: string[]; at: string }
  members?: GroupMember[] // thành viên nhóm kèm theo khi gọi GET /bookings/:id
}

export interface CreateBookingInput {
  title: string; roomId: number; groupId: number | null; date: string; from: string; to: string
}

export const STAR_LABELS = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt']
export const STATUS: Record<Status, [label: string, cls: string]> = {
  wait: ['Chờ duyệt', 's-wait'], ok: ['Đã chấp nhận', 's-ok'], live: ['Đang diễn ra', 's-live'],
  done: ['Đã kết thúc', 's-done'], no: ['Không chấp nhận', 's-no'], cancel: ['Đã hủy', 's-cancel'],
}
export const STATUSES = Object.keys(STATUS) as Status[]

export const when = (b: Pick<Booking, 'date' | 'from' | 'to'>) => `${dmy(b.date)} ${b.from}–${b.to}`
export const code = (b: Booking) => b.code ?? `#BK-2611-${String(b.id).padStart(3, '0')}`
