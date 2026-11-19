import { create } from 'zustand'
import { seed } from '../../mocks/seed'
import type { User } from './model'

// shortcut: dữ liệu mẫu (mật khẩu plain text) cho phía End-User; Admin đã đọc / ghi qua api.ts.
interface UsersState {
  users: User[]
  setPw(id: string, pw: string): void
}

export const useUsersStore = create<UsersState>()(set => ({
  users: seed.users,
  setPw: (id, pw) => set(s => ({ users: s.users.map(x => x.id === id ? { ...x, pw } : x) })),
}))
