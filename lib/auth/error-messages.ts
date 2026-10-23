import { PASSWORD_POLICY_MESSAGE } from "./constants";

// Maps Better Auth / hook error codes to the Vietnamese text the admin UI shows. Import-free apart
// from constants, so client components can use it. Raw server messages are English and may carry
// detail we do not want on screen — unknown codes fall back to a generic line, never to `message`.

export type AuthErrorLike = { code?: string; message?: string; status?: number } | null | undefined;

export type AuthFailure = {
  message: string;
  /** The session is too old for this action: the UI offers "sign in again" instead of "retry". */
  needsReauth: boolean;
};

const NO_PERMISSION = "Bạn không có quyền thực hiện thao tác này.";
const SESSION_EXPIRED = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
const GENERIC_FAILURE = "Đã xảy ra lỗi. Vui lòng thử lại.";
const TOO_MANY_REQUESTS = "Quá nhiều yêu cầu. Vui lòng thử lại sau.";

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email hoặc mật khẩu không đúng.",
  INVALID_PASSWORD: "Mật khẩu hiện tại không đúng.",
  BANNED_USER: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
  SESSION_NOT_FRESH: "Phiên đăng nhập đã cũ. Vui lòng đăng nhập lại để tiếp tục thao tác này.",
  PASSWORD_POLICY: PASSWORD_POLICY_MESSAGE,
  PASSWORD_TOO_SHORT: PASSWORD_POLICY_MESSAGE,
  PASSWORD_TOO_LONG: PASSWORD_POLICY_MESSAGE,
  SELF_ACTION_FORBIDDEN: "Không thể tự đổi vai trò hoặc vô hiệu hóa chính tài khoản của bạn.",
  USER_ALREADY_EXISTS: "Email này đã được sử dụng cho một tài khoản khác.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Email này đã được sử dụng cho một tài khoản khác.",
  INVALID_EMAIL: "Email không hợp lệ.",
  PASSWORD_CHANGE_REQUIRED: "Bạn cần đổi mật khẩu trước khi tiếp tục.",
  UNAUTHENTICATED: SESSION_EXPIRED,
  UNAUTHORIZED: SESSION_EXPIRED,
  FORBIDDEN: NO_PERMISSION,
  CROSS_ORIGIN: NO_PERMISSION,
};

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** "30 giây", "5 phút", "2 giờ" — rounded up so the user never retries a moment too early. */
export function formatWaitTime(totalSeconds: number): string {
  const seconds = Math.max(1, Math.ceil(totalSeconds));
  if (seconds < SECONDS_PER_MINUTE) return `${seconds} giây`;
  if (seconds < SECONDS_PER_HOUR) return `${Math.ceil(seconds / SECONDS_PER_MINUTE)} phút`;
  return `${Math.ceil(seconds / SECONDS_PER_HOUR)} giờ`;
}

/** `Retry-After` (also Better Auth's `X-Retry-After`) in seconds; null when absent or not a plain number. */
export function parseRetryAfter(headers: Headers | undefined | null): number | null {
  const raw = headers?.get("Retry-After") ?? headers?.get("X-Retry-After");
  if (!raw || !/^\d+$/.test(raw.trim())) return null;
  return Number(raw.trim());
}

function lockedMessage(retryAfterSeconds: number | null | undefined): string {
  const base = "Quá nhiều lần đăng nhập sai.";
  return retryAfterSeconds ? `${base} Vui lòng thử lại sau ${formatWaitTime(retryAfterSeconds)}.` : `${base} Vui lòng thử lại sau.`;
}

function tooManyRequestsMessage(retryAfterSeconds: number | null | undefined): string {
  return retryAfterSeconds ? `Quá nhiều yêu cầu. Vui lòng thử lại sau ${formatWaitTime(retryAfterSeconds)}.` : TOO_MANY_REQUESTS;
}

function messageFor(error: Exclude<AuthErrorLike, null | undefined>, retryAfterSeconds: number | null | undefined): string {
  const { code, status } = error;
  if (code === "ACCOUNT_LOCKED") return lockedMessage(retryAfterSeconds);
  if (code && MESSAGES[code]) return MESSAGES[code];
  // Better Auth's own admin-plugin denials are all `YOU_ARE_NOT_ALLOWED_TO_*`.
  if (code?.startsWith("YOU_ARE_NOT_ALLOWED")) return NO_PERMISSION;
  if (status === 429) return tooManyRequestsMessage(retryAfterSeconds);
  if (status === 401) return SESSION_EXPIRED;
  if (status === 403) return NO_PERMISSION;
  return GENERIC_FAILURE;
}

export function describeAuthError(error: AuthErrorLike, retryAfterSeconds?: number | null): AuthFailure {
  if (!error) return { message: GENERIC_FAILURE, needsReauth: false };
  return { message: messageFor(error, retryAfterSeconds), needsReauth: error.code === "SESSION_NOT_FRESH" };
}
