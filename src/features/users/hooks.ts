// UI chỉ gọi các hook ở đây, không đụng store / API trực tiếp (DIP).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../auth/store'
import { useToast } from '../toast/hooks'
import { fetchUsers, saveUserApi, type UserInput } from './api'
import type { User } from './model'
import { useUsersStore } from './store'

const KEY = ['users']
const NONE: User[] = []
const useIsAdmin = () => useAuthStore(s => s.isAdmin) // đọc thẳng store để tránh import vòng với auth/hooks

// Admin: GET /admin/users.
export const useUsersQuery = () => useQuery({ queryKey: KEY, queryFn: fetchUsers, enabled: useIsAdmin() })

// shortcut: End-User không gọi được /admin/users (403) nên vẫn đọc dữ liệu mẫu (useMe, thành viên nhóm…);
// đổi khi nối phía End-User (GET /auth/me, GET /my/groups).
export function useUsers() {
  const isAdmin = useIsAdmin()
  const { data } = useUsersQuery()
  const mock = useUsersStore(s => s.users)
  return isAdmin ? data ?? NONE : mock
}

// POST /admin/users (tạo) hoặc PUT /admin/users/:id (sửa), xong thì tải lại danh sách.
export function useSaveUser() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ user, groupIds, orig }: { user: UserInput; groupIds: number[]; orig?: string }) => saveUserApi(user, groupIds, orig),
    onSuccess: (u, { orig }) => {
      qc.invalidateQueries({ queryKey: KEY })
      // Đổi nhóm của người dùng → số thành viên / chi tiết nhóm cũng đổi.
      qc.removeQueries({ queryKey: ['groups'], predicate: q => q.queryKey.length > 1 })
      qc.invalidateQueries({ queryKey: ['groups'] })
      toast(orig ? 'Cập nhật thành công' : 'Tạo người dùng thành công', `${u.id} – ${u.name}`)
    },
  })
}

export function useUserLabel() {
  const users = useUsers()
  return (id: string) => `${id} – ${users.find(u => u.id === id)?.name ?? ''}`
}
