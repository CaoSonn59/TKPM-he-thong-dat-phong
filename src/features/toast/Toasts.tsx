import { Icon } from '../../shared/ui'
import { useDismissToast, useToasts } from './hooks'

export function Toasts() {
  const toasts = useToasts()
  const dismiss = useDismissToast()
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map(t => (
        <div key={t.id} className="toast" role={t.bad ? 'alert' : 'status'}>
          <span className={`w-7 h-7 flex-none flex items-center justify-center rounded-full ${t.bad ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}><Icon n={t.bad ? 'alert' : 'check'} s={16} /></span>
          <div><div className="font-semibold">{t.title}</div>{t.sub && <div className="small muted">{t.sub}</div>}</div>
          <button className="ib ml-auto w-[30px]! h-[30px]!" aria-label="Đóng thông báo" onClick={() => dismiss(t.id)}><Icon n="x" s={16} /></button>
        </div>
      ))}
    </div>
  )
}
