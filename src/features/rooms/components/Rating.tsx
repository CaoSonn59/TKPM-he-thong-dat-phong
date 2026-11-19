import { Icon } from '../../../shared/ui'
import type { Room } from '../model'

export const Rating = ({ r, compact }: { r: Room; compact?: boolean }) => r.rate
  ? <span className="star"><Icon n="star" s={16} className="fill-amber-400 stroke-amber-600" />{r.rate.toFixed(1)}{!compact && <span className="muted small font-normal"> ({r.votes} lượt)</span>}</span>
  : <span className="muted small">Chưa có đánh giá</span>
