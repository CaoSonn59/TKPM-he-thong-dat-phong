// UI chỉ gọi các hook ở đây, không đụng store trực tiếp (DIP):
// khi nối backend, chỉ cần đổi phần ruột sang react-query, các màn hình giữ nguyên.
import { useShallow } from 'zustand/react/shallow'
import { useBookingsStore } from './store'

export const useBookings = () => useBookingsStore(s => s.bookings)
export const useBookingActions = () => useBookingsStore(useShallow(s => ({ setStatus: s.setStatus, book: s.book, saveFb: s.saveFb })))
