// UI chỉ gọi các hook ở đây, không đụng store / API trực tiếp (DIP).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMyGroupsQuery } from '../groups/hooks'
import type { Group } from '../groups/model'
import { toUser } from '../users/api'
import { useToast } from '../toast/hooks'
import { changePasswordApi, fetchMeApi, loginApi } from './api'
import { useAuthStore } from './store'

export const useSession = () => useAuthStore(s => s.session)
export const useIsAdmin = () => useAuthStore(s => s.isAdmin)
export const useAuthUser = () => useAuthStore(s => s.user)

export function useAuthActions() {
  const logoutStore = useAuthStore(s => s.logout)
  const qc = useQueryClient()
  return {
    logout: () => {
      logoutStore()
      qc.clear()
    },
  }
}

// POST /auth/login → lưu token + quyền vào store.
export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth)
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, pw }: { id: string; pw: string }) => loginApi(id, pw),
    onSuccess: res => {
      qc.clear()
      setAuth(res.token, res.user, res.expires_at)
      toast('Đăng nhập thành công', res.user.full_name)
    },
  })
}

// GET /auth/me — đồng bộ thông tin người dùng hiện tại từ backend.
export function useMeQuery() {
  const session = useSession()
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMeApi,
    enabled: !!session,
    staleTime: 60_000,
  })
}

// PUT /auth/change-password — thành công thì đăng xuất về trang Đăng nhập (U10 / A13).
export function useChangePassword() {
  const { logout } = useAuthActions()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ cur, next }: { cur: string; next: string }) => changePasswordApi(cur, next),
    onSuccess: () => {
      logout()
      toast('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
    },
  })
}

// Người dùng đang đăng nhập (ưu tiên dữ liệu mới nhất từ GET /auth/me, fallback sang dữ liệu từ /auth/login).
export function useMe() {
  const authUser = useAuthUser()
  const { data } = useMeQuery()
  const u = data ?? authUser
  return u && u.role !== 'Admin' ? toUser(u) : null
}

// Nhóm mà End-User đang thuộc: lấy từ GET /my/groups, tạm hiển thị danh sách nhóm trong /auth/me lúc chưa tải xong.
export function useMyGroups(): Group[] {
  const me = useMe()
  const { data } = useMyGroupsQuery()
  if (data) return data
  return (me?.inGroups ?? []).map(g => ({ id: g.id, name: g.name, created: '', count: 0 }))
}
