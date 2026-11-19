import { api } from '../../shared/api/http'
import type { Sex, User } from './model'

// Map dữ liệu người dùng giữa backend (dat-phong-backend, UserResponse) và model của frontend.
const ACTIVE = 'Đang hoạt động', INACTIVE = 'Ngưng sử dụng'

export interface ApiUser {
  user_id: string; full_name: string; gender: string; role: 'Admin' | 'User'; status: string
  created_at: string; groups: { group_id: number; group_name: string }[] | null
}
interface Paged<T> { items: T[]; pagination: { page: number; limit: number; total_items: number; total_pages: number } }

export type UserInput = Pick<User, 'id' | 'name' | 'sex' | 'active'>

export const toUser = (u: ApiUser): User => ({
  id: u.user_id, name: u.full_name, sex: u.gender as Sex, active: u.status === ACTIVE, created: u.created_at,
  inGroups: (u.groups ?? []).map(g => ({ id: g.group_id, name: g.group_name })),
})

// ponytail: lấy hết người dùng một lần rồi lọc / sắp xếp / phân trang ở client như bản cũ;
// chuyển sang truyền keyword/group_id/status/page lên server khi số người dùng lớn.
// Tài khoản Admin không hiện trong màn quản lý người dùng (giống thiết kế A3).
export const fetchUsers = () => api<Paged<ApiUser>>('/admin/users?limit=1000')
  .then(d => d.items.filter(u => u.role !== 'Admin').map(toUser))

// POST tạo mới (mật khẩu mặc định = mã định danh, trạng thái mặc định Đang hoạt động — backend tự đặt).
// PUT sửa theo mã cũ `orig`; đổi mã định danh thì backend chuyển luôn nhóm và lịch đặt sang mã mới.
export const saveUserApi = (u: UserInput, groupIds: number[], orig?: string) =>
  api<ApiUser>(orig ? `/admin/users/${encodeURIComponent(orig)}` : '/admin/users', orig ? 'PUT' : 'POST', {
    user_id: u.id, full_name: u.name, gender: u.sex, group_ids: groupIds,
    ...(orig && { status: u.active ? ACTIVE : INACTIVE }),
  }).then(toUser)
