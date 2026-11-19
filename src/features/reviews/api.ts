import { api } from '../../shared/api/http'
import { toRoom, type ApiRoom } from '../rooms/api'
import type { Room } from '../rooms/model'
import type { Review } from './model'

// Map dữ liệu đánh giá giữa backend (RoomFeedbackItem, bảng feedbacks) và model của frontend.
export interface ApiFeedback { feedback_id: number; booking_id: number; rating: number; comment: string; tags?: string[] | null; created_at: string; updated_at?: string }
export interface FeedbackInput { stars: number; text: string; tags?: string[] }

export const toReview = (f: ApiFeedback): Review =>
  ({ id: f.feedback_id, bookingId: f.booking_id, stars: f.rating, text: f.comment, at: f.created_at.slice(0, 10) })

// GET /rooms/:id — mọi tài khoản đều gọi được; trả phòng (kèm điểm TB mới nhất) + 10 đánh giá gần nhất.
export const fetchRoomReviews = (roomId: number) =>
  api<ApiRoom & { recent_feedbacks: ApiFeedback[] | null }>(`/rooms/${roomId}`)
    .then((d): { room: Room; reviews: Review[] } => ({ room: toRoom(d), reviews: (d.recent_feedbacks ?? []).map(toReview) }))

// POST /bookings/:id/feedback (gửi mới) hoặc PUT /bookings/:id/feedback (sửa trong vòng 1 tháng).
export const saveFeedbackApi = (bookingId: number, input: FeedbackInput, isEdit: boolean) =>
  api<ApiFeedback>(
    `/bookings/${bookingId}/feedback`,
    isEdit ? 'PUT' : 'POST',
    { rating: input.stars, comment: input.text.trim(), tags: input.tags ?? [] },
  ).then(toReview)
