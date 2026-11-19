// U5 — Xác nhận đặt phòng
import { useState, type FormEvent } from 'react'
import { Field, Icon, Modal, inp } from '../../../shared/ui'
import { longDate } from '../../../shared/lib/format'
import { useMe, useMyGroups } from '../../auth/hooks'
import { cap, loc, type Room } from '../../rooms/model'
import { useBookingActions } from '../hooks'
import type { SearchQuery } from '../logic'
import type { Booking } from '../model'

export function BookFormDialog({ r, q, onClose, onDone, onLost }: { r: Room; q: SearchQuery; onClose: () => void; onDone: (b: Booking) => void; onLost: () => void }) {
  const me = useMe()
  const myGroups = useMyGroups()
  const { book } = useBookingActions()
  const [title, setTitle] = useState('')
  const [group, setGroup] = useState(q.group)
  const [err, setErr] = useState('')
  const g = myGroups.find(x => x.id === +group)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setErr('Vui lòng nhập tiêu đề')
    const b = me && book({ title: title.trim(), roomId: r.id, groupId: g?.id ?? null, date: q.date, from: q.from, to: q.to }, me.id)
    if (b) onDone(b); else onLost()
  }
  return (
    <Modal title="Xác nhận đặt phòng" w="md:max-w-[500px]" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn bp max-md:flex-1" form="book-form">Xác nhận đặt phòng</button></>}>
      <form id="book-form" className="mb gap-4!" onSubmit={submit} noValidate>
        <div className="sum flex justify-between gap-3">
          <div><div className="font-bold">{r.name}</div><div className="small muted">{loc(r)} · {cap(r)} người</div><div className="mt-1.5 font-medium">{longDate(q.date)} · {q.from} – {q.to}</div></div>
          <button type="button" className="lnk self-start" onClick={onClose}>Đổi</button>
        </div>
        <Field label="Tiêu đề cuộc họp / buổi học" req id="bk-title" err={err}>
          <input id="bk-title" className={inp(err)} placeholder="Ví dụ: Họp nhóm đồ án KTTKPM" value={title} onChange={e => { setTitle(e.target.value); setErr('') }} />
        </Field>
        <Field label="Nhóm sử dụng" id="bk-group" hint={g && `Nhóm có ${g.count} thành viên`}>
          <select id="bk-group" className="inp" value={group} onChange={e => setGroup(e.target.value)}>
            <option value="">Cá nhân</option>{myGroups.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        {g && g.count > r.max && <div className="warn" role="status"><Icon n="warn" /><span>Nhóm có {g.count} thành viên, vượt sức chứa tối đa {r.max} của phòng. Bạn vẫn có thể gửi yêu cầu.</span></div>}
        <div className="flex gap-2.5 text-[13px] text-gray-600"><Icon n="info" className="text-gray-500" /><span>Yêu cầu sẽ ở trạng thái <strong className="text-amber-800">Chờ duyệt</strong> cho đến khi quản trị viên xác nhận.</span></div>
      </form>
    </Modal>
  )
}
