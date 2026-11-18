import { Drawer, Icon, Stars } from '../../../shared/ui'
import { dmy, longDate } from '../../../shared/lib/format'
import { useGroupName } from '../../groups/hooks'
import { RoomDl } from '../../rooms/components/RoomDl'
import { useRoomOf } from '../../rooms/hooks'
import { useUsers } from '../../users/hooks'
import { mins } from '../logic'
import { code, type Booking } from '../model'
import type { Act } from './DecideDialog'
import { Members } from './Members'
import { ReasonBox } from './ReasonBox'
import { StatusBadge } from './StatusBadge'

// A8 — Chi tiết đặt phòng (drawer phía Admin)
export function AdminBookingDetail({ b, onClose, onAct }: { b: Booking; onClose: () => void; onAct: (a: Act) => void }) {
  const roomOf = useRoomOf()
  const users = useUsers()
  const groupName = useGroupName()
  const hours = String((mins(b.to) - mins(b.from)) / 60).replace('.', ',')
  return (
    <Drawer label={b.title} onClose={onClose}>
      <header className="dh">
        <div className="flex flex-col items-start gap-2">
          <StatusBadge s={b.status} />
          <h2 className="text-xl font-bold">{b.title}</h2>
          <p className="muted small">Mã đặt phòng {code(b)}{b.sent && ` · gửi lúc ${b.sent.slice(11)}, ${dmy(b.sent)}`}</p>
        </div>
        <button className="ib" aria-label="Đóng" onClick={onClose}><Icon n="x" /></button>
      </header>
      <div className="flex-auto overflow-y-auto">
        <ReasonBox b={b} />
        <section className="sec"><h3 className="sh">Thông tin sự kiện</h3>
          <dl className="dl"><dt>Tiêu đề</dt><dd>{b.title}</dd><dt>Ngày</dt><dd>{longDate(b.date)}</dd><dt>Thời gian</dt><dd>{b.from} – {b.to} ({hours} giờ)</dd></dl>
        </section>
        <section className="sec"><h3 className="sh">Thông tin phòng</h3><RoomDl r={roomOf(b.roomId)} /></section>
        <section className="sec"><h3 className="sh">Người đặt</h3>
          <dl className="dl"><dt>Mã định danh</dt><dd>{b.by}</dd><dt>Họ và tên</dt><dd>{users.find(u => u.id === b.by)?.name}</dd><dt>Nhóm sử dụng</dt><dd>{groupName(b.groupId)}</dd></dl>
        </section>
        <Members b={b} avatars />
        <section className="sec"><h3 className="sh">Phản hồi của người dùng</h3>
          {b.fb ? (
            <div className="flex flex-col gap-1.5 p-3.5 border border-gray-200 rounded-[10px] bg-gray-50">
              <div className="flex items-center gap-2"><Stars n={b.fb.stars} /><span className="font-semibold">{b.fb.stars}/5</span><span className="muted small">· {dmy(b.fb.at)}</span></div>
              {b.fb.text && <p>{b.fb.text}</p>}
            </div>
          ) : <div className="flex items-center gap-2.5 p-3.5 border border-dashed border-gray-300 rounded-[10px] text-gray-600"><Icon n="star" />Chưa có phản hồi</div>}
        </section>
      </div>
      {(b.status === 'wait' || b.status === 'ok') && (
        <footer className="mf">
          {b.status === 'wait' ? <>
            <button className="btn bo" onClick={() => onAct({ type: 'no', b })}><Icon n="x" s={16} />Từ chối</button>
            <button className="btn bg" onClick={() => onAct({ type: 'ok', b })}><Icon n="check" s={16} />Chấp nhận</button>
          </> : <button className="btn bo" onClick={() => onAct({ type: 'cancel', b })}><Icon n="ban" s={16} />Hủy khẩn cấp</button>}
        </footer>
      )}
    </Drawer>
  )
}
