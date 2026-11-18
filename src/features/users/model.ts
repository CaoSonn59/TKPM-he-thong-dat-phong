export type Sex = 'Nam' | 'Nữ' | 'Khác'
export interface User { id: string; name: string; sex: Sex; active: boolean; created: string; pw: string }
