# Kiến trúc frontend

React 19 + React Router · state: **zustand** · gọi API: **react-query** + `fetch`.
Code chia theo **tính năng (feature)**, mỗi tầng chỉ được phụ thuộc xuống tầng dưới:

```
app  →  layouts  →  features  →  mocks  →  shared
```

## Cấu trúc thư mục

```
src/
├─ app/                    Composition root
│  ├─ main.tsx             Dựng provider, nối http client với phiên đăng nhập
│  └─ App.tsx              Định tuyến theo quyền (Admin / End-User)
├─ layouts/                Khung trang: AdminLayout, AdminPage, UserLayout
├─ features/
│  └─ <feature>/           auth · bookings · rooms · users · groups · reports · dashboard · toast
│     ├─ model.ts          Kiểu dữ liệu, hằng số, hàm định dạng của feature
│     ├─ logic.ts          Quy tắc nghiệp vụ thuần (không React) + logic.test.ts
│     ├─ api.ts            Gọi backend (endpoint, kiểu request/response)
│     ├─ store.ts          State zustand (hiện là dữ liệu mẫu, trừ auth)
│     ├─ hooks.ts          API công khai cho UI: useX(), useXActions(), useLogin()…
│     ├─ components/       Thành phần riêng của feature (form, dialog, drawer…)
│     └─ pages/            Màn hình gắn với route
├─ mocks/                  Dữ liệu mẫu + đồng hồ cố định (xóa dần khi nối backend)
└─ shared/                 Dùng chung, KHÔNG import feature nào
   ├─ ui/                  Icon, form, dialog, feedback, table (useSort/usePaged)
   ├─ api/http.ts          fetch client: gắn token, đọc { success, message, data }
   └─ lib/                 format (dmy, longDate, initials), nextId
```

## Áp dụng SOLID

| Nguyên tắc | Trong dự án |
|---|---|
| **S** – Single Responsibility | Mỗi file một việc: `pages/` chỉ ghép giao diện, `hooks.ts` lấy dữ liệu, `logic.ts` chứa quy tắc nghiệp vụ, `store.ts` giữ state, `api.ts` gọi HTTP. Ví dụ: `reports/hooks.ts` (`useReport`) tính số liệu, `ReportsPage` chỉ hiển thị. |
| **O** – Open/Closed | Thành phần dùng chung mở rộng qua props/children, không sửa ruột: `Modal` (`head`, `footer`, `bare`), `Confirm` (`reason`, `tone`), `MultiPick` (`free`). `StatusBadge` đọc bảng `STATUS`: thêm trạng thái chỉ cần thêm một dòng trong bảng. |
| **L** – Liskov Substitution | Component bọc thẻ HTML nhận đủ props của thẻ gốc: `PwInput` dùng được ở mọi chỗ dùng `<input>`. |
| **I** – Interface Segregation | Component chỉ nhận dữ liệu nó cần (`RoomDl` nhận `Room`, `ReasonBox` nhận `Booking`); hook tách nhỏ (`useUsers`, `useUserActions`, `useUserLabel`) thay vì một store khổng lồ. |
| **D** – Dependency Inversion | UI chỉ gọi `hooks.ts`, không biết dữ liệu đến từ zustand hay API: nối backend chỉ sửa `hooks.ts`/`api.ts`, màn hình giữ nguyên. `shared/api/http.ts` không import `auth`; `app/main.tsx` truyền cách lấy token và xử lý 401 qua `configureHttp()`. |

## Quy tắc khi thêm code

1. Component/page **không** import `store.ts`, chỉ import `hooks.ts`.
2. `shared/` không import `features/`, `layouts/`, `app/`, `mocks/`.
3. Feature dùng feature khác qua `hooks.ts`, `model.ts` hoặc `components/` của feature đó.
4. Quy tắc nghiệp vụ đặt trong `logic.ts` (hàm thuần) và có test cạnh nó; chạy `npm test`.
5. Nối một màn với backend: thêm hàm vào `api.ts` → đổi ruột hook trong `hooks.ts` sang `useQuery`/`useMutation` → xóa phần dữ liệu mẫu trong `store.ts`.
