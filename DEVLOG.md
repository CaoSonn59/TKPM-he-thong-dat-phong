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

## Trạng thái hiện tại

| Phần | Nguồn dữ liệu |
|---|---|
| Đăng nhập, phiên đăng nhập | Backend |
| Phòng (Admin) | Backend |
| Phòng (End-User), booking, người dùng, nhóm, dashboard, báo cáo, đổi mật khẩu | Dữ liệu mẫu (`mocks/`) |

## Còn tồn đọng / lưu ý

- **Chưa chạy thử với backend thật:** lúc làm, backend (`localhost:8080`) chưa chạy. Mới kiểm tra bằng typecheck, test và build.
- Id phòng trong dữ liệu mẫu giả định DB được seed mới với id từ 1 đến 7. Nếu khác, tên phòng trong booking mẫu sẽ lệch cho đến khi nối API booking.
- End-User chưa có API liệt kê toàn bộ phòng (chỉ có `/rooms/available` theo khung giờ), nên màn Tìm phòng vẫn dùng dữ liệu mẫu.
- Danh sách phòng của admin lấy hết một lần rồi lọc ở client. Nếu số phòng lớn, chuyển sang truyền `keyword`/`page` lên server.
- Các thay đổi chưa được commit.

## Việc tiếp theo

1. Bật backend, chạy thử đăng nhập và màn Phòng.
2. Nối Đặt phòng (Admin): danh sách, chi tiết, duyệt / từ chối / hủy.
3. Nối Người dùng, Nhóm, Tổng quan, Báo cáo.
4. Nối phía End-User: Tìm phòng (`/rooms/available`), đặt phòng, lịch sử, đánh giá, đổi mật khẩu (`PUT /auth/change-password`).
5. Xóa dần `mocks/` khi mỗi màn đã nối xong.
