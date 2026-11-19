import test from 'node:test'
import assert from 'node:assert/strict'
import type { Booking } from './model.ts'
import { canCancel, canRate, slotErrors } from './logic.ts'

const bk = (o: Partial<Booking>): Booking =>
  ({ id: 1, title: 't', roomId: 1, by: 'u1', groupId: null, date: '2026-11-13', from: '09:00', to: '11:00', status: 'wait', sent: '', ...o })
const q = { date: '2026-11-13', from: '10:00', to: '12:00', amenities: [] as string[] }

test('slotErrors', () => {
  assert.deepEqual(slotErrors(q, '2026-11-09', '10:30'), {})
  assert.ok(slotErrors({ ...q, date: '2026-11-08' }, '2026-11-09', '10:30').date)
  assert.ok(slotErrors({ ...q, date: '2026-11-09' }, '2026-11-09', '10:30').date)
  assert.ok(slotErrors({ ...q, to: '09:30' }, '2026-11-09', '10:30').to)
})

test('canCancel / canRate', () => {
  assert.ok(canCancel(bk({ status: 'ok' }), 'u1'))
  assert.ok(!canCancel(bk({ status: 'ok' }), 'u2')) // thành viên nhóm chỉ được xem
  assert.ok(!canCancel(bk({ status: 'live' }), 'u1'))
  assert.ok(canRate(bk({ status: 'done', date: '2026-11-03' }), 'u1', '2026-11-09'))
  assert.ok(!canRate(bk({ status: 'done', date: '2026-10-02' }), 'u1', '2026-11-09')) // quá 1 tháng
  assert.ok(!canRate(bk({ status: 'ok' }), 'u1', '2026-11-09'))
})
