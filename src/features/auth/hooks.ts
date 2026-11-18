// UI chỉ gọi các hook ở đây, không đụng store trực tiếp (DIP):
// khi nối backend, chỉ cần đổi phần ruột sang react-query, các màn hình giữ nguyên.
import { useMutation } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useGroups } from '../groups/hooks'
import { useUsers } from '../users/hooks'
import { loginApi } from './api'
import { useAuthStore } from './store'

export const useSession = () => useAuthStore(s => s.session)
export const useIsAdmin = () => useAuthStore(s => s.isAdmin)
export const useAuthActions = () => useAuthStore(useShallow(s => ({ logout: s.logout, changePw: s.changePw })))

// POST /auth/login → lưu token + quyền vào store.
export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth)
  return useMutation({
    mutationFn: ({ id, pw }: { id: string; pw: string }) => loginApi(id, pw),
    onSuccess: res => setAuth(res.token, res.user),
  })
}

// Người dùng đang đăng nhập (tra trong dữ liệu mẫu) và các nhóm của họ.
export function useMe() {
  const session = useSession()
  return useUsers().find(u => u.id === session) ?? null
}
export function useMyGroups() {
  const me = useMe()
  return useGroups().filter(g => me && g.members.includes(me.id))
}
