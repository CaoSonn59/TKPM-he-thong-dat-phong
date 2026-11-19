// UI chỉ gọi các hook ở đây, không đụng store / API trực tiếp (DIP).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../auth/store'
import { decideBookingApi, fetchBookings } from './api'
import type { Booking } from './model'
import { useBookingsStore } from './store'

const KEY = ['bookings']
const NONE: Booking[] = []
const useIsAdmin = () => useAuthStore(s => s.isAdmin) // đọc thẳng store để tránh import vòng với auth/hooks

// Admin: GET /admin/bookings.
export const useBookingsQuery = () => useQuery({ queryKey: KEY, queryFn: fetchBookings, enabled: useIsAdmin() })

// shortcut: phía End-User (tìm phòng, đặt, lịch sử, hủy, đánh giá) vẫn chạy trên dữ liệu mẫu;
// đổi khi nối /rooms/available, /bookings, /bookings/my, /bookings/:id/cancel, /bookings/:id/feedback.
export function useBookings() {
  const isAdmin = useIsAdmin()
  const { data } = useBookingsQuery()
  const mock = useBookingsStore(s => s.bookings)
  return isAdmin ? data ?? NONE : mock
}
export const useBookingActions = () => useBookingsStore(useShallow(s => ({ setStatus: s.setStatus, book: s.book, saveFb: s.saveFb })))

// Admin: Chấp nhận / Từ chối / Hủy khẩn cấp. Xong thì tải lại lịch đặt và phòng (số lịch sắp tới của phòng đổi theo).
export function useDecideBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ b, type, reason }: { b: Booking; type: 'ok' | 'no' | 'cancel'; reason?: string }) => decideBookingApi(b.id, type, reason),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: KEY }), qc.invalidateQueries({ queryKey: ['rooms'] })]),
  })
}
