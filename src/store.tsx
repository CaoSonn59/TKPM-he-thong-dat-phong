import { createContext, useContext, useState, type ReactNode } from 'react'
import { ADMIN_PW, NOW, TODAY, seed, type Booking, type Room, type Sex, type Status, type User } from './data'
import { isFree, pwErrors, type PwErr } from './logic'

export interface Toast { id: number; title: string; sub?: string; bad?: boolean }

export interface AuthUser {
  user_id: string
  full_name: string
  gender: Sex
  role: string
  status: string
  created_at: string
  groups: unknown[]
}

interface LoginResponse {
  success: boolean
  message: string
  data?: {
    token: string
    expires_at: string
    user: AuthUser
  }
}

const API_BASE = 'http://localhost:8080/api/v1'
const STORAGE_TOKEN_KEY = 'dp_token'
const STORAGE_USER_KEY = 'dp_user'
const STORAGE_EXPIRES_KEY = 'dp_expires_at'

function loadStoredAuth(): { token: string | null; authUser: AuthUser | null; session: string | null } {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY)
    const rawUser = localStorage.getItem(STORAGE_USER_KEY)
    const expiresAt = localStorage.getItem(STORAGE_EXPIRES_KEY)
    if (!token || !rawUser) return { token: null, authUser: null, session: null }
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(STORAGE_TOKEN_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
      localStorage.removeItem(STORAGE_EXPIRES_KEY)
      return { token: null, authUser: null, session: null }
    }
    const authUser = JSON.parse(rawUser) as AuthUser
    const session = authUser.role === 'Admin' || authUser.user_id === 'admin' ? 'admin' : authUser.user_id
    return { token, authUser, session }
  } catch {
    return { token: null, authUser: null, session: null }
  }
}

// shortcut: everything lives in memory (lost on reload) and passwords are plain text in state;
// replace this file with API calls when the backend exists.
function useStoreValue() {
  const initialAuth = loadStoredAuth()
  const [users, setUsers] = useState(seed.users)
  const [groups, setGroups] = useState(seed.groups)
  const [rooms, setRooms] = useState(seed.rooms)
  const [bookings, setBookings] = useState(seed.bookings)
  const [adminPw, setAdminPw] = useState(ADMIN_PW)
  const [token, setToken] = useState<string | null>(initialAuth.token)
  const [authUser, setAuthUser] = useState<AuthUser | null>(initialAuth.authUser)
  const [session, setSession] = useState<string | null>(initialAuth.session) // 'admin' hoặc mã định danh
  const [toasts, setToasts] = useState<Toast[]>([])

  const me = users.find(u => u.id === session) ?? (authUser && session !== 'admin' ? {
    id: authUser.user_id,
    name: authUser.full_name,
    sex: authUser.gender,
    active: authUser.status === 'Đang hoạt động',
    created: authUser.created_at.slice(0, 10),
    pw: '',
  } : null)
  const myGroups = groups.filter(g => me && g.members.includes(me.id))
  const nextId = (xs: { id: number }[]) => Math.max(0, ...xs.map(x => x.id)) + 1

  const dismiss = (id: number) => setToasts(t => t.filter(x => x.id !== id))
  const toast = (title: string, sub?: string, bad?: boolean) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, title, sub, bad }])
    setTimeout(() => dismiss(id), 4500)
  }

  const clearAuth = () => {
    setToken(null)
    setAuthUser(null)
    setSession(null)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_EXPIRES_KEY)
  }

  return {
    users, groups, rooms, bookings, session, token, authUser, me, myGroups, toasts, toast, dismiss,
    roomOf: (id: number) => rooms.find(r => r.id === id)!,
    userLabel: (id: string) => `${id} – ${users.find(u => u.id === id)?.name ?? ''}`,
    groupName: (id: number | null) => id === null ? 'Cá nhân' : groups.find(g => g.id === id)?.name ?? '(nhóm đã xóa)',

    async login(id: string, pw: string): Promise<string | null> {
      id = id.trim()
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: id, password: pw }),
        })
        const json = (await res.json()) as LoginResponse
        if (!res.ok || !json.success || !json.data) {
          return json.message || 'Tên đăng nhập hoặc mật khẩu không chính xác'
        }
        const { token: jwt, expires_at, user } = json.data
        if (user.status && user.status !== 'Đang hoạt động') {
          return 'Tài khoản đã ngưng sử dụng, vui lòng liên hệ quản trị viên'
        }
        localStorage.setItem(STORAGE_TOKEN_KEY, jwt)
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
        localStorage.setItem(STORAGE_EXPIRES_KEY, expires_at)
        setToken(jwt)
        setAuthUser(user)
        const nextSession = user.role === 'Admin' || user.user_id === 'admin' ? 'admin' : user.user_id
        if (nextSession !== 'admin') {
          setUsers(us => {
            const mapped: User = {
              id: user.user_id,
              name: user.full_name,
              sex: user.gender,
              active: user.status === 'Đang hoạt động',
              created: user.created_at.slice(0, 10),
              pw,
            }
            return us.some(x => x.id === user.user_id)
              ? us.map(x => x.id === user.user_id ? { ...x, ...mapped } : x)
              : [mapped, ...us]
          })
        } else {
          setAdminPw(pw)
        }
        setSession(nextSession)
        toast(json.message || 'Đăng nhập thành công', user.full_name)
        return null
      } catch {
        return 'Không thể kết nối đến máy chủ, vui lòng thử lại sau'
      }
    },
    logout: clearAuth,
    changePw(cur: string, next: string, again: string): PwErr {
      const e = pwErrors(cur, next, again, me ? me.pw : adminPw, session!)
      if (Object.keys(e).length) return e
      if (me) setUsers(us => us.map(u => u.id === me.id ? { ...u, pw: next } : u))
      else setAdminPw(next)
      clearAuth()
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
