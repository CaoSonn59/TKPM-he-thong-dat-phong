import { useState } from 'react'
import { Icon } from '../../../shared/ui'
import { initials } from '../../../shared/lib/format'
import { useSession } from '../../auth/hooks'
import { useGroup } from '../../groups/hooks'
import type { Booking } from '../model'

export function Members({ b, avatars, search }: { b: Booking; avatars?: boolean; search?: boolean }) {
  const session = useSession()
  const [open, setOpen] = useState(b.status !== 'no' && b.status !== 'cancel')
  const [all, setAll] = useState(false)
  const [q, setQ] = useState('')
  const g = useGroup(b.members ? null : b.groupId)
  const memberList = b.members ?? g?.memberList
  if (!memberList?.length) return null
  const count = b.members ? b.members.length : g?.count ?? memberList.length
  const list = memberList.filter(u => `${u.id} ${u.name}`.toLowerCase().includes(q.toLowerCase()))
    .sort((x, y) => +(y.id === b.by) - +(x.id === b.by))
  const shown = all || q ? list : list.slice(0, 5)
  return (
    <section className="sec">
      <div className="flex items-center justify-between">
        <h3 className="sh">Thành viên tham gia · {count}</h3>
        <button className="lnk" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Thu gọn' : 'Mở rộng'}<Icon n={open ? 'up' : 'down'} s={16} /></button>
      </div>
      {open && <>
        {search && <div className="field"><Icon n="search" s={16} /><input className="inp h-[38px]!" type="search" placeholder="Tìm theo mã hoặc họ tên" aria-label="Tìm thành viên" value={q} onChange={e => setQ(e.target.value)} /></div>}
        <div>
          {shown.map(u => avatars
            ? <div key={u.id} className="mem"><span className="av">{initials(u.name)}</span><div><div className="font-medium">{u.name}</div><div className="muted small">{u.id}{u.id === b.by && ' · người đặt'}</div></div></div>
            : <div key={u.id} className="mem justify-between"><span>{u.name} {u.id === session && <span className="muted small">(bạn)</span>}</span><span className="muted small">{u.id}</span></div>)}
        </div>
        {!all && !q && list.length > 5 && <button className="lnk self-start" onClick={() => setAll(true)}>Xem thêm {list.length - 5} thành viên</button>}
      </>}
    </section>
  )
}
