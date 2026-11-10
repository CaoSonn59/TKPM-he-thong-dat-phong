// A11 — Báo cáo & thống kê
import { useState } from 'react'
import { dmy, when, type Booking, type Status } from '../data'
import { useStore } from '../store'
import { Badge, Empty, Field, Icon, MultiPick, usePaged } from '../ui'
import { Page } from './AdminLayout'

type Pt = { label: string; v: number }

function LineChart({ pts }: { pts: Pt[] }) {
  const max = Math.ceil(Math.max(1, ...pts.map(p => p.v)) / 3) * 3, dots = pts.length <= 10, every = Math.ceil(pts.length / 8)
  const x = (i: number) => pts.length < 2 ? 270 : 50 + i * 460 / (pts.length - 1)
  const y = (v: number) => 200 - v / max * 162
  return (
    <svg viewBox="0 0 540 240" role="img" className="w-full h-auto block" aria-label={`Biểu đồ đường: ${pts.map(p => `${p.label} ${p.v}`).join(', ')}`}>
      {[0, 1, 2, 3].map(i => <g key={i}>
        <line x1="30" x2="510" y1={200 - i * 54} y2={200 - i * 54} stroke="#ECEDF0" />
        <text x="22" y={204 - i * 54} fontSize="11" fill="#6B7280" textAnchor="end">{max * i / 3}</text>
      </g>)}
      <polyline points={pts.map((p, i) => `${x(i)},${y(p.v)}`).join(' ')} fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((p, i) => <g key={i}>
        {(dots || p.v > 0) && <circle cx={x(i)} cy={y(p.v)} r={dots ? 4.5 : 3} fill="#fff" stroke="#4F46E5" strokeWidth="2" />}
        {(dots || p.v > 0) && <text x={x(i)} y={y(p.v) - 12} fontSize="12" fontWeight="600" fill="#111827" textAnchor="middle">{p.v}</text>}
        {i % every === 0 && <text x={x(i)} y="226" fontSize="11" fill="#4B5563" textAnchor="middle">{p.label}</text>}
      </g>)}
    </svg>
  )
}

