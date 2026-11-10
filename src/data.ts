export type Status = 'wait' | 'ok' | 'live' | 'done' | 'no' | 'cancel'
export type Sex = 'Nam' | 'Nữ' | 'Khác'

export interface User { id: string; name: string; sex: Sex; active: boolean; created: string; pw: string }
export interface Group { id: number; name: string; created: string; members: string[] }
export interface Room {
  id: number; name: string; min: number; max: number; building: string; floor: string
  amenities: string[]; maint: boolean
  // shortcut: seeded average, feedback sent in the app does not move it; compute from feedback rows once there is a backend.
  rate: number | null; votes: number
}
export interface Booking {
  id: number; title: string; roomId: number; by: string; groupId: number | null
  date: string; from: string; to: string; status: Status; sent: string
  reason?: { text: string; by: 'admin' | 'user'; at: string }
  fb?: { stars: number; text: string; at: string }
}

// shortcut: fixed demo clock so the sample data stays coherent (statuses are seeded, not derived from time);
// switch to the real clock when a backend owns booking status.
export const TODAY = '2026-11-09'
export const NOW = '10:30'
export const ADMIN_PW = 'admin123'

export const AMENITIES = ['Máy chiếu', 'Bảng trắng', 'Micro', 'Loa', 'Điều hòa', 'TV']
export const STAR_LABELS = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt']
export const STATUS: Record<Status, [label: string, cls: string]> = {
  wait: ['Chờ duyệt', 's-wait'], ok: ['Đã chấp nhận', 's-ok'], live: ['Đang diễn ra', 's-live'],
  done: ['Đã kết thúc', 's-done'], no: ['Không chấp nhận', 's-no'], cancel: ['Đã hủy', 's-cancel'],
}
export const STATUSES = Object.keys(STATUS) as Status[]

export const dmy = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')
export const longDate = (iso: string) =>
  `${new Date(iso + 'T00:00').toLocaleDateString('vi-VN', { weekday: 'long' })}, ${dmy(iso)}`
export const when = (b: Pick<Booking, 'date' | 'from' | 'to'>) => `${dmy(b.date)} ${b.from}–${b.to}`
export const code = (b: Booking) => `#BK-2611-${String(b.id).padStart(3, '0')}`
export const cap = (r: Room) => `${r.min} – ${r.max}`
export const loc = (r: Room) => `${r.building}, ${r.floor}`
export const initials = (name: string) => {
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}

// ---- Dữ liệu mẫu End-User (bám sát báo cáo đồ án và bộ ảnh NguoiDung / Mobile) ----

const u = (id: string, name: string, sex: Sex, created: string, active = true): User => ({ id, name, sex, active, created, pw: id })
const named: User[] = [
  u('GV0042', 'Lê Thị Hoa', 'Nữ', '2026-08-10'),
  u('SV2026001', 'Nguyễn Văn An', 'Nam', '2026-09-01'),
  u('SV2026002', 'Hoàng Gia Bảo', 'Nam', '2026-09-01'),
  u('SV2026003', 'Đặng Thu Hà', 'Nữ', '2026-09-01'),
  u('SV2026007', 'Trịnh Bảo Ngọc', 'Nữ', '2026-09-01'),
  u('SV2026004', 'Lý Thanh Sơn', 'Nam', '2026-09-01'),
  u('SV2026005', 'Mai Ngọc Trâm', 'Nữ', '2026-09-01'),
  u('SV2026006', 'Phan Đức Long', 'Nam', '2026-09-01'),
  u('SV2026008', 'Cao Văn Lực', 'Nam', '2026-09-01'),
  u('SV2026009', 'Hồ Thị Mai', 'Nữ', '2026-09-01'),
  u('SV2026010', 'Lâm Quốc Việt', 'Nam', '2026-09-01'),
  u('GV0057', 'Ngô Đức Thành', 'Nam', '2026-11-05'),
  u('NV0789', 'Võ Thanh Tâm', 'Nữ', '2026-10-20'),
  u('NV0512', 'Đỗ Quang Huy', 'Nam', '2026-10-18'),
  u('NV0456', 'Phạm Minh Khoa', 'Nam', '2026-08-22', false),
  u('NV0123', 'Trần Thị Bình', 'Nữ', '2026-08-15'),
  u('NV0231', 'Nguyễn Thị Lan', 'Nữ', '2026-08-15'),
  u('NV0318', 'Lý Hoàng Phúc', 'Nam', '2026-08-15'),
  u('SV2021045', 'Bùi Minh Thư', 'Nữ', '2026-08-02'),
]

