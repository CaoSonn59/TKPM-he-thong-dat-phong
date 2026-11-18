// Định tuyến: trang đăng nhập dùng chung; sau đó chuyển hướng theo quyền.
import { Navigate, Route, Routes } from 'react-router-dom'
import { useIsAdmin, useSession } from '../features/auth/hooks'
import LoginPage from '../features/auth/pages/LoginPage'
import AccountPage from '../features/auth/pages/AccountPage'
import AdminBookingsPage from '../features/bookings/pages/AdminBookingsPage'
import HistoryPage from '../features/bookings/pages/HistoryPage'
import SearchPage from '../features/bookings/pages/SearchPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import GroupFormPage from '../features/groups/pages/GroupFormPage'
import GroupsPage from '../features/groups/pages/GroupsPage'
import ReportsPage from '../features/reports/pages/ReportsPage'
import RoomsPage from '../features/rooms/pages/RoomsPage'
import UsersPage from '../features/users/pages/UsersPage'
import AdminLayout from '../layouts/AdminLayout'
import UserLayout from '../layouts/UserLayout'

export default function App() {
  const session = useSession()
  const isAdmin = useIsAdmin()
  if (!session) return <LoginPage />
  if (isAdmin) return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dat-phong" element={<AdminBookingsPage />} />
        <Route path="phong" element={<RoomsPage />} />
        <Route path="nguoi-dung" element={<UsersPage />} />
        <Route path="nhom" element={<GroupsPage />} />
        <Route path="nhom/:id" element={<GroupFormPage />} />
        <Route path="bao-cao" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<SearchPage />} />
        <Route path="lich-su" element={<HistoryPage />} />
        <Route path="tai-khoan" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
