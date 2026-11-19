# Nhật ký phát triển — Frontend đặt phòng

Nhánh: `feat/admin-api-mapping` · Backend: `../../dat-phong-backend` (Go + Gin, base URL `http://localhost:8080/api/v1`)

---

## 2026-11-18

### 1. Khảo sát backend và lập bảng mapping API cho Admin

**Mục tiêu:** hiểu router của backend, nhất là nhóm `/admin`, để nối các màn admin của frontend (lúc đó đang chạy hoàn toàn bằng dữ liệu mẫu).

**Đã đọc:** `internal/routes/routes.go`, `middlewares/auth_middleware.go`, `middlewares/role_middleware.go`, toàn bộ `internal/dto/*`, các handler admin, các lỗi khai báo trong `services/*`.

**Kết quả:**
- Luồng xác thực: `POST /auth/login` là route công khai. Các route còn lại đi qua `AuthMiddleware`, middleware này yêu cầu JWT hợp lệ và tài khoản đang ở trạng thái "Đang hoạt động", nếu không thì trả 401 hoặc 403. Nhóm `/admin` có thêm `AdminRequired`, yêu cầu `role == "Admin"`, nếu không thì trả 403.
- Mọi response có dạng `{ success, message?, data?, error? }`. Danh sách phân trang trả về `data.items` và `data.pagination { page, limit, total_items, total_pages }`, mặc định `limit = 10`.
- Bảng mapping màn hình ↔ endpoint:

| Màn | API |
|---|---|
| Đăng nhập / Tài khoản | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PUT /auth/change-password` |
| A02 Tổng quan | `GET /admin/dashboard?date=` |
| Đặt phòng | `GET /admin/bookings`, `GET /admin/bookings/:id`, `PUT /admin/bookings/:id/approve \| reject \| cancel` |
| Phòng | `GET /admin/rooms`, `GET /admin/rooms/:id`, `POST /admin/rooms`, `PUT /admin/rooms/:id` |
| Người dùng | `GET /admin/users`, `GET /admin/users/:id`, `POST /admin/users`, `PUT /admin/users/:id` |
| Nhóm | `GET /admin/groups`, `GET /admin/groups/:id`, `POST /admin/groups`, `PUT /admin/groups/:id`, `DELETE /admin/groups/:id` |
| A11 Báo cáo | `GET /admin/reports/bookings` |

- Chỗ lệch giữa frontend và backend cần chuyển đổi:
  - Trạng thái booking: `wait/ok/live/done/no/cancel` ↔ `"Chờ duyệt"`, `"Đã chấp nhận"`, `"Đang diễn ra"`, `"Đã kết thúc"`, `"Không chấp nhận"`, `"Đã hủy"`.
  - Phòng: `maint: boolean` ↔ `status: "Khả dụng" | "Đang bảo trì"`.
  - Người dùng: `active: boolean` ↔ `status: "Đang hoạt động" | "Ngưng sử dụng"`.
  - Booking: frontend lưu `date/from/to`, backend dùng `start_time/end_time` dạng ISO.
- Ghi chú về backend:
  - Backend không bắt buộc `reason` khi từ chối hoặc hủy.
  - Không chuyển được phòng sang bảo trì khi phòng còn lịch sắp tới (trả 400).
  - Mã lỗi: trùng dữ liệu trả 409, không tìm thấy trả 404, sai trạng thái trả 400.
  - Tài khoản admin trong seed là `admin` / `admin`.

---

### 2. Nối đăng nhập với backend

- Thêm HTTP client `api()` dùng `fetch`:
  - Tự gắn `Authorization: Bearer <token>`.
  - Đọc `{ success, message, data }`: thành công trả `data`, lỗi thì báo đúng `message` của backend.
  - Mất kết nối thì báo "Không kết nối được máy chủ".
  - URL lấy từ `VITE_API_URL`, mặc định `http://localhost:8080/api/v1`.
- Đăng nhập gọi `POST /auth/login`, lưu `token`, `session` (user_id) và `isAdmin` (`role === 'Admin'`).
- Định tuyến theo `isAdmin`, không còn so `session === 'admin'` như trước.
- Màn đăng nhập khóa nút và hiện "Đang đăng nhập…" trong lúc chờ.

