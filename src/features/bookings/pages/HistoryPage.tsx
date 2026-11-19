// U6 / M6 — Lịch sử đặt phòng (GET /bookings/my), U8 — Hủy (PUT /bookings/:id/cancel), U9 — Đánh giá
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Confirm, Empty, Icon, Skeleton, SkeletonRows } from '../../../shared/ui'
import { today } from '../../../shared/lib/clock'
import { useMe, useMyGroups } from '../../auth/hooks'
import { useGroupName } from '../../groups/hooks'
import { useRoomOf } from '../../rooms/hooks'
import { useUserLabel } from '../../users/hooks'
import { RateDialog } from '../components/RateDialog'
import { StatusBadge } from '../components/StatusBadge'
import { UserBookingDetail } from '../components/UserBookingDetail'
import { useCancelMyBooking, useMyBookingsQuery } from '../hooks'
import { canCancel, canRate } from '../logic'
import { STATUS, STATUSES, when, type Booking, type Status } from '../model'

const COLS = ['w-44', 'w-24', 'w-32', 'w-28', 'w-24', 'w-24', 'w-20 ml-auto']

export default function HistoryPage() {
  const { data: all = [], isLoading, error } = useMyBookingsQuery()
  const me = useMe()
  const myGroups = useMyGroups()
  const roomOf = useRoomOf()
  const groupName = useGroupName()
  const userLabel = useUserLabel()
  const cancelBooking = useCancelMyBooking()
  const [tab, setTab] = useState<Status | ''>('')
  const [f, setF] = useState({ src: '', from: '', to: '' })
  const [view, setView] = useState<number | null>(null)
  const [cancel, setCancel] = useState<Booking | null>(null)
  const [rate, setRate] = useState<Booking | null>(null)
  const id = me!.id
  const todayStr = today()

  const mine = all.filter(b => (!f.src || (f.src === 'self' ? b.groupId === null : b.groupId === +f.src)) && (!f.from || b.date >= f.from) && (!f.to || b.date <= f.to))
  const list = mine.filter(b => !tab || b.status === tab)
  const key = (b: Booking) => b.date + b.from
  // Lịch sắp diễn ra lên đầu, sau đó lịch cũ từ mới đến cũ.
  const sections: [string, Booking[]][] = [
    ['Sắp tới và đang diễn ra', list.filter(b => b.date >= todayStr).sort((a, b) => key(a).localeCompare(key(b)))],
    ['Đã qua', list.filter(b => b.date < todayStr).sort((a, b) => key(b).localeCompare(key(a)))],
  ]
  const viewing = all.find(b => b.id === view)
  const clear = () => { setF({ src: '', from: '', to: '' }); setTab('') }

  const roomLabel = (b: Booking) => b.roomName ?? roomOf(b.roomId).name
  const groupLabel = (b: Booking) => groupName(b.groupId, b.groupName)
  const acts = (b: Booking) => <>
    <button className="ab" onClick={() => setView(b.id)}>Xem</button>
    {canCancel(b, id) && <button className="ab red" onClick={() => setCancel(b)}>Hủy</button>}
    {canRate(b, id, todayStr) && <button className="ab pri" onClick={() => setRate(b)}>{b.fb ? 'Sửa đánh giá' : 'Đánh giá'}</button>}
  </>
  const who = (b: Booking) => b.by === id ? <span className="you">Bạn</span> : userLabel(b.by, b.byName)

  return <>
    <h1 className="text-[22px] md:text-2xl font-bold">Lịch sử đặt phòng</h1>
    {error && <div className="alert" role="alert"><Icon n="alert" />Không tải được lịch sử đặt phòng: {error.message}</div>}

    {!isLoading && !error && all.length === 0 ? (
      <div className="card rounded-2xl!"><Empty icon="cal" title="Bạn chưa có lịch đặt phòng nào"><Link className="btn bp" to="/">Tìm phòng ngay</Link></Empty></div>
    ) : (
      <section className="card rounded-[14px]! max-md:bg-transparent! max-md:border-0!">
        <div className="tabs max-md:-mx-4" role="tablist" aria-label="Lọc theo trạng thái">
          {(['', ...STATUSES] as const).map(s => (
            <button key={s} className={`tab ${tab === s ? 'on' : ''}`} role="tab" aria-selected={tab === s} onClick={() => setTab(s)}>
              {s ? STATUS[s][0] : 'Tất cả'} {isLoading ? <Skeleton className="w-5 h-4! inline-block" /> : <span className="tc">{mine.filter(b => !s || b.status === s).length}</span>}
            </button>
          ))}
        </div>
        <div className="filters max-md:px-0! max-md:border-0!">
          <label className="small muted" htmlFor="h-src">Nguồn</label>
          <select className="sel" id="h-src" value={f.src} onChange={e => setF({ ...f, src: e.target.value })}>
            <option value="">Tất cả</option><option value="self">Cá nhân</option>{myGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <input className="inp w-[150px]!" type="date" aria-label="Từ ngày" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} />
          <span className="muted">–</span>
          <input className="inp w-[150px]!" type="date" aria-label="Đến ngày" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} />
          <button className="btn gh" onClick={clear}>Xóa lọc</button>
        </div>

        {isLoading ? <>
          <div className="tw max-md:hidden" aria-busy="true">
            <table className="tbl">
              <thead><tr><th>Tiêu đề</th><th>Phòng</th><th>Thời gian</th><th>Đặt cho</th><th>Người đặt</th><th>Trạng thái</th><th className="text-right!">Thao tác</th></tr></thead>
              <tbody><SkeletonRows cols={COLS} rows={6} /></tbody>
            </table>
          </div>
          <div className="md:hidden flex flex-col gap-3" aria-busy="true">
            {[1, 2, 3].map(i => (
              <div key={i} className="bk">
                <Skeleton className="w-2/3 h-5!" /><Skeleton className="w-1/2" /><Skeleton className="w-1/3" />
              </div>
            ))}
          </div>
          <p className="sr-only" role="status">Đang tải lịch sử đặt phòng…</p>
        </> : list.length === 0 ? <Empty title="Không có lịch đặt phù hợp" text="Thử chọn tab khác hoặc bỏ bớt bộ lọc."><button className="btn" onClick={clear}>Xóa lọc</button></Empty> : <>
          {/* Desktop: bảng */}
          <div className="tw max-md:hidden">
            <table className="tbl">
              <thead><tr><th>Tiêu đề</th><th>Phòng</th><th>Thời gian</th><th>Đặt cho</th><th>Người đặt</th><th>Trạng thái</th><th className="text-right!">Thao tác</th></tr></thead>
              {sections.map(([label, rows]) => rows.length > 0 && (
                <tbody key={label}>
                  <tr className="grp"><td colSpan={7}>{label}</td></tr>
                  {rows.map(b => (
                    <tr key={b.id}>
                      <td className="font-semibold">{b.title}</td><td className="nw">{roomLabel(b)}</td><td className="nw">{when(b)}</td>
                      <td className="nw">{groupLabel(b)}</td><td className="nw">{who(b)}</td><td><StatusBadge s={b.status} /></td>
                      <td><div className="flex justify-end gap-1">{acts(b)}</div></td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          {/* Mobile: card */}
          <div className="md:hidden flex flex-col gap-3">
            {sections.map(([label, rows]) => rows.length > 0 && (
              <div key={label} className="contents">
                <div className="text-xs font-semibold tracking-wide uppercase text-gray-600 mt-1.5">{label}</div>
                {rows.map(b => (
                  <article key={b.id} className="bk">
                    <div className="flex justify-between items-start gap-2"><h2 className="text-base font-semibold">{b.title}</h2><StatusBadge s={b.status} /></div>
                    <div className="ln">{roomLabel(b)} · {when(b)}</div>
                    <div className="ln">{groupLabel(b)} · {b.by === id ? who(b) : <>đặt bởi {who(b)}</>}</div>
                    {b.reason?.text && <p className="small px-2.5 py-2 rounded-lg bg-gray-100 text-gray-700">{b.status === 'no' ? 'Lý do từ chối' : 'Lý do hủy'}: {b.reason.text}</p>}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">{acts(b)}</div>
                  </article>
                ))}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 text-[13px] text-gray-600 max-md:px-0">Hiển thị {list.length} lịch đặt</div>
        </>}
      </section>
    )}

    {viewing && <UserBookingDetail b={viewing} onClose={() => setView(null)} onCancel={() => setCancel(viewing)} onRate={() => setRate(viewing)} />}
    {cancel && (
      <Confirm title="Hủy lịch đặt phòng?" icon="ban" ok={cancelBooking.isPending ? 'Đang hủy…' : 'Đồng ý hủy'} cancel="Không"
        busy={cancelBooking.isPending} reason="Lý do hủy (không bắt buộc)" placeholder="Ví dụ: Nhóm đổi lịch họp" onClose={() => setCancel(null)}
        onOk={reason => cancelBooking.mutate({ id: cancel.id, reason }, { onSuccess: () => setCancel(null) })}>
        <div><strong className="text-gray-900">{cancel.title}</strong> – {roomLabel(cancel)}, {when(cancel)}.</div>
        <div>Khung giờ sẽ được giải phóng cho người khác đặt.</div>
      </Confirm>
    )}
    {rate && <RateDialog b={rate} onClose={() => setRate(null)} />}
  </>
}
