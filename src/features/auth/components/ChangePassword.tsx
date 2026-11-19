import { useState, type FormEvent } from 'react'
import { Field, Icon, Modal, PwInput } from '../../../shared/ui'
import { useChangePassword, useIsAdmin, useSession } from '../hooks'
import { pwClientErrors, strength, type PwErr } from '../logic'

const METER = [['', '#E5E7EB', ''], ['Yếu', '#DC2626', '#B91C1C'], ['Trung bình', '#D97706', '#92400E'], ['Khá', '#D97706', '#92400E'], ['Mạnh', '#16A34A', '#166534']]

// U10 / M10 / A13 — dùng chung cho End-User và Admin. Thành công thì đăng xuất về trang Đăng nhập.
export function ChangePassword({ onClose }: { onClose: () => void }) {
  const session = useSession()
  const isAdmin = useIsAdmin()
  const changePw = useChangePassword()
  const [v, setV] = useState({ cur: '', next: '', again: '' })
  const [e, setE] = useState<PwErr & { form?: string }>({})
  const s = strength(v.next)
  const set = (k: keyof typeof v) => (ev: { target: { value: string } }) => {
    setV({ ...v, [k]: ev.target.value })
    setE(prev => ({ ...prev, [k]: undefined, form: undefined }))
  }
  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const clientErr = pwClientErrors(v.cur, v.next, v.again, session ?? '')
    if (Object.keys(clientErr).length) return setE(clientErr)
    changePw.mutate({ cur: v.cur, next: v.next }, {
      onError: err => {
        const msg = err.message
        if (/hiện tại|không chính xác|không đúng|sai/i.test(msg)) setE({ cur: msg })
        else if (/mới|6 ký tự|trùng/i.test(msg)) setE({ next: msg })
        else setE({ form: msg })
      },
    })
  }
  return (
    <Modal title="Đổi mật khẩu" mobileBack w="md:max-w-[480px]" onClose={onClose}
      footer={<>
        <button className="btn max-md:hidden" disabled={changePw.isPending} onClick={onClose}>Hủy</button>
        <button className="btn bp max-md:w-full" disabled={changePw.isPending} form="pw-form">
          {changePw.isPending ? 'Đang cập nhật…' : 'Đổi mật khẩu'}
        </button>
      </>}>
      <form id="pw-form" className="mb" onSubmit={submit} noValidate>
        {e.form && <div className="alert" role="alert"><Icon n="alert" />{e.form}</div>}
        <Field label="Mật khẩu hiện tại" req id="pw-cur" err={e.cur}>
          <PwInput id="pw-cur" bad={!!e.cur} value={v.cur} disabled={changePw.isPending} onChange={set('cur')} autoComplete="current-password" />
        </Field>
        <Field label="Mật khẩu mới" req id="pw-next" err={e.next}
          hint={`Tối thiểu 6 ký tự, khác mật khẩu hiện tại và khác ${isAdmin ? 'tên đăng nhập' : 'mã định danh'}.`}>
          <PwInput id="pw-next" bad={!!e.next} value={v.next} disabled={changePw.isPending} onChange={set('next')} autoComplete="new-password" />
          <div className="flex items-center gap-2.5 mt-2">
            <div className="grid grid-cols-4 gap-1 flex-1">{[1, 2, 3, 4].map(i => <span key={i} className="h-1.5 rounded-sm" style={{ background: i <= s ? METER[s][1] : '#E5E7EB' }} />)}</div>
            <span className="small font-semibold min-w-16 text-right" style={{ color: METER[s][2] }}>{METER[s][0]}</span>
          </div>
        </Field>
        <Field label="Nhập lại mật khẩu mới" req id="pw-again" err={e.again}>
          <PwInput id="pw-again" bad={!!e.again} value={v.again} disabled={changePw.isPending} onChange={set('again')} autoComplete="new-password" />
        </Field>
      </form>
    </Modal>
  )
}
