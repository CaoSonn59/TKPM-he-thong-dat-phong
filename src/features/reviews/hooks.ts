// UI chỉ gọi các hook ở đây, không đụng API trực tiếp (DIP).
import { useQuery } from '@tanstack/react-query'
import { fetchRoomReviews } from './api'

// Đánh giá gần đây của một phòng (dùng ở cả Admin và End-User).
export const useRoomReviews = (roomId: number) =>
  useQuery({ queryKey: ['reviews', 'room', roomId], queryFn: () => fetchRoomReviews(roomId) })
