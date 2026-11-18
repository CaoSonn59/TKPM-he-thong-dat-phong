// Khung Admin: thanh bên điều hướng + vùng nội dung (Outlet).
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Icon, type IconName } from "../shared/ui";
import { useBookings } from "../features/bookings/hooks";

const NAV: [to: string, label: string, icon: IconName][] = [
  ["/admin", "Tổng quan", "grid"],
  ["/admin/dat-phong", "Đặt phòng", "calCheck"],
  ["/admin/phong", "Phòng", "door"],
  ["/admin/nguoi-dung", "Người dùng", "user"],
  ["/admin/nhom", "Nhóm người dùng", "users"],
  ["/admin/bao-cao", "Báo cáo & thống kê", "chart"],
];

export default function AdminLayout() {
  const bookings = useBookings();
  const [mini, setMini] = useState(false);
  const wait = bookings.filter((b) => b.status === "wait").length;
  return (
    <div className="flex flex-wrap min-h-screen">
      <nav
        className={`side ${mini ? "flex-none w-16" : "flex-[1_1_232px] md:max-w-[232px]"}`}
        aria-label="Điều hướng chính"
      >
        <div className="flex items-center gap-2.5 px-1 pt-1 pb-[18px] overflow-hidden">
          <div className="logo">ĐP</div>
          {!mini && (
            <div className="whitespace-nowrap">
              <div className="font-bold text-[15px]">Hệ thống đặt phòng</div>
              <div className="muted small">Trang quản trị</div>
            </div>
          )}
        </div>
        {NAV.map(([to, label, icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            title={mini ? label : undefined}
            className={({ isActive }) => `nav ${isActive ? "on" : ""}`}
          >
            <Icon n={icon} />
            {!mini && label}
            {!mini && to === "/admin/dat-phong" && wait > 0 && (
              <span className="cnt" aria-label={`${wait} yêu cầu chờ duyệt`}>
                {wait}
              </span>
            )}
          </NavLink>
        ))}
        <button
          className="nav mt-auto"
          aria-label={mini ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          aria-expanded={!mini}
          onClick={() => setMini(!mini)}
        >
          <Icon n="collapse" className={mini ? "rotate-180" : ""} />
          {!mini && "Thu gọn"}
        </button>
      </nav>
      <div className="flex-[999_1_560px] min-w-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
