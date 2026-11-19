import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ApiUser } from '../users/api'

interface AuthState {
  token: string | null
  session: string | null // user_id từ backend
  isAdmin: boolean
  user: ApiUser | null // thông tin người đăng nhập (tên hiển thị, nhóm…) từ /auth/login hoặc /auth/me
  expiresAt: string | null
  setAuth(token: string, user: ApiUser, expiresAt: string): void
  setUser(user: ApiUser): void
  logout(): void
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  token: null, session: null, isAdmin: false, user: null, expiresAt: null,
  setAuth: (token, user, expiresAt) => set({ token, session: user.user_id, isAdmin: user.role === 'Admin', user, expiresAt }),
  setUser: (user) => set({ user, session: user.user_id, isAdmin: user.role === 'Admin' }),
  // JWT stateless: POST /auth/logout ở backend chỉ trả OK nên không cần gọi.
  logout: () => set({ token: null, session: null, isAdmin: false, user: null, expiresAt: null }),
}), {
  // Chỉ giữ phiên đăng nhập qua reload (localStorage).
  name: 'dat-phong-auth',
  partialize: s => ({ token: s.token, session: s.session, isAdmin: s.isAdmin, user: s.user, expiresAt: s.expiresAt }),
  // Token đã hết hạn lúc mở lại trang → đăng xuất luôn, không đợi request đầu tiên bị 401.
  onRehydrateStorage: () => s => { if (s?.expiresAt && Date.parse(s.expiresAt) <= Date.now()) s.logout() },
}))