export default function Reports() {
  const { bookings, rooms, groups, roomOf, groupName, userLabel } = useStore()
  const [f, setF] = useState({ from: '2026-11-01', to: '2026-11-30', rooms: [] as string[], groups: [] as string[] })
  const [unit, setUnit] = useState<1 | 7>(7)
  const [tab, setTab] = useState(0)

  const valid = !!f.from && !!f.to && f.from <= f.to
  const list = !valid ? [] : bookings
    .filter(b => b.date >= f.from && b.date <= f.to && (!f.rooms.length || f.rooms.includes(String(b.roomId))) && (!f.groups.length || f.groups.includes(String(b.groupId))))
    .sort((a, b) => (b.date + b.from).localeCompare(a.date + a.from))
  const count = (key: (b: Booking) => string): [string, number][] =>
    Object.entries(list.reduce<Record<string, number>>((m, b) => { const k = key(b); m[k] = (m[k] ?? 0) + 1; return m }, {})).sort((a, b) => b[1] - a[1])
  const byRoom = count(b => roomOf(b.roomId).name), byGroup = count(b => groupName(b.groupId))
  const n = (...s: Status[]) => list.filter(b => s.includes(b.status)).length
  const acc = n('ok', 'live', 'done'), rej = n('no', 'cancel'), wait = n('wait')

  const days: string[] = []
  if (valid) for (const d = new Date(f.from + 'T00:00Z'); days.length < 366 && d.toISOString().slice(0, 10) <= f.to; d.setUTCDate(d.getUTCDate() + 1)) days.push(d.toISOString().slice(0, 10))
  const byTime: Pt[] = Array.from({ length: Math.ceil(days.length / unit) }, (_, i) => {
    const ds = days.slice(i * unit, i * unit + unit)
    return { label: unit === 1 ? dmy(ds[0]).slice(0, 5) : `${ds[0].slice(8)}–${dmy(ds[ds.length - 1]).slice(0, 5)}`, v: list.filter(b => ds.includes(b.date)).length }
  })
  const summary = [byRoom, byGroup, byTime.map(p => [p.label, p.v] as [string, number])][tab]
  const { rows, pager } = usePaged(list)
  const maxRoom = Math.max(1, ...byRoom.map(r => r[1])), maxGroup = Math.max(1, ...byGroup.map(r => r[1]))

  return (
    <Page title="Báo cáo & thống kê">
      <section className="card p-4" aria-label="Bộ lọc báo cáo">
        <div className="flex flex-wrap items-start gap-3">
          <Field label="Từ ngày" req id="rp-from" className="flex-[0_1_170px]"><input id="rp-from" type="date" className="inp" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /></Field>
          <Field label="Đến ngày" req id="rp-to" className="flex-[0_1_170px]" err={f.from && f.to && !valid ? 'Phải sau Từ ngày' : undefined}><input id="rp-to" type="date" className="inp" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} /></Field>
          <Field label="Phòng" id="rp-rooms" className="flex-[1_1_240px]"><MultiPick id="rp-rooms" placeholder="Tất cả phòng" options={rooms.map(r => ({ value: String(r.id), text: r.name }))} value={f.rooms} onChange={v => setF({ ...f, rooms: v })} /></Field>
          <Field label="Nhóm người dùng" id="rp-groups" className="flex-[1_1_300px]"><MultiPick id="rp-groups" placeholder="Tất cả nhóm" options={groups.map(g => ({ value: String(g.id), text: g.name }))} value={f.groups} onChange={v => setF({ ...f, groups: v })} /></Field>
        </div>
      </section>

      {list.length === 0 ? (
        <div className="card"><Empty icon="chart" tone="bg-indigo-50 text-indigo-700" title="Không có dữ liệu trong khoảng thời gian đã chọn" text="Thử chọn khoảng ngày khác hoặc bỏ bớt phòng, nhóm." /></div>
      ) : <>
        <div className="stats">
          <div className="card stat"><div className="text-[13px] font-medium text-gray-600">Tổng booking</div><div className="sn">{list.length}</div><div className="small muted">{dmy(f.from).slice(0, 5)} – {dmy(f.to)}</div></div>
          <div className="card stat"><div className="text-[13px] font-medium text-gray-600">Đã chấp nhận</div><div className="sn text-green-800">{acc}</div><div className="small muted">gồm {n('live')} đang diễn ra, {n('done')} đã kết thúc</div></div>
          <div className="card stat"><div className="text-[13px] font-medium text-gray-600">Không chấp nhận / Đã hủy</div><div className="sn text-red-800">{rej}</div><div className="small muted">{n('no')} không chấp nhận · {n('cancel')} đã hủy</div></div>
          <div className="card stat"><div className="text-[13px] font-medium text-gray-600">Tỷ lệ chấp nhận</div><div className="sn">{acc + rej ? Math.round(acc / (acc + rej) * 100) + '%' : '—'}</div><div className="small muted">{acc} trên {acc + rej} yêu cầu đã xử lý (chưa tính {wait} chờ duyệt)</div></div>
        </div>

        <div className="flex flex-wrap gap-4">
          <section className="card flex-[1_1_460px] min-w-0">
            <div className="ch"><h2 className="h2">Số booking theo phòng</h2></div>
            <div className="p-4" role="img" aria-label={`Biểu đồ cột: ${byRoom.map(r => r.join(' ')).join(', ')}`}>
              <div className="vbars">{byRoom.map(([k, v]) => <div key={k} className="vb"><b>{v}</b><i style={{ height: v / maxRoom * 180 }} /></div>)}</div>
              <div className="vlab">{byRoom.map(([k]) => <span key={k}>{k}</span>)}</div>
            </div>
          </section>
          <section className="card flex-[1_1_460px] min-w-0">
            <div className="ch"><h2 className="h2">Số booking theo {unit === 1 ? 'ngày' : 'tuần'}</h2>
              <div className="flex gap-1">{([[1, 'Ngày'], [7, 'Tuần']] as const).map(([u, l]) =>
                <button key={u} className={`btn xs ${unit === u ? 'bg-indigo-50! border-indigo-200! text-indigo-800!' : ''}`} aria-pressed={unit === u} onClick={() => setUnit(u)}>{l}</button>)}</div>
            </div>
            <div className="p-4"><LineChart pts={byTime} /></div>
          </section>
        </div>

        <div className="flex flex-wrap gap-4">
          <section className="card flex-[1_1_460px] min-w-0">
            <div className="ch"><h2 className="h2">Số booking theo nhóm người dùng</h2></div>
            <div className="p-4" role="img" aria-label={`Biểu đồ cột ngang: ${byGroup.map(r => r.join(' ')).join(', ')}`}>
              {byGroup.map(([k, v]) => <div key={k} className="hb"><span className="truncate">{k}</span><i style={{ width: `${v / maxGroup * 100}%` }} /><span className="font-semibold text-right tabular-nums">{v}</span></div>)}
            </div>
          </section>
          <section className="card flex-[1_1_460px] min-w-0">
            <div className="px-4 pt-3.5"><h2 className="h2">Bảng tổng hợp</h2></div>
            <div className="tabs" role="tablist">{['Theo phòng', 'Theo nhóm', 'Theo thời gian'].map((l, i) => <button key={l} className={`tab ${tab === i ? 'on' : ''}`} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>{l}</button>)}</div>
            <div className="tw">
              <table className="tbl">
                <thead><tr><th>{['Tên phòng', 'Tên nhóm', unit === 1 ? 'Ngày' : 'Tuần'][tab]}</th><th className="r">Số booking</th></tr></thead>
                <tbody>
                  {summary.map(([k, v]) => <tr key={k}><td>{k}</td><td className="r">{v}</td></tr>)}
                  <tr><td className="font-semibold border-0!">Tổng</td><td className="r font-bold border-0!">{list.length}</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="card">
          <div className="ch"><h2 className="h2">Chi tiết booking</h2><span className="small muted">{list.length} lịch đặt</span></div>
          <div className="tw">
            <table className="tbl">
              <thead><tr><th>Tiêu đề</th><th>Phòng</th><th>Người đặt</th><th>Nhóm</th><th>Thời gian</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {rows.map(b => (
                  <tr key={b.id}>
                    <td className="font-semibold min-w-52">{b.title}</td><td className="nw">{roomOf(b.roomId).name}</td><td className="nw">{userLabel(b.by)}</td>
                    <td className="nw">{groupName(b.groupId)}</td><td className="nw">{when(b)}</td><td><Badge s={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pager}
        </section>
      </>}
    </Page>
  )
}
