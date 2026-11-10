import { createContext, useContext, useState, type ReactNode } from 'react'
import { ADMIN_PW, NOW, TODAY, seed, type Booking, type Room, type Status, type User } from './data'
import { isFree, pwErrors, type PwErr } from './logic'

export interface Toast { id: number; title: string; sub?: string; bad?: boolean }

// Lưu trạng thái trên bộ nhớ trình duyệt (dùng chung cho cả Front-end User và Admin).
function useStoreValue() {
  const [users, setUsers] = useState(seed.users)
  const [groups, setGroups] = useState(seed.groups)
  const [rooms, setRooms] = useState(seed.rooms)
  const [bookings, setBookings] = useState(seed.bookings)
  const [adminPw, setAdminPw] = useState(ADMIN_PW)
  const [session, setSession] = useState<string | null>(null) // 'admin' hoặc mã định danh người dùng (VD: SV2026001)
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
      if (!(id === 'admin' ? pw === adminPw : u?.pw === pw)) return 'Tên đăng nhập hoặc mật khẩu không chính xác'
      if (u && !u.active) return 'Tài khoản đã ngưng sử dụng, vui lòng liên hệ quản trị viên'
      setSession(id)
      return null
    },
    logout: () => setSession(null),
    changePw(cur: string, next: string, again: string): PwErr {
      const e = pwErrors(cur, next, again, me ? me.pw : adminPw, session!)
      if (Object.keys(e).length) return e
      if (me) setUsers(us => us.map(u => u.id === me.id ? { ...u, pw: next } : u))
      else setAdminPw(next)
      setSession(null)
      toast('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
      return e
    },

    saveUser(u: Pick<User, 'id' | 'name' | 'sex' | 'active'>, groupIds: number[], orig?: string): string | null {
      if (u.id === 'admin' || (u.id !== orig && users.some(x => x.id === u.id))) return 'Mã định danh đã tồn tại, vui lòng nhập mã khác'
      setUsers(us => orig
        ? us.map(x => x.id === orig ? { ...x, ...u, pw: x.pw === orig ? u.id : x.pw } : x)
        : [{ ...u, created: TODAY, pw: u.id }, ...us])
      setGroups(gs => gs.map(g => ({ ...g, members: [...g.members.filter(m => m !== orig && m !== u.id), ...(groupIds.includes(g.id) ? [u.id] : [])] })))
      if (orig && orig !== u.id) setBookings(bs => bs.map(b => b.by === orig ? { ...b, by: u.id } : b))
      toast(orig ? 'Cập nhật thành công' : 'Tạo người dùng thành công', `${u.id} – ${u.name}`)
      return null
    },
    saveRoom(r: Room): string | null {
      if (rooms.some(x => x.id !== r.id && x.name === r.name)) return 'Tên phòng đã tồn tại'
      setRooms(rs => r.id ? rs.map(x => x.id === r.id ? r : x) : [...rs, { ...r, id: nextId(rs) }])
      toast(r.id ? 'Cập nhật phòng thành công' : 'Thêm phòng thành công', r.name)
      return null
    },
    saveGroup(g: { id: number; name: string; members: string[] }): string | null {
      if (groups.some(x => x.id !== g.id && x.name === g.name)) return 'Tên nhóm đã tồn tại, vui lòng nhập tên khác'
      setGroups(gs => g.id ? gs.map(x => x.id === g.id ? { ...x, ...g } : x) : [...gs, { ...g, id: nextId(gs), created: TODAY }])
      toast(g.id ? 'Cập nhật nhóm thành công' : 'Tạo nhóm thành công', g.name)
      return null
    },
    deleteGroup: (id: number) => setGroups(gs => gs.filter(g => g.id !== id)),

    // Booking không bao giờ bị xóa: từ chối → 'no', hủy → 'cancel', đều lưu lý do.
    setStatus: (id: number, status: Status, text = '', by: 'admin' | 'user' = 'admin') =>
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


