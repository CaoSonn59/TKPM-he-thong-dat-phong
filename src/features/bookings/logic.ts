// Quy tắc đặt phòng (thuần, không phụ thuộc React) — có test ở logic.test.ts
import type { Booking } from './model.ts'
import type { Room } from '../rooms/model.ts'

export const mins = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3)

export interface Slot { date: string; from: string; to: string }
export interface Query extends Slot { min?: number; amenities: string[] }

export const overlaps = (a: Slot, b: Slot) => a.date === b.date && a.from < b.to && b.from < a.to

// Booking Chờ duyệt / Đã chấp nhận / Đang diễn ra giữ chỗ khung giờ.
const HOLDS = ['wait', 'ok', 'live']
export const isFree = (roomId: number, bookings: Booking[], s: Slot) =>
  !bookings.some(b => b.roomId === roomId && HOLDS.includes(b.status) && overlaps(b, s))

export const freeRooms = (rooms: Room[], bookings: Booking[], q: Query) =>
  rooms.filter(r => !r.maint && (!q.min || r.max >= q.min) && q.amenities.every(a => r.amenities.includes(a)) && isFree(r.id, bookings, q))

export function slotErrors(s: Slot, today: string, now: string) {
  const e: { date?: string; to?: string } = {}
  if (s.date < today || (s.date === today && s.from < now)) e.date = 'Không thể đặt phòng cho thời gian đã qua'
  if (s.to <= s.from) e.to = 'Giờ kết thúc phải sau giờ bắt đầu'
  return e
}

export const addMonth = (iso: string) => {
  const d = new Date(iso + 'T00:00Z')
  d.setUTCMonth(d.getUTCMonth() + 1)
  return d.toISOString().slice(0, 10)
}

// Chỉ người đặt được hủy / đánh giá; đánh giá trong vòng 1 tháng sau ngày sử dụng.
export const canCancel = (b: Booking, me: string) => b.by === me && (b.status === 'wait' || b.status === 'ok')
export const canRate = (b: Booking, me: string, today: string) =>
  b.by === me && (b.status === 'live' || b.status === 'done') && today <= addMonth(b.date)

// Bộ lọc của màn Tìm phòng: khung giờ + sức chứa/tiện ích + nhóm sử dụng.
export type SearchQuery = Query & { group: string }
