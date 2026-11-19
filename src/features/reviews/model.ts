// Đánh giá & phản hồi sau buổi sử dụng phòng — bảng `feedbacks` ở backend (mỗi booking tối đa 1 đánh giá).
export interface Review { id: number; bookingId: number; stars: number; text: string; at: string }
