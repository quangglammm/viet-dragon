// The admin is used in Vietnam and rendered both on the server (whose time zone is the VPS's) and in the
// browser. Pinning the zone keeps server and client output identical, so there is no hydration mismatch.

const ADMIN_LOCALE = "vi-VN";
const ADMIN_TIME_ZONE = "Asia/Ho_Chi_Minh";

const dateTimeFormat = new Intl.DateTimeFormat(ADMIN_LOCALE, {
  timeZone: ADMIN_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormat = new Intl.DateTimeFormat(ADMIN_LOCALE, {
  timeZone: ADMIN_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat(ADMIN_LOCALE, { timeZone: ADMIN_TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false });

/** `14:05`: for «Đã lưu lúc …». */
export function formatAdminTime(value: Date | string | number): string {
  return timeFormat.format(new Date(value));
}

export function formatAdminDateTime(value: Date | string | number): string {
  return dateTimeFormat.format(new Date(value));
}

export function formatAdminDate(value: Date | string | number): string {
  return dateFormat.format(new Date(value));
}
