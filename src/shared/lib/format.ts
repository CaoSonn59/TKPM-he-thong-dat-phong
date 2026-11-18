// Định dạng hiển thị dùng chung.

export const dmy = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')
export const longDate = (iso: string) =>
  `${new Date(iso + 'T00:00').toLocaleDateString('vi-VN', { weekday: 'long' })}, ${dmy(iso)}`
export const initials = (name: string) => {
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}
