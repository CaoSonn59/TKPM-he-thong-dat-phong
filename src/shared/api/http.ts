// Gọi backend dat-phong-backend: mọi response có dạng { success, message?, data? }.
// Dùng làm queryFn / mutationFn cho react-query.
// Không import feature nào (DIP): app/ đăng ký cách lấy token và xử lý 401 qua configureHttp().
interface HttpConfig { getToken(): string | null; onUnauthorized(): void }
let cfg: HttpConfig = { getToken: () => null, onUnauthorized: () => {} }
export const configureHttp = (c: HttpConfig) => { cfg = c }

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function api<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  opts?: { skipAuthRedirect?: boolean },
): Promise<T> {
  const token = cfg.getToken()
  let res: Response
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Không kết nối được máy chủ, vui lòng thử lại', 0)
  }
  // Token hết hạn / tài khoản bị khóa giữa chừng → về màn đăng nhập.
  if (token && res.status === 401 && !opts?.skipAuthRedirect) cfg.onUnauthorized()
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) throw new ApiError(json?.message ?? `Lỗi máy chủ (${res.status})`, res.status)
  return json.data as T
}
