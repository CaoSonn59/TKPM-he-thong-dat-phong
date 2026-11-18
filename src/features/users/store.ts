import { create } from 'zustand'
import { TODAY } from '../../mocks/clock'
import { seed } from '../../mocks/seed'
import { toast } from '../toast/store'
import { useGroupsStore } from '../groups/store'
import { useBookingsStore } from '../bookings/store'
import type { User } from './model'

// shortcut: dữ liệu mẫu (mật khẩu plain text) trong bộ nhớ; thay bằng react-query gọi /admin/users.
interface UsersState {
  users: User[]
  saveUser(u: Pick<User, 'id' | 'name' | 'sex' | 'active'>, groupIds: number[], orig?: string): string | null
  setPw(id: string, pw: string): void
}

export const useUsersStore = create<UsersState>()((set, get) => ({
  users: seed.users,
  saveUser(u, groupIds, orig) {
    if (u.id === 'admin' || (u.id !== orig && get().users.some(x => x.id === u.id))) return 'Mã định danh đã tồn tại, vui lòng nhập mã khác'
    set(s => ({
      users: orig
        ? s.users.map(x => x.id === orig ? { ...x, ...u, pw: x.pw === orig ? u.id : x.pw } : x)
        : [{ ...u, created: TODAY, pw: u.id }, ...s.users],
    }))
    useGroupsStore.setState(s => ({ groups: s.groups.map(g => ({ ...g, members: [...g.members.filter(m => m !== orig && m !== u.id), ...(groupIds.includes(g.id) ? [u.id] : [])] })) }))
    if (orig && orig !== u.id) useBookingsStore.setState(s => ({ bookings: s.bookings.map(b => b.by === orig ? { ...b, by: u.id } : b) }))
    toast(orig ? 'Cập nhật thành công' : 'Tạo người dùng thành công', `${u.id} – ${u.name}`)
    return null
  },
  setPw: (id, pw) => set(s => ({ users: s.users.map(x => x.id === id ? { ...x, pw } : x) })),
}))
