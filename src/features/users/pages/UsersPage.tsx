// A3 — Danh sách người dùng. Không có thao tác xóa: vô hiệu hóa bằng "Ngưng sử dụng".
import { useState } from 'react'
import { Empty, Icon, usePaged, useSort } from '../../../shared/ui'
import { dmy } from '../../../shared/lib/format'
import { Page } from '../../../layouts/AdminPage'
import { useGroups } from '../../groups/hooks'
import { UserForm } from '../components/UserForm'
import { useUsers, useUsersQuery } from '../hooks'
import type { User } from '../model'

export default function UsersPage() {
  const users = useUsers()
  const { isLoading, error } = useUsersQuery()
  const groups = useGroups()
  const [f, setF] = useState({ q: '', group: '', active: '' })
  const [edit, setEdit] = useState<User | 'new' | null>(null)
  const list = users
    .map(u => ({ ...u, groups: (u.inGroups ?? []).map(g => g.name) }))
    .filter(u => `${u.id} ${u.name}`.toLowerCase().includes(f.q.toLowerCase()) && (!f.group || u.groups.includes(f.group)) && (!f.active || String(u.active) === f.active))
  const { sorted, th } = useSort(list, 'created', -1)
  const { rows, pager } = usePaged(sorted)
  const clear = () => setF({ q: '', group: '', active: '' })

  return (
    <Page title="Người dùng" action={<button className="btn bp" onClick={() => setEdit('new')}><Icon n="plus" s={16} />Tạo người dùng</button>}>
      {error && <div className="alert" role="alert"><Icon n="alert" />{error.message}</div>}
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
        {rows.length === 0 && !isLoading && <Empty title="Không có dữ liệu phù hợp" text="Thử đổi từ khóa hoặc bỏ bớt bộ lọc."><button className="btn h-9!" onClick={clear}>Xóa lọc</button></Empty>}
        {pager}
      </section>
      {edit && <UserForm user={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
    </Page>
  )
}
