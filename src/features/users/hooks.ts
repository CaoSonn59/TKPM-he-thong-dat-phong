// UI chỉ gọi các hook ở đây, không đụng store trực tiếp (DIP):
// khi nối backend, chỉ cần đổi phần ruột sang react-query, các màn hình giữ nguyên.
import { useShallow } from 'zustand/react/shallow'
import { useUsersStore } from './store'

export const useUsers = () => useUsersStore(s => s.users)
export const useUserActions = () => useUsersStore(useShallow(s => ({ saveUser: s.saveUser })))

export function useUserLabel() {
  const users = useUsers()
  return (id: string) => `${id} – ${users.find(u => u.id === id)?.name ?? ''}`
}
