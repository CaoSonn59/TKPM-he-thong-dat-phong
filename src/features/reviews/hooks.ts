// UI chỉ gọi các hook ở đây, không đụng API trực tiếp (DIP).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../toast/hooks'
import { fetchRoomReviews, saveFeedbackApi, type FeedbackInput } from './api'

// Đánh giá gần đây + chi tiết của một phòng (dùng ở cả Admin và End-User qua GET /rooms/:id).
export const useRoomReviews = (roomId?: number) =>
  useQuery({ queryKey: ['reviews', 'room', roomId], queryFn: () => fetchRoomReviews(roomId!), enabled: !!roomId })

// End-User: POST / PUT /bookings/:id/feedback — gửi hoặc sửa đánh giá sau khi sử dụng phòng.
export function useSaveFeedback() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ bookingId, input, isEdit }: { bookingId: number; roomId: number; input: FeedbackInput; isEdit: boolean }) =>
      saveFeedbackApi(bookingId, input, isEdit),
    onSuccess: (_, { roomId }) => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['reviews', 'room', roomId] })
      qc.invalidateQueries({ queryKey: ['rooms'] })
      toast('Đã lưu phản hồi, cảm ơn bạn!')
    },
  })
}
