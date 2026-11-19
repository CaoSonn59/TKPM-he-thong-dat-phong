import { api } from '../../shared/api/http'
import type { ApiUser } from '../users/api'
export interface LoginRes { token: string; expires_at: string; user: ApiUser }

export const loginApi = (id: string, password: string) =>
  api<LoginRes>('/auth/login', 'POST', { user_id: id.trim(), password })
