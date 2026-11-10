import test from 'node:test'
import assert from 'node:assert/strict'
import type { Booking, Room } from './data.ts'
import { canCancel, canRate, freeRooms, pwErrors, slotErrors, strength } from './logic.ts'

const room = (id: number, o: Partial<Room> = {}): Room =>
  ({ id, name: 'P' + id, min: 1, max: 30, building: 'A', floor: '1', amenities: ['TV'], maint: false, rate: null, votes: 0, ...o })
const bk = (o: Partial<Booking>): Booking =>
  ({ id: 1, title: 't', roomId: 1, by: 'u1', groupId: null, date: '2026-11-13', from: '09:00', to: '11:00', status: 'wait', sent: '', ...o })
const q = { date: '2026-11-13', from: '10:00', to: '12:00', amenities: [] as string[] }

test('freeRooms: loại phòng bảo trì, trùng giờ, thiếu sức chứa/tiện ích', () => {
  const rooms = [room(1), room(2, { maint: true }), room(3, { max: 5 }), room(4, { amenities: [] })]
  assert.deepEqual(freeRooms(rooms, [], q).map(r => r.id), [1, 3, 4])
  assert.deepEqual(freeRooms(rooms, [bk({})], q).map(r => r.id), [3, 4]) // chờ duyệt vẫn giữ chỗ
  assert.deepEqual(freeRooms(rooms, [bk({ status: 'cancel' })], q).map(r => r.id), [1, 3, 4])
  assert.deepEqual(freeRooms(rooms, [bk({ to: '10:00' })], q).map(r => r.id), [1, 3, 4]) // sát giờ không tính trùng
  assert.deepEqual(freeRooms(rooms, [], { ...q, min: 10, amenities: ['TV'] }).map(r => r.id), [1])
})

test('slotErrors', () => {
  assert.deepEqual(slotErrors(q, '2026-11-09', '10:30'), {})
  assert.ok(slotErrors({ ...q, date: '2026-11-08' }, '2026-11-09', '10:30').date)
  assert.ok(slotErrors({ ...q, date: '2026-11-09' }, '2026-11-09', '10:30').date)
  assert.ok(slotErrors({ ...q, to: '09:30' }, '2026-11-09', '10:30').to)
})

test('pwErrors + strength', () => {
  assert.deepEqual(pwErrors('SV1', 'hocTap#2026', 'hocTap#2026', 'SV1', 'SV1'), {})
  assert.ok(pwErrors('sai', 'hocTap#2026', 'hocTap#2026', 'SV1', 'SV1').cur)
  assert.match(pwErrors('SV1', 'adm1', 'adm2', 'SV1', 'SV1').next!, /6 ký tự/)
  assert.match(pwErrors('matkhau', 'SV2026001', 'SV2026001', 'matkhau', 'SV2026001').next!, /trùng/)
  assert.ok(pwErrors('SV1', 'abcdef', 'abcdeg', 'SV1', 'SV1').again)
  assert.deepEqual(['', 'adm1', 'hocTap#26', 'QuanTri#2026'].map(strength), [0, 1, 3, 4])
})

test('canCancel / canRate', () => {
  assert.ok(canCancel(bk({ status: 'ok' }), 'u1'))
  assert.ok(!canCancel(bk({ status: 'ok' }), 'u2')) // thành viên nhóm chỉ được xem
  assert.ok(!canCancel(bk({ status: 'live' }), 'u1'))
  assert.ok(canRate(bk({ status: 'done', date: '2026-11-03' }), 'u1', '2026-11-09'))
  assert.ok(!canRate(bk({ status: 'done', date: '2026-10-02' }), 'u1', '2026-11-09')) // quá 1 tháng
  assert.ok(!canRate(bk({ status: 'ok' }), 'u1', '2026-11-09'))
})
