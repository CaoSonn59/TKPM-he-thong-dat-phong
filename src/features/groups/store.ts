import { create } from 'zustand'
import { seed } from '../../mocks/seed'
import type { Group } from './model'

// shortcut: chỉ còn phục vụ phía End-User (nhóm của tôi, thành viên trong lịch đặt); Admin đã đọc / ghi qua api.ts.
interface GroupsState { groups: Group[] }

export const useGroupsStore = create<GroupsState>()(() => ({ groups: seed.groups }))