### 3. Chuyển sang react-query và zustand

- Cài thêm `@tanstack/react-query` và `zustand`.
- Store chuyển từ React Context + `useState` sang zustand. Đăng nhập dùng `useMutation`.
- `QueryClientProvider` thay cho `StoreProvider`.
- Logout không gọi `POST /auth/logout` nữa: backend dùng JWT không lưu phiên nên endpoint đó chỉ trả OK.

### 4. Giữ phiên đăng nhập qua reload

- Dùng middleware `persist` của zustand, chỉ lưu `token`, `session`, `isAdmin` vào localStorage (key `dat-phong-auth`).
- `api()` tự đăng xuất khi đang có token mà backend trả 401, ví dụ khi token hết hạn.
- Lưu ý: token nằm trong localStorage thì JS trên trang đọc được. Muốn chặt hơn thì backend phải trả token qua cookie `httpOnly`.

### 5. Tách store theo tính năng

- Bỏ store gộp `useStore()`, tách thành `auth`, `toast`, `users`, `groups`, `rooms`, `bookings`, mỗi tính năng một thư mục.
- Màn hình lấy từng trường qua selector, nên chỉ re-render khi đúng dữ liệu nó dùng thay đổi.
- `book()` nhận người đặt qua tham số để tránh import vòng giữa `bookings` và `auth`.

### 6. Tổ chức lại dự án theo SOLID

Cấu trúc mới (chi tiết ở `ARCHITECTURE.md`):

```
src/
├─ app/        main.tsx (khởi động, cấu hình provider), App.tsx (định tuyến)
├─ layouts/    AdminLayout, AdminPage, UserLayout
├─ features/   auth · bookings · rooms · users · groups · reports · dashboard · toast
│  └─ <feature>/ model.ts · logic.ts (+test) · api.ts · store.ts · hooks.ts · components/ · pages/
├─ mocks/      dữ liệu mẫu + đồng hồ cố định
└─ shared/     ui/ · api/http.ts · lib/   (không import feature nào)
```

Áp dụng SOLID:
- **S:**
  - `ui.tsx`, `parts.tsx`, `data.ts`, `logic.ts` được tách theo tính năng.
  - Các file màn hình lớn được tách thành component riêng.
  - Phần tính số liệu báo cáo chuyển sang `reports/hooks.ts` (`useReport`), trang chỉ lo hiển thị.
- **O:** `StatusBadge` đọc bảng `STATUS`. `Modal`, `Confirm`, `MultiPick` mở rộng qua props.
- **L:** `PwInput` nhận đủ props của `<input>`.
- **I:** hook được tách nhỏ (`useUsers`, `useUserActions`, `useUserLabel`…).
- **D:**
  - UI chỉ gọi `hooks.ts`, không import store.
  - `shared/api/http.ts` không phụ thuộc `auth`. Cách lấy token và xử lý 401 được truyền vào từ `app/main.tsx` qua `configureHttp()`.

Thay đổi đi kèm:
- `index.html` trỏ tới `src/app/main.tsx`.
- `npm test` chạy mọi file `src/**/*.test.ts`.
- Thêm `ARCHITECTURE.md`.

Kiểm tra:
- `tsc` qua, kể cả khi bật `--noUnusedLocals`.
- 4/4 test qua, build thành công.
- Không có import vòng.
- So từng dòng với code cũ: không mất dòng logic nào, chỉ có các chỗ đổi tên có chủ đích.

### 7. Mapping API dữ liệu phòng (Admin)

- **`rooms/api.ts`:** chuyển đổi `RoomResponse` ↔ `Room`.

| Frontend | Backend |
|---|---|
| `id`, `name` | `room_id`, `room_name` |
| `min`, `max` | `min_capacity`, `max_capacity` |
| `building`, `floor`, `amenities` | giữ tên (`amenities: null` → `[]`) |
| `maint` | `status` (`"Đang bảo trì"` / `"Khả dụng"`) |
| `rate`, `votes` | `avg_rating` (`rating_count = 0` → `null`), `rating_count` |
| `upcoming` (mới) | `upcoming_bookings_count` |

