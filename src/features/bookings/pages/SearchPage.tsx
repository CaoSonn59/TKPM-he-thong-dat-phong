// U3 / M3 — Tìm phòng trống (GET /rooms/available), U4 — Chi tiết phòng, U5 — Đặt phòng
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Empty, Field, Icon, MultiPick, Skeleton, inp } from '../../../shared/ui'
import { nowHM, today } from '../../../shared/lib/clock'
import { dmy, initials } from '../../../shared/lib/format'
import { useMe, useMyGroups } from '../../auth/hooks'
import { Rating } from '../../rooms/components/Rating'
import { useAvailableRoomsQuery } from '../../rooms/hooks'
import { AMENITIES, AM_ICON, cap, loc, type Room } from '../../rooms/model'
import { useToast } from '../../toast/hooks'
import { BookFormDialog } from '../components/BookFormDialog'
import { BookedDialog } from '../components/BookedDialog'
import { RoomDetailDialog } from '../components/RoomDetailDialog'
import { slotErrors, type SearchQuery } from '../logic'
import type { Booking } from '../model'

export default function SearchPage() {
  const me = useMe()
  const myGroups = useMyGroups()
  const toast = useToast()
  const [f, setF] = useState({ date: '', from: '', to: '', min: '', amenities: [] as string[], group: '' })
  const [q, setQ] = useState<SearchQuery | null>(null)
  const [err, setErr] = useState<{ date?: string; to?: string }>({})
  const [more, setMore] = useState(false)
  const [detail, setDetail] = useState<Room | null>(null)
  const [booking, setBooking] = useState<Room | null>(null)
  const [done, setDone] = useState<{ b: Booking; room: Room } | null>(null)
  const [lost, setLost] = useState('')

  const { data: results = [], isLoading, isFetching, error, refetch } = useAvailableRoomsQuery(q)
  const extra = +!!f.min + f.amenities.length + +!!f.group
  const todayStr = today()

  const search = (v = f) => {
    if (!v.date || !v.from || !v.to) return setErr({ date: !v.date ? 'Vui lòng chọn ngày' : undefined, to: !v.from || !v.to ? 'Vui lòng chọn khung giờ' : undefined })
    const e = slotErrors(v, today(), nowHM())
    setErr(e)
    if (Object.keys(e).length) return
    setLost('')
    const next: SearchQuery = { date: v.date, from: v.from, to: v.to, min: v.min ? +v.min : undefined, amenities: v.amenities, group: v.group }
    const same = q && q.date === next.date && q.from === next.from && q.to === next.to && q.min === next.min && q.amenities.join(',') === next.amenities.join(',')
    setQ(next)
    if (same) refetch()
  }
  const submit = (e: FormEvent) => { e.preventDefault(); search() }
  const relax = () => { const v = { ...f, min: '', amenities: [] }; setF(v); search(v) }

  return <>
    <div className="flex items-center justify-between">
      <h1 className="text-[22px] md:text-2xl font-bold"><span className="max-md:hidden">Tìm phòng trống</span><span className="md:hidden">Tìm phòng</span></h1>
      {me && <Link to="/tai-khoan" className="av w-10! h-10! text-sm! no-underline md:hidden" aria-label="Tài khoản">{initials(me.name)}</Link>}
    </div>
    <form className="p-3.5 md:p-5 bg-white border border-gray-200 rounded-2xl shadow-[0_6px_20px_rgba(17,24,39,.05)]" aria-label="Tìm phòng" onSubmit={submit} noValidate>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 md:gap-3 items-start">
        <Field label="Ngày" req id="s-date" err={err.date} className="max-md:col-span-2">
          <div className="field"><Icon n="cal" /><input id="s-date" type="date" min={todayStr} className={inp(err.date)} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></div>
        </Field>
        <Field label="Từ giờ" req id="s-from"><div className="field"><Icon n="clock" /><input id="s-from" type="time" step={1800} className="inp" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /></div></Field>
        <Field label="Đến giờ" req id="s-to" err={err.to}><div className="field"><Icon n="clock" /><input id="s-to" type="time" step={1800} className={inp(err.to)} value={f.to} onChange={e => setF({ ...f, to: e.target.value })} /></div></Field>
        <button type="button" className="more col-span-2 md:hidden" aria-expanded={more} onClick={() => setMore(!more)}>
          <span>Sức chứa, tiện ích, nhóm</span>
          <span className="flex items-center gap-1.5">{extra > 0 && <span className="cnt bg-indigo-700! text-white!" aria-label={`${extra} bộ lọc đang dùng`}>{extra}</span>}<Icon n={more ? 'up' : 'down'} s={16} /></span>
        </button>
        <div className={`${more ? 'contents' : 'hidden'} md:contents`}>
          <Field label="Sức chứa tối thiểu" id="s-min" className="max-md:col-span-2"><div className="field"><Icon n="users" /><input id="s-min" type="number" min={1} className="inp" placeholder="Số người" value={f.min} onChange={e => setF({ ...f, min: e.target.value })} /></div></Field>
          <Field label="Tiện ích" id="s-am" className="max-md:col-span-2"><MultiPick id="s-am" icon="filter" placeholder="Chọn tiện ích" options={AMENITIES.map(a => ({ value: a, text: a }))} value={f.amenities} onChange={amenities => setF({ ...f, amenities })} /></Field>
          <Field label="Nhóm sử dụng" id="s-group" className="max-md:col-span-2">
            <div className="field"><Icon n="person" /><select id="s-group" className="inp" value={f.group} onChange={e => setF({ ...f, group: e.target.value })}>
              <option value="">Cá nhân</option>{myGroups.map(g => <option key={g.id} value={g.id}>{g.count > 0 ? `${g.name} (${g.count})` : g.name}</option>)}
            </select></div>
          </Field>
        </div>
        <button className="btn bp big max-md:col-span-2 md:col-span-6 md:justify-self-start md:mt-0.5" disabled={isFetching}>
          <Icon n={isFetching ? 'spin' : 'search'} className={isFetching ? 'animate-spin' : ''} />{isFetching ? 'Đang tìm…' : 'Tìm kiếm'}
        </button>
      </div>
    </form>

    {lost && <div className="alert" role="alert"><Icon n="refresh" />Danh sách đã được tải lại. {lost} không còn trống.</div>}
    {error && <div className="alert" role="alert"><Icon n="alert" />Không tải được danh sách phòng trống: {error.message}</div>}

    {!q ? (
      <div className="card rounded-2xl!"><Empty icon="calDots" tone="bg-indigo-50 text-indigo-700" title="Chọn ngày giờ để xem phòng trống" text="Nhập ngày, khung giờ rồi bấm Tìm kiếm. Bạn có thể lọc thêm theo sức chứa và tiện ích." /></div>
    ) : isLoading ? (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 md:gap-4" aria-busy="true">
        {[1, 2, 3].map(i => (
          <div key={i} className="room">
            <Skeleton className="w-1/2 h-5!" /><Skeleton className="w-3/4" />
            <div className="flex gap-2"><Skeleton className="w-20 h-6!" /><Skeleton className="w-20 h-6!" /></div>
            <Skeleton className="w-1/3" />
            <div className="rf"><Skeleton className="flex-1 h-10!" /><Skeleton className="flex-1 h-10!" /></div>
          </div>
        ))}
        <p className="sr-only" role="status">Đang tìm phòng trống…</p>
      </div>
    ) : <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="md:text-base">Tìm thấy <strong>{results.length} phòng trống</strong> ngày {dmy(q.date)}, {q.from}–{q.to}</p>
        <p className="small muted max-md:hidden">Chỉ hiện phòng khả dụng và chưa có lịch trùng giờ</p>
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
              <div>
                <h2 className="text-[17px] font-bold">{r.name}</h2>
                <div className="meta mt-1.5">
                  <span><Icon n="pin" s={16} />{loc(r)}</span>
                  <span><Icon n="person" s={16} />{cap(r)} người</span>
                  <span className="md:hidden"><Rating r={r} compact /></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">{r.amenities.map(a => <span key={a} className="tag pill"><span className="max-md:hidden contents">{AM_ICON[a] && <Icon n={AM_ICON[a]} s={14} />}</span>{a}</span>)}</div>
              <div className="max-md:hidden"><Rating r={r} /></div>
              <div className="rf"><button className="btn flex-1" onClick={() => setDetail(r)}>Xem chi tiết</button><button className="btn bp flex-1" onClick={() => setBooking(r)}>Đặt phòng</button></div>
            </article>
          ))}
        </div>
      )}
    </>}

    {detail && q && <RoomDetailDialog r={detail} q={q} onClose={() => setDetail(null)} onBook={() => { setBooking(detail); setDetail(null) }} />}
    {booking && q && <BookFormDialog r={booking} q={q} onClose={() => setBooking(null)} onDone={b => { setDone({ b, room: booking }); setBooking(null) }}
      onLost={() => { toast('Phòng đã bị đặt, vui lòng chọn lại', `${booking.name} vừa được người khác đặt cùng khung giờ.`, true); setLost(booking.name); setBooking(null); refetch() }} />}
    {done && <BookedDialog b={done.b} room={done.room} onClose={() => setDone(null)} />}
  </>
}
