import { cap, loc, type Room } from '../model'

export const RoomDl = ({ r }: { r: Room }) => (
  <dl className="dl">
    <dt>Tên phòng</dt><dd>{r.name}</dd>
    <dt>Sức chứa</dt><dd>{cap(r)} người</dd>
    <dt>Vị trí</dt><dd>{loc(r)}</dd>
    <dt>Tiện ích</dt><dd><div className="flex flex-wrap gap-1">{r.amenities.map(a => <span key={a} className="tag">{a}</span>)}</div></dd>
  </dl>
)
