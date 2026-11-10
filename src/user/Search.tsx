// U3 — Tìm phòng, U4 — Chi tiết phòng, U5 — Xác nhận đặt phòng / thành công / lỗi tranh chấp
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AMENITIES, NOW, TODAY, cap, code, dmy, loc, longDate, type Booking, type Room } from '../data'
import { freeRooms, slotErrors, type Query } from '../logic'
import { Rating } from '../parts'
import { useStore } from '../store'
import { AM_ICON, Empty, Field, Icon, Modal, MultiPick, Stars, inp } from '../ui'

type Q = Query & { group: string }

function RoomDetail({ r, q, onClose, onBook }: { r: Room; q: Q; onClose: () => void; onBook: () => void }) {
  const { bookings } = useStore()
  const reviews = bookings.filter(b => b.roomId === r.id && b.fb).sort((a, b) => b.fb!.at.localeCompare(a.fb!.at)).slice(0, 5)
  return (
    <Modal title={r.name} w="md:max-w-[640px]" onClose={onClose}
      head={<div><h2 className="text-xl font-bold">{r.name}</h2><div className="meta mt-1.5"><span><Icon n="pin" s={16} />{loc(r)}</span><span><Icon n="person" s={16} />{cap(r)} người</span><Rating r={r} /></div></div>}
      footer={<><button className="btn" onClick={onClose}>Đóng</button><button className="btn bp" onClick={onBook}>Đặt phòng này</button></>}>
      <section className="sec">
        <div className="flex items-center justify-between gap-3 px-3.5 py-3 border border-green-200 rounded-xl bg-green-50">
          <div><div className="small muted">Khung giờ bạn đang tìm</div><div className="font-semibold mt-0.5">{longDate(q.date)} · {q.from} – {q.to}</div></div>
          <span className="badge s-ok">Còn trống</span>
        </div>
      </section>
      <section className="sec">
        <h3 className="sh">Tiện ích</h3>
        {r.amenities.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {r.amenities.map(a => <div key={a} className="flex items-center gap-2 h-10 px-3 rounded-[10px] bg-gray-50 border border-gray-100 font-medium">{AM_ICON[a] && <Icon n={AM_ICON[a]} className="text-indigo-700" />}{a}</div>)}
          </div>
        ) : <p className="muted">Chưa khai báo tiện ích</p>}
      </section>
      <section className="sec">
        <h3 className="sh">Đánh giá gần đây</h3>
        {reviews.length ? <div>{reviews.map(b => (
          <div key={b.id} className="py-3 border-b border-gray-100 last:border-0">
            <div className="flex justify-between"><Stars n={b.fb!.stars} /><span className="small muted">{dmy(b.fb!.at)}</span></div>
            {b.fb!.text && <p className="mt-1">{b.fb!.text}</p>}
          </div>
        ))}</div> : <p className="muted">Chưa có đánh giá nào</p>}
      </section>
    </Modal>
  )
}

function BookForm({ r, q, onClose, onDone, onLost }: { r: Room; q: Q; onClose: () => void; onDone: (b: Booking) => void; onLost: () => void }) {
  const { myGroups, book } = useStore()
  const [title, setTitle] = useState('')
  const [group, setGroup] = useState(q.group)
  const [err, setErr] = useState('')
  const g = myGroups.find(x => x.id === +group)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setErr('Vui lòng nhập tiêu đề')
    const b = book({ title: title.trim(), roomId: r.id, groupId: g?.id ?? null, date: q.date, from: q.from, to: q.to })
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
        <Field label="Nhóm sử dụng" id="bk-group" hint={g && `Nhóm có ${g.members.length} thành viên`}>
          <select id="bk-group" className="inp" value={group} onChange={e => setGroup(e.target.value)}>
            <option value="">Cá nhân</option>{myGroups.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        {g && g.members.length > r.max && <div className="warn" role="status"><Icon n="warn" /><span>Nhóm có {g.members.length} thành viên, vượt sức chứa tối đa {r.max} của phòng. Bạn vẫn có thể gửi yêu cầu.</span></div>}
        <div className="flex gap-2.5 text-[13px] text-gray-600"><Icon n="info" className="text-gray-500" /><span>Yêu cầu sẽ ở trạng thái <strong className="text-amber-800">Chờ duyệt</strong> cho đến khi quản trị viên xác nhận.</span></div>
      </form>
    </Modal>
  )
}

