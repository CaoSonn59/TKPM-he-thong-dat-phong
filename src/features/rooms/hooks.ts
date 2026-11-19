// UI chỉ gọi các hook ở đây, không đụng store / API trực tiếp (DIP).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useIsAdmin } from '../auth/hooks'
import { useToast } from '../toast/hooks'
import { fetchAvailableRooms, fetchRooms, saveRoomApi, type AvailableRoomsParams, type RoomInput } from './api'
import type { Room } from './model'

const KEY = ['rooms']
const NONE: Room[] = []

// Admin: GET /admin/rooms.
export const useRoomsQuery = () => useQuery({ queryKey: KEY, queryFn: fetchRooms, enabled: useIsAdmin() })

// End-User: GET /rooms/available theo khung giờ + bộ lọc.
export const useAvailableRoomsQuery = (q: AvailableRoomsParams | null) =>
  useQuery({
    queryKey: [...KEY, 'available', q?.date, q?.from, q?.to, q?.min ?? '', (q?.amenities ?? []).join(',')],
    queryFn: () => fetchAvailableRooms(q!),
    enabled: !!q,
  })

export function useRooms() {
  const { data } = useRoomsQuery()
  return data ?? NONE
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
  return (id: number, fallbackName?: string): Room => rooms.find(r => r.id === id)
    ?? { id, name: fallbackName || '—', min: 0, max: 0, building: '—', floor: '—', amenities: [], maint: false, rate: null, votes: 0 }
}