- **`rooms/hooks.ts`:**
  - `useRoomsQuery()` gọi `GET /admin/rooms?limit=1000`, chỉ chạy khi là admin.
  - `useSaveRoom()` gọi `POST`/`PUT`, xong thì tải lại danh sách và hiện toast.
  - `useRoomOf()` trả về một phòng tạm thay vì làm vỡ màn hình khi phòng chưa tải xong.
- **`RoomForm`:**
  - Lấy số lịch sắp tới từ backend để chặn chuyển sang bảo trì.
  - Lỗi trùng tên (409) hiện ở ô Tên phòng, lỗi khác hiện ở đầu form.
  - Nút Lưu bị khóa trong lúc đang gửi.
- **`RoomsPage`:** hiện thông báo khi tải lỗi, không hiện "Không có dữ liệu" trong lúc đang tải.
- **Dữ liệu mẫu:** đổi id phòng theo thứ tự seed của backend (A1=1, A2=2, B1=3, B3=4, Họp T2=5, Họp T3=6, Hội trường C=7) để booking mẫu hiện đúng tên phòng thật.

---

## 2026-11-19

### 8. Sửa lỗi sau khi merge nhánh đăng nhập của khoale193 (`35c0521` → merge `5bff150`)

Nhánh này làm đăng nhập trên cấu trúc cũ (`src/store.tsx`). Lúc gộp, xung đột chưa được xử lý sạch nên build bị lỗi:
- `src/store.tsx` cũ còn sót lại, import tới `./data` và `./logic` đã bị xóa. Không file nào dùng nên đã xóa.
- `LoginPage.tsx` còn tham chiếu biến `loading`. Đã đổi sang `login.isPending`.

Các tính năng của nhánh đó được chuyển sang cấu trúc mới:
- **Header admin hiện tên thật:** `auth/store` lưu thêm `user` (`ApiUser`) và `expiresAt`. `AdminPage` hiện `full_name` cùng chữ viết tắt.
- **`useMe()` dựng từ tài khoản đăng nhập** khi người dùng không có trong dữ liệu mẫu. Trước đây trường hợp này làm màn End-User bị trắng.
- **Tự đăng xuất khi token hết hạn** ngay lúc mở lại trang (`onRehydrateStorage` kiểm tra `expiresAt`).
- **Toast "Đăng nhập thành công"** kèm họ tên.

### 9. Mapping API dữ liệu người dùng (Admin)

- **`users/api.ts`:** chuyển đổi `UserResponse` ↔ `User`. Kiểu `ApiUser` chuyển từ `auth/api.ts` sang đây.

| Frontend | Backend |
|---|---|
| `id`, `name` | `user_id`, `full_name` |
| `sex` | `gender` (`Nam` / `Nữ` / `Khác`) |
| `active` | `status` (`"Đang hoạt động"` / `"Ngưng sử dụng"`) |
| `created` | `created_at` |
| `inGroups` (mới) | `groups[] { group_id, group_name }` |
| `pw` (giờ là tùy chọn) | — (chỉ dữ liệu mẫu có) |

- **`fetchUsers()`:** gọi `GET /admin/users?limit=1000` và bỏ tài khoản có role `Admin` khỏi danh sách quản lý (đúng thiết kế A3).
- **`saveUserApi()`:**
  - `POST /admin/users` với `{ user_id, full_name, gender, group_ids }`. Backend tự đặt mật khẩu mặc định bằng mã định danh và trạng thái "Đang hoạt động".
  - `PUT /admin/users/:id` gửi thêm `status`. Khi đổi mã định danh, backend tự chuyển nhóm và lịch đặt sang mã mới.
- **`users/hooks.ts`:** `useUsersQuery()` chỉ chạy khi là admin, `useSaveUser()` lưu xong thì tải lại danh sách và hiện toast. `useUsers()` và `useUserLabel()` giữ nguyên cách gọi.
- **`UserForm`:**
  - Nhóm đang chọn lấy từ `inGroups` của backend.
  - Lỗi trùng mã (409) hiện ở ô Mã định danh, lỗi khác hiện ở đầu form.
  - Nút Lưu bị khóa trong lúc đang gửi.
