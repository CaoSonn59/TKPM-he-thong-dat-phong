// A7 — Danh sách đặt phòng, A8 — Chi tiết (drawer), hộp thoại Chấp nhận / Từ chối / Hủy khẩn cấp
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { STATUS, STATUSES, code, dmy, longDate, when, type Booking } from '../data'
import { mins } from '../logic'
import { Members, ReasonBox, RoomDl } from '../parts'
import { useStore } from '../store'
import { Badge, Confirm, Drawer, Empty, Icon, Stars, usePaged, useSort } from '../ui'
import { Page } from './AdminLayout'

export type Act = { type: 'ok' | 'no' | 'cancel'; b: Booking }
const ACT = {
  ok: { title: 'Chấp nhận lịch đặt?', icon: 'check', tone: 'green', done: 'Đã chấp nhận lịch đặt', ph: undefined },
  no: { title: 'Từ chối lịch đặt?', icon: 'x', tone: 'red', done: 'Đã từ chối lịch đặt', ph: 'Ví dụ: Phòng đã được ưu tiên cho lịch thi' },
  cancel: { title: 'Hủy khẩn cấp lịch đặt?', icon: 'ban', tone: 'red', done: 'Đã hủy lịch đặt', ph: 'Ví dụ: Phòng mất điện đột xuất' },
} as const

export function Decide({ act: { type, b }, onClose }: { act: Act; onClose: () => void }) {
  const { setStatus, roomOf, toast } = useStore()
  const room = roomOf(b.roomId).name, c = ACT[type]
  const t = <strong className="text-gray-900">{b.title}</strong>
  return (
    <Confirm title={c.title} icon={c.icon} tone={c.tone} placeholder={c.ph} onClose={onClose}
      reason={type === 'ok' ? undefined : 'Lý do (không bắt buộc)'} hint="Người đặt sẽ thấy lý do này"
      onOk={r => { setStatus(b.id, type, r); toast(c.done, `${b.title} · ${room}`); onClose() }}>
      {type === 'ok' ? <>Chấp nhận lịch đặt {t} tại <strong className="text-gray-900">{room}</strong>, {when(b)}?</>
        : type === 'no' ? <>Lịch {t} sẽ chuyển sang “Không chấp nhận” và khung giờ được giải phóng.</>
          : <>Lịch {t} đã được chấp nhận. Sau khi hủy, trạng thái chuyển sang “Đã hủy”.</>}
    </Confirm>
  )
}

function Detail({ b, onClose, onAct }: { b: Booking; onClose: () => void; onAct: (a: Act) => void }) {
  const { roomOf, users, groupName } = useStore()
  const hours = String((mins(b.to) - mins(b.from)) / 60).replace('.', ',')
  return (
    <Drawer label={b.title} onClose={onClose}>
      <header className="dh">
        <div className="flex flex-col items-start gap-2">
          <Badge s={b.status} />
          <h2 className="text-xl font-bold">{b.title}</h2>
          <p className="muted small">Mã đặt phòng {code(b)}{b.sent && ` · gửi lúc ${b.sent.slice(11)}, ${dmy(b.sent)}`}</p>
        </div>
        <button className="ib" aria-label="Đóng" onClick={onClose}><Icon n="x" /></button>
      </header>
      <div className="flex-auto overflow-y-auto">
        <ReasonBox b={b} />
        <section className="sec"><h3 className="sh">Thông tin sự kiện</h3>
          <dl className="dl"><dt>Tiêu đề</dt><dd>{b.title}</dd><dt>Ngày</dt><dd>{longDate(b.date)}</dd><dt>Thời gian</dt><dd>{b.from} – {b.to} ({hours} giờ)</dd></dl>
        </section>
        <section className="sec"><h3 className="sh">Thông tin phòng</h3><RoomDl r={roomOf(b.roomId)} /></section>
        <section className="sec"><h3 className="sh">Người đặt</h3>
          <dl className="dl"><dt>Mã định danh</dt><dd>{b.by}</dd><dt>Họ và tên</dt><dd>{users.find(u => u.id === b.by)?.name}</dd><dt>Nhóm sử dụng</dt><dd>{groupName(b.groupId)}</dd></dl>
        </section>
        <Members b={b} avatars />
        <section className="sec"><h3 className="sh">Phản hồi của người dùng</h3>
          {b.fb ? (
            <div className="flex flex-col gap-1.5 p-3.5 border border-gray-200 rounded-[10px] bg-gray-50">
              <div className="flex items-center gap-2"><Stars n={b.fb.stars} /><span className="font-semibold">{b.fb.stars}/5</span><span className="muted small">· {dmy(b.fb.at)}</span></div>
              {b.fb.text && <p>{b.fb.text}</p>}
            </div>
          ) : <div className="flex items-center gap-2.5 p-3.5 border border-dashed border-gray-300 rounded-[10px] text-gray-600"><Icon n="star" />Chưa có phản hồi</div>}
        </section>
      </div>
      {(b.status === 'wait' || b.status === 'ok') && (
        <footer className="mf">
          {b.status === 'wait' ? <>
            <button className="btn bo" onClick={() => onAct({ type: 'no', b })}><Icon n="x" s={16} />Từ chối</button>
            <button className="btn bg" onClick={() => onAct({ type: 'ok', b })}><Icon n="check" s={16} />Chấp nhận</button>
          </> : <button className="btn bo" onClick={() => onAct({ type: 'cancel', b })}><Icon n="ban" s={16} />Hủy khẩn cấp</button>}
        </footer>
      )}
    </Drawer>
  )
}

export default function Bookings() {
  const { bookings, rooms, groups, roomOf, groupName, userLabel } = useStore()
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
      <section className="card">
        <div className="tabs" role="tablist" aria-label="Lọc theo trạng thái">
          {(['', ...STATUSES] as const).map(s => {
            const n = base.filter(r => !s || r.status === s).length
            return (
              <button key={s} className={`tab ${tab === s ? 'on' : ''}`} role="tab" aria-selected={tab === s} onClick={() => set('tt', s)}>
                {s ? STATUS[s][0] : 'Tất cả'} <span className={`tc ${s === 'wait' && n ? 'amber' : ''}`}>{n}</span>
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
          <table className="tbl">
            <thead><tr>{th('title', 'Tiêu đề')}{th('room', 'Phòng')}<th>Người đặt</th><th>Nhóm</th>{th('time', 'Thời gian')}<th>Trạng thái</th><th className="text-right!">Thao tác</th></tr></thead>
            <tbody>
              {rows.map(({ b, ...r }) => (
                <tr key={b.id}>
                  <td className="min-w-44"><button className="font-semibold text-left" onClick={() => set('xem', String(b.id))}>{b.title}</button></td>
                  <td className="nw">{r.room}</td>
                  <td className="nw">{r.by}</td>
                  <td className="nw">{r.group}</td>
                  <td className="nw">{when(b)}</td>
                  <td><Badge s={b.status} /></td>
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
        {rows.length === 0 && <Empty title="Không có dữ liệu phù hợp" text="Thử đổi từ khóa hoặc bỏ bớt bộ lọc."><button className="btn h-9!" onClick={clear}>Xóa lọc</button></Empty>}
        {pager}
      </section>
      {viewing && <Detail b={viewing} onClose={() => set('xem', '')} onAct={setAct} />}
      {act && <Decide act={act} onClose={() => setAct(null)} />}
    </Page>
  )
}
