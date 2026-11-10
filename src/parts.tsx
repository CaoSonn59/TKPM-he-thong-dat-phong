// Thành phần dùng chung của End-User & Admin có đọc store: toast, menu tài khoản, đổi mật khẩu, các khối chi tiết lịch đặt.
import { useState, type FormEvent, type ReactNode } from 'react'
import { cap, dmy, initials, loc, type Booking, type Room } from './data'
import { strength, type PwErr } from './logic'
import { useStore } from './store'
import { Field, Icon, Modal, PwInput } from './ui'

export function Toasts() {
  const { toasts, dismiss } = useStore()
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

const METER = [['', '#E5E7EB', ''], ['Yếu', '#DC2626', '#B91C1C'], ['Trung bình', '#D97706', '#92400E'], ['Khá', '#D97706', '#92400E'], ['Mạnh', '#16A34A', '#166534']]

// U10 / M10 / A13 — Đổi mật khẩu dùng chung cho End-User và Admin. Thành công thì store tự đăng xuất về trang Đăng nhập.
export function ChangePassword({ onClose }: { onClose: () => void }) {
  const { changePw, session } = useStore()
  const [v, setV] = useState({ cur: '', next: '', again: '' })
  const [e, setE] = useState<PwErr>({})
  const s = strength(v.next)
  const set = (k: keyof typeof v) => (ev: { target: { value: string } }) => setV({ ...v, [k]: ev.target.value })
  const submit = (ev: FormEvent) => { ev.preventDefault(); setE(changePw(v.cur, v.next, v.again)) }
  return (
    <Modal title="Đổi mật khẩu" mobileBack w="md:max-w-[480px]" onClose={onClose}
      footer={<><button className="btn max-md:hidden" onClick={onClose}>Hủy</button><button className="btn bp max-md:w-full" form="pw-form">Đổi mật khẩu</button></>}>
      <form id="pw-form" className="mb" onSubmit={submit}>
        <Field label="Mật khẩu hiện tại" req id="pw-cur" err={e.cur}>
          <PwInput id="pw-cur" bad={!!e.cur} value={v.cur} onChange={set('cur')} autoComplete="current-password" />
        </Field>
        <Field label="Mật khẩu mới" req id="pw-next" err={e.next}
          hint={`Tối thiểu 6 ký tự, khác mật khẩu hiện tại và khác ${session === 'admin' ? 'tên đăng nhập' : 'mã định danh'}.`}>
          <PwInput id="pw-next" bad={!!e.next} value={v.next} onChange={set('next')} autoComplete="new-password" />
          <div className="flex items-center gap-2.5 mt-2">
            <div className="grid grid-cols-4 gap-1 flex-1">{[1, 2, 3, 4].map(i => <span key={i} className="h-1.5 rounded-sm" style={{ background: i <= s ? METER[s][1] : '#E5E7EB' }} />)}</div>
            <span className="small font-semibold min-w-16 text-right" style={{ color: METER[s][2] }}>{METER[s][0]}</span>
          </div>
        </Field>
        <Field label="Nhập lại mật khẩu mới" req id="pw-again" err={e.again}>
          <PwInput id="pw-again" bad={!!e.again} value={v.again} onChange={set('again')} autoComplete="new-password" />
        </Field>
      </form>
    </Modal>
  )
}

export function AccountMenu({ initials: ini, label, wide, children }: { initials: string; label: string; wide?: boolean; children: ReactNode }) {
  const { logout } = useStore()
  const [open, setOpen] = useState(false)
  const [pw, setPw] = useState(false)
  return (
    <div className="relative">
      <button className="acct" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="av">{ini}</span>{label}<Icon n={open ? 'up' : 'down'} s={16} />
      </button>
      {open && <>
        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
        <div className={`menu ${wide ? 'w-[300px]!' : ''}`} role="menu">
          {children}
          <button className="mi" role="menuitem" onClick={() => { setOpen(false); setPw(true) }}><Icon n="lock" className="text-gray-600" />Đổi mật khẩu</button>
          <button className="mi red" role="menuitem" onClick={logout}><Icon n="logout" />Đăng xuất</button>
        </div>
      </>}
      {pw && <ChangePassword onClose={() => setPw(false)} />}
    </div>
  )
}

export const Rating = ({ r, compact }: { r: Room; compact?: boolean }) => r.rate
  ? <span className="star"><Icon n="star" s={16} className="fill-amber-400 stroke-amber-600" />{r.rate.toFixed(1)}{!compact && <span className="muted small font-normal"> ({r.votes} lượt)</span>}</span>
  : <span className="muted small">Chưa có đánh giá</span>

export const RoomDl = ({ r }: { r: Room }) => (
  <dl className="dl">
    <dt>Phòng</dt><dd>{r.name}</dd>
    <dt>Sức chứa</dt><dd>{cap(r)} người</dd>
    <dt>Vị trí</dt><dd>{loc(r)}</dd>
    <dt>Tiện ích</dt><dd><div className="flex flex-wrap gap-1.5">{r.amenities.map(a => <span key={a} className="tag pill">{a}</span>)}</div></dd>
  </dl>
)

// Chỉ hiện khi Không chấp nhận / Đã hủy và có nhập lý do.
export function ReasonBox({ b, self }: { b: Booking; self?: boolean }) {
  if (!b.reason?.text) return null
  return (
    <section className="sec pb-1! border-0!">
      <div className="reason">
        <div className="font-semibold">{b.status === 'no' ? 'Lý do từ chối' : 'Lý do hủy'}</div>
        <p className="mt-1">{b.reason.text}</p>
        <p className="small mt-1.5 text-red-800">{b.reason.by === 'admin' ? 'Quản trị viên' : self ? 'Bạn' : 'Người đặt'} · {dmy(b.reason.at)}</p>
      </div>
    </section>
  )
}

export function Members({ b, avatars, search }: { b: Booking; avatars?: boolean; search?: boolean }) {
  const { users, groups, session } = useStore()
  const [open, setOpen] = useState(b.status !== 'no' && b.status !== 'cancel')
  const [all, setAll] = useState(false)
  const [q, setQ] = useState('')
  const g = groups.find(x => x.id === b.groupId)
  if (!g) return null
  const list = g.members
    .map(id => users.find(u => u.id === id))
    .filter((u): u is NonNullable<typeof u> => !!u && `${u.id} ${u.name}`.toLowerCase().includes(q.toLowerCase()))
  const shown = all || q ? list : list.slice(0, 5)
  return (
    <section className="sec">
      <div className="flex items-center justify-between">
        <h3 className="sh">Thành viên tham gia · {g.members.length}</h3>
        <button className="lnk" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Thu gọn' : 'Mở rộng'}</button>
      </div>
      {open && <>
        {search && <div className="field"><Icon n="search" s={16} /><input className="inp h-[38px]!" type="search" placeholder="Tìm theo mã hoặc họ tên" aria-label="Tìm thành viên" value={q} onChange={e => setQ(e.target.value)} /></div>}
        <div>
          {shown.map(u => avatars
            ? <div key={u.id} className="mem"><span className="av">{initials(u.name)}</span><div><div className="font-medium">{u.name}</div><div className="muted small">{u.id}{u.id === b.by && ' · người đặt'}</div></div></div>
            : <div key={u.id} className="mem justify-between"><span>{u.name} {u.id === session && <span className="muted small">(bạn)</span>}</span><span className="muted small">{u.id}</span></div>)}
        </div>
        {!all && !q && list.length > 5 && <button className="lnk self-start" onClick={() => setAll(true)}>Xem thêm {list.length - 5} thành viên</button>}
      </>}
    </section>
  )
}

