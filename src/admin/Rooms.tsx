// A9 — Danh sách phòng, A10 — Thêm / Sửa phòng (modal)
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AMENITIES, TODAY, cap, loc, type Room } from '../data'
import { Rating } from '../parts'
import { useStore } from '../store'
import { Empty, Field, Icon, Modal, MultiPick, inp, usePaged, useSort } from '../ui'
import { Page } from './AdminLayout'

function RoomForm({ room, onClose }: { room: Room | null; onClose: () => void }) {
  const { saveRoom, bookings } = useStore()
  const [v, setV] = useState({ name: room?.name ?? '', min: String(room?.min ?? ''), max: String(room?.max ?? ''), building: room?.building ?? '', floor: room?.floor ?? '', amenities: room?.amenities ?? [], maint: room?.maint ?? false })
  const [e, setE] = useState<Partial<Record<'name' | 'min' | 'max' | 'loc', string>>>({})
  const set = (k: 'name' | 'min' | 'max' | 'building' | 'floor') => (ev: { target: { value: string } }) => setV({ ...v, [k]: ev.target.value })
  const upcoming = room ? bookings.filter(b => b.roomId === room.id && ['wait', 'ok', 'live'].includes(b.status) && b.date >= TODAY).length : 0
  const blocked = !!room && !room.maint && v.maint && upcoming > 0

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const er: typeof e = {}
    if (!v.name.trim()) er.name = 'Vui lòng nhập tên phòng'
    if (!(+v.min >= 1)) er.min = 'Sức chứa tối thiểu phải từ 1'
    if (!(+v.max >= +v.min)) er.max = 'Sức chứa tối đa phải lớn hơn hoặc bằng sức chứa tối thiểu'
    if (!v.building.trim() || !v.floor.trim()) er.loc = 'Vui lòng nhập tòa nhà và lầu'
    if (!Object.keys(er).length && !blocked) {
      const dup = saveRoom({ id: room?.id ?? 0, rate: room?.rate ?? null, votes: room?.votes ?? 0, ...v, name: v.name.trim(), building: v.building.trim(), floor: v.floor.trim(), min: +v.min, max: +v.max })
      if (!dup) return onClose()
      er.name = dup
    }
    setE(er)
  }

  return (
    <Modal title={room ? 'Sửa phòng' : 'Thêm phòng'} onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn bp" form="room-form" disabled={blocked}>{room ? 'Lưu cập nhật' : 'Lưu'}</button></>}>
      <form id="room-form" className="mb" onSubmit={submit} noValidate>
        <Field label="Tên phòng" req id="r-name" err={e.name} hint="Tên phòng không được trùng."><input id="r-name" className={inp(e.name)} value={v.name} onChange={set('name')} /></Field>
        <div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sức chứa tối thiểu" req id="r-min"><input id="r-min" type="number" min={1} className={inp(e.min)} value={v.min} onChange={set('min')} /></Field>
            <Field label="Sức chứa tối đa" req id="r-max"><input id="r-max" type="number" min={1} className={inp(e.max)} value={v.max} onChange={set('max')} /></Field>
          </div>
          {(e.min || e.max) && <div className="err" role="alert"><Icon n="alert" s={16} />{e.min || e.max}</div>}
        </div>
        <div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tòa nhà / Dãy" req id="r-b"><input id="r-b" className={inp(e.loc && !v.building.trim())} placeholder="Tòa A" value={v.building} onChange={set('building')} /></Field>
            <Field label="Lầu" req id="r-f"><input id="r-f" className={inp(e.loc && !v.floor.trim())} placeholder="Lầu 1" value={v.floor} onChange={set('floor')} /></Field>
          </div>
          {e.loc && <div className="err" role="alert"><Icon n="alert" s={16} />{e.loc}</div>}
        </div>
        <Field label="Tiện ích" opt id="r-am">
          <MultiPick id="r-am" free options={AMENITIES.map(a => ({ value: a, text: a }))} value={v.amenities} onChange={amenities => setV({ ...v, amenities })} placeholder="Nhập tiện ích rồi bấm Enter" />
          <div className="sug flex flex-wrap gap-1.5 mt-2" aria-label="Gợi ý tiện ích">
            {AMENITIES.filter(a => !v.amenities.includes(a)).map(a => <button key={a} type="button" onClick={() => setV({ ...v, amenities: [...v.amenities, a] })}>+ {a}</button>)}
          </div>
        </Field>
        <fieldset>
          <legend className="lb">Trạng thái <span className="req">*</span></legend>
          <div className="flex flex-wrap gap-5">
            <label className="opt"><input type="radio" name="r-st" checked={!v.maint} onChange={() => setV({ ...v, maint: false })} />Khả dụng</label>
            <label className="opt"><input type="radio" name="r-st" checked={v.maint} onChange={() => setV({ ...v, maint: true })} />Đang bảo trì</label>
          </div>
        </fieldset>
        {blocked && (
          <div className="alert amber" role="alert"><Icon n="warn" />
            <div>Phòng còn <strong>{upcoming}</strong> lịch đặt sắp tới, cần xử lý các lịch này trước khi chuyển sang bảo trì.
              <div className="mt-1.5"><Link to={`/admin/dat-phong?phong=${room.id}`} className="font-semibold">Xem các lịch đặt →</Link></div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default function Rooms() {
  const { rooms } = useStore()
  const [f, setF] = useState({ q: '', st: '', building: '', am: '' })
  const [edit, setEdit] = useState<Room | 'new' | null>(null)
  const list = rooms.filter(r => r.name.toLowerCase().includes(f.q.toLowerCase()) && (!f.st || String(r.maint) === f.st)
    && (!f.building || r.building === f.building) && (!f.am || r.amenities.includes(f.am)))
  const { sorted, th } = useSort(list, 'name')
  const { rows, pager } = usePaged(sorted)
  const clear = () => setF({ q: '', st: '', building: '', am: '' })

  return (
    <Page title="Phòng" action={<button className="btn bp" onClick={() => setEdit('new')}><Icon n="plus" s={16} />Thêm phòng</button>}>
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
        {rows.length === 0 && <Empty title="Không có dữ liệu phù hợp" text="Thử đổi từ khóa hoặc bỏ bớt bộ lọc."><button className="btn h-9!" onClick={clear}>Xóa lọc</button></Empty>}
        {pager}
      </section>
      {edit && <RoomForm room={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
    </Page>
  )
}
