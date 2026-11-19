import { create } from 'zustand'

export interface Toast { id: number; title: string; sub?: string; bad?: boolean }

interface ToastState {
  toasts: Toast[]
  toast(title: string, sub?: string, bad?: boolean): void
  dismiss(id: number): void
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  dismiss: id => set(s => ({ toasts: s.toasts.filter(x => x.id !== id) })),
  toast(title, sub, bad) {
    const id = Date.now() + Math.random()
    set(s => ({ toasts: [...s.toasts, { id, title, sub, bad }] }))
    setTimeout(() => get().dismiss(id), 4500)
  },
}))

// Gọi được cả ngoài component (trong store khác).
export const toast = (title: string, sub?: string, bad?: boolean) => useToastStore.getState().toast(title, sub, bad)
