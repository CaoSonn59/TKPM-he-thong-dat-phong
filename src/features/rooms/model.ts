import type { IconName } from '../../shared/ui'

export interface Room {
  id: number; name: string; min: number; max: number; building: string; floor: string
  amenities: string[]; maint: boolean
  rate: number | null; votes: number
  upcoming?: number // số lịch đặt sắp tới (backend tính) — chặn chuyển sang bảo trì
}
export const AMENITIES = ['Máy chiếu', 'Bảng trắng', 'Micro', 'Loa', 'Điều hòa', 'TV']
export const AM_ICON: Record<string, IconName | undefined> = { 'Máy chiếu': 'projector', 'Bảng trắng': 'board', TV: 'tv', Micro: 'mic', Loa: 'speaker' }

export const cap = (r: Room) => `${r.min} – ${r.max}`
export const loc = (r: Room) => `${r.building}, ${r.floor}`
