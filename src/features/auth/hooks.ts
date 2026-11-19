// UI chỉ gọi các hook ở đây, không đụng store trực tiếp (DIP):
// khi nối backend, chỉ cần đổi phần ruột sang react-query, các màn hình giữ nguyên.
import { useMutation } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useGroups } from '../groups/hooks'
import { toUser } from '../users/api'
import { useUsers } from '../users/hooks'
import { useToast } from '../toast/hooks'
import { loginApi } from './api'
import { useAuthStore } from './store'

export const useSession = () => useAuthStore(s => s.session)
export const useIsAdmin = () => useAuthStore(s => s.isAdmin)
export const useAuthUser = () => useAuthStore(s => s.user)
export const useAuthActions = () => useAuthStore(useShallow(s => ({ logout: s.logout, changePw: s.changePw })))

// POST /auth/login → lưu token + quyền vào store.
export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth)
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, pw }: { id: string; pw: string }) => loginApi(id, pw),
    onSuccess: res => { setAuth(res.token, res.user, res.expires_at); toast('Đăng nhập thành công', res.user.full_name) },
  })
}

// Người dùng đang đăng nhập và các nhóm của họ. Ưu tiên bản trong dữ liệu mẫu (có lịch đặt, nhóm mẫu);
// tài khoản thật không có trong dữ liệu mẫu thì dựng từ thông tin đăng nhập để màn End-User không bị trắng.
export function useMe() {
  const session = useSession()
  const authUser = useAuthUser()
  return useUsers().find(u => u.id === session) ?? (authUser && authUser.role !== 'Admin' ? toUser(authUser) : null)
}
export function useMyGroups() {
  const me = useMe()
  return useGroups().filter(g => me && g.members?.includes(me.id))
}
