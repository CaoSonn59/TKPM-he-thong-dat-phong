// Nhóm người dùng — bảng `user_groups` (+ bảng nối `user_group_members`) ở backend.
export interface GroupMember { id: string; name: string; sex: string }
export interface Group {
  id: number; name: string; created: string
  count: number // số thành viên (danh sách nhóm chỉ trả số đếm)
  members?: string[] // mã định danh thành viên — chỉ có khi lấy chi tiết nhóm / dữ liệu mẫu
  memberList?: GroupMember[] // thành viên kèm họ tên — chỉ có khi lấy chi tiết nhóm / dữ liệu mẫu
}
