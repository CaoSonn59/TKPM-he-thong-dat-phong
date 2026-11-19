import { useToastStore } from './store'

export const useToast = () => useToastStore(s => s.toast)
export const useToasts = () => useToastStore(s => s.toasts)
export const useDismissToast = () => useToastStore(s => s.dismiss)
