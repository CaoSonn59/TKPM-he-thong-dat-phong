// U5 / M5 — Đặt phòng thành công
import { Link } from 'react-router-dom'
import { Icon, Modal } from '../../../shared/ui'
import { dmy } from '../../../shared/lib/format'
import { useGroupName } from '../../groups/hooks'
import { useRoomOf } from '../../rooms/hooks'
import { loc, type Room } from '../../rooms/model'
import { code, type Booking } from '../model'

export function BookedDialog({ b, room, onClose }: { b: Booking; room?: Room; onClose: () => void }) {
  const roomOf = useRoomOf()
  const groupName = useGroupName()
  const r = room ?? roomOf(b.roomId, b.roomName)
  const roomLine = r.building !== '—' ? `${r.name} · ${loc(r)}` : r.name
  return (
    <Modal bare title="Đặt phòng thành công" w="md:max-w-[500px]" onClose={onClose}
      footer={<><button className="btn flex-1" onClick={onClose}>Đặt phòng khác</button><Link className="btn bp flex-1" to="/lich-su">Xem lịch sử đặt phòng</Link></>}>
      <div className="flex flex-col items-center gap-3 px-7 pt-9 pb-6 text-center">
        <span className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-700"><Icon n="check" s={30} className="stroke-[2.5]" /></span>
        <h2 className="text-xl font-bold">Đặt phòng thành công</h2>
        <p className="muted">Yêu cầu đã được gửi tới quản trị viên.</p>
      </div>
      <div className="mx-6 mb-5 p-3.5 border border-gray-200 rounded-xl grid grid-cols-[110px_minmax(0,1fr)] gap-y-2 [&>:nth-child(odd)]:text-gray-500 [&>:nth-child(even)]:font-medium">
        <span>Mã đặt phòng</span><span className="font-bold! tabular-nums">{code(b)}</span>
        <span>Trạng thái</span><span><span className="badge s-wait">Chờ duyệt</span></span>
        <span>Tiêu đề</span><span>{b.title}</span>
        <span>Phòng</span><span>{roomLine}</span>
        <span>Thời gian</span><span>{dmy(b.date)} · {b.from} – {b.to}</span>
        <span>Đặt cho</span><span>{groupName(b.groupId, b.groupName)}</span>
      </div>
    </Modal>
  )
}
