import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

// <dialog> gốc của trình duyệt: có sẵn khóa focus, Esc để đóng, lớp phủ.
function Dlg({ label, onClose, className, children }: { label: string; onClose: () => void; className: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (!ref.current!.open) ref.current!.showModal() }, [])
  return (
    <dialog ref={ref} aria-label={label} className={className} onClose={onClose} onMouseDown={e => e.target === ref.current && onClose()}>
      {children}
    </dialog>
  )
}

export function Modal({ title, head, bare, mobileBack, w = 'md:max-w-[560px]', onClose, children, footer }: {
  title: string; head?: ReactNode; bare?: boolean; mobileBack?: boolean; w?: string; onClose: () => void; children: ReactNode; footer?: ReactNode
}) {
  return (
    <Dlg label={title} onClose={onClose} className={`modal ${mobileBack ? 'max-md:h-full max-md:max-h-full max-md:rounded-none!' : ''} ${w}`}>
      {!bare && (
        <div className="flex items-start justify-between gap-3 px-6 py-[18px] border-b border-gray-200">
          {mobileBack ? (
            <div className="flex items-center gap-2.5">
              <button type="button" className="ib md:hidden -ml-2" aria-label="Quay lại" onClick={onClose}><Icon n="left" s={20} /></button>
              {head ?? <h2 className="text-lg font-bold">{title}</h2>}
            </div>
          ) : (head ?? <h2 className="text-lg font-bold">{title}</h2>)}
          <button type="button" className={`ib ${mobileBack ? 'max-md:hidden' : ''}`} aria-label="Đóng" onClick={onClose}><Icon n="x" /></button>
        </div>
      )}
      <div className="overflow-y-auto flex-1">{children}</div>
      {footer && <div className="mf">{footer}</div>}
    </Dlg>
  )
}

export const Drawer = ({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) =>
  <Dlg label={label} onClose={onClose} className="drawer">{children}</Dlg>

export function Confirm({ title, children, icon = 'x', tone = 'red', ok = 'Đồng ý', cancel = 'Hủy', reason, hint, placeholder, busy, onOk, onClose }: {
  title: string; children: ReactNode; icon?: IconName; tone?: 'red' | 'green'; ok?: string; cancel?: string
  reason?: string; hint?: string; placeholder?: string; busy?: boolean; onOk: (reason: string) => void; onClose: () => void
}) {
  const [text, setText] = useState('')
  return (
    <Dlg label={title} onClose={onClose} className="modal md:max-w-[460px]">
      <div className="flex gap-3.5 px-[22px] pt-[22px] pb-[18px]">
        <span className={`w-10 h-10 flex-none flex items-center justify-center rounded-full ${tone === 'red' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}><Icon n={icon} /></span>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold mb-1.5">{title}</h2>
          <div className="text-gray-600">{children}</div>
          {reason && <>
            <label className="lb mt-3.5" htmlFor="cf-reason">{reason}</label>
            <textarea id="cf-reason" className="inp" placeholder={placeholder} value={text} disabled={busy} onChange={e => setText(e.target.value)} />
            {hint && <div className="hint">{hint}</div>}
          </>}
        </div>
      </div>
      <div className="mf">
        <button className="btn" disabled={busy} onClick={onClose}>{cancel}</button>
        <button className={`btn ${tone === 'red' ? 'bd' : 'bp'}`} disabled={busy} onClick={() => onOk(text)}>{ok}</button>
      </div>
    </Dlg>
  )
}
