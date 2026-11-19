// A6 — Tạo / Sửa nhóm (trang riêng). Thay đổi thành viên chỉ được lưu khi bấm Lưu.
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Field, Icon, MultiPick, inp, usePaged } from '../../../shared/ui'
import { dmy } from '../../../shared/lib/format'
import { Page } from '../../../layouts/AdminPage'
import { useUsers } from '../../users/hooks'
import { useToast } from '../../toast/hooks'
import { useGroupDetailQuery, useSaveGroup } from '../hooks'
import type { Group } from '../model'

const Step = ({ n }: { n: number }) => <span className="inline-flex w-6 h-6 mr-2 items-center justify-center rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold">{n}</span>

// /admin/nhom/moi → tạo mới; /admin/nhom/:id → tải chi tiết nhóm (GET /admin/groups/:id) rồi mới dựng form.
export default function GroupFormPage() {
  const { id } = useParams()
  const isNew = id === 'moi'
  const { data: g, error } = useGroupDetailQuery(isNew ? undefined : Number(id))
  if (!isNew && !g) return (
    <Page narrow title="Sửa nhóm" crumb={<><Link to="/admin/nhom">Nhóm người dùng</Link> / Sửa nhóm</>}>
      {error ? <div className="alert" role="alert"><Icon n="alert" />{error.message}</div> : <p className="muted">Đang tải…</p>}
    </Page>
  )
  return <GroupForm g={g} />
}

function GroupForm({ g }: { g?: Group }) {
  const nav = useNavigate()
  const users = useUsers()
  const saveGroup = useSaveGroup()
  const toast = useToast()
  const [name, setName] = useState(g?.name ?? '')
  const [members, setMembers] = useState(g?.members ?? [])
  const [pick, setPick] = useState<string[]>([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const list = users.filter(u => members.includes(u.id) && `${u.id} ${u.name}`.toLowerCase().includes(q.toLowerCase()))
  const { rows, pager } = usePaged(list, 8, false)
  const title = g ? `Sửa nhóm: ${g.name}` : 'Tạo nhóm'

  const save = () => {
    if (!name.trim()) return setErr('Vui lòng nhập tên nhóm')
    saveGroup.mutate({ id: g?.id, name: name.trim(), members }, {
      onSuccess: () => nav('/admin/nhom'),
      // 409 trùng tên → báo ở ô Tên nhóm; lỗi khác (mất kết nối…) báo bằng toast.
      onError: e => e.message.startsWith('Tên nhóm') ? setErr(e.message) : toast('Không lưu được nhóm', e.message, true),
    })
  }

  return (
    <Page narrow title={title} crumb={<><Link to="/admin/nhom">Nhóm người dùng</Link> / {g ? 'Sửa nhóm' : 'Tạo nhóm'}</>}
      foot={
        <div className="foot">
          <span className="small muted">{g ? `Tạo ngày ${dmy(g.created)}` : 'Nhóm mới'}</span>
          <div className="flex gap-2"><Link className="btn" to="/admin/nhom">Hủy</Link><button className="btn bp" disabled={saveGroup.isPending} onClick={save}>{g ? 'Lưu cập nhật' : 'Lưu'}</button></div>
        </div>
      }>
      <section className="card">
        <div className="ch px-5! py-4!"><h2 className="text-base font-semibold"><Step n={1} />Thông tin nhóm</h2></div>
        <div className="p-5">
          <Field label="Tên nhóm" req id="g-name" err={err} hint="Ví dụ: Lớp CNTT2026/11, Phòng Marketing. Tên nhóm không được trùng.">
            <input id="g-name" className={`${inp(err)} max-w-[480px]`} value={name} onChange={e => { setName(e.target.value); setErr('') }} />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="ch px-5! py-4!"><h2 className="text-base font-semibold"><Step n={2} />Thành viên</h2><span className="muted"><strong className="text-gray-900">{members.length}</strong> thành viên</span></div>
        <div className="flex flex-wrap items-start gap-2 p-5 pb-4">
          <div className="flex-[1_1_420px]">
            <MultiPick label="Tìm người dùng theo mã định danh hoặc họ tên" placeholder="Tìm theo mã định danh hoặc họ tên" takenNote="Đã trong nhóm"
              options={users.filter(u => u.active).map(u => ({ value: u.id, text: `${u.id} – ${u.name}`, taken: members.includes(u.id) }))} value={pick} onChange={setPick} />
          </div>
          <button className="btn bp" disabled={!pick.length} onClick={() => { setMembers([...pick, ...members]); setPick([]) }}><Icon n="plus" s={16} />Thêm vào nhóm{pick.length > 0 && ` (${pick.length})`}</button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3">
          <div className="field flex-[0_1_320px]"><Icon n="search" /><input className="inp h-9!" type="search" placeholder="Lọc nhanh trong danh sách thành viên" aria-label="Lọc nhanh trong danh sách thành viên" value={q} onChange={e => setQ(e.target.value)} /></div>
          <span className="small muted">Thay đổi thành viên chỉ được lưu khi bấm “{g ? 'Lưu cập nhật' : 'Lưu'}”.</span>
        </div>
        <div className="tw">
          <table className="tbl border-t border-gray-200">
            <thead><tr><th>Mã định danh</th><th>Họ và tên</th><th>Giới tính</th><th className="text-right!">Gỡ</th></tr></thead>
            <tbody>
              {rows.map(m => (
                <tr key={m.id}>
                  <td className="font-semibold tabular-nums">{m.id}</td><td>{m.name}</td><td>{m.sex}</td>
                  <td className="text-right py-1.5!"><button className="ib no" title="Gỡ khỏi nhóm" aria-label={`Gỡ ${m.name} khỏi nhóm`} onClick={() => setMembers(members.filter(x => x !== m.id))}><Icon n="x" /></button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="text-center muted py-8!">{members.length ? 'Không có thành viên phù hợp' : 'Nhóm chưa có thành viên'}</td></tr>}
            </tbody>
          </table>
        </div>
        {pager}
      </section>
    </Page>
  )
}
