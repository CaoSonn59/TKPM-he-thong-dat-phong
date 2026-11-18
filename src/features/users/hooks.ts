// UI chỉ gọi các hook ở đây, không đụng store / API trực tiếp (DIP).
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useIsAdmin } from '../auth/hooks'
import { fetchUsers } from './api'
import type { User } from './model'
import { useUsersStore } from './store'

const KEY = ['users']
const NONE: User[] = []

// Admin: GET /admin/users.
export const useUsersQuery = () => useQuery({ queryKey: KEY, queryFn: fetchUsers, enabled: useIsAdmin() })

export function useUsers() {
  const isAdmin = useIsAdmin()
  const { data } = useUsersQuery()
  const mock = useUsersStore(s => s.users)
  return isAdmin ? data ?? NONE : mock
}

export const useUserActions = () => useUsersStore(useShallow(s => ({ saveUser: s.saveUser })))

export function useUserLabel() {
  const users = useUsers()
  return (id: string) => `${id} – ${users.find(u => u.id === id)?.name ?? ''}`
}
