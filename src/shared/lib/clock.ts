// Ngày / giờ hiện tại theo giờ máy người dùng, cùng định dạng với dữ liệu: YYYY-MM-DD và HH:MM.
const pad = (n: number) => String(n).padStart(2, '0')
export const today = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const nowHM = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
// Ngày đầu và ngày cuối của tháng hiện tại (khoảng mặc định của Báo cáo).
export const monthRange = (d = new Date()) => ({
  from: today(new Date(d.getFullYear(), d.getMonth(), 1)),
  to: today(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
})
