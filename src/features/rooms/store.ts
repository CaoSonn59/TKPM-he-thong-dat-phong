import { create } from 'zustand'
import { seed } from '../../mocks/seed'
import type { Room } from './model'

// shortcut: chỉ còn phục vụ phía End-User (Tìm phòng, đặt phòng mẫu); Admin đã đọc / ghi qua api.ts.
interface RoomsState { rooms: Room[] }

export const useRoomsStore = create<RoomsState>()(() => ({ rooms: seed.rooms }))