- **`UsersPage`:**
  - Cột "Nhóm trực thuộc" lấy từ `inGroups`.
  - Hiện thông báo khi tải lỗi, không hiện "Không có dữ liệu" trong lúc đang tải.
- **`users/store.ts`:** bỏ `saveUser`, chỉ giữ dữ liệu mẫu cho End-User và đổi mật khẩu mẫu.

**Kiểm tra:**
- `tsc --noUnusedLocals` qua, 4/4 test qua, build thành công, không có import vòng.
- Đã gọi thử với backend thật (chỉ các API GET):
  - `/admin/users` trả 11 user, khớp mapping.
  - `/admin/rooms` có id 1–7, đúng giả định ở mục 7.
  - `/admin/groups` có id 1–6, khớp dữ liệu mẫu.
- Chưa thử tạo hay sửa user thật (POST/PUT), để tránh ghi vào DB.

**Lưu ý:**
- Nhóm vẫn là dữ liệu mẫu. Lưu user không cập nhật thành viên trong các màn Nhóm, Thành viên booking cho đến khi nối API nhóm. (Đã xử lý ở mục 10.)
- Đổi mật khẩu vẫn chạy trên dữ liệu mẫu, nên với tài khoản thật luôn báo "Mật khẩu hiện tại không chính xác" (mật khẩu mẫu của admin là `admin123`, mật khẩu thật là `admin`). Cần nối `PUT /auth/change-password`.

---

### 10. Mapping API dữ liệu nhóm người dùng (Admin) — bảng `user_groups`

Backend lưu nhóm ở bảng `user_groups` (`group_id`, `group_name`, `created_at`, `updated_at`). Thành viên nằm ở bảng nối `user_group_members`.

- **`groups/model.ts`:** model `Group` đổi lại cho khớp backend.
  - Thêm `count`, lấy từ `member_count`.
  - `members` (danh sách mã thành viên) và `memberList` (thành viên kèm họ tên) chỉ có khi lấy chi tiết nhóm, hoặc khi dùng dữ liệu mẫu.
- **`groups/api.ts`:** chuyển đổi dữ liệu và gọi API.

| Frontend | Backend |
|---|---|
| `id`, `name`, `created` | `group_id`, `group_name`, `created_at` |
| `count` (mới) | `member_count` |
| `members`, `memberList` | `members[] { user_id, full_name, gender, status }` (chỉ có ở chi tiết) |

  - Danh sách: `GET /admin/groups?limit=1000`.
  - Chi tiết: `GET /admin/groups/:id`, không truyền page/limit nên backend trả đủ thành viên.
  - Tạo: `POST /admin/groups` với `{ group_name, user_ids }`.
  - Sửa: `PUT /admin/groups/:id` với `{ group_name, user_ids }`, backend thay toàn bộ danh sách thành viên.
  - Xóa: `DELETE /admin/groups/:id`.
- **`groups/hooks.ts`:**
  - `useGroupsQuery()`, `useGroupDetailQuery(id)`, `useSaveGroup()`, `useDeleteGroup()`.
  - `useGroup(id)` trả về một nhóm kèm thành viên: admin lấy từ API, End-User lấy từ dữ liệu mẫu.
  - Sau khi lưu hoặc xóa, tải lại cả nhóm lẫn người dùng (vì cột "Nhóm trực thuộc" thay đổi theo), và xóa cache chi tiết nhóm để form không khởi tạo bằng dữ liệu cũ. Lưu người dùng cũng xóa cache này.
- **`GroupsPage`:**
  - Số thành viên lấy từ `count`.
  - Xóa nhóm qua API; nếu lỗi thì hiện toast.
  - Hiện thông báo khi tải lỗi, không hiện "Không có dữ liệu" trong lúc đang tải.
- **`GroupFormPage`:**
  - Tải chi tiết nhóm xong mới dựng form (trong lúc chờ hiện "Đang tải…").
  - Lỗi trùng tên (409) hiện ở ô Tên nhóm, lỗi khác hiện bằng toast.
  - Nút Lưu bị khóa trong lúc đang gửi.
