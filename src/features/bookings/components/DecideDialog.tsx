import { Confirm } from '../../../shared/ui'
import { useRoomOf } from '../../rooms/hooks'
import { useToast } from '../../toast/hooks'
import { useBookingActions } from '../hooks'
import { when, type Booking } from '../model'

export type Act = { type: 'ok' | 'no' | 'cancel'; b: Booking }

const ACT = {
  ok: { title: 'Chấp nhận lịch đặt?', icon: 'check', tone: 'green', done: 'Đã chấp nhận lịch đặt', ph: undefined },
  no: { title: 'Từ chối lịch đặt?', icon: 'x', tone: 'red', done: 'Đã từ chối lịch đặt', ph: 'Ví dụ: Phòng đã được ưu tiên cho lịch thi' },
  cancel: { title: 'Hủy khẩn cấp lịch đặt?', icon: 'ban', tone: 'red', done: 'Đã hủy lịch đặt', ph: 'Ví dụ: Phòng mất điện đột xuất' },
} as const

export function Decide({ act: { type, b }, onClose }: { act: Act; onClose: () => void }) {
  const { setStatus } = useBookingActions()
  const roomOf = useRoomOf()
  const toast = useToast()
  const room = roomOf(b.roomId).name, c = ACT[type]
  const t = <strong className="text-gray-900">{b.title}</strong>
  return (
    <Confirm title={c.title} icon={c.icon} tone={c.tone} placeholder={c.ph} onClose={onClose}
      reason={type === 'ok' ? undefined : 'Lý do (không bắt buộc)'} hint="Người đặt sẽ thấy lý do này"
      onOk={r => { setStatus(b.id, type, r); toast(c.done, `${b.title} · ${room}`); onClose() }}>
      {type === 'ok' ? <>Chấp nhận lịch đặt {t} tại <strong className="text-gray-900">{room}</strong>, {when(b)}?</>
        : type === 'no' ? <>Lịch {t} sẽ chuyển sang “Không chấp nhận” và khung giờ được giải phóng.</>
          : <>Lịch {t} đã được chấp nhận. Sau khi hủy, trạng thái chuyển sang “Đã hủy”.</>}
    </Confirm>
  )
}
