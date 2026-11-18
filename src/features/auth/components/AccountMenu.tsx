import { useState, type ReactNode } from 'react'
import { Icon } from '../../../shared/ui'
import { useAuthActions } from '../hooks'
import { ChangePassword } from './ChangePassword'

export function AccountMenu({ initials: ini, label, wide, children }: { initials: string; label: string; wide?: boolean; children: ReactNode }) {
  const { logout } = useAuthActions()
  const [open, setOpen] = useState(false)
  const [pw, setPw] = useState(false)
  return (
    <div className="relative">
      <button className="acct" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="av">{ini}</span>{label}<Icon n={open ? 'up' : 'down'} s={16} />
      </button>
      {open && <>
        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
        <div className={`menu ${wide ? 'w-[300px]!' : ''}`} role="menu">
          {children}
          <button className="mi" role="menuitem" onClick={() => { setOpen(false); setPw(true) }}><Icon n="lock" className="text-gray-600" />Đổi mật khẩu</button>
          <button className="mi red" role="menuitem" onClick={logout}><Icon n="logout" />Đăng xuất</button>
        </div>
      </>}
      {pw && <ChangePassword onClose={() => setPw(false)} />}
    </div>
  )
}
