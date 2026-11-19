import test from 'node:test'
import assert from 'node:assert/strict'
import { pwClientErrors, pwErrors, strength } from './logic.ts'

test('pwErrors + strength', () => {
  assert.deepEqual(pwErrors('SV1', 'hocTap#2026', 'hocTap#2026', 'SV1', 'SV1'), {})
  assert.ok(pwErrors('sai', 'hocTap#2026', 'hocTap#2026', 'SV1', 'SV1').cur)
  assert.match(pwErrors('SV1', 'adm1', 'adm2', 'SV1', 'SV1').next!, /6 ký tự/)
  assert.match(pwErrors('matkhau', 'SV2026001', 'SV2026001', 'matkhau', 'SV2026001').next!, /trùng/)
  assert.ok(pwErrors('SV1', 'abcdef', 'abcdeg', 'SV1', 'SV1').again)
  assert.deepEqual(['', 'adm1', 'hocTap#26', 'QuanTri#2026'].map(strength), [0, 1, 3, 4])
})

test('pwClientErrors: kiểm tra đầu vào phía client trước khi gọi API', () => {
  assert.deepEqual(pwClientErrors('oldPass', 'NewPass#1', 'NewPass#1', 'SV2026001'), {})
  assert.ok(pwClientErrors('', 'NewPass#1', 'NewPass#1', 'SV2026001').cur)
  assert.match(pwClientErrors('oldPass', '12345', '12345', 'SV2026001').next!, /6 ký tự/)
  assert.match(pwClientErrors('oldPass', 'oldPass', 'oldPass', 'SV2026001').next!, /trùng/)
  assert.match(pwClientErrors('oldPass', 'SV2026001', 'SV2026001', 'SV2026001').next!, /trùng/)
  assert.ok(pwClientErrors('oldPass', 'NewPass#1', 'NewPass#2', 'SV2026001').again)
})
