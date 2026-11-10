// A2 — Tổng quan
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { NOW, TODAY, dmy, loc, longDate, when } from '../data'
import { mins } from '../logic'
import { useStore } from '../store'
import { Empty, Icon, type IconName } from '../ui'
import { Page } from './AdminLayout'
import { Decide, type Act } from './Bookings'

const pct = (t: string) => `${(mins(t) - 420) / 7.2}%` // vị trí trên trục 07:00–19:00

function Stat({ to, icon, tone, label, n, children }: { to?: string; icon: IconName; tone: string; label: string; n: number; children: ReactNode }) {
  const body = <>
    <div className="flex items-center gap-2 text-[13px] font-medium text-gray-600"><span className={`w-8 h-8 flex items-center justify-center rounded-lg ${tone}`}><Icon n={icon} /></span>{label}</div>
    <div className="sn">{n}</div>
    <div className="small muted">{children}</div>
  </>
  return to ? <Link className="card stat" to={to}>{body}</Link> : <div className="card stat">{body}</div>
}

export default function Dashboard() {
  const { bookings, rooms, users, roomOf, userLabel } = useStore()
  const [act, setAct] = useState<Act | null>(null)
  const wait = bookings.filter(b => b.status === 'wait').sort((a, b) => b.sent.localeCompare(a.sent))
  const today = bookings.filter(b => b.date === TODAY && (b.status === 'ok' || b.status === 'live'))
  const live = today.filter(b => b.status === 'live').length
  const maint = rooms.filter(r => r.maint)
  const active = users.filter(u => u.active).length

  return (
    <Page title="Tổng quan">
      <p className="muted">{longDate(TODAY)} · cập nhật lúc {NOW}</p>

      <div className="stats">
        <Stat to="/admin/dat-phong?tt=wait" icon="clock" tone="bg-amber-100 text-amber-800" label="Booking chờ duyệt" n={wait.length}>
          <span className="text-indigo-700 font-medium">Xem và duyệt →</span>
        </Stat>
        <Stat icon="cal" tone="bg-blue-100 text-blue-800" label="Booking hôm nay" n={today.length}>{live} đang diễn ra · {today.length - live} sắp tới</Stat>
        <Stat to="/admin/phong" icon="warn" tone="bg-orange-100 text-orange-800" label="Phòng đang bảo trì" n={maint.length}>{maint.map(r => r.name).join(', ') || 'Không có'}</Stat>
        <Stat to="/admin/nguoi-dung" icon="users" tone="bg-green-100 text-green-800" label="Người dùng đang hoạt động" n={active}>trên {users.length} tài khoản</Stat>
      </div>

      <section className="card">
        <div className="ch"><h2 className="h2">Yêu cầu chờ duyệt mới nhất</h2><Link to="/admin/dat-phong?tt=wait" className="small font-semibold">Xem tất cả ({wait.length})</Link></div>
        {wait.length === 0 ? <Empty icon="check" title="Không còn yêu cầu nào chờ duyệt" /> : (
          <div className="tw">
            <table className="tbl">
              <thead><tr><th>Tiêu đề</th><th>Phòng</th><th>Người đặt</th><th>Thời gian</th><th className="text-right!">Thao tác</th></tr></thead>
              <tbody>
                {wait.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td><Link to={`/admin/dat-phong?xem=${b.id}`} className="font-semibold text-gray-900 no-underline">{b.title}</Link><div className="muted small">Gửi {dmy(b.sent).slice(0, 5)} {b.sent.slice(11)}</div></td>
                    <td className="nw">{roomOf(b.roomId).name}</td>
                    <td className="nw">{userLabel(b.by)}</td>
                    <td className="nw">{when(b)}</td>
                    <td><div className="flex gap-1.5 justify-end">
                      <button className="btn xs bg" onClick={() => setAct({ type: 'ok', b })}><Icon n="check" s={16} />Chấp nhận</button>
                      <button className="btn xs bo" onClick={() => setAct({ type: 'no', b })}><Icon n="x" s={16} />Từ chối</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="ch">
          <h2 className="h2">Lịch hôm nay · {dmy(TODAY)}</h2>
          <div className="flex flex-wrap gap-3.5 small text-gray-600">
            {[['#BFDBFE', 'Đang diễn ra'], ['#BBF7D0', 'Đã chấp nhận'], ['#FED7AA', 'Đang bảo trì']].map(([c, l]) =>
              <span key={l}><i className="inline-block w-2.5 h-2.5 mr-1.5 rounded-[3px] align-[-1px]" style={{ background: c }} />{l}</span>)}
            <span><i className="inline-block w-[3px] h-2.5 mr-1.5 align-[-1px] bg-red-600" />Bây giờ ({NOW})</span>
          </div>
        </div>
        <div className="tw">
          <div className="flex flex-col px-4 pt-2 pb-4 min-w-[720px]">
            <div className="flex items-center gap-3 h-8">
              <div className="flex-[0_0_170px]" />
              <div className="relative flex-auto h-[18px] text-[11px] text-gray-500">
                {[7, 9, 11, 13, 15, 17, 19].map((h, i) => <span key={h} className="absolute" style={i === 6 ? { right: 0 } : { left: pct(`${String(h).padStart(2, '0')}:00`), translate: i ? '-50%' : undefined }}>{String(h).padStart(2, '0')}:00</span>)}
              </div>
            </div>
            {rooms.map(r => (
              <div key={r.id} className="flex items-center gap-3 min-h-[52px] border-b border-gray-100 last:border-0">
                <div className="flex-[0_0_170px] font-medium">{r.name}<div className="muted small font-normal">{loc(r)}</div></div>
                <div className="track">
                  {r.maint ? <span className="ev ev-maint">Đang bảo trì, không nhận đặt phòng</span> : <>
                    {today.filter(b => b.roomId === r.id).map(b => (
                      <Link key={b.id} to={`/admin/dat-phong?xem=${b.id}`} className={`ev ev-${b.status}`} title={`${b.from}–${b.to} · ${b.title}`}
                        style={{ left: pct(b.from), width: `calc(${pct(b.to)} - ${pct(b.from)})` }}>{b.from}–{b.to} · {b.title}</Link>
                    ))}
                    <span className="absolute -top-1.5 -bottom-1.5 w-0.5 bg-red-600" style={{ left: pct(NOW) }} aria-hidden="true" />
                  </>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {act && <Decide act={act} onClose={() => setAct(null)} />}
    </Page>
  )
}
