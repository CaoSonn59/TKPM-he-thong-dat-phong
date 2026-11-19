export type Sex = 'Nam' | 'Nữ' | 'Khác'
export interface User {
  id: string; name: string; sex: Sex; active: boolean; created: string
  inGroups?: { id: number; name: string }[] // nhóm trực thuộc, backend trả kèm user
}
