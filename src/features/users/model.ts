export type Sex = 'Nam' | 'Nữ' | 'Khác'
export interface UserGroup { id: number; name: string }
export interface User { id: string; name: string; sex: Sex; active: boolean; created: string; pw: string; groups?: UserGroup[] }
