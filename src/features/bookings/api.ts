import { api } from '../../shared/api/http'
import { toBooking, toBookingBody, type ApiBooking } from './mapping'
import type { CreateBookingInput } from './model'

interface BookingList {
  items: ApiBooking[]
  status_counts?: Record<'all' | 'pending' | 'approved' | 'ongoing' | 'completed' | 'rejected' | 'cancelled', number>
  pagination?: { page: number; limit: number; total_items: number; total_pages: number }
}

const mapList = (d: ApiBooking[] | BookingList) => (Array.isArray(d) ? d : d?.items ?? []).map(toBooking)

// Admin: lấy hết lịch đặt một lần rồi lọc / sắp xếp / phân trang / đếm theo tab ở client
// (Tổng quan, Đặt phòng, Báo cáo dùng chung một danh sách).
export const fetchBookings = () => api<BookingList>('/admin/bookings?limit=10000').then(mapList)

// Admin: PUT /admin/bookings/:id/approve | reject | cancel — reason không bắt buộc (approve bỏ qua).
const ACTION = { ok: 'approve', no: 'reject', cancel: 'cancel' } as const
export const decideBookingApi = (id: number, type: keyof typeof ACTION, reason = '') =>
  api<ApiBooking>(`/admin/bookings/${id}/${ACTION[type]}`, 'PUT', { reason: reason.trim() }).then(toBooking)

// End-User: GET /bookings/my — lịch sử đặt phòng của người dùng và các nhóm người dùng tham gia.
export const fetchMyBookings = () => api<BookingList | ApiBooking[]>('/bookings/my?limit=10000').then(mapList)

// End-User: GET /bookings/:id — chi tiết lịch đặt (có thể trả kèm thành viên nhóm / phản hồi).
export const fetchBookingDetail = (id: number) => api<ApiBooking>(`/bookings/${id}`).then(toBooking)

// End-User: POST /bookings — tạo yêu cầu đặt phòng mới (trả 409 nếu phòng vừa bị đặt hoặc chuyển bảo trì).
export const createBookingApi = (nb: CreateBookingInput) =>
  api<ApiBooking>('/bookings', 'POST', toBookingBody(nb)).then(toBooking)

// End-User: PUT /bookings/:id/cancel — người đặt hủy lịch ở trạng thái Chờ duyệt / Đã chấp nhận.
export const cancelMyBookingApi = (id: number, reason = '') =>
  api<ApiBooking>(`/bookings/${id}/cancel`, 'PUT', { reason: reason.trim() }).then(toBooking)
