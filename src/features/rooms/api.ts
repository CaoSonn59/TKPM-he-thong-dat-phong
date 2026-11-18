import { api } from '../../shared/api/http'
import type { Room } from './model'

// Map dữ liệu phòng giữa backend (dat-phong-backend, RoomResponse) và model của frontend.
const MAINT = 'Đang bảo trì', AVAILABLE = 'Khả dụng'

export interface ApiRoom {
  room_id: number; room_name: string; min_capacity: number; max_capacity: number
  location: string; building: string; floor: string; amenities: string[] | null; status: string
  avg_rating: number; rating_count: number; upcoming_bookings_count: number
}
interface Paged<T> { items: T[]; pagination: { page: number; limit: number; total_items: number; total_pages: number } }

export type RoomInput = Pick<Room, 'name' | 'min' | 'max' | 'building' | 'floor' | 'amenities' | 'maint'>

export const toRoom = (r: ApiRoom): Room => ({
  id: r.room_id, name: r.room_name, min: r.min_capacity, max: r.max_capacity,
  building: r.building, floor: r.floor, amenities: r.amenities ?? [], maint: r.status === MAINT,
  rate: r.rating_count ? r.avg_rating : null, votes: r.rating_count, upcoming: r.upcoming_bookings_count,
})

const toBody = (r: RoomInput) => ({
  room_name: r.name, min_capacity: r.min, max_capacity: r.max,
  building: r.building, floor: r.floor, amenities: r.amenities, status: r.maint ? MAINT : AVAILABLE,
})

// ponytail: lấy hết phòng một lần rồi lọc / sắp xếp / phân trang ở client (số phòng ít, backend cũng lọc trong bộ nhớ);
// chuyển sang truyền keyword/status/page lên server khi số phòng lớn.
export const fetchRooms = () => api<Paged<ApiRoom>>('/admin/rooms?limit=1000').then(d => d.items.map(toRoom))

export const saveRoomApi = (room: RoomInput, id?: number) =>
  api<ApiRoom>(id ? `/admin/rooms/${id}` : '/admin/rooms', id ? 'PUT' : 'POST', toBody(room)).then(toRoom)