function Booked({ b, onClose }: { b: Booking; onClose: () => void }) {
  const { roomOf, groupName } = useStore()
  const r = roomOf(b.roomId)
  return (
    <Modal bare title="Đặt phòng thành công" w="md:max-w-[500px]" onClose={onClose}
      footer={<><button className="btn flex-1" onClick={onClose}>Đặt phòng khác</button><Link className="btn bp flex-1" to="/lich-su">Xem lịch sử đặt phòng</Link></>}>
      <div className="flex flex-col items-center gap-3 px-7 pt-9 pb-6 text-center">
        <span className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-700"><Icon n="check" s={30} className="stroke-[2.5]" /></span>
        <h2 className="text-xl font-bold">Đặt phòng thành công</h2>
        <p className="muted">Yêu cầu đã được gửi tới quản trị viên.</p>
      </div>
      <div className="mx-6 mb-5 p-3.5 border border-gray-200 rounded-xl grid grid-cols-[110px_minmax(0,1fr)] gap-y-2 [&>:nth-child(odd)]:text-gray-500 [&>:nth-child(even)]:font-medium">
        <span>Mã đặt phòng</span><span className="font-bold! tabular-nums">{code(b)}</span>
        <span>Trạng thái</span><span><span className="badge s-wait">Chờ duyệt</span></span>
        <span>Tiêu đề</span><span>{b.title}</span>
        <span>Phòng</span><span>{r.name} · {loc(r)}</span>
        <span>Thời gian</span><span>{dmy(b.date)} · {b.from} – {b.to}</span>
        <span>Đặt cho</span><span>{groupName(b.groupId)}</span>
      </div>
    </Modal>
  )
}

