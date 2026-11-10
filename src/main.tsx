import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { StoreProvider, useStore } from './store'
import { Toasts } from './parts'
import Login from './Login'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Bookings from './admin/Bookings'
import Rooms from './admin/Rooms'
import Users from './admin/Users'
import Groups from './admin/Groups'
import GroupForm from './admin/GroupForm'
import Reports from './admin/Reports'
import UserLayout from './user/UserLayout'
import Search from './user/Search'
import History from './user/History'
import Account from './user/Account'

// Trang đăng nhập dùng chung; hệ thống chuyển hướng theo quyền.
function App() {
  const { session } = useStore()
  if (!session) return <Login />
  if (session === 'admin') return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dat-phong" element={<Bookings />} />
        <Route path="phong" element={<Rooms />} />
        <Route path="nguoi-dung" element={<Users />} />
        <Route path="nhom" element={<Groups />} />
        <Route path="nhom/:id" element={<GroupForm />} />
        <Route path="bao-cao" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<Search />} />
        <Route path="lich-su" element={<History />} />
        <Route path="tai-khoan" element={<Account />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
        <Toasts />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
