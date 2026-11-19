import type { ReactNode } from 'react'
import { AccountMenu } from '../features/auth/components/AccountMenu'
import { useAuthUser } from '../features/auth/hooks'
import { initials } from '../shared/lib/format'

// Khuôn chung của mọi trang Admin: header (breadcrumb + tiêu đề + nút chính + tài khoản) và vùng nội dung.
export function Page({ title, crumb, action, narrow, foot, children }: {
  title: string; crumb?: ReactNode; action?: ReactNode; narrow?: boolean; foot?: ReactNode; children: ReactNode
}) {
  const name = useAuthUser()?.full_name || 'Quản trị viên hệ thống'
  return <>
    <header className="top">
      <div><div className="crumb">{crumb ?? `Quản trị / ${title}`}</div><h1 className="text-xl font-bold">{title}</h1></div>
      <div className="flex items-center gap-3">
        {action}
        <AccountMenu initials={initials(name)} label={name}>
          <div className="px-2.5 pt-2 pb-2.5 mb-1.5 border-b border-gray-100"><div className="font-semibold">{name}</div><div className="muted small">Quản trị viên hệ thống</div></div>
        </AccountMenu>
      </div>
    </header>
    <main className={`w-full ${narrow ? 'max-w-[1040px]' : 'max-w-[1400px]'} flex flex-col gap-4 px-7 pt-6 pb-10`}>{children}</main>
    {foot}
  </>
}