// Sinh thêm người dùng để các nhóm đủ sĩ số như trong thiết kế (Lớp CNTT2026/11: 45, CLB Lập trình: 20...).
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ']
const TEN: [string, Sex][] = [
  ['Minh Anh', 'Nữ'], ['Quốc Bảo', 'Nam'], ['Thùy Chi', 'Nữ'], ['Tiến Dũng', 'Nam'], ['Thu Giang', 'Nữ'], ['Gia Huy', 'Nam'],
  ['Ngọc Khánh', 'Nữ'], ['Hải Long', 'Nam'], ['Thanh Mai', 'Nữ'], ['Đức Nam', 'Nam'], ['Bảo Trân', 'Nữ'],
]
let k = 0
const gen = (prefix: string, start: number, n: number, pad: number, created: string) =>
  Array.from({ length: n }, (_, i) => {
    const [ten, sex] = TEN[Math.floor(k / 10) % TEN.length]
    return u(prefix + String(start + i).padStart(pad, '0'), `${HO[k++ % 10]} ${ten}`, sex, created)
  })
const sv26 = gen('SV2026', 11, 37, 3, '2026-09-01')
const sv21 = gen('SV2021', 46, 36, 3, '2026-08-02')
const mkt = gen('NV', 600, 8, 4, '2026-08-15')
const hr = gen('NV', 700, 6, 4, '2026-08-15')
const rd = gen('NV', 800, 13, 4, '2026-08-16')
const ids = (us: User[]) => us.map(x => x.id)

const groups: Group[] = [
  { id: 1, name: 'Lớp CNTT2026/11', created: '2026-09-01', members: ['GV0042', 'SV2026001', 'SV2026002', 'SV2026003', 'SV2026007', 'SV2026008', 'SV2026009', 'SV2026010', ...ids(sv26)] },
  { id: 2, name: 'Lớp D21CQCN', created: '2026-08-02', members: ['GV0042', 'SV2021045', ...ids(sv21)] },
  { id: 3, name: 'Phòng Marketing', created: '2026-08-15', members: ['NV0123', 'NV0512', 'NV0231', 'NV0318', ...ids(mkt)] },
  { id: 4, name: 'Phòng Nhân sự', created: '2026-08-15', members: ['NV0789', 'NV0512', ...ids(hr)] },
  { id: 5, name: 'Phòng R&D', created: '2026-08-16', members: ['NV0512', 'NV0456', ...ids(rd)] },
  { id: 6, name: 'CLB Lập trình', created: '2026-09-10', members: ['SV2026001', ...ids(sv26).slice(0, 10), ...ids(sv21).slice(0, 9)] },
]

const r = (id: number, name: string, min: number, max: number, building: string, floor: string, amenities: string[], rate: number | null, votes: number, maint = false): Room =>
  ({ id, name, min, max, building, floor, amenities, rate, votes, maint })
const rooms: Room[] = [
  r(1, 'Hội trường C', 50, 200, 'Tòa C', 'Lầu 1', ['Máy chiếu', 'Micro', 'Loa', 'Điều hòa'], 3.6, 9, true),
  r(2, 'Phòng A1', 20, 40, 'Tòa A', 'Lầu 1', ['Máy chiếu', 'Bảng trắng'], 4.2, 12),
  r(3, 'Phòng A2', 10, 30, 'Tòa A', 'Lầu 1', ['Bảng trắng'], 3.8, 9),
  r(4, 'Phòng B1', 30, 60, 'Tòa B', 'Lầu 1', ['Máy chiếu', 'Loa'], null, 0),
  r(5, 'Phòng Họp Tầng 2', 4, 12, 'Tòa B', 'Lầu 2', ['TV', 'Micro'], 4.6, 14),
  r(6, 'Phòng Họp Tầng 3', 6, 16, 'Tòa B', 'Lầu 3', ['TV', 'Điều hòa'], 4.7, 6),
  r(7, 'Phòng B3', 30, 60, 'Tòa B', 'Lầu 3', ['Máy chiếu', 'Loa', 'Micro'], 4.0, 7),
]

