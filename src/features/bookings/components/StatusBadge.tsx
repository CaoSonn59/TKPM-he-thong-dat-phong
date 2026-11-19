import { STATUS, type Status } from '../model'

// Màu + nhãn lấy từ bảng STATUS: thêm trạng thái mới chỉ cần sửa bảng đó (OCP).
export const StatusBadge = ({ s }: { s: Status }) => <span className={`badge ${STATUS[s][1]}`}>{STATUS[s][0]}</span>
