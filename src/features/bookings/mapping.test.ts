import test from 'node:test'
import assert from 'node:assert/strict'
import { toBooking, toBookingBody, type ApiBooking } from './mapping.ts'

const api = (o: Partial<ApiBooking>): ApiBooking => ({
  booking_id: 6, booking_code: '#BK-2611-006', title: 'Họp', room_id: 1, room_name: 'Phòng A1',
  user_id: 'NV0123', full_name: 'Trần Thị Bình', group_id: 3, group_name: 'Phòng Marketing',
  start_time: '2026-11-20T09:00:00+07:00', end_time: '2026-11-20T11:30:00+07:00',
  status: 'Chờ duyệt', created_at: '2026-11-17T11:52:33.41+07:00', updated_at: '2026-11-18T08:00:00+07:00', ...o,
})

test('toBooking: thời gian, trạng thái, mã, tên hiển thị', () => {
  const b = toBooking(api({}))
  assert.deepEqual([b.date, b.from, b.to, b.status, b.code, b.sent], ['2026-11-20', '09:00', '11:30', 'wait', '#BK-2611-006', '2026-11-17T11:52'])
  assert.deepEqual([b.roomName, b.byName, b.groupName], ['Phòng A1', 'Trần Thị Bình', 'Phòng Marketing'])
  assert.equal(toBooking(api({ status: 'Đang diễn ra' })).status, 'live')
  assert.equal(toBooking(api({ group_id: null, group_name: '' })).groupId, null)
})

test('toBooking: lý do, phản hồi và thành viên nhóm', () => {
  assert.equal(toBooking(api({})).reason, undefined)
  assert.deepEqual(toBooking(api({ status: 'Không chấp nhận', reason: 'Trùng lịch thi' })).reason, { text: 'Trùng lịch thi', by: 'admin', at: '2026-11-18' })
  assert.equal(toBooking(api({ status: 'Đã hủy', reason: 'Đổi lịch' })).reason!.by, undefined)
  const fb = toBooking(api({ status: 'Đã kết thúc', feedback: { rating: 4, comment: 'Tốt', tags: ['Phòng sạch sẽ'], created_at: '2026-11-21T10:00:00+07:00', updated_at: '' } })).fb
  assert.deepEqual(fb, { stars: 4, text: 'Tốt', tags: ['Phòng sạch sẽ'], at: '2026-11-21' })
  const withMembers = toBooking(api({ members: [{ user_id: 'SV1', full_name: 'Nguyễn A', gender: 'Nam' }] }))
  assert.deepEqual(withMembers.members, [{ id: 'SV1', name: 'Nguyễn A', sex: 'Nam' }])
})

test('toBookingBody: chuyển sang payload POST /bookings chuẩn RFC3339', () => {
  assert.deepEqual(
    toBookingBody({ title: '  Họp đồ án  ', roomId: 1, groupId: 2, date: '2026-11-20', from: '09:00', to: '11:00' }, 420),
    { title: 'Họp đồ án', room_id: 1, group_id: 2, start_time: '2026-11-20T09:00:00+07:00', end_time: '2026-11-20T11:00:00+07:00' },
  )
})
