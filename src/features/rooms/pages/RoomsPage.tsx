// A9 — Danh sách phòng
import { useState } from 'react'
import { Empty, Icon, usePaged, useSort } from '../../../shared/ui'
import { Page } from '../../../layouts/AdminPage'
import { Rating } from '../components/Rating'
import { RoomForm } from '../components/RoomForm'
import { useRooms, useRoomsQuery } from '../hooks'
import { AMENITIES, cap, loc, type Room } from '../model'

export default function RoomsPage() {
  const rooms = useRooms()
  const { isLoading, error } = useRoomsQuery()
  const [f, setF] = useState({ q: '', st: '', building: '', am: '' })
  const [edit, setEdit] = useState<Room | 'new' | null>(null)
  const list = rooms.filter(r => r.name.toLowerCase().includes(f.q.toLowerCase()) && (!f.st || String(r.maint) === f.st)
    && (!f.building || r.building === f.building) && (!f.am || r.amenities.includes(f.am)))
  const { sorted, th } = useSort(list, 'name')
  const { rows, pager } = usePaged(sorted)
  const clear = () => setF({ q: '', st: '', building: '', am: '' })

  return (
    <Page title="Phòng" action={<button className="btn bp" onClick={() => setEdit('new')}><Icon n="plus" s={16} />Thêm phòng</button>}>
      {error && <div className="alert" role="alert"><Icon n="alert" />{error.message}</div>}
      <section className="card">
        <div className="filters">
          <div className="field flex-[1_1_260px]"><Icon n="search" /><input className="inp" type="search" placeholder="Tìm theo tên phòng" aria-label="Tìm theo tên phòng" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} /></div>
          <select className="sel" aria-label="Trạng thái" value={f.st} onChange={e => setF({ ...f, st: e.target.value })}><option value="">Tất cả trạng thái</option><option value="false">Khả dụng</option><option value="true">Đang bảo trì</option></select>
          <select className="sel" aria-label="Tòa nhà" value={f.building} onChange={e => setF({ ...f, building: e.target.value })}>
            <option value="">Tất cả tòa nhà</option>{[...new Set(rooms.map(r => r.building))].sort().map(b => <option key={b}>{b}</option>)}
          </select>
          <select className="sel" aria-label="Tiện ích" value={f.am} onChange={e => setF({ ...f, am: e.target.value })}>
            <option value="">Tiện ích: tất cả</option>{AMENITIES.map(a => <option key={a}>{a}</option>)}
          </select>
          <button className="btn gh" onClick={clear}>Xóa lọc</button>
        </div>
        <div className="tw">
          <table className="tbl">
            <thead><tr>{th('name', 'Tên phòng')}{th('max', 'Sức chứa')}<th>Vị trí</th><th>Tiện ích</th>{th('rate', 'Đánh giá TB')}<th>Trạng thái</th><th className="text-right!">Thao tác</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="nw font-semibold">{r.name}</td>
                  <td className="nw tabular-nums">{cap(r)} người</td>
                  <td className="nw">{loc(r)}</td>
                  <td><div className="flex flex-wrap gap-1">
                    {r.amenities.slice(0, 3).map(a => <span key={a} className="tag">{a}</span>)}
                    {r.amenities.length > 3 && <span className="tag more" title={r.amenities.slice(3).join(', ')}>+{r.amenities.length - 3}</span>}
                  </div></td>
                  <td className="nw"><Rating r={r} /></td>
                  <td><span className={`badge ${r.maint ? 's-maint' : 's-ok'}`}>{r.maint ? 'Đang bảo trì' : 'Khả dụng'}</span></td>
                  <td className="text-right"><button className="ib" title="Sửa" aria-label={`Sửa ${r.name}`} onClick={() => setEdit(r)}><Icon n="edit" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && !isLoading && <Empty title="Không có dữ liệu phù hợp" text="Thử đổi từ khóa hoặc bỏ bớt bộ lọc."><button className="btn h-9!" onClick={clear}>Xóa lọc</button></Empty>}
        {pager}
      </section>
      {edit && <RoomForm room={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
    </Page>
  )
}
