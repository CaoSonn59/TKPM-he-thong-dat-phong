// Ngày / giờ hiện tại theo giờ máy người dùng, cùng định dạng với dữ liệu: YYYY-MM-DD và HH:MM.
const pad = (n: number) => String(n).padStart(2, '0')
export const today = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const nowHM = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
// Ngày đầu và ngày cuối của tháng hiện tại (khoảng mặc định của Báo cáo).
export const monthRange = (d = new Date()) => ({
  from: today(new Date(d.getFullYear(), d.getMonth(), 1)),
  to: today(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
})

// Ghép ngày YYYY-MM-DD + giờ HH:MM thành RFC3339 kèm múi giờ (mặc định +07:00 hoặc múi giờ máy nếu được truyền).
// Ví dụ: toIsoDateTime('2026-11-20', '09:00') → '2026-11-20T09:00:00+07:00'.
export function toIsoDateTime(date: string, hm: string, offsetMinutes = -new Date().getTimezoneOffset()): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const hh = pad(Math.floor(abs / 60))
  const mm = pad(abs % 60)
  return `${date}T${hm}:00${sign}${hh}:${mm}`
}
