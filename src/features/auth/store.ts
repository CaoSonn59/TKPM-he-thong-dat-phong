import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from '../toast/store'
import { useUsersStore } from '../users/store'
import { pwErrors, type PwErr } from './logic'
import type { ApiUser } from './api'

interface AuthState {
  token: string | null
  session: string | null // user_id từ backend
  isAdmin: boolean
  adminPw: string // shortcut: mật khẩu admin mẫu, đổi mật khẩu vẫn chạy trên dữ liệu mẫu; thay bằng PUT /auth/change-password.
  setAuth(token: string, user: ApiUser): void
  logout(): void
  changePw(cur: string, next: string, again: string): PwErr
}

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  token: null, session: null, isAdmin: false, adminPw: 'admin123',
  setAuth: (token, user) => set({ token, session: user.user_id, isAdmin: user.role === 'Admin' }),
  // JWT stateless: POST /auth/logout ở backend chỉ trả OK nên không cần gọi.
  logout: () => set({ token: null, session: null, isAdmin: false }),
  changePw(cur, next, again) {
    const { adminPw, session } = get()
    const me = useUsersStore.getState().users.find(u => u.id === session)
    const e = pwErrors(cur, next, again, me ? me.pw : adminPw, session!)
    if (Object.keys(e).length) return e
    if (me) useUsersStore.getState().setPw(me.id, next)
    else set({ adminPw: next })
    get().logout()
    toast('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
    return e
  },
}), {
  // Chỉ giữ phiên đăng nhập qua reload (localStorage).
  name: 'dat-phong-auth',
  partialize: s => ({ token: s.token, session: s.session, isAdmin: s.isAdmin }),
}))
