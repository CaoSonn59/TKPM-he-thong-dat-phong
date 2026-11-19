// UI chỉ gọi các hook ở đây, không đụng store / API trực tiếp (DIP).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../auth/store'
import { useToast } from '../toast/hooks'
import { deleteGroupApi, fetchGroup, fetchGroups, fetchMyGroupDetail, fetchMyGroups, saveGroupApi } from './api'
import type { Group } from './model'

const KEY = ['groups']
const NONE: Group[] = []
const useIsAdmin = () => useAuthStore(s => s.isAdmin) // đọc thẳng store để tránh import vòng với auth/hooks
const useHasSession = () => !!useAuthStore(s => s.session)

// Admin: GET /admin/groups.
export const useGroupsQuery = () => useQuery({ queryKey: KEY, queryFn: fetchGroups, enabled: useIsAdmin() })

// End-User: GET /my/groups.
export const useMyGroupsQuery = () => {
  const hasSession = useHasSession()
  const isAdmin = useIsAdmin()
  return useQuery({ queryKey: [...KEY, 'my'], queryFn: fetchMyGroups, enabled: hasSession && !isAdmin })
}

export function useGroups() {
  const isAdmin = useIsAdmin()
  const admin = useGroupsQuery()
  const mine = useMyGroupsQuery()
  return isAdmin ? admin.data ?? NONE : mine.data ?? NONE
}

// Admin: GET /admin/groups/:id — chi tiết nhóm kèm toàn bộ thành viên.
export const useGroupDetailQuery = (id?: number) =>
  useQuery({ queryKey: [...KEY, id], queryFn: () => fetchGroup(id!), enabled: useIsAdmin() && !!id })

// End-User: GET /my/groups/:id — chỉ gọi khi danh sách /my/groups chưa kèm memberList.
export const useMyGroupDetailQuery = (id?: number, enabled = true) => {
  const hasSession = useHasSession()
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: [...KEY, 'my', id],
    queryFn: () => fetchMyGroupDetail(id!),
    enabled: hasSession && !isAdmin && !!id && enabled,
    retry: false,
  })
}

// Một nhóm kèm thành viên (memberList): Admin dùng /admin/groups/:id, End-User dùng /my/groups hoặc /my/groups/:id.
export function useGroup(id: number | null) {
  const isAdmin = useIsAdmin()
  const adminDetail = useGroupDetailQuery(id ?? undefined)
  const myGroups = useMyGroupsQuery()
  const cachedMyGroup = id ? myGroups.data?.find(g => g.id === id) : undefined
  const needMyDetail = !isAdmin && !!id && !cachedMyGroup?.memberList
  const myDetail = useMyGroupDetailQuery(id ?? undefined, needMyDetail)
  if (isAdmin) return adminDetail.data
  return cachedMyGroup?.memberList ? cachedMyGroup : myDetail.data ?? cachedMyGroup
}

export function useGroupName() {
  const groups = useGroups()
  return (id: number | null, fallbackName?: string) =>
    id === null ? 'Cá nhân' : groups.find(g => g.id === id)?.name ?? (fallbackName || '(nhóm đã xóa)')
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
