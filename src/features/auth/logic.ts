// Quy tắc mật khẩu (thuần, không phụ thuộc React) — có test ở logic.test.ts

export interface PwErr { cur?: string; next?: string; again?: string }
export function pwErrors(cur: string, next: string, again: string, realPw: string, ident: string): PwErr {
  const e: PwErr = {}
  if (cur !== realPw) e.cur = 'Mật khẩu hiện tại không chính xác'
  if (next.length < 6) e.next = 'Mật khẩu mới phải có ít nhất 6 ký tự'
  else if (next === cur || next === ident) e.next = 'Mật khẩu mới không được trùng mật khẩu hiện tại hoặc mã định danh'
  if (again !== next) e.again = 'Mật khẩu nhập lại không khớp'
  return e
}

// 0 = trống, 1 Yếu … 4 Mạnh
export const strength = (pw: string) =>
  !pw ? 0 : pw.length < 6 ? 1
    : 1 + +(pw.length >= 10) + +(/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw)) + +/[^A-Za-z0-9]/.test(pw)
