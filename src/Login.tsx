// U1 / M1 — Màn hình Đăng nhập dành cho Người dùng cuối (End-User)
import { useState, type FormEvent } from 'react'
import { useStore } from './store'
import { Field, Icon, PwInput } from './ui'

export default function Login() {
  const { login } = useStore()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setErr(null)
    setTimeout(() => {
      const er = login(id, pw)
      setBusy(false)
      setErr(er)
      if (er && !er.startsWith('Tài khoản')) setPw('') // Sai mật khẩu: giữ lại tên đăng nhập để nhập lại
    }, 250)
  }

  return (
    <main className="touch min-h-screen flex md:items-center justify-center px-6 pt-16 pb-10 md:p-10 max-md:bg-white">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-[52px] h-[52px] flex items-center justify-center rounded-[14px] bg-indigo-700 text-white text-lg font-bold">ĐP</div>
          <h1 className="text-2xl font-bold">Hệ thống đặt phòng</h1>
          <p className="text-gray-600 max-md:hidden">Đặt phòng học, phòng họp nhanh trong vài bước</p>
          <p className="text-gray-600 md:hidden">Đăng nhập để tìm và đặt phòng</p>
        </div>
        <form onSubmit={submit} className="w-full flex flex-col gap-[18px] md:p-7 md:bg-white md:border md:border-gray-200 md:rounded-[14px] md:shadow-[0_8px_24px_rgba(17,24,39,.06)]">
          <h2 className="text-lg font-semibold max-md:hidden">Đăng nhập</h2>
          {err && <div className="alert" role="alert"><Icon n={err.startsWith('Tài khoản') ? 'ban' : 'alert'} />{err}</div>}
          <Field label="Tên đăng nhập" req id="login-id">
            <input id="login-id" className="inp" required value={id} onChange={e => setId(e.target.value)} placeholder="Mã NV / Mã SV / Mã GV" autoComplete="username" />
          </Field>
          <Field label="Mật khẩu" req id="login-pw" hint="Mật khẩu mặc định là mã định danh của bạn.">
            <PwInput id="login-pw" required value={pw} onChange={e => setPw(e.target.value)} placeholder="Nhập mật khẩu" autoComplete="current-password" />
          </Field>
          <button disabled={busy} className="btn bp h-11! text-[15px]">
            {busy ? <><Icon n="spin" className="animate-spin" />Đang đăng nhập...</> : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </main>
  )
}

