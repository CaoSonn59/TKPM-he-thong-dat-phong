// A4 — Tạo / Sửa người dùng (modal)
import { useState, type FormEvent } from 'react'
import { Field, Modal, MultiPick, inp } from '../../../shared/ui'
import { useGroups } from '../../groups/hooks'
import { useUserActions } from '../hooks'
import type { Sex, User } from '../model'

export function UserForm({ user, onClose }: { user: User | null; onClose: () => void }) {
  const groups = useGroups()
  const { saveUser } = useUserActions()
  const [v, setV] = useState({ id: user?.id ?? '', name: user?.name ?? '', sex: (user?.sex ?? 'Nam') as Sex, active: user?.active ?? true })
  const [gs, setGs] = useState(() =>
    user?.groups
      ? user.groups.map(g => String(g.id))
      : groups.filter(g => user && g.members.includes(user.id)).map(g => String(g.id))
  )
  const [e, setE] = useState<{ id?: string; name?: string }>({})

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const er: typeof e = {}
    if (!v.id.trim()) er.id = 'Vui lòng nhập mã định danh'
    if (!v.name.trim()) er.name = 'Vui lòng nhập họ và tên'
    if (!er.id && !er.name) {
      const dup = saveUser({ ...v, id: v.id.trim(), name: v.name.trim() }, gs.map(Number), user?.id)
      if (!dup) return onClose()
      er.id = dup
    }
    setE(er)
  }

  return (
    <Modal title={user ? 'Sửa người dùng' : 'Tạo người dùng'} onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn bp" form="user-form">{user ? 'Lưu cập nhật' : 'Lưu'}</button></>}>
      <form id="user-form" className="mb" onSubmit={submit} noValidate>
        <Field label="Mã định danh" req id="u-id" err={e.id} hint="Mã NV / SV / GV. Dùng làm tên đăng nhập và mật khẩu mặc định.">
          <input id="u-id" className={inp(e.id)} value={v.id} onChange={ev => setV({ ...v, id: ev.target.value })} />
        </Field>
        <Field label="Họ và tên" req id="u-name" err={e.name}><input id="u-name" className={inp(e.name)} value={v.name} onChange={ev => setV({ ...v, name: ev.target.value })} /></Field>
        <fieldset>
          <legend className="lb">Giới tính <span className="req">*</span></legend>
          <div className="flex flex-wrap gap-5">
            {(['Nam', 'Nữ', 'Khác'] as const).map(s => <label key={s} className="opt"><input type="radio" name="u-sex" checked={v.sex === s} onChange={() => setV({ ...v, sex: s })} />{s}</label>)}
          </div>
        </fieldset>
        <Field label="Nhóm người dùng" opt id="u-groups">
          <MultiPick id="u-groups" options={groups.map(g => ({ value: String(g.id), text: g.name }))} value={gs} onChange={setGs} placeholder="Chọn nhóm…" />
        </Field>
        {user && (
          <fieldset>
            <legend className="lb">Trạng thái</legend>
            <div className="seg">
              <label><input type="radio" name="u-st" checked={v.active} onChange={() => setV({ ...v, active: true })} /><span className="w-2 h-2 rounded-full bg-green-600" />Đang hoạt động</label>
              <label><input type="radio" name="u-st" checked={!v.active} onChange={() => setV({ ...v, active: false })} /><span className="w-2 h-2 rounded-full bg-gray-500" />Ngưng sử dụng</label>
            </div>
            <div className="hint">Tài khoản ngưng sử dụng không đăng nhập được. Lịch sử đặt phòng vẫn được giữ.</div>
          </fieldset>
        )}
      </form>
    </Modal>
  )
}
