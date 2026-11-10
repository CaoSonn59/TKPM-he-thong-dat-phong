// Khung End-User: thanh điều hướng trên (desktop), tab bar dưới (mobile)
import { NavLink, Outlet } from 'react-router-dom'
import { initials } from '../data'
import { AccountMenu } from '../parts'
import { useStore } from '../store'
import { Icon } from '../ui'

export default function UserLayout() {
  const { me, myGroups } = useStore()
  if (!me) return null
  const ml = ({ isActive }: { isActive: boolean }) => `ml ${isActive ? 'on' : ''}`
  const tb = ({ isActive }: { isActive: boolean }) => `tb ${isActive ? 'on' : ''}`
  return (
    <div className="touch min-h-screen flex flex-col max-md:pb-20">
      <header className="topnav max-md:hidden">
        <NavLink to="/" className="flex items-center gap-2.5 font-bold text-[15px] text-gray-900 no-underline"><span className="logo w-[34px]! h-[34px]!">ĐP</span>Hệ thống đặt phòng</NavLink>
        <nav className="flex flex-wrap gap-1" aria-label="Điều hướng chính">
          <NavLink to="/" end className={ml}><Icon n="search" />Tìm phòng</NavLink>
          <NavLink to="/lich-su" className={ml}><Icon n="cal" />Lịch sử đặt phòng</NavLink>
        </nav>
        <AccountMenu wide initials={initials(me.name)} label={`${me.id} – ${me.name}`}>
          <div className="flex gap-3 p-3 mb-1.5 border-b border-gray-100">
            <span className="av w-10! h-10! text-sm!">{initials(me.name)}</span>
            <div>
              <div className="font-semibold">{me.name}</div>
              <div className="small muted">Mã định danh: {me.id}</div>
              <div className="small muted mt-2">Nhóm đang thuộc</div>
              <div className="flex flex-wrap gap-1 mt-1">{myGroups.length ? myGroups.map(g => <span key={g.id} className="tag pill h-[22px]!">{g.name}</span>) : <span className="small muted">Chưa thuộc nhóm nào</span>}</div>
            </div>
          </div>
        </AccountMenu>
      </header>
      <main className="w-full max-w-[1200px] mx-auto flex flex-col gap-4 md:gap-5 px-4 md:px-7 pt-5 md:pt-7 pb-12"><Outlet /></main>
      <nav className="tabbar md:hidden" aria-label="Điều hướng chính">
        <NavLink to="/" end className={tb}><Icon n="search" s={20} />Tìm phòng</NavLink>
        <NavLink to="/lich-su" className={tb}><Icon n="cal" s={20} />Lịch sử</NavLink>
        <NavLink to="/tai-khoan" className={tb}><Icon n="user" s={20} />Tài khoản</NavLink>
      </nav>
    </div>
  )
}
