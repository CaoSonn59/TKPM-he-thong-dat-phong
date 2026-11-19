import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Icon } from './Icon'

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

export interface Opt { value: string; text: string; taken?: boolean }
// Ô chọn nhiều dạng chip + gợi ý. `free`: cho nhập thêm giá trị mới bằng Enter.
export function MultiPick({ options, value, onChange, placeholder, free, id, takenNote, label }: {
  options: Opt[]; value: string[]; onChange: (v: string[]) => void; placeholder?: string; free?: boolean; id?: string; takenNote?: string; label?: string
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const shown = options.filter(o => o.text.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
  const text = (v: string) => options.find(o => o.value === v)?.text ?? v
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  return (
    <div className="relative" onBlur={e => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <div className="multi">
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
        // preventDefault giữ focus ở ô nhập để danh sách không đóng trước khi click kịp chạy (Safari)
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
