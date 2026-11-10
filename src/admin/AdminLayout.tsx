import { useState, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AccountMenu } from '../parts'
import { useStore } from '../store'
import { Icon, type IconName } from '../ui'

const NAV: [to: string, label: string, icon: IconName][] = [
  ['/admin', 'Tổng quan', 'grid'], ['/admin/dat-phong', 'Đặt phòng', 'calCheck'], ['/admin/phong', 'Phòng', 'door'],
  ['/admin/nguoi-dung', 'Người dùng', 'user'], ['/admin/nhom', 'Nhóm người dùng', 'users'], ['/admin/bao-cao', 'Báo cáo & thống kê', 'chart'],
]

export default function AdminLayout() {
  const { bookings } = useStore()
  const [mini, setMini] = useState(false)
  const wait = bookings.filter(b => b.status === 'wait').length
  return (
    <div className="flex flex-wrap min-h-screen">
      <nav className={`side ${mini ? 'flex-none w-16' : 'flex-[1_1_232px] md:max-w-[232px]'}`} aria-label="Điều hướng chính">
        <div className="flex items-center gap-2.5 px-1 pt-1 pb-[18px] overflow-hidden">
          <div className="logo">ĐP</div>
          {!mini && <div className="whitespace-nowrap"><div className="font-bold text-[15px]">Hệ thống đặt phòng</div><div className="muted small">Trang quản trị</div></div>}
        </div>
        {NAV.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/admin'} title={mini ? label : undefined} className={({ isActive }) => `nav ${isActive ? 'on' : ''}`}>
            <Icon n={icon} />{!mini && label}
            {!mini && to === '/admin/dat-phong' && wait > 0 && <span className="cnt" aria-label={`${wait} yêu cầu chờ duyệt`}>{wait}</span>}
          </NavLink>
        ))}
        <button className="nav mt-auto" aria-label={mini ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'} aria-expanded={!mini} onClick={() => setMini(!mini)}>
          <Icon n="collapse" className={mini ? 'rotate-180' : ''} />{!mini && 'Thu gọn'}
        </button>
      </nav>
      <div className="flex-[999_1_560px] min-w-0 flex flex-col"><Outlet /></div>
    </div>
  )
}

// Khuôn chung của mọi trang Admin: header (breadcrumb + tiêu đề + nút chính + tài khoản) và vùng nội dung.
export function Page({ title, crumb, action, narrow, foot, children }: {
  title: string; crumb?: ReactNode; action?: ReactNode; narrow?: boolean; foot?: ReactNode; children: ReactNode
}) {
  const { authUser } = useStore()
  const roleLabel = authUser?.role || 'Admin'
  const fullName = authUser?.full_name || 'Quản trị viên hệ thống'
  return <>
    <header className="top">
      <div><div className="crumb">{crumb ?? `Quản trị / ${title}`}</div><h1 className="text-xl font-bold">{title}</h1></div>
      <div className="flex items-center gap-3">
        {action}
        <AccountMenu initials={roleLabel[0]?.toUpperCase() || 'A'} label={roleLabel}>
          <div className="px-2.5 pt-2 pb-2.5 mb-1.5 border-b border-gray-100"><div className="font-semibold">{roleLabel}</div><div className="muted small">{fullName}</div></div>
        </AccountMenu>
      </div>
    </header>
    <main className={`w-full ${narrow ? 'max-w-[1040px]' : 'max-w-[1400px]'} flex flex-col gap-4 px-7 pt-6 pb-10`}>{children}</main>
    {foot}
  </>
}
