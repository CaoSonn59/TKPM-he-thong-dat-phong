import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { configureHttp } from '../shared/api/http'
import { useAuthStore } from '../features/auth/store'
import { Toasts } from '../features/toast/Toasts'
import App from './App'

// Composition root: nối http client với phiên đăng nhập (DIP) rồi dựng các provider.
configureHttp({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().logout(), // token hết hạn / tài khoản bị khóa → về màn đăng nhập
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toasts />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
