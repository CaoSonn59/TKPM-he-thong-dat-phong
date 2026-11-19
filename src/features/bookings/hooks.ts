// UI chỉ gọi các hook ở đây, không đụng store / API trực tiếp (DIP).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../auth/store'
import { useToast } from '../toast/hooks'
import { cancelMyBookingApi, createBookingApi, decideBookingApi, fetchBookingDetail, fetchBookings, fetchMyBookings } from './api'
import type { Booking, CreateBookingInput } from './model'

const KEY = ['bookings']
const NONE: Booking[] = []
const useIsAdmin = () => useAuthStore(s => s.isAdmin) // đọc thẳng store để tránh import vòng với auth/hooks
const useHasSession = () => !!useAuthStore(s => s.session)

// Admin: GET /admin/bookings.
export const useBookingsQuery = () => useQuery({ queryKey: KEY, queryFn: fetchBookings, enabled: useIsAdmin() })

// End-User: GET /bookings/my.
export const useMyBookingsQuery = () => {
  const hasSession = useHasSession()
  const isAdmin = useIsAdmin()
  return useQuery({ queryKey: [...KEY, 'my'], queryFn: fetchMyBookings, enabled: hasSession && !isAdmin })
}

// End-User: GET /bookings/:id — chi tiết lịch đặt (bổ sung thành viên nhóm nếu backend trả kèm).
export const useBookingDetailQuery = (id?: number) => {
  const hasSession = useHasSession()
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => fetchBookingDetail(id!),
    enabled: hasSession && !isAdmin && !!id,
    retry: false,
  })
}

export function useBookings() {
  const isAdmin = useIsAdmin()
  const admin = useBookingsQuery()
  const mine = useMyBookingsQuery()
  return isAdmin ? admin.data ?? NONE : mine.data ?? NONE
}

// Admin: Chấp nhận / Từ chối / Hủy khẩn cấp. Xong thì tải lại lịch đặt và phòng (số lịch sắp tới của phòng đổi theo).
export function useDecideBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ b, type, reason }: { b: Booking; type: 'ok' | 'no' | 'cancel'; reason?: string }) => decideBookingApi(b.id, type, reason),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: KEY }), qc.invalidateQueries({ queryKey: ['rooms'] })]),
  })
}

// End-User: POST /bookings — tạo yêu cầu đặt phòng mới.
export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (nb: CreateBookingInput) => createBookingApi(nb),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: KEY }), qc.invalidateQueries({ queryKey: ['rooms', 'available'] })]),
  })
}

// End-User: PUT /bookings/:id/cancel — hủy lịch đặt phòng của bản thân.
export function useCancelMyBooking() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => cancelMyBookingApi(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['rooms', 'available'] })
      toast('Hủy đặt phòng thành công', 'Lịch chuyển sang tab “Đã hủy”.')
    },
    onError: err => toast('Không hủy được lịch đặt', err.message, true),
  })
}
