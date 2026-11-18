// A10 — Thêm / Sửa phòng (modal)
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Field, Icon, Modal, MultiPick, inp } from '../../../shared/ui'
import { useSaveRoom } from '../hooks'
import { AMENITIES, type Room } from '../model'

export function RoomForm({ room, onClose }: { room: Room | null; onClose: () => void }) {
  const save = useSaveRoom()
  const [v, setV] = useState({ name: room?.name ?? '', min: String(room?.min ?? ''), max: String(room?.max ?? ''), building: room?.building ?? '', floor: room?.floor ?? '', amenities: room?.amenities ?? [], maint: room?.maint ?? false })
  const [e, setE] = useState<Partial<Record<'name' | 'min' | 'max' | 'loc' | 'form', string>>>({})
  const set = (k: 'name' | 'min' | 'max' | 'building' | 'floor') => (ev: { target: { value: string } }) => setV({ ...v, [k]: ev.target.value })
  const upcoming = room?.upcoming ?? 0
  const blocked = !!room && !room.maint && v.maint && upcoming > 0

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const er: typeof e = {}
    if (!v.name.trim()) er.name = 'Vui lòng nhập tên phòng'
    if (!(+v.min >= 1)) er.min = 'Sức chứa tối thiểu phải từ 1'
    if (!(+v.max >= +v.min)) er.max = 'Sức chứa tối đa phải lớn hơn hoặc bằng sức chứa tối thiểu'
    if (!v.building.trim() || !v.floor.trim()) er.loc = 'Vui lòng nhập tòa nhà và lầu'
    if (!Object.keys(er).length && !blocked) {
      save.mutate({ id: room?.id, room: { ...v, name: v.name.trim(), building: v.building.trim(), floor: v.floor.trim(), min: +v.min, max: +v.max } }, {
        onSuccess: onClose,
        // 409 trùng tên → báo ở ô Tên phòng; lỗi khác (sức chứa, còn lịch sắp tới, mất kết nối…) báo đầu form.
        onError: err => setE(err.message.startsWith('Tên phòng') ? { name: err.message } : { form: err.message }),
      })
    }
    setE(er)
  }

  return (
    <Modal title={room ? 'Sửa phòng' : 'Thêm phòng'} onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn bp" form="room-form" disabled={blocked || save.isPending}>{room ? 'Lưu cập nhật' : 'Lưu'}</button></>}>
      <form id="room-form" className="mb" onSubmit={submit} noValidate>
        {e.form && <div className="alert" role="alert"><Icon n="alert" />{e.form}</div>}
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
