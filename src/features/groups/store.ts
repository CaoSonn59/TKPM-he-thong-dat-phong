import { create } from 'zustand'
import { TODAY } from '../../mocks/clock'
import { seed } from '../../mocks/seed'
import { nextId } from '../../shared/lib/nextId'
import { toast } from '../toast/store'
import type { Group } from './model'

// shortcut: dữ liệu mẫu trong bộ nhớ; thay bằng react-query gọi /admin/groups.
interface GroupsState {
  groups: Group[]
  saveGroup(g: { id: number; name: string; members: string[] }): string | null
  deleteGroup(id: number): void
}

export const useGroupsStore = create<GroupsState>()((set, get) => ({
  groups: seed.groups,
  saveGroup(g) {
    if (get().groups.some(x => x.id !== g.id && x.name === g.name)) return 'Tên nhóm đã tồn tại, vui lòng nhập tên khác'
    set(s => ({ groups: g.id ? s.groups.map(x => x.id === g.id ? { ...x, ...g } : x) : [...s.groups, { ...g, id: nextId(s.groups), created: TODAY }] }))
    toast(g.id ? 'Cập nhật nhóm thành công' : 'Tạo nhóm thành công', g.name)
    return null
  },
  deleteGroup: id => set(s => ({ groups: s.groups.filter(g => g.id !== id) })),
}))
