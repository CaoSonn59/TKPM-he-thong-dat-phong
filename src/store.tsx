import { createContext, useContext, useState, type ReactNode } from 'react'
import { NOW, TODAY, seed, type Booking, type Status } from './data'
import { isFree, pwErrors, type PwErr } from './logic'

export interface Toast { id: number; title: string; sub?: string; bad?: boolean }

// Lưu trạng thái trên bộ nhớ trình duyệt (dữ liệu mẫu cho Front-end User, không dùng Back-end).
function useStoreValue() {
  const [users, setUsers] = useState(seed.users)
  const [groups] = useState(seed.groups)
  const [rooms] = useState(seed.rooms)
  const [bookings, setBookings] = useState(seed.bookings)
  const [session, setSession] = useState<string | null>(null) // Mã định danh người dùng (VD: SV2026001)
  const [toasts, setToasts] = useState<Toast[]>([])

  const me = users.find(u => u.id === session) ?? null
  const myGroups = groups.filter(g => me && g.members.includes(me.id))
  const nextId = (xs: { id: number }[]) => Math.max(0, ...xs.map(x => x.id)) + 1

  const dismiss = (id: number) => setToasts(t => t.filter(x => x.id !== id))
  const toast = (title: string, sub?: string, bad?: boolean) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, title, sub, bad }])
    setTimeout(() => dismiss(id), 4500)
  }

  return {
    users, groups, rooms, bookings, session, me, myGroups, toasts, toast, dismiss,
    roomOf: (id: number) => rooms.find(r => r.id === id)!,
    userLabel: (id: string) => `${id} – ${users.find(u => u.id === id)?.name ?? ''}`,
    groupName: (id: number | null) => id === null ? 'Cá nhân' : groups.find(g => g.id === id)?.name ?? '(nhóm đã xóa)',

    login(id: string, pw: string): string | null {
      id = id.trim()
      const u = users.find(x => x.id === id)
      if (!u || u.pw !== pw) return 'Tên đăng nhập hoặc mật khẩu không chính xác'
      if (!u.active) return 'Tài khoản đã ngưng sử dụng, vui lòng liên hệ quản trị viên'
      setSession(id)
      return null
    },
    logout: () => setSession(null),
    changePw(cur: string, next: string, again: string): PwErr {
      if (!me) return {}
      const e = pwErrors(cur, next, again, me.pw, me.id)
      if (Object.keys(e).length) return e
      setUsers(us => us.map(u => u.id === me.id ? { ...u, pw: next } : u))
      setSession(null)
      toast('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
      return e
    },

    // Hủy đặt phòng: chuyển trạng thái sang 'cancel' và lưu lý do hủy (giải phóng khung giờ).
    setStatus: (id: number, status: Status, text = '', by: 'admin' | 'user' = 'user') =>
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status, reason: status === 'ok' ? undefined : { text: text.trim(), by, at: TODAY } } : b)),
    // Trả null nếu phòng vừa bị đặt / chuyển bảo trì (lỗi tranh chấp).
    book(nb: Pick<Booking, 'title' | 'roomId' | 'groupId' | 'date' | 'from' | 'to'>): Booking | null {
      const room = rooms.find(r => r.id === nb.roomId)
      if (!me || !room || room.maint || !isFree(nb.roomId, bookings, nb)) return null
      const b: Booking = { ...nb, id: nextId(bookings), by: me.id, status: 'wait', sent: `${TODAY}T${NOW}` }
      setBookings([...bookings, b])
      return b
    },
    saveFb(id: number, stars: number, text: string) {
      setBookings(bs => bs.map(b => b.id === id ? { ...b, fb: { stars, text: text.trim(), at: TODAY } } : b))
      toast('Đã lưu phản hồi, cảm ơn bạn!')
    },
  }
}

export type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store>(null!)
export const StoreProvider = ({ children }: { children: ReactNode }) => <Ctx.Provider value={useStoreValue()}>{children}</Ctx.Provider>
export const useStore = () => useContext(Ctx)

