// U4 — Chi tiết phòng (kèm khung giờ đang tìm và đánh giá gần đây)
import { Icon, Modal, Skeleton, Stars } from '../../../shared/ui'
import { dmy, longDate } from '../../../shared/lib/format'
import { Rating } from '../../rooms/components/Rating'
import { AM_ICON, cap, loc, type Room } from '../../rooms/model'
import { useRoomReviews } from '../../reviews/hooks'
import type { SearchQuery } from '../logic'

export function RoomDetailDialog({ r, q, onClose, onBook }: { r: Room; q: SearchQuery; onClose: () => void; onBook: () => void }) {
  const { data, isLoading, error } = useRoomReviews(r.id)
  const reviews = (data?.reviews ?? []).slice(0, 5) // backend đã sắp mới nhất trước
  return (
    <Modal title={r.name} w="md:max-w-[640px]" onClose={onClose}
      head={<div><h2 className="text-xl font-bold">{r.name}</h2><div className="meta mt-1.5"><span><Icon n="pin" s={16} />{loc(r)}</span><span><Icon n="person" s={16} />{cap(r)} người</span><Rating r={data?.room ?? r} /></div></div>}
      footer={<><button className="btn" onClick={onClose}>Đóng</button><button className="btn bp" onClick={onBook}>Đặt phòng này</button></>}>
      <section className="sec">
        <div className="flex items-center justify-between gap-3 px-3.5 py-3 border border-green-200 rounded-xl bg-green-50">
          <div><div className="small muted">Khung giờ bạn đang tìm</div><div className="font-semibold mt-0.5">{longDate(q.date)} · {q.from} – {q.to}</div></div>
          <span className="badge s-ok">Còn trống</span>
        </div>
      </section>
      <section className="sec">
        <h3 className="sh">Tiện ích</h3>
        {r.amenities.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {r.amenities.map(a => <div key={a} className="flex items-center gap-2 h-10 px-3 rounded-[10px] bg-gray-50 border border-gray-100 font-medium">{AM_ICON[a] && <Icon n={AM_ICON[a]} className="text-indigo-700" />}{a}</div>)}
          </div>
        ) : <p className="muted">Chưa khai báo tiện ích</p>}
      </section>
      <section className="sec">
        <h3 className="sh">Đánh giá gần đây</h3>
        {isLoading ? <div aria-busy="true">{[1, 2].map(i => <div key={i} className="py-3 flex flex-col gap-2"><Skeleton className="w-24" /><Skeleton className="w-3/4" /></div>)}</div>
          : error ? <p className="muted">Không tải được đánh giá: {error.message}</p>
          : reviews.length ? <div>{reviews.map(v => (
            <div key={v.id} className="py-3 border-b border-gray-100 last:border-0">
              <div className="flex justify-between"><Stars n={v.stars} /><span className="small muted">{dmy(v.at)}</span></div>
              {v.text && <p className="mt-1">{v.text}</p>}
            </div>
          ))}</div> : <p className="muted">Chưa có đánh giá nào</p>}
      </section>
    </Modal>
  )
}
