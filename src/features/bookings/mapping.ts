// Map dữ liệu đặt phòng giữa backend (BookingItemResponse của bảng bookings) và model của frontend.
// Hàm thuần, không import runtime — có test ở mapping.test.ts.
import type { Booking, Status } from './model.ts'

export interface ApiBooking {
  booking_id: number; booking_code: string; title: string
  room_id: number; room_name: string; user_id: string; full_name: string
  group_id: number | null; group_name: string
  start_time: string; end_time: string // RFC3339 kèm múi giờ máy chủ, vd 2026-11-20T09:00:00+07:00
  status: string; reason?: string; created_at: string; updated_at: string
  feedback?: { rating: number; comment: string; created_at: string; updated_at: string } | null
}

// Backend trả trạng thái thực tế (đã tính Đang diễn ra / Đã kết thúc theo giờ hiện tại).
const STATUS_IN: Record<string, Status> = {
  'Chờ duyệt': 'wait', 'Đã chấp nhận': 'ok', 'Đang diễn ra': 'live',
  'Đã kết thúc': 'done', 'Không chấp nhận': 'no', 'Đã hủy': 'cancel',
}
export const STATUS_OUT = Object.fromEntries(Object.entries(STATUS_IN).map(([k, v]) => [v, k])) as Record<Status, string>

// Cắt chuỗi thay vì new Date(): giữ đúng giờ theo múi giờ máy chủ, không phụ thuộc múi giờ trình duyệt.
const day = (iso: string) => iso.slice(0, 10)
const hm = (iso: string) => iso.slice(11, 16)

export function toBooking(b: ApiBooking): Booking {
  const status = STATUS_IN[b.status] ?? 'wait'
  return {
    id: b.booking_id, code: b.booking_code, title: b.title,
    roomId: b.room_id, by: b.user_id, groupId: b.group_id,
    date: day(b.start_time), from: hm(b.start_time), to: hm(b.end_time),
    status, sent: b.created_at.slice(0, 16),
    // Backend chỉ lưu nội dung lý do: từ chối chắc chắn do Admin; hủy thì không biết ai hủy.
    reason: b.reason ? { text: b.reason, by: status === 'no' ? 'admin' : undefined, at: day(b.updated_at) } : undefined,
    fb: b.feedback ? { stars: b.feedback.rating, text: b.feedback.comment, at: day(b.feedback.updated_at || b.feedback.created_at) } : undefined,
  }
}
