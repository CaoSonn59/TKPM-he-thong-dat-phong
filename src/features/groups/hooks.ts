// UI chỉ gọi các hook ở đây, không đụng store trực tiếp (DIP):
// khi nối backend, chỉ cần đổi phần ruột sang react-query, các màn hình giữ nguyên.
import { useShallow } from 'zustand/react/shallow'
import { useGroupsStore } from './store'

export const useGroups = () => useGroupsStore(s => s.groups)
export const useGroupActions = () => useGroupsStore(useShallow(s => ({ saveGroup: s.saveGroup, deleteGroup: s.deleteGroup })))

export function useGroupName() {
  const groups = useGroups()
  return (id: number | null) => id === null ? 'Cá nhân' : groups.find(g => g.id === id)?.name ?? '(nhóm đã xóa)'
}
