export type Sex = 'Nam' | 'Nữ' | 'Khác'
export interface User {
  id: string; name: string; sex: Sex; active: boolean; created: string
  pw?: string // shortcut: chỉ dữ liệu mẫu có (đổi mật khẩu phía End-User chưa nối backend)
  inGroups?: { id: number; name: string }[] // nhóm trực thuộc, backend trả kèm user
}
