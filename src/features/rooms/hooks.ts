// UI chỉ gọi các hook ở đây, không đụng store / API trực tiếp (DIP).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useIsAdmin } from '../auth/hooks'
import { useToast } from '../toast/hooks'
import { fetchRooms, saveRoomApi, type RoomInput } from './api'
import type { Room } from './model'
import { useRoomsStore } from './store'

const KEY = ['rooms']
const NONE: Room[] = []

// Admin: GET /admin/rooms.
export const useRoomsQuery = () => useQuery({ queryKey: KEY, queryFn: fetchRooms, enabled: useIsAdmin() })

// shortcut: End-User chưa có API liệt kê phòng (backend chỉ có /rooms/available theo khung giờ)
// nên vẫn đọc dữ liệu mẫu; đổi khi nối màn Tìm phòng.
export function useRooms() {
  const isAdmin = useIsAdmin()
  const { data } = useRoomsQuery()
  const mock = useRoomsStore(s => s.rooms)
  return isAdmin ? data ?? NONE : mock
}

// POST /admin/rooms (thêm) hoặc PUT /admin/rooms/:id (sửa), xong thì tải lại danh sách.
export function useSaveRoom() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ room, id }: { room: RoomInput; id?: number }) => saveRoomApi(room, id),
    onSuccess: (r, { id }) => {
      qc.invalidateQueries({ queryKey: KEY })
      toast(id ? 'Cập nhật phòng thành công' : 'Thêm phòng thành công', r.name)
    },
  })
}

// Phòng chưa tải xong / đã bị xóa vẫn trả về object để màn hình không vỡ.
export function useRoomOf() {
  const rooms = useRooms()
  return (id: number): Room => rooms.find(r => r.id === id)
    ?? { id, name: '—', min: 0, max: 0, building: '—', floor: '—', amenities: [], maint: false, rate: null, votes: 0 }
}