export default function Search() {
  const { rooms, bookings, myGroups, toast } = useStore()
  const [f, setF] = useState({ date: '', from: '', to: '', min: '', amenities: [] as string[], group: '' })
  const [q, setQ] = useState<Q | null>(null) // lần tìm gần nhất; kết quả luôn tính lại từ dữ liệu hiện tại
  const [err, setErr] = useState<{ date?: string; to?: string }>({})
  const [more, setMore] = useState(false)
  const [detail, setDetail] = useState<Room | null>(null)
  const [booking, setBooking] = useState<Room | null>(null)
  const [done, setDone] = useState<Booking | null>(null)
  const [lost, setLost] = useState('')
  const results = q ? freeRooms(rooms, bookings, q) : []
  const extra = +!!f.min + +!!f.amenities.length + +!!f.group

  const search = (v = f) => {
    const e = v.date && v.from && v.to ? slotErrors(v, TODAY, NOW) : { date: 'Vui lòng chọn ngày và khung giờ' }
    setErr(e)
    if (!Object.keys(e).length) { setQ({ ...v, min: +v.min || undefined }); setLost('') }
  }
  const submit = (e: FormEvent) => { e.preventDefault(); search() }
  const relax = () => { const v = { ...f, min: '', amenities: [] }; setF(v); search(v) }

  return <>
    <h1 className="text-[22px] md:text-2xl font-bold">Tìm phòng trống</h1>
    <form className="p-3.5 md:p-5 bg-white border border-gray-200 rounded-2xl shadow-[0_6px_20px_rgba(17,24,39,.05)]" aria-label="Tìm phòng" onSubmit={submit} noValidate>
      <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 md:gap-3 items-start">
        <Field label="Ngày" req id="s-date" err={err.date} className="max-md:col-span-2">
          <div className="field"><Icon n="cal" /><input id="s-date" type="date" min={TODAY} className={inp(err.date)} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></div>
        </Field>
        <Field label="Từ giờ" req id="s-from"><div className="field"><Icon n="clock" /><input id="s-from" type="time" step={1800} className="inp" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /></div></Field>
        <Field label="Đến giờ" req id="s-to" err={err.to}><div className="field"><Icon n="clock" /><input id="s-to" type="time" step={1800} className={inp(err.to)} value={f.to} onChange={e => setF({ ...f, to: e.target.value })} /></div></Field>
        <button type="button" className="more col-span-2 md:hidden" aria-expanded={more} onClick={() => setMore(!more)}>
          <span>Sức chứa, tiện ích, nhóm</span>
          <span className="flex items-center gap-1.5">{extra > 0 && <span className="cnt bg-indigo-700! text-white!" aria-label={`${extra} bộ lọc đang dùng`}>{extra}</span>}<Icon n={more ? 'up' : 'down'} s={16} /></span>
        </button>
        <div className={`${more ? 'contents' : 'hidden'} md:contents`}>
          <Field label="Sức chứa tối thiểu" id="s-min" className="max-md:col-span-2"><div className="field"><Icon n="users" /><input id="s-min" type="number" min={1} className="inp" placeholder="Số người" value={f.min} onChange={e => setF({ ...f, min: e.target.value })} /></div></Field>
          <Field label="Tiện ích" id="s-am" className="max-md:col-span-2"><MultiPick id="s-am" placeholder="Chọn tiện ích" options={AMENITIES.map(a => ({ value: a, text: a }))} value={f.amenities} onChange={amenities => setF({ ...f, amenities })} /></Field>
          <Field label="Nhóm sử dụng" id="s-group" className="max-md:col-span-2">
            <div className="field"><Icon n="user" /><select id="s-group" className="inp" value={f.group} onChange={e => setF({ ...f, group: e.target.value })}>
              <option value="">Cá nhân</option>{myGroups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.members.length})</option>)}
            </select></div>
          </Field>
        </div>
        <button className="btn bp big max-md:col-span-2 md:mt-[25px]"><Icon n="search" />Tìm kiếm</button>
      </div>
    </form>

    {lost && <div className="alert" role="alert"><Icon n="alert" />Danh sách đã được tải lại. {lost} không còn trống.</div>}

    {!q ? (
      <div className="card rounded-2xl!"><Empty icon="calDots" tone="bg-indigo-50 text-indigo-700" title="Chọn ngày giờ để xem phòng trống" text="Nhập ngày, khung giờ rồi bấm Tìm kiếm. Bạn có thể lọc thêm theo sức chứa và tiện ích." /></div>
    ) : <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="md:text-base">Tìm thấy <strong>{results.length} phòng trống</strong> ngày {dmy(q.date)}, {q.from}–{q.to}</p>
        <p className="small muted">Chỉ hiện phòng khả dụng và chưa có lịch trùng giờ</p>
      </div>
      {results.length === 0 ? (
        <div className="card rounded-2xl!">
          <Empty icon="door" title="Không có phòng trống phù hợp với tiêu chí của bạn" text="Thử đổi khung giờ hoặc bớt yêu cầu tiện ích.">
            {(q.min || q.amenities.length > 0) && <button className="btn" onClick={relax}>Xóa bớt lọc</button>}
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 md:gap-4">
          {results.map(r => (
            <article key={r.id} className="room">
              <div><h2 className="text-[17px] font-bold">{r.name}</h2><div className="meta mt-1.5"><span><Icon n="pin" s={16} />{loc(r)}</span><span><Icon n="person" s={16} />{cap(r)} người</span></div></div>
              <div className="flex flex-wrap gap-1.5">{r.amenities.map(a => <span key={a} className="tag pill">{AM_ICON[a] && <Icon n={AM_ICON[a]} s={14} />}{a}</span>)}</div>
              <Rating r={r} />
              <div className="rf"><button className="btn flex-1" onClick={() => setDetail(r)}>Xem chi tiết</button><button className="btn bp flex-1" onClick={() => setBooking(r)}>Đặt phòng</button></div>
            </article>
          ))}
        </div>
      )}
    </>}

    {detail && q && <RoomDetail r={detail} q={q} onClose={() => setDetail(null)} onBook={() => { setBooking(detail); setDetail(null) }} />}
    {booking && q && <BookForm r={booking} q={q} onClose={() => setBooking(null)} onDone={b => { setBooking(null); setDone(b) }}
      onLost={() => { toast('Phòng đã bị đặt, vui lòng chọn lại', `${booking.name} vừa được người khác đặt cùng khung giờ.`, true); setLost(booking.name); setBooking(null) }} />}
    {done && <Booked b={done} onClose={() => setDone(null)} />}
  </>
}
