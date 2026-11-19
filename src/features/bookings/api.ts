import { api } from '../../shared/api/http'
import { toBooking, type ApiBooking } from './mapping'

interface BookingList {
  items: ApiBooking[]
  status_counts: Record<'all' | 'pending' | 'approved' | 'ongoing' | 'completed' | 'rejected' | 'cancelled', number>
  pagination: { page: number; limit: number; total_items: number; total_pages: number }
}

// ponytail: lấy hết lịch đặt một lần rồi lọc / sắp xếp / phân trang / đếm theo tab ở client
// (Tổng quan, Đặt phòng, Báo cáo dùng chung một danh sách); truyền status/keyword/from_date/page lên server khi dữ liệu lớn.
export const fetchBookings = () => api<BookingList>('/admin/bookings?limit=10000').then(d => d.items.map(toBooking))

// PUT /admin/bookings/:id/approve | reject | cancel — reason không bắt buộc (approve bỏ qua).
const ACTION = { ok: 'approve', no: 'reject', cancel: 'cancel' } as const
export const decideBookingApi = (id: number, type: keyof typeof ACTION, reason = '') =>
  api<ApiBooking>(`/admin/bookings/${id}/${ACTION[type]}`, 'PUT', { reason: reason.trim() }).then(toBooking)
