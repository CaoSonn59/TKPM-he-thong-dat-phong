import { dmy } from '../../../shared/lib/format'
import type { Booking } from '../model'

// Chỉ hiện khi Không chấp nhận / Đã hủy và có nhập lý do.
export function ReasonBox({ b, self }: { b: Booking; self?: boolean }) {
  if (!b.reason?.text) return null
  return (
    <section className="sec pb-1! border-0!">
      <div className="reason">
        <div className="font-semibold">{b.status === 'no' ? 'Lý do từ chối' : 'Lý do hủy'}</div>
        <p className="mt-1">{b.reason.text}</p>
        <p className="small mt-1.5 text-red-800">{b.reason.by && <>{b.reason.by === 'admin' ? 'Quản trị viên' : self ? 'Bạn' : 'Người đặt'} · </>}{dmy(b.reason.at)}</p>
      </div>
    </section>
  )
}
