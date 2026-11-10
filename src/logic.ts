// Quy tắc nghiệp vụ thuần (không phụ thuộc React) — có test ở logic.test.ts
import type { Booking, Room } from './data.ts'

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

export interface PwErr { cur?: string; next?: string; again?: string }
export function pwErrors(cur: string, next: string, again: string, realPw: string, ident: string): PwErr {
  const e: PwErr = {}
  if (cur !== realPw) e.cur = 'Mật khẩu hiện tại không chính xác'
  if (next.length < 6) e.next = 'Mật khẩu mới phải có ít nhất 6 ký tự'
  else if (next === cur || next === ident) e.next = 'Mật khẩu mới không được trùng mật khẩu hiện tại hoặc mã định danh'
  if (again !== next) e.again = 'Mật khẩu nhập lại không khớp'
  return e
}

// 0 = trống, 1 Yếu … 4 Mạnh
export const strength = (pw: string) =>
  !pw ? 0 : pw.length < 6 ? 1
    : 1 + +(pw.length >= 10) + +(/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw)) + +/[^A-Za-z0-9]/.test(pw)

export const addMonth = (iso: string) => {
  const d = new Date(iso + 'T00:00Z')
  d.setUTCMonth(d.getUTCMonth() + 1)
  return d.toISOString().slice(0, 10)
}

// Chỉ người đặt được hủy / đánh giá; đánh giá trong vòng 1 tháng sau ngày sử dụng.
export const canCancel = (b: Booking, me: string) => b.by === me && (b.status === 'wait' || b.status === 'ok')
export const canRate = (b: Booking, me: string, today: string) =>
  b.by === me && (b.status === 'live' || b.status === 'done') && today <= addMonth(b.date)
