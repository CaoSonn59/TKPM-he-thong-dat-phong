import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { StoreProvider, useStore } from './store'
import { Toasts } from './parts'
import Login from './Login'
import UserLayout from './user/UserLayout'
import Search from './user/Search'
import History from './user/History'
import Account from './user/Account'

const isStandardWeb = typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:') && !window.location.pathname.endsWith('.html')
const Router = isStandardWeb ? BrowserRouter : MemoryRouter

// Giao diện End-User (branch user — tách biệt hoàn toàn với phần Admin).
function App() {
  const { session } = useStore()
  if (!session) return <Login />
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
    <Router>
      <StoreProvider>
        <App />
        <Toasts />
      </StoreProvider>
    </Router>
  </StrictMode>,
)