type B = [title: string, roomId: number, by: string, groupId: number | null, date: string, from: string, to: string, status: Status, sent?: string, extra?: Pick<Booking, 'reason' | 'fb'>]
const B: B[] = [
  // 10 lịch đặt của SV2026001 và nhóm trực thuộc (khớp U06-Lich-su-dat-phong.png)
  ['Tập văn nghệ chào mừng 20/11', 1, 'SV2026001', 1, '2026-11-20', '18:00', '21:00', 'no', '2026-11-04T20:15', { reason: { text: 'Phòng đã được ưu tiên cho hội thảo khoa.', by: 'admin', at: '2026-11-05' } }],
  ['Seminar Trí tuệ nhân tạo', 2, 'GV0042', 1, '2026-11-13', '13:30', '16:30', 'wait', '2026-11-08T21:40'],
  ['Ôn tập Cấu trúc dữ liệu', 3, 'SV2026001', null, '2026-11-10', '18:00', '20:00', 'wait', '2026-11-07T19:50'],
  ['Thực hành Lập trình Web', 2, 'GV0042', 1, '2026-11-09', '09:00', '11:30', 'live', '2026-11-03T16:45'],
  ['Sinh hoạt lớp', 2, 'SV2026001', 1, '2026-11-03', '17:00', '18:00', 'done', '2026-10-30T18:20'],
  ['Họp nhóm đồ án', 3, 'SV2026001', 1, '2026-11-12', '09:00', '11:00', 'wait', '2026-11-07T15:10'],
  ['Workshop Git cơ bản', 7, 'SV2026001', 6, '2026-11-15', '08:00', '10:00', 'ok', '2026-11-05T20:00'],
  ['Họp CLB định kỳ', 5, 'SV2026001', 6, '2026-11-07', '17:00', '18:30', 'cancel', '2026-11-02T21:00', { reason: { text: 'Trùng lịch thi giữa kỳ', by: 'user', at: '2026-11-05' } }],
  ['Seminar AI', 2, 'SV2026001', null, '2026-11-05', '13:00', '15:00', 'done', '2026-11-01T08:00', { fb: { stars: 4, text: 'Phòng sạch, máy chiếu hơi mờ ở góc trái.', at: '2026-11-05' } }],
  ['Ôn thi Giải tích', 3, 'SV2026001', null, '2026-10-02', '18:00', '20:00', 'done', '2026-09-29T12:00'],
  // Các đánh giá gần đây của Phòng A1 (khớp U04-Chi-tiet-phong.png: 4 / 12 đánh giá)
  ['Báo cáo chuyên đề CNPM', 2, 'GV0057', 2, '2026-11-06', '08:00', '10:00', 'done', '2026-11-01T09:00', { fb: { stars: 5, text: 'Phòng rộng, máy chiếu sáng rõ. Ổ điện đủ cho cả lớp.', at: '2026-11-06' } }],
  ['Họp chuyên môn bộ môn', 2, 'GV0057', 2, '2026-10-30', '14:00', '16:00', 'done', '2026-10-25T10:00', { fb: { stars: 3, text: 'Điều hòa chung của tầng không mát vào buổi chiều.', at: '2026-10-30' } }],
  ['Phụ đạo Lập trình C++', 2, 'GV0042', 2, '2026-10-22', '08:00', '10:00', 'done', '2026-10-18T11:00', { fb: { stars: 5, text: 'Bảng trắng mới, bút đầy đủ.', at: '2026-10-22' } }],
  // Các lịch giữ chỗ ngày 13/11/2026 để khớp U03a (4 phòng trống 08:00–10:00) và U03b (0 phòng trống 13:00–17:00)
  ['Lớp học phần Mạng máy tính', 4, 'GV0057', 2, '2026-11-13', '07:30', '17:00', 'ok', '2026-11-05T08:00'],
  ['Họp điều phối dự án', 6, 'NV0512', 5, '2026-11-13', '08:00', '17:00', 'ok', '2026-11-05T09:00'],
  ['Thảo luận nhóm Thiết kế Web', 3, 'GV0042', 2, '2026-11-13', '13:00', '17:00', 'ok', '2026-11-06T10:00'],
  ['Họp chiến dịch truyền thông', 5, 'NV0123', 3, '2026-11-13', '13:00', '17:00', 'ok', '2026-11-06T14:00'],
  ['Hội thảo Hướng nghiệp', 7, 'NV0789', 4, '2026-11-13', '13:00', '17:00', 'ok', '2026-11-06T15:00'],
  // Đánh giá mẫu cho các phòng khác
  ['Workshop thiết kế nội dung', 5, 'NV0123', 3, '2026-11-06', '14:00', '16:00', 'done', '2026-11-02T09:10', { fb: { stars: 5, text: 'TV rõ nét, micro âm thanh tốt, không gian họp yên tĩnh.', at: '2026-11-06' } }],
  ['Bảo vệ đồ án giữa kỳ', 3, 'GV0042', 2, '2026-11-05', '08:00', '11:00', 'done', '2026-10-30T13:00', { fb: { stars: 4, text: 'Bảng trắng sạch, ánh sáng tốt.', at: '2026-11-05' } }],
]

export const seed = {
  users: [...named, ...sv26, ...sv21, ...mkt, ...hr, ...rd],
  groups,
  rooms,
  bookings: B.map(([title, roomId, by, groupId, date, from, to, status, sent = '', extra], i): Booking =>
    ({ id: i + 1, title, roomId, by, groupId, date, from, to, status, sent, ...extra })),
}

