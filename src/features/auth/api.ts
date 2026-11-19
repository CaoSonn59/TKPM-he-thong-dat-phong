import { api } from '../../shared/api/http'
import type { ApiUser } from '../users/api'

export interface LoginRes { token: string; expires_at: string; user: ApiUser }

export const loginApi = (id: string, password: string) =>
  api<LoginRes>('/auth/login', 'POST', { user_id: id.trim(), password })

// GET /auth/me — lấy thông tin tài khoản hiện tại kèm danh sách nhóm đang thuộc.
export const fetchMeApi = () => api<ApiUser>('/auth/me')

// PUT /auth/change-password — đổi mật khẩu (dùng chung cho End-User và Admin).
// skipAuthRedirect: nếu backend trả 401 khi nhập sai mật khẩu hiện tại, không tự đăng xuất người dùng.
export const changePasswordApi = (currentPassword: string, newPassword: string) =>
  api<void>(
    '/auth/change-password',
    'PUT',
    { current_password: currentPassword, new_password: newPassword, confirm_password: newPassword },
    { skipAuthRedirect: true },
  )
