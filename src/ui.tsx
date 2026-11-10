// Thành phần giao diện dùng chung cho End-User, không phụ thuộc store.
import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { STATUS, type Status } from './data'

const P = {
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></>,
  ban: <><circle cx="12" cy="12" r="9" /><path d="m5.7 5.7 12.6 12.6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  warn: <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /><path d="M3 3l18 18" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6 9 17l-5-5" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  refresh: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  spin: <path d="M21 12a9 9 0 1 1-6.2-8.6" />,
  down: <path d="m6 9 6 6 6-6" />,
  up: <path d="m18 15-6-6-6 6" />,
  left: <path d="m15 18-6-6 6-6" />,
  right: <path d="m9 18 6-6-6-6" />,
  cal: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  calDots: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
  door: <path d="M3 21h18M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M14 12h.01" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  person: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /></>,
  users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 9M22 21a7 7 0 0 0-4-6.3" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" />,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  projector: <><rect x="2" y="7" width="20" height="10" rx="2" /><circle cx="16" cy="12" r="2.5" /><path d="M6 17v2M18 17v2" /></>,
  board: <><rect x="3" y="4" width="18" height="12" rx="1" /><path d="M12 16v4M8 20h8" /></>,
  tv: <><rect x="2" y="7" width="20" height="13" rx="2" /><path d="m8 3 4 4 4-4" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  speaker: <><rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="14" r="4" /><path d="M12 6h.01" /></>,
}
export type IconName = keyof typeof P
export const AM_ICON: Record<string, IconName | undefined> = { 'Máy chiếu': 'projector', 'Bảng trắng': 'board', TV: 'tv', Micro: 'mic', Loa: 'speaker' }

export const Icon = ({ n, s = 18, className = '' }: { n: IconName; s?: number; className?: string }) =>
  <svg className={`i ${className}`} width={s} height={s} viewBox="0 0 24 24" aria-hidden="true">{P[n]}</svg>

export const Badge = ({ s }: { s: Status }) => <span className={`badge ${STATUS[s][1]}`}>{STATUS[s][0]}</span>

export const Stars = ({ n, className = '' }: { n: number; className?: string }) => (
  <span role="img" aria-label={`${n} trên 5 sao`} className={`text-amber-600 tracking-[2px] ${className}`}>
    {'★'.repeat(n)}<span className="text-gray-300">{'★'.repeat(5 - n)}</span>
  </span>
)

export const inp = (err?: unknown) => `inp ${err ? 'bad' : ''}`

export function Field({ label, id, req, opt, hint, err, className, children }: {
  label: string; id?: string; req?: boolean; opt?: boolean; hint?: ReactNode; err?: string; className?: string; children: ReactNode
}) {
  return (
    <div className={className}>
      <label className="lb" htmlFor={id}>{label} {req && <span className="req">*</span>}{opt && <span className="font-normal text-gray-500">(không bắt buộc)</span>}</label>
      {children}
      {err && <div className="err" role="alert"><Icon n="alert" s={16} />{err}</div>}
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}

export function PwInput({ bad, ...p }: InputHTMLAttributes<HTMLInputElement> & { bad?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input {...p} type={show ? 'text' : 'password'} className={`${inp(bad)} pr-11`} />
      <button type="button" className="eye" aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShow(!show)}><Icon n={show ? 'eyeOff' : 'eye'} /></button>
    </div>
  )
}

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

export function Confirm({ title, children, icon = 'x', tone = 'red', ok = 'Đồng ý', cancel = 'Hủy', reason, hint, placeholder, onOk, onClose }: {
  title: string; children: ReactNode; icon?: IconName; tone?: 'red' | 'green'; ok?: string; cancel?: string
  reason?: string; hint?: string; placeholder?: string; onOk: (reason: string) => void; onClose: () => void
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
            <textarea id="cf-reason" className="inp" placeholder={placeholder} value={text} onChange={e => setText(e.target.value)} />
            {hint && <div className="hint">{hint}</div>}
          </>}
        </div>
      </div>
      <div className="mf">
        <button className="btn" onClick={onClose}>{cancel}</button>
        <button className={`btn ${tone === 'red' ? 'bd' : 'bp'}`} onClick={() => onOk(text)}>{ok}</button>
      </div>
    </Dlg>
  )
}

export function Empty({ icon = 'search', tone = 'bg-gray-100 text-gray-500', title, text, children }: {
  icon?: IconName; tone?: string; title: string; text?: string; children?: ReactNode
}) {
  return (
    <div className="state">
      <span className={`w-12 h-12 flex items-center justify-center rounded-full ${tone}`}><Icon n={icon} /></span>
      <div className="font-semibold">{title}</div>
      {text && <p className="muted max-w-[360px]">{text}</p>}
      {children}
    </div>
  )
}

export interface Opt { value: string; text: string; taken?: boolean }
// Ô chọn nhiều dạng chip + gợi ý.
export function MultiPick({ options, value, onChange, placeholder, free, id, takenNote, label, icon }: {
  options: Opt[]; value: string[]; onChange: (v: string[]) => void; placeholder?: string; free?: boolean; id?: string; takenNote?: string; label?: string; icon?: IconName
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const shown = options.filter(o => o.text.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
  const text = (v: string) => options.find(o => o.value === v)?.text ?? v
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  return (
    <div className="relative" onBlur={e => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <div className="multi">
        {icon && value.length === 0 && <Icon n={icon} s={16} className="text-gray-500 ml-0.5" />}
        {value.map(v => (
          <span key={v} className="chip">{text(v)}
            <button type="button" aria-label={`Bỏ ${text(v)}`} onClick={() => toggle(v)}><Icon n="x" s={16} /></button>
          </span>
        ))}
        <input id={id} aria-label={label} role="combobox" aria-expanded={open} value={q} placeholder={value.length ? '' : placeholder}
          onFocus={() => setOpen(true)} onChange={e => { setQ(e.target.value); setOpen(true) }}
          onKeyDown={e => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            const t = q.trim()
            if (free && t) { if (!value.includes(t)) onChange([...value, t]) }
            else if (t && shown[0] && !shown[0].taken) toggle(shown[0].value)
            setQ('')
          }} />
      </div>
      {open && shown.length > 0 && (
        <div className="dd" role="listbox" aria-multiselectable="true" onMouseDown={e => e.preventDefault()}>
          {shown.map(o => {
            const on = value.includes(o.value)
            return (
              <button key={o.value} type="button" role="option" aria-selected={on} disabled={o.taken} className="di" onClick={() => toggle(o.value)}>
                <span className={`ck ${on ? 'on' : ''}`}>{(on || o.taken) && <Icon n="check" s={12} className="stroke-3" />}</span>
                {o.text}{o.taken && <span className="small ml-auto">{takenNote}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

