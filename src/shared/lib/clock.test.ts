import test from 'node:test'
import assert from 'node:assert/strict'
import { toIsoDateTime } from './clock.ts'

test('toIsoDateTime: tạo chuỗi RFC3339 đúng định dạng múi giờ', () => {
  assert.equal(toIsoDateTime('2026-11-20', '09:00', 420), '2026-11-20T09:00:00+07:00')
  assert.equal(toIsoDateTime('2026-11-20', '14:30', 0), '2026-11-20T14:30:00+00:00')
  assert.equal(toIsoDateTime('2026-11-20', '08:15', -300), '2026-11-20T08:15:00-05:00')
})
