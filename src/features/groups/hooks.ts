// UI chỉ gọi các hook ở đây, không đụng store / API trực tiếp (DIP).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../auth/store'
import { useToast } from '../toast/hooks'
import { useUsers } from '../users/hooks'
import { deleteGroupApi, fetchGroup, fetchGroups, saveGroupApi } from './api'
import type { Group } from './model'
import { useGroupsStore } from './store'

const KEY = ['groups']
const NONE: Group[] = []
const useIsAdmin = () => useAuthStore(s => s.isAdmin) // đọc thẳng store để tránh import vòng với auth/hooks

// Admin: GET /admin/groups.
export const useGroupsQuery = () => useQuery({ queryKey: KEY, queryFn: fetchGroups, enabled: useIsAdmin() })

// shortcut: End-User không gọi được /admin/groups (403) nên vẫn đọc dữ liệu mẫu; đổi khi nối GET /my/groups.
export function useGroups() {
  const isAdmin = useIsAdmin()
  const { data } = useGroupsQuery()
  const mock = useGroupsStore(s => s.groups)
  return isAdmin ? data ?? NONE : mock
}

// Admin: GET /admin/groups/:id — chi tiết nhóm kèm toàn bộ thành viên.
export const useGroupDetailQuery = (id?: number) =>
  useQuery({ queryKey: [...KEY, id], queryFn: () => fetchGroup(id!), enabled: useIsAdmin() && !!id })

// Một nhóm kèm thành viên (memberList): Admin lấy từ API, End-User lấy từ dữ liệu mẫu.
export function useGroup(id: number | null) {
  const isAdmin = useIsAdmin()
  const { data } = useGroupDetailQuery(id ?? undefined)
  const mock = useGroupsStore(s => s.groups.find(g => g.id === id))
  const users = useUsers()
  if (isAdmin) return data
  return mock && { ...mock, memberList: users.filter(u => mock.members?.includes(u.id)) }
}

export function useGroupName() {
  const groups = useGroups()
  return (id: number | null) => id === null ? 'Cá nhân' : groups.find(g => g.id === id)?.name ?? '(nhóm đã xóa)'
}

// Lưu / xóa nhóm làm đổi cả cột "Nhóm trực thuộc" của người dùng → tải lại nhóm và người dùng.
// Bỏ hẳn cache chi tiết nhóm: form sửa nhóm khởi tạo state từ dữ liệu này, không được dùng bản cũ.
function useRefresh() {
  const qc = useQueryClient()
  return () => {
    qc.removeQueries({ queryKey: KEY, predicate: q => q.queryKey.length > 1 })
    return Promise.all([qc.invalidateQueries({ queryKey: KEY }), qc.invalidateQueries({ queryKey: ['users'] })])
  }
}

// POST /admin/groups (tạo) hoặc PUT /admin/groups/:id (sửa).
export function useSaveGroup() {
  const refresh = useRefresh()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, name, members }: { id?: number; name: string; members: string[] }) => saveGroupApi(name, members, id),
    onSuccess: (g, { id }) => { refresh(); toast(id ? 'Cập nhật nhóm thành công' : 'Tạo nhóm thành công', g.name) },
  })
}

// DELETE /admin/groups/:id — backend gỡ thành viên khỏi nhóm, lịch đặt cũ vẫn giữ (group_id → NULL).
export function useDeleteGroup() {
  const refresh = useRefresh()
  const toast = useToast()
  return useMutation({
    mutationFn: (g: Group) => deleteGroupApi(g.id),
    onSuccess: (_, g) => { refresh(); toast('Đã xóa nhóm', g.name) },
    onError: err => toast('Không xóa được nhóm', err.message, true),
  })
}