- **`Members`** (thành viên trong chi tiết booking): lấy từ `useGroup()`, nên phía admin hiện thành viên thật.
- **Màn End-User** (Tìm phòng, Tài khoản, xác nhận đặt phòng): số thành viên đọc từ `count`.
- **`groups/store.ts`:** bỏ `saveGroup` và `deleteGroup`, chỉ giữ dữ liệu mẫu cho End-User.

**Kiểm tra:**
- `tsc --noUnusedLocals` qua, 4/4 test qua, build thành công, không có import vòng.
- Đã gọi `GET /admin/groups` và `GET /admin/groups/1` với backend thật, dữ liệu khớp mapping.
- Chưa thử tạo, sửa hay xóa nhóm thật (POST/PUT/DELETE), để tránh ghi vào DB.

**Lưu ý:** booking vẫn là dữ liệu mẫu, nên chi tiết booking phía admin giờ hiện thành viên thật của nhóm (ví dụ nhóm 1 có 4 người theo seed backend) thay vì danh sách mẫu.

---

### 11. Mapping API dữ liệu đặt phòng (Admin) — bảng `bookings`

- **`bookings/mapping.ts` (mới, có `mapping.test.ts`):** hàm thuần chuyển `BookingItemResponse` ↔ `Booking`.

| Frontend `Booking` | Backend |
|---|---|
| `id`, `code` (mới), `title` | `booking_id`, `booking_code`, `title` |
| `roomId`, `by`, `groupId` | `room_id`, `user_id`, `group_id` (`null` = Cá nhân) |
| `date`, `from`, `to` | `start_time`, `end_time` (cắt chuỗi RFC3339 để giữ giờ theo máy chủ, không phụ thuộc múi giờ trình duyệt) |
| `status` `wait/ok/live/done/no/cancel` | `status` `"Chờ duyệt"`, `"Đã chấp nhận"`, `"Đang diễn ra"`, `"Đã kết thúc"`, `"Không chấp nhận"`, `"Đã hủy"` (backend đã tính trạng thái thực tế theo giờ hiện tại) |
| `sent` | `created_at` |
| `reason { text, by?, at }` | `reason` (chỉ có nội dung) + `updated_at` |
| `fb { stars, text, at }` | `feedback { rating, comment, updated_at \| created_at }` |

  - Backend chỉ lưu nội dung lý do. Lịch bị từ chối thì ghi `by = 'admin'`. Lịch bị hủy thì không biết ai hủy, nên để trống `by` và `ReasonBox` không hiện dòng người hủy.
- **`bookings/api.ts`:**
  - Danh sách: `GET /admin/bookings?limit=10000`. Tổng quan, Đặt phòng và Báo cáo dùng chung danh sách này, lọc ở client.
  - Duyệt: `PUT /admin/bookings/:id/approve | reject | cancel` với `{ reason }`.
- **`bookings/hooks.ts`:**
  - `useBookingsQuery()` chỉ chạy khi là admin.
  - `useDecideBooking()`: xử lý xong thì tải lại lịch đặt và phòng (vì số lịch sắp tới của phòng thay đổi).
  - `useBookings()` giữ nguyên cách gọi, End-User vẫn đọc dữ liệu mẫu.
- **`DecideDialog`:** Chấp nhận, Từ chối, Hủy khẩn cấp đều gọi API. Thành công thì hiện toast và đóng hộp thoại. Lỗi (ví dụ lịch vừa được xử lý ở nơi khác, backend trả 400) thì hiện toast đỏ.
- **Mã đặt phòng:** dùng `booking_code` của backend. Dữ liệu mẫu vẫn tự sinh mã như cũ.
- **Tổng quan:** dùng giờ thật (`shared/lib/clock.ts`) thay cho đồng hồ mẫu, vì dữ liệu admin đã là dữ liệu thật.
- Các màn tự lấy dữ liệu thật mà không phải sửa: Đặt phòng (danh sách, tab đếm trạng thái, chi tiết), Báo cáo, số chờ duyệt ở thanh bên.

