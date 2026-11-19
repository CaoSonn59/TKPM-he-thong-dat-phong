// U5 / M5 — Xác nhận đặt phòng (POST /bookings)
import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../shared/api/http'
import { Field, Icon, Modal, inp } from '../../../shared/ui'
import { longDate } from '../../../shared/lib/format'
import { useMyGroups } from '../../auth/hooks'
import { cap, loc, type Room } from '../../rooms/model'
import { useCreateBooking } from '../hooks'
import type { SearchQuery } from '../logic'
import type { Booking } from '../model'

export function BookFormDialog({ r, q, onClose, onDone, onLost }: { r: Room; q: SearchQuery; onClose: () => void; onDone: (b: Booking) => void; onLost: () => void }) {
  const myGroups = useMyGroups()
  const createBooking = useCreateBooking()
  const [title, setTitle] = useState('')
  const [group, setGroup] = useState(q.group)
  const [err, setErr] = useState('')
  const [formErr, setFormErr] = useState('')
  const g = myGroups.find(x => x.id === +group)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setErr('Vui lòng nhập tiêu đề')
    setFormErr('')
    createBooking.mutate(
      { title: title.trim(), roomId: r.id, groupId: g?.id ?? null, date: q.date, from: q.from, to: q.to },
      {
        onSuccess: b => onDone(b),
        onError: error => {
          const isConflict = (error instanceof ApiError && error.status === 409) || /trùng|không còn trống|đã bị đặt|bảo trì/i.test(error.message)
          if (isConflict) onLost()
          else setFormErr(error.message)
        },
      },
    )
  }

  return (
    <Modal title="Xác nhận đặt phòng" w="md:max-w-[500px]" onClose={onClose}
      footer={<>
        <button className="btn" disabled={createBooking.isPending} onClick={onClose}>Hủy</button>
        <button className="btn bp max-md:flex-1" disabled={createBooking.isPending} form="book-form">
          {createBooking.isPending ? 'Đang gửi…' : 'Xác nhận đặt phòng'}
        </button>
      </>}>
      <form id="book-form" className="mb gap-4!" onSubmit={submit} noValidate>
        {formErr && <div className="alert" role="alert"><Icon n="alert" />{formErr}</div>}
        <div className="sum flex justify-between gap-3">
          <div><div className="font-bold">{r.name}</div><div className="small muted">{loc(r)} · {cap(r)} người</div><div className="mt-1.5 font-medium">{longDate(q.date)} · {q.from} – {q.to}</div></div>
          <button type="button" className="lnk self-start" disabled={createBooking.isPending} onClick={onClose}>Đổi</button>
        </div>
        <Field label="Tiêu đề cuộc họp / buổi học" req id="bk-title" err={err}>
          <input id="bk-title" className={inp(err)} placeholder="Ví dụ: Họp nhóm đồ án KTTKPM" value={title}
            disabled={createBooking.isPending} onChange={e => { setTitle(e.target.value); setErr('') }} />
        </Field>
        <Field label="Nhóm sử dụng" id="bk-group" hint={g && g.count > 0 && `Nhóm có ${g.count} thành viên`}>
          <select id="bk-group" className="inp" value={group} disabled={createBooking.isPending} onChange={e => setGroup(e.target.value)}>
            <option value="">Cá nhân</option>{myGroups.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        {g && g.count > r.max && (
          <div className="warn" role="status"><Icon n="warn" /><span>Nhóm có {g.count} thành viên, vượt sức chứa tối đa {r.max} của phòng.<span className="max-md:hidden"> Bạn vẫn có thể gửi yêu cầu.</span></span></div>
        )}
        <div className="flex gap-2.5 text-[13px] text-gray-600"><Icon n="info" className="text-gray-500 max-md:hidden" /><span>Yêu cầu sẽ ở trạng thái <strong className="text-amber-800">Chờ duyệt</strong> cho đến khi quản trị viên xác nhận.</span></div>
      </form>
    </Modal>
  )
}
