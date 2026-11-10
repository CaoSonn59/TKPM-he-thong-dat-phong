// A3 — Danh sách người dùng, A4 — Tạo / Sửa người dùng (modal). Không có thao tác xóa: vô hiệu hóa bằng "Ngưng sử dụng".
import { useState, type FormEvent } from 'react'
import { dmy, type Sex, type User } from '../data'
import { useStore } from '../store'
import { Empty, Field, Icon, Modal, MultiPick, inp, usePaged, useSort } from '../ui'
import { Page } from './AdminLayout'

function UserForm({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { groups, saveUser } = useStore()
  const [v, setV] = useState({ id: user?.id ?? '', name: user?.name ?? '', sex: (user?.sex ?? 'Nam') as Sex, active: user?.active ?? true })
  const [gs, setGs] = useState(() => groups.filter(g => user && g.members.includes(user.id)).map(g => String(g.id)))
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

export default function Users() {
  const { users, groups } = useStore()
  const [f, setF] = useState({ q: '', group: '', active: '' })
  const [edit, setEdit] = useState<User | 'new' | null>(null)
  const list = users
    .map(u => ({ ...u, groups: groups.filter(g => g.members.includes(u.id)).map(g => g.name) }))
    .filter(u => `${u.id} ${u.name}`.toLowerCase().includes(f.q.toLowerCase()) && (!f.group || u.groups.includes(f.group)) && (!f.active || String(u.active) === f.active))
  const { sorted, th } = useSort(list, 'created', -1)
  const { rows, pager } = usePaged(sorted)
  const clear = () => setF({ q: '', group: '', active: '' })

  return (
    <Page title="Người dùng" action={<button className="btn bp" onClick={() => setEdit('new')}><Icon n="plus" s={16} />Tạo người dùng</button>}>
      <section className="card">
        <div className="filters">
          <div className="field flex-[1_1_300px]"><Icon n="search" /><input className="inp" type="search" placeholder="Tìm theo mã định danh hoặc họ tên" aria-label="Tìm theo mã định danh hoặc họ tên" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} /></div>
          <select className="sel" aria-label="Nhóm" value={f.group} onChange={e => setF({ ...f, group: e.target.value })}>
            <option value="">Tất cả nhóm</option>{groups.map(g => <option key={g.id}>{g.name}</option>)}
          </select>
          <select className="sel" aria-label="Trạng thái" value={f.active} onChange={e => setF({ ...f, active: e.target.value })}>
            <option value="">Tất cả trạng thái</option><option value="true">Đang hoạt động</option><option value="false">Ngưng sử dụng</option>
          </select>
          <button className="btn gh" onClick={clear}>Xóa lọc</button>
        </div>
        <div className="tw">
          <table className="tbl">
            <thead><tr>{th('id', 'Mã định danh')}{th('name', 'Họ và tên')}<th>Giới tính</th><th>Nhóm trực thuộc</th><th>Trạng thái</th>{th('created', 'Ngày tạo')}<th className="text-right!">Thao tác</th></tr></thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id}>
                  <td className="nw font-semibold tabular-nums">{u.id}</td>
                  <td className="nw">{u.name}</td>
                  <td>{u.sex}</td>
                  <td><div className="flex flex-wrap gap-1">
                    {u.groups.slice(0, 2).map(g => <span key={g} className="tag">{g}</span>)}
                    {u.groups.length > 2 && <span className="tag more" title={u.groups.slice(2).join(', ')}>+{u.groups.length - 2}</span>}
                    {u.groups.length === 0 && <span className="muted">—</span>}
                  </div></td>
                  <td><span className={`badge ${u.active ? 's-ok' : 's-off'}`}>{u.active ? 'Đang hoạt động' : 'Ngưng sử dụng'}</span></td>
                  <td className="nw">{dmy(u.created)}</td>
                  <td className="text-right"><button className="ib" title="Sửa" aria-label={`Sửa ${u.name}`} onClick={() => setEdit(u)}><Icon n="edit" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <Empty title="Không có dữ liệu phù hợp" text="Thử đổi từ khóa hoặc bỏ bớt bộ lọc."><button className="btn h-9!" onClick={clear}>Xóa lọc</button></Empty>}
        {pager}
      </section>
      {edit && <UserForm user={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
    </Page>
  )
}
