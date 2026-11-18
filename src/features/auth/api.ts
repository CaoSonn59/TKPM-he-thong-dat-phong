import { api } from '../../shared/api/http'

export interface ApiUser {
  user_id: string; full_name: string; gender: string; role: 'Admin' | 'User'; status: string
  created_at: string; groups: { group_id: number; group_name: string }[]
}
export interface LoginRes { token: string; expires_at: string; user: ApiUser }

export const loginApi = (id: string, password: string) =>
  api<LoginRes>('/auth/login', 'POST', { user_id: id.trim(), password })
