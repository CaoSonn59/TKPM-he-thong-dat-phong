import test from 'node:test'
import assert from 'node:assert/strict'
import { pwClientErrors, strength } from './logic.ts'

test('pwClientErrors + strength: kiểm tra đầu vào phía client trước khi gọi API', () => {
  assert.deepEqual(pwClientErrors('oldPass', 'NewPass#1', 'NewPass#1', 'SV2026001'), {})
  assert.ok(pwClientErrors('', 'NewPass#1', 'NewPass#1', 'SV2026001').cur)
  assert.match(pwClientErrors('oldPass', '12345', '12345', 'SV2026001').next!, /6 ký tự/)
  assert.match(pwClientErrors('oldPass', 'oldPass', 'oldPass', 'SV2026001').next!, /trùng/)
  assert.match(pwClientErrors('oldPass', 'SV2026001', 'SV2026001', 'SV2026001').next!, /trùng/)
  assert.ok(pwClientErrors('oldPass', 'NewPass#1', 'NewPass#2', 'SV2026001').again)
  assert.deepEqual(['', 'adm1', 'hocTap#26', 'QuanTri#2026'].map(strength), [0, 1, 3, 4])
})
