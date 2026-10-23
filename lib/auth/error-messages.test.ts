import { describe, expect, it } from "vitest";
import { describeAuthError, formatWaitTime, parseRetryAfter } from "./error-messages";

describe("describeAuthError", () => {
  it.each([
    ["INVALID_EMAIL_OR_PASSWORD", "Email hoặc mật khẩu không đúng."],
    ["BANNED_USER", "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."],
    ["SELF_ACTION_FORBIDDEN", "Không thể tự đổi vai trò hoặc vô hiệu hóa chính tài khoản của bạn."],
    ["USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", "Email này đã được sử dụng cho một tài khoản khác."],
    ["INVALID_PASSWORD", "Mật khẩu hiện tại không đúng."],
  ])("maps %s to Vietnamese", (code, message) => {
    expect(describeAuthError({ code, message: "English text from the server" }).message).toBe(message);
  });

  it("puts the password policy (12–128 characters) in front of the user", () => {
    expect(describeAuthError({ code: "PASSWORD_POLICY" }).message).toMatch(/12 đến 128/);
    expect(describeAuthError({ code: "PASSWORD_TOO_SHORT" }).message).toMatch(/12 đến 128/);
  });

  it("asks to sign in again only when the session is too old", () => {
    expect(describeAuthError({ code: "SESSION_NOT_FRESH" }).needsReauth).toBe(true);
    expect(describeAuthError({ code: "FORBIDDEN", status: 403 }).needsReauth).toBe(false);
  });

  it("includes the wait time for a locked account when the server gave one", () => {
    expect(describeAuthError({ code: "ACCOUNT_LOCKED", status: 429 }, 300).message).toContain("5 phút");
    expect(describeAuthError({ code: "ACCOUNT_LOCKED", status: 429 }).message).toBe("Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau.");
  });

  it("reads a plain rate-limit 429 (no code) as too many requests", () => {
    expect(describeAuthError({ status: 429 }, 42).message).toBe("Quá nhiều yêu cầu. Vui lòng thử lại sau 42 giây.");
  });

  it("maps the admin plugin's permission denials to one line", () => {
    expect(describeAuthError({ code: "YOU_ARE_NOT_ALLOWED_TO_BAN_USERS", status: 403 }).message).toBe(
      "Bạn không có quyền thực hiện thao tác này.",
    );
  });

  it("never shows an unknown server message — English or otherwise", () => {
    const failure = describeAuthError({ code: "SOMETHING_NEW", message: "internal detail: relation does not exist", status: 500 });
    expect(failure.message).toBe("Đã xảy ra lỗi. Vui lòng thử lại.");
    expect(describeAuthError(null).message).toBe("Đã xảy ra lỗi. Vui lòng thử lại.");
  });
});

describe("formatWaitTime", () => {
  it.each([
    [0, "1 giây"],
    [30, "30 giây"],
    [59.2, "1 phút"],
    [60, "1 phút"],
    [301, "6 phút"],
    [3600, "1 giờ"],
    [86400, "24 giờ"],
  ])("%s s → %s", (seconds, text) => {
    expect(formatWaitTime(seconds)).toBe(text);
  });
});

describe("parseRetryAfter", () => {
  it("reads Retry-After, then Better Auth's X-Retry-After", () => {
    expect(parseRetryAfter(new Headers({ "Retry-After": "120" }))).toBe(120);
    expect(parseRetryAfter(new Headers({ "X-Retry-After": "7" }))).toBe(7);
  });

  it("ignores HTTP dates, junk and missing headers", () => {
    expect(parseRetryAfter(new Headers({ "Retry-After": "Wed, 21 Oct 2026 07:28:00 GMT" }))).toBeNull();
    expect(parseRetryAfter(new Headers({ "Retry-After": "-5" }))).toBeNull();
    expect(parseRetryAfter(new Headers())).toBeNull();
    expect(parseRetryAfter(undefined)).toBeNull();
  });
});
