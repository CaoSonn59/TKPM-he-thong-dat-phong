import { api } from '../../shared/api/http'
import type { Group } from './model'

// Map dữ liệu nhóm giữa backend (GroupResponse / GroupDetailResponse của bảng user_groups) và model của frontend.
export interface ApiGroup { group_id: number; group_name: string; member_count?: number; created_at?: string; updated_at?: string }
export interface ApiGroupDetail extends ApiGroup {
  members?: { user_id: string; full_name: string; gender?: string; status?: string }[] | null
}
interface Paged<T> { items: T[]; pagination: { page: number; limit: number; total_items: number; total_pages: number } }

export const toGroup = (g: ApiGroup): Group => ({
  id: g.group_id,
  name: g.group_name,
  created: g.created_at ?? '',
  count: g.member_count ?? 0,
})

export const toGroupDetail = (g: ApiGroupDetail): Group => {
  const ms = g.members ?? []
  return {
    ...toGroup(g),
    count: g.member_count ?? ms.length,
    members: ms.map(m => m.user_id),
    memberList: ms.map(m => ({ id: m.user_id, name: m.full_name, sex: m.gender ?? '' })),
  }
}

const mapGroupItem = (g: ApiGroupDetail): Group => (Array.isArray(g.members) ? toGroupDetail(g) : toGroup(g))

// Admin: lấy hết nhóm một lần rồi lọc / sắp xếp / phân trang ở client; truyền keyword/page lên server khi nhiều nhóm.
export const fetchGroups = () => api<Paged<ApiGroup>>('/admin/groups?limit=1000').then(d => d.items.map(toGroup))

// Admin: không truyền page/limit → backend trả toàn bộ thành viên (form sửa nhóm cần đủ để thêm / gỡ).
export const fetchGroup = (id: number) => api<ApiGroupDetail>(`/admin/groups/${id}`).then(toGroupDetail)

// End-User: GET /my/groups — nhóm mà người dùng hiện tại tham gia (hỗ trợ cả mảng trực tiếp lẫn dạng Paged).
export const fetchMyGroups = () =>
  api<ApiGroupDetail[] | Paged<ApiGroupDetail>>('/my/groups')
    .then(d => (Array.isArray(d) ? d : d?.items ?? []).map(mapGroupItem))

// End-User: GET /my/groups/:id — chi tiết nhóm kèm thành viên (nếu danh sách /my/groups chưa trả kèm members).
export const fetchMyGroupDetail = (id: number) => api<ApiGroupDetail>(`/my/groups/${id}`).then(toGroupDetail)

// Admin: POST tạo / PUT sửa; user_ids là danh sách thành viên đầy đủ sau khi sửa (backend thay toàn bộ).
export const saveGroupApi = (name: string, userIds: string[], id?: number) =>
  api<ApiGroupDetail>(id ? `/admin/groups/${id}` : '/admin/groups', id ? 'PUT' : 'POST', { group_name: name, user_ids: userIds }).then(toGroupDetail)

export const deleteGroupApi = (id: number) => api<void>(`/admin/groups/${id}`, 'DELETE')