**Kiểm tra:**
- `tsc --noUnusedLocals` qua, 6/6 test qua (thêm 2 test cho hàm chuyển đổi), build thành công, không có import vòng.
- Đã chạy hàm chuyển đổi trên dữ liệu thật: lấy 12 lịch đặt từ `GET /admin/bookings`, tất cả chuyển đúng trạng thái, giờ, mã, lý do và đánh giá.
- Chưa bấm Chấp nhận, Từ chối hay Hủy trên dữ liệu thật, để tránh ghi vào DB.

**Lưu ý:**
- Phía End-User (tìm phòng, đặt phòng, lịch sử, hủy, đánh giá) vẫn dùng dữ liệu mẫu.
- Chi tiết booking chưa gọi `GET /admin/bookings/:id`. Mọi thông tin hiển thị đã có sẵn trong danh sách, còn thành viên lấy từ chi tiết nhóm (mục 10).

---

### 12. Loading skeleton cho màn Quản lý đặt phòng

- **`shared/ui/feedback.tsx`:** thêm `Skeleton` (thanh xám nhấp nháy, không nhấp nháy khi người dùng bật giảm chuyển động) và `SkeletonRows` (dòng giả cho bảng).
- **`AdminBookingsPage`, khi đang tải:**
  - Hiện 8 dòng giả với độ rộng gần giống dữ liệu thật; số đếm trên các tab cũng là thanh giả.
  - Ẩn dòng "Không có dữ liệu" và thanh phân trang.
  - Bảng có `aria-busy`, kèm dòng ẩn cho trình đọc màn hình.
  - Tải lỗi thì hiện thông báo phía trên bảng.
- **Kiểm tra:** chạy Dia ở chế độ chạy ngầm với profile tạm, điều khiển qua DevTools Protocol, giữ request `/admin/bookings` lại vài giây rồi chụp màn hình lúc đang tải và lúc đã tải. Skeleton hiện đúng, dữ liệu thật thay vào đúng chỗ.
- **Phát hiện thêm (chưa sửa):** ở độ rộng 1440px, bảng với dữ liệu thật rộng hơn khung chứa, cột "Thao tác" bị đẩy ra ngoài, phải cuộn ngang.

### 13. Mapping API đánh giá (reviews) — bảng `feedbacks`

Ở backend, đánh giá nằm trong bảng `feedbacks` (`feedback_id`, `booking_id` unique, `rating`, `comment`, `created_at`, `updated_at`), mỗi booking tối đa một đánh giá.

| Nơi dùng | Nguồn |
|---|---|
| Điểm TB, số lượt đánh giá của phòng | `avg_rating`, `rating_count` trong `RoomResponse` (mục 7) |
| Phản hồi trong chi tiết booking (Admin) | `feedback` trong `BookingItemResponse` (mục 11) |
| Đánh giá gần đây trong chi tiết phòng | `GET /rooms/:id` → `recent_feedbacks` (mới) |

- **`features/reviews/` (mới):**
  - `model.ts`: kiểu `Review { id, bookingId, stars, text, at }`.
  - `api.ts`: hàm chuyển đổi `toReview` (`feedback_id`, `booking_id`, `rating`, `comment`, `created_at`) và `fetchRoomReviews(roomId)`.
  - `hooks.ts`: `useRoomReviews(roomId)`.
- **`GET /rooms/:id`:** tài khoản nào cũng gọi được (không cần quyền admin), trả về phòng kèm 10 đánh giá gần nhất.
- **`RoomDetailDialog`** (chi tiết phòng ở màn Tìm phòng):
  - Đánh giá gần đây và điểm trung bình lấy từ backend, thay cho việc lọc từ booking mẫu.
  - Đang tải thì hiện skeleton, lỗi thì hiện thông báo.
  - Id phòng mẫu đã khớp backend (mục 7) nên End-User cũng thấy đánh giá thật.

**Kiểm tra:**
- `tsc --noUnusedLocals` qua, 6/6 test qua, build thành công, không có import vòng.
- Đã gọi `GET /rooms/1` với tài khoản thường `SV2026001`: trả 1 đánh giá 4 sao, khớp mapping.
- Chưa xem trên giao diện.

