// U7 / M7 — Chi tiết lịch đặt (drawer phía End-User)
import { Drawer, Icon, Skeleton, Stars } from '../../../shared/ui'
import { today } from '../../../shared/lib/clock'
import { dmy, longDate } from '../../../shared/lib/format'
import { useMe } from '../../auth/hooks'
import { useGroupName } from '../../groups/hooks'
import { useRoomReviews } from '../../reviews/hooks'
import { RoomDl } from '../../rooms/components/RoomDl'
import { useRoomOf } from '../../rooms/hooks'
import { useUserLabel } from '../../users/hooks'
import { useBookingDetailQuery } from '../hooks'
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
  const { data: detailData } = useBookingDetailQuery(b.id)
  const { data: roomData, isLoading: roomLoading } = useRoomReviews(b.roomId)

  const cur = detailData ? { ...b, ...detailData } : b
  const room = roomData?.room ?? roomOf(cur.roomId, cur.roomName)
  const todayStr = today()
  const own = cur.by === me!.id, cancelable = canCancel(cur, me!.id), ratable = canRate(cur, me!.id, todayStr)

  return (
    <Drawer label={cur.title} onClose={onClose}>
      <div className="dh"><div><StatusBadge s={cur.status} /><h2 className="text-[19px] font-bold mt-2">{cur.title}</h2></div><button className="ib" aria-label="Đóng" onClick={onClose}><Icon n="x" /></button></div>
      <div className="flex-auto overflow-y-auto">
        <ReasonBox b={cur} self={own} />
        <section className="sec"><h3 className="sh">Thông tin sự kiện</h3>
          <dl className="dl">
            <dt>Ngày</dt><dd>{longDate(cur.date)}</dd><dt>Thời gian</dt><dd>{cur.from} – {cur.to}</dd>
            <dt>Người đặt</dt><dd>{own ? <span className="you">Bạn</span> : userLabel(cur.by, cur.byName)}</dd>
            <dt>Đặt cho</dt><dd>{groupName(cur.groupId, cur.groupName)}</dd>
          </dl>
        </section>
        <section className="sec">
          <h3 className="sh">Thông tin phòng</h3>
          {roomLoading ? (
            <div className="flex flex-col gap-2.5" aria-busy="true">
              <Skeleton className="w-1/2" /><Skeleton className="w-2/3" /><Skeleton className="w-3/4" />
            </div>
          ) : <RoomDl r={room} />}
        </section>
        <Members b={cur} search />
        {cur.fb && own && (
          <section className="sec"><h3 className="sh">Phản hồi của bạn</h3>
            <div className="p-3.5 border border-gray-200 rounded-[10px]">
              <div className="flex items-center gap-2"><Stars n={cur.fb.stars} className="text-lg" /><span className="font-semibold">{STAR_LABELS[cur.fb.stars - 1]}</span></div>
              {cur.fb.text && <p className="mt-1.5">{cur.fb.text}</p>}
              <p className="small muted mt-1.5">Gửi ngày {dmy(cur.fb.at)}</p>
            </div>
            {ratable && <p className="small muted">Bạn có thể sửa đánh giá đến hết {dmy(addMonth(cur.date))}.</p>}
          </section>
        )}
      </div>
      {(cancelable || ratable) && (
        <div className="mf">
          {cancelable && <button className="btn bo" onClick={onCancel}>Hủy đặt phòng</button>}
          {ratable && <button className="btn bp" onClick={onRate}>{cur.fb ? 'Sửa đánh giá' : 'Đánh giá'}</button>}
        </div>
      )}
    </Drawer>
  )
}
