// Mobile · Tài khoản (U2): thông tin cơ bản, Đổi mật khẩu, Đăng xuất
import { useState } from 'react'
import { initials } from '../data'
import { ChangePassword } from '../parts'
import { useStore } from '../store'
import { Icon } from '../ui'

export default function Account() {
  const { me, myGroups, logout } = useStore()
  const [pw, setPw] = useState(false)
  if (!me) return null
  return <>
    <h1 className="text-[22px] md:text-2xl font-bold">Tài khoản</h1>
    <section className="card rounded-2xl! flex flex-col gap-3.5 p-[18px] max-w-[480px]">
      <div className="flex items-center gap-3.5">
        <span className="av w-14! h-14! text-lg!">{initials(me.name)}</span>
        <div><div className="text-lg font-bold">{me.name}</div><div className="muted text-sm">Mã định danh: {me.id}</div></div>
      </div>
      <div>
        <div className="muted text-[13px] font-semibold mb-1.5">Nhóm đang thuộc</div>
        <div className="flex flex-wrap gap-1.5">{myGroups.length ? myGroups.map(g => <span key={g.id} className="tag pill h-7! text-[13px]!">{g.name} · {g.members.length}</span>) : <span className="muted">Chưa thuộc nhóm nào</span>}</div>
      </div>
    </section>
    <nav className="card rounded-2xl! max-w-[480px]" aria-label="Tài khoản">
      <button className="row" onClick={() => setPw(true)}><Icon n="lock" s={20} className="text-gray-600" />Đổi mật khẩu<Icon n="right" s={20} className="ml-auto text-gray-400" /></button>
      <button className="row text-red-700" onClick={logout}><Icon n="logout" s={20} />Đăng xuất</button>
    </nav>
    {pw && <ChangePassword onClose={() => setPw(false)} />}
  </>
}
