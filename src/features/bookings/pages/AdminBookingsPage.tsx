// A7 — Danh sách đặt phòng
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Empty, Icon, Skeleton, SkeletonRows, usePaged, useSort } from '../../../shared/ui'
import { Page } from '../../../layouts/AdminPage'
import { useGroupName, useGroups } from '../../groups/hooks'
import { useRoomOf, useRooms } from '../../rooms/hooks'
import { useUserLabel } from '../../users/hooks'
import { AdminBookingDetail } from '../components/AdminBookingDetail'
import { Decide, type Act } from '../components/DecideDialog'
import { StatusBadge } from '../components/StatusBadge'
import { useBookings, useBookingsQuery } from '../hooks'
import { STATUS, STATUSES, when } from '../model'

export default function AdminBookingsPage() {
  const bookings = useBookings()
  const { isLoading, error } = useBookingsQuery()
  const rooms = useRooms()
  const groups = useGroups()
  const roomOf = useRoomOf()
  const groupName = useGroupName()
  const userLabel = useUserLabel()
  // Tab, phòng và booking đang xem nằm trên URL để Tổng quan / form Phòng link thẳng tới (?tt=wait, ?phong=2, ?xem=6).
  const [sp, setSp] = useSearchParams()
  const set = (k: string, v: string) => setSp(p => { if (v) p.set(k, v); else p.delete(k); return p }, { replace: true })
  const tab = sp.get('tt') ?? '', room = sp.get('phong') ?? ''
  const [f, setF] = useState({ q: '', group: '', from: '', to: '' })
  const [act, setAct] = useState<Act | null>(null)

  const base = bookings
    .map(b => ({ b, title: b.title, room: roomOf(b.roomId).name, by: userLabel(b.by), group: groupName(b.groupId), time: `${b.date} ${b.from}`, status: b.status }))
    .filter(r => `${r.title} ${r.by}`.toLowerCase().includes(f.q.toLowerCase()) && (!room || r.b.roomId === +room)
      && (!f.group || r.b.groupId === +f.group) && (!f.from || r.b.date >= f.from) && (!f.to || r.b.date <= f.to))
  const { sorted, th } = useSort(base.filter(r => !tab || r.status === tab), 'time', -1)
  const { rows, pager } = usePaged(sorted, 20)
  const viewing = bookings.find(b => b.id === Number(sp.get('xem')))
  const clear = () => { setF({ q: '', group: '', from: '', to: '' }); setSp({}, { replace: true }) }

  return (
    <Page title="Đặt phòng">
      {error && <div className="alert" role="alert"><Icon n="alert" />{error.message}</div>}
      <section className="card">
        <div className="tabs" role="tablist" aria-label="Lọc theo trạng thái">
          {(['', ...STATUSES] as const).map(s => {
            const n = base.filter(r => !s || r.status === s).length
            return (
              <button key={s} className={`tab ${tab === s ? 'on' : ''}`} role="tab" aria-selected={tab === s} onClick={() => set('tt', s)}>
                {s ? STATUS[s][0] : 'Tất cả'} <span className={`tc ${s === 'wait' && n ? 'amber' : ''}`}>{isLoading ? <Skeleton className="w-3 h-2.5" /> : n}</span>
              </button>
            )
          })}
        </div>
        <div className="filters">
          <div className="field flex-[1_1_260px]"><Icon n="search" /><input className="inp" type="search" placeholder="Tìm theo tiêu đề hoặc người đặt" aria-label="Tìm theo tiêu đề hoặc người đặt" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} /></div>
          <select className="sel" aria-label="Phòng" value={room} onChange={e => set('phong', e.target.value)}>
            <option value="">Tất cả phòng</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select className="sel" aria-label="Nhóm" value={f.group} onChange={e => setF({ ...f, group: e.target.value })}>
            <option value="">Tất cả nhóm</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <div className="flex items-center gap-1.5">
            <input className="inp w-[148px]!" type="date" aria-label="Từ ngày" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} />
            <span className="muted">–</span>
            <input className="inp w-[148px]!" type="date" aria-label="Đến ngày" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} />
          </div>
          <button className="btn gh" onClick={clear}>Xóa lọc</button>
        </div>
        <div className="tw">
          <table className="tbl" aria-busy={isLoading}>
            <thead><tr>{th('title', 'Tiêu đề')}{th('room', 'Phòng')}<th>Người đặt</th><th>Nhóm</th>{th('time', 'Thời gian')}<th>Trạng thái</th><th className="text-right!">Thao tác</th></tr></thead>
            <tbody>
              {isLoading && <SkeletonRows cols={['w-44', 'w-24', 'w-36', 'w-28', 'w-32', 'w-24 h-6! rounded-full', 'w-20 ml-auto']} />}
              {rows.map(({ b, ...r }) => (
                <tr key={b.id}>
                  <td className="min-w-44"><button className="font-semibold text-left" onClick={() => set('xem', String(b.id))}>{b.title}</button></td>
                  <td className="nw">{r.room}</td>
                  <td className="nw">{r.by}</td>
                  <td className="nw">{r.group}</td>
                  <td className="nw">{when(b)}</td>
                  <td><StatusBadge s={b.status} /></td>
                  <td><div className="flex gap-0.5 justify-end">
                    {b.status === 'wait' && <>
                      <button className="ib ok" title="Chấp nhận" aria-label={`Chấp nhận ${b.title}`} onClick={() => setAct({ type: 'ok', b })}><Icon n="check" /></button>
                      <button className="ib no" title="Từ chối" aria-label={`Từ chối ${b.title}`} onClick={() => setAct({ type: 'no', b })}><Icon n="x" /></button>
                    </>}
                    {b.status === 'ok' && <button className="ib no" title="Hủy khẩn cấp" aria-label={`Hủy khẩn cấp ${b.title}`} onClick={() => setAct({ type: 'cancel', b })}><Icon n="ban" /></button>}
                    <button className="ib" title="Xem chi tiết" aria-label={`Xem chi tiết ${b.title}`} onClick={() => set('xem', String(b.id))}><Icon n="eye" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && <p className="sr-only" role="status">Đang tải danh sách đặt phòng…</p>}
        {rows.length === 0 && !isLoading && <Empty title="Không có dữ liệu phù hợp" text="Thử đổi từ khóa hoặc bỏ bớt bộ lọc."><button className="btn h-9!" onClick={clear}>Xóa lọc</button></Empty>}
        {!isLoading && pager}
      </section>
      {viewing && <AdminBookingDetail b={viewing} onClose={() => set('xem', '')} onAct={setAct} />}
      {act && <Decide act={act} onClose={() => setAct(null)} />}
    </Page>
  )
}
