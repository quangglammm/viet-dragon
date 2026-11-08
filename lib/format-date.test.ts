import { describe, expect, it } from "vitest";
import { formatAdminDate, formatAdminDateTime, formatAdminTime } from "./format-date";

describe("admin date formatting", () => {
  it("renders in Vietnam time whatever the machine's time zone is", () => {
    // 17:30 UTC is 00:30 the next day in UTC+7.
    const instant = new Date("2026-10-23T17:30:00Z");
    expect(formatAdminDateTime(instant)).toContain("24/10/2026");
    expect(formatAdminDateTime(instant)).toContain("00:30");
    expect(formatAdminDate(instant)).toBe("24/10/2026");
  });

  it("renders just the time of day, in Vietnam time, for «Đã lưu lúc …»", () => {
    expect(formatAdminTime("2026-10-23T17:30:00Z")).toBe("00:30");
    expect(formatAdminTime(new Date("2026-10-24T07:05:00Z"))).toBe("14:05");
  });

  it("accepts the ISO strings that cross the server → client boundary", () => {
    expect(formatAdminDate("2026-01-05T03:00:00.000Z")).toBe("05/01/2026");
  });
});