**Chưa làm:**
- Gửi và sửa đánh giá (`POST/PUT /bookings/:id/feedback` với `{ rating, comment, tags }`). Booking phía End-User vẫn là dữ liệu mẫu, id không trùng với booking thật, nên phải nối lịch sử đặt phòng (`/bookings/my`) trước.

---

### 14. Tổng quan và Báo cáo & thống kê: bỏ hết dữ liệu mẫu còn sót

Theo yêu cầu, frontend vẫn tự tải dữ liệu về và tự tính (chưa dùng `/admin/dashboard`, `/admin/reports/bookings`).

Hai màn này đã đọc lịch đặt, phòng, người dùng, nhóm từ API (mục 7–11). Còn sót lại:
- **Khoảng ngày mặc định của Báo cáo cố định 01–30/11/2026** (theo dữ liệu mẫu). Đã đổi thành tháng hiện tại bằng `monthRange()` trong `shared/lib/clock.ts`.
- **Trong lúc tải, hai màn hiện số 0 và "Không có dữ liệu".** Đã thêm `StatsSkeleton` (`shared/ui/feedback.tsx`) cho cả hai màn khi lịch đặt, phòng, người dùng hoặc nhóm chưa tải xong. Có lỗi thì hiện thông báo.

**Đối chiếu với số liệu backend tự tính:**
- Báo cáo tháng 11 (`/admin/reports/bookings`) khớp hoàn toàn:
  - 12 booking, 5 chấp nhận, 2 không chấp nhận hoặc đã hủy, 5 chờ duyệt.
  - Theo phòng: A1 6, Họp Tầng 2 3, A2 2, Hội trường C 1.
  - Theo nhóm khớp từng dòng.
  - Tỷ lệ chấp nhận 71% so với 71,4% của backend (làm tròn).
- Tổng quan (`/admin/dashboard`): chờ duyệt 5, lịch hôm nay 0, phòng bảo trì 0, khớp backend.
  - Ô người dùng hiện **9/10**, backend tính **10/11**, vì danh sách người dùng của frontend không có tài khoản admin (mục 9).

**Kiểm tra:**
- `tsc --noUnusedLocals` qua, 6/6 test qua, build thành công.
- Chụp màn hình bằng Dia chạy ngầm: Tổng quan lúc đang tải (skeleton) và lúc đã tải; Báo cáo đầy đủ.

---

### 15. Mapping toàn bộ API phía End-User & xóa sạch dữ liệu mẫu (nhánh `user`)

Gộp cấu trúc chuẩn từ `main` sang nhánh `user`, giữ lại các tối ưu UI mobile/desktop của nhánh `user` (`vercel.json`, icon lọc/tải lại/spin, nút quay lại modal trên mobile, hiển thị điểm đánh giá gọn trên mobile) và nối toàn bộ phần End-User + Đổi mật khẩu với backend:

