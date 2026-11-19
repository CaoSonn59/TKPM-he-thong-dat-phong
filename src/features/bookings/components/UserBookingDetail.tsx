// U7 — Chi tiết lịch đặt (drawer phía End-User)
import { Drawer, Icon, Stars } from '../../../shared/ui'
import { dmy, longDate } from '../../../shared/lib/format'
import { TODAY } from '../../../mocks/clock'
import { useMe } from '../../auth/hooks'
import { useGroupName } from '../../groups/hooks'
import { RoomDl } from '../../rooms/components/RoomDl'
import { useRoomOf } from '../../rooms/hooks'
import { useUserLabel } from '../../users/hooks'
import { addMonth, canCancel, canRate } from '../logic'
import { STAR_LABELS, type Booking } from '../model'
import { Members } from './Members'
import { ReasonBox } from './ReasonBox'
import { StatusBadge } from './StatusBadge'

export function UserBookingDetail({ b, onClose, onCancel, onRate }: { b: Booking; onClose: () => void; onCancel: () => void; onRate: () => void }) {
  const me = useMe()
  const roomOf = useRoomOf()
  const groupName = useGroupName()
  const userLabel = useUserLabel()
  const own = b.by === me!.id, cancelable = canCancel(b, me!.id), ratable = canRate(b, me!.id, TODAY)
  return (
    <Drawer label={b.title} onClose={onClose}>
      <div className="dh"><div><StatusBadge s={b.status} /><h2 className="text-[19px] font-bold mt-2">{b.title}</h2></div><button className="ib" aria-label="Đóng" onClick={onClose}><Icon n="x" /></button></div>
      <div className="flex-auto overflow-y-auto">
        <ReasonBox b={b} self={own} />
        <section className="sec"><h3 className="sh">Thông tin sự kiện</h3>
          <dl className="dl">
            <dt>Ngày</dt><dd>{longDate(b.date)}</dd><dt>Thời gian</dt><dd>{b.from} – {b.to}</dd>
            <dt>Người đặt</dt><dd>{own ? <span className="you">Bạn</span> : userLabel(b.by)}</dd><dt>Đặt cho</dt><dd>{groupName(b.groupId)}</dd>
          </dl>
        </section>
        <section className="sec"><h3 className="sh">Thông tin phòng</h3><RoomDl r={roomOf(b.roomId)} /></section>
        <Members b={b} search />
        {b.fb && own && (
          <section className="sec"><h3 className="sh">Phản hồi của bạn</h3>
            <div className="p-3.5 border border-gray-200 rounded-[10px]">
              <div className="flex items-center gap-2"><Stars n={b.fb.stars} className="text-lg" /><span className="font-semibold">{STAR_LABELS[b.fb.stars - 1]}</span></div>
              {b.fb.text && <p className="mt-1.5">{b.fb.text}</p>}
              <p className="small muted mt-1.5">Gửi ngày {dmy(b.fb.at)}</p>
            </div>
            {ratable && <p className="small muted">Bạn có thể sửa đánh giá đến hết {dmy(addMonth(b.date))}.</p>}
          </section>
        )}
      </div>
      {(cancelable || ratable) && (
        <div className="mf">
          {cancelable && <button className="btn bo" onClick={onCancel}>Hủy đặt phòng</button>}
          {ratable && <button className="btn bp" onClick={onRate}>{b.fb ? 'Sửa đánh giá' : 'Đánh giá'}</button>}
        </div>
      )}
    </Drawer>
  )
}
