// A5 — Danh sách nhóm người dùng
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { dmy, type Group } from '../data'
import { useStore } from '../store'
import { Confirm, Empty, Icon, usePaged, useSort } from '../ui'
import { Page } from './AdminLayout'

export default function Groups() {
  const { groups, deleteGroup, toast } = useStore()
  const [q, setQ] = useState('')
  const [del, setDel] = useState<Group | null>(null)
  const list = groups.filter(g => g.name.toLowerCase().includes(q.toLowerCase())).map(g => ({ ...g, n: g.members.length }))
  const { sorted, th } = useSort(list, 'name')
  const { rows, pager } = usePaged(sorted)

  return (
    <Page title="Nhóm người dùng" action={<Link className="btn bp" to="/admin/nhom/moi"><Icon n="plus" s={16} />Tạo nhóm</Link>}>
      <section className="card">
        <div className="filters">
          <div className="field flex-[0_1_380px]"><Icon n="search" /><input className="inp" type="search" placeholder="Tìm theo tên nhóm" aria-label="Tìm theo tên nhóm" value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className="btn gh" onClick={() => setQ('')}>Xóa lọc</button>
        </div>
        <div className="tw">
          <table className="tbl">
            <thead><tr>{th('name', 'Tên nhóm')}{th('n', 'Số thành viên')}{th('created', 'Ngày tạo')}<th className="text-right!">Thao tác</th></tr></thead>
            <tbody>
              {rows.map(g => (
                <tr key={g.id}>
                  <td><div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-gray-100 text-gray-600"><Icon n="users" s={16} /></span>
                    <Link to={`/admin/nhom/${g.id}`} className="font-semibold text-gray-900 no-underline">{g.name}</Link>
                  </div></td>
                  <td className="tabular-nums">{g.n} thành viên</td>
                  <td>{dmy(g.created)}</td>
                  <td><div className="flex gap-0.5 justify-end">
                    <Link className="ib" to={`/admin/nhom/${g.id}`} title="Sửa" aria-label={`Sửa ${g.name}`}><Icon n="edit" /></Link>
                    <button className="ib no" title="Xóa" aria-label={`Xóa ${g.name}`} onClick={() => setDel(g)}><Icon n="trash" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <Empty title="Không có dữ liệu phù hợp" text="Thử đổi từ khóa."><button className="btn h-9!" onClick={() => setQ('')}>Xóa lọc</button></Empty>}
        {pager}
      </section>
      {del && (
        <Confirm title={`Xóa nhóm “${del.name}”?`} icon="trash" onClose={() => setDel(null)}
          onOk={() => { deleteGroup(del.id); toast('Đã xóa nhóm', del.name); setDel(null) }}>
          Xóa nhóm sẽ gỡ toàn bộ thành viên khỏi nhóm. Các lịch đặt cũ vẫn được giữ.
        </Confirm>
      )}
    </Page>
  )
}