| Màn / Chức năng | API đã nối | Ghi chú |
|---|---|---|
| Phiên & Tài khoản (`AccountPage`, `UserLayout`) | `GET /auth/me` | Đồng bộ thông tin user và nhóm trực thuộc mới nhất; xóa cache React Query khi đăng nhập/đăng xuất/401 |
| Đổi mật khẩu (`ChangePassword`, cả Admin & End-User) | `PUT /auth/change-password` | Payload `{ current_password, new_password, confirm_password }`; truyền `skipAuthRedirect: true` để nhập sai mật khẩu hiện tại không bị đăng xuất nhầm |
| Nhóm của tôi (`SearchPage`, `BookFormDialog`, `AccountPage`, `Members`) | `GET /my/groups`, `GET /my/groups/:id` | Tự hỗ trợ cả response mảng lẫn `{ items }`; chi tiết thành viên tải theo nhu cầu khi xem booking |
| Tìm phòng trống (`SearchPage`) | `GET /rooms/available?start_time=&end_time=&min_capacity=&amenities=` | Thời gian gửi chuẩn RFC3339 (`toIsoDateTime` trong `shared/lib/clock.ts`), dùng giờ thật |
| Chi tiết phòng (`RoomDetailDialog`, `UserBookingDetail`) | `GET /rooms/:id` | Lấy thông tin phòng, tiện ích, điểm TB và đánh giá gần đây từ backend |
| Đặt phòng (`BookFormDialog`) | `POST /bookings` | Payload `{ room_id, title, start_time, end_time, group_id }`; bắt lỗi `409 Conflict` qua `ApiError` để báo trùng lịch và tự tải lại danh sách phòng trống |
| Lịch sử & Chi tiết đặt phòng (`HistoryPage`, `UserBookingDetail`) | `GET /bookings/my`, `GET /bookings/:id` | Có loading skeleton (bảng desktop + card mobile) và thông báo lỗi |
| Hủy lịch đặt (`HistoryPage`, `UserBookingDetail`) | `PUT /bookings/:id/cancel` | Payload `{ reason }`, khóa nút trong lúc gửi (`Confirm.busy`) và invalidate cache |
| Gửi / Sửa đánh giá (`RateDialog`) | `POST /bookings/:id/feedback`, `PUT /bookings/:id/feedback` | Payload `{ rating, comment, tags }`; lưu xong invalidate cả lịch sử booking lẫn chi tiết phòng |

**Dọn phần thừa:**
- Xóa toàn bộ file cấu trúc phẳng cũ của nhánh `user` (`src/Login.tsx`, `src/main.tsx`, `src/parts.tsx`, `src/store.tsx`, `src/ui.tsx`, `src/data.ts`, `src/logic.ts`, `src/logic.test.ts`, `src/index.css`, `src/user/*`).
- Xóa toàn bộ thư mục `src/mocks/` (`clock.ts`, `seed.ts`), `src/shared/lib/nextId.ts` và 4 mock store (`rooms/store.ts`, `groups/store.ts`, `bookings/store.ts`, `users/store.ts`).

**Kiểm tra:**
- `npx tsc --noEmit --noUnusedLocals` qua không lỗi.
- `npm test` qua 9/9 test (thêm unit test cho `pwClientErrors`, `toBookingBody`, `toIsoDateTime`).
- `npm run build` thành công, không vi phạm quy tắc DIP (`pages/`/`components/` không import `store.ts` hay `api.ts`).

---

## Trạng thái hiện tại

| Phần | Nguồn dữ liệu |
|---|---|
| Đăng nhập, phiên đăng nhập, `/auth/me`, đổi mật khẩu | Backend |
| Phòng (Admin & End-User `/rooms/available`, `/rooms/:id`) | Backend |
| Người dùng (Admin) | Backend |
| Nhóm người dùng (Admin & End-User `/my/groups`, `/my/groups/:id`) | Backend |
| Đặt phòng, Tổng quan, Báo cáo (Admin) | Backend (Tổng quan, Báo cáo do frontend tự tính từ dữ liệu thật) |
| Lịch sử đặt phòng, tạo/hủy đặt phòng (End-User) | Backend |
| Đánh giá: điểm TB phòng, phản hồi trong booking, gửi/sửa đánh giá | Backend |

## Còn tồn đọng / lưu ý

- Chưa kiểm thử end-to-end các thao tác ghi (`POST`/`PUT`/`DELETE`) trực tiếp trên backend chạy thật; cần đối chiếu nhanh tên field request/response của các endpoint End-User (`/auth/change-password`, `/my/groups`, `/rooms/available`, `/bookings/my`, `/bookings`, `/bookings/:id/cancel`, `/bookings/:id/feedback`) khi chạy cùng server `dat-phong-backend`.
- Danh sách phòng/booking của admin lấy hết một lần rồi lọc ở client. Nếu dữ liệu lớn, chuyển sang phân trang/lọc phía server.

## Việc tiếp theo

1. Chạy thử toàn bộ luồng End-User và Admin với backend `dat-phong-backend` thật để xác nhận khớp 100% schema request/response.
2. Merge nhánh `user` vào `main` sau khi test thực tế với backend đạt yêu cầu.
