import { create } from 'zustand'
import { NOW, TODAY } from '../../mocks/clock'
import { seed } from '../../mocks/seed'
import { nextId } from '../../shared/lib/nextId'
import { toast } from '../toast/store'
import { useRoomsStore } from '../rooms/store'
import { isFree } from './logic'
import type { Booking, Status } from './model'

// shortcut: dữ liệu mẫu trong bộ nhớ; thay bằng react-query gọi /admin/bookings, /bookings.
interface BookingsState {
  bookings: Booking[]
  setStatus(id: number, status: Status, text?: string, by?: 'admin' | 'user'): void
  book(nb: Pick<Booking, 'title' | 'roomId' | 'groupId' | 'date' | 'from' | 'to'>, by: string): Booking | null
  saveFb(id: number, stars: number, text: string): void
}

export const useBookingsStore = create<BookingsState>()((set, get) => ({
  bookings: seed.bookings,
  // Booking không bao giờ bị xóa: từ chối → 'no', hủy → 'cancel', đều lưu lý do.
  setStatus: (id, status, text = '', by = 'admin') =>
    set(s => ({ bookings: s.bookings.map(b => b.id === id ? { ...b, status, reason: status === 'ok' ? undefined : { text: text.trim(), by, at: TODAY } } : b) })),
  // Trả null nếu phòng vừa bị đặt / chuyển bảo trì (lỗi tranh chấp).
  book(nb, by) {
    const { bookings } = get()
    const room = useRoomsStore.getState().rooms.find(r => r.id === nb.roomId)
    if (!room || room.maint || !isFree(nb.roomId, bookings, nb)) return null
    const b: Booking = { ...nb, id: nextId(bookings), by, status: 'wait', sent: `${TODAY}T${NOW}` }
    set({ bookings: [...bookings, b] })
    return b
  },
  saveFb(id, stars, text) {
    set(s => ({ bookings: s.bookings.map(b => b.id === id ? { ...b, fb: { stars, text: text.trim(), at: TODAY } } : b) }))
    toast('Đã lưu phản hồi, cảm ơn bạn!')
  },
}))
