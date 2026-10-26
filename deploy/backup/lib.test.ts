import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

// The decisions of the backup image (when to run, what to delete, whether a restored copy matches) are plain bash functions in lib.sh, so they can be
// tested here without a database or a container. Everything that touches Postgres or the volumes is covered by the restore drill (docs/deployment.md).

const DIR = __dirname;
const LIB = join(DIR, "lib.sh");
const scratch = mkdtempSync(join(tmpdir(), "vd-backup-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** Runs a snippet of bash with lib.sh loaded; returns stdout (and fails the test if bash exits non-zero). */
const bash = (snippet: string, input?: string): string => execFileSync("bash", ["-c", `. "${LIB}"; ${snippet}`], { input, encoding: "utf8" }).trimEnd();
const bashStatus = (snippet: string) => spawnSync("bash", ["-c", `. "${LIB}"; ${snippet}`], { encoding: "utf8" });

const file = (name: string, lines: string[]) => {
  const path = join(scratch, name);
  writeFileSync(path, lines.length ? `${lines.join("\n")}\n` : "");
  return path;
};

describe("seconds_until_hour", () => {
  const until = (hour: number, now: string) => Number(bash(`seconds_until_hour ${hour} ${now}`));
  const clock = (h: number, m = 0, s = 0) => String(h * 3600 + m * 60 + s);

  it("counts to the next occurrence of the hour", () => {
    expect(until(3, clock(2))).toBe(3600);
    expect(until(3, clock(0))).toBe(3 * 3600);
    expect(until(3, clock(2, 59, 59))).toBe(1);
  });

  it("wraps past midnight when the hour has gone today", () => {
    expect(until(3, clock(4))).toBe(23 * 3600);
    expect(until(3, clock(23, 59, 59))).toBe(3 * 3600 + 1);
  });

  it("never answers 0: a backup that ends the second it was due must not start again at once", () => {
    expect(until(3, clock(3))).toBe(86_400);
    expect(until(0, clock(0))).toBe(86_400);
  });
});

describe("local_seconds_of_day", () => {
  it("is the number of seconds since local midnight, read from the time zone's own clock", () => {
    for (const zone of ["Asia/Ho_Chi_Minh", "UTC", "America/New_York"]) {
      const seconds = Number(bash(`local_seconds_of_day ${zone}`));
      expect(Number.isInteger(seconds), zone).toBe(true);
      expect(seconds).toBeGreaterThanOrEqual(0);
      expect(seconds).toBeLessThan(86_400);
    }
  });

  it("does not trip over hours and minutes such as 08 and 09 (leading zeros are not octal)", () => {
    // The function is the only place a zero-padded clock reading becomes a number; run it with a stub `date` that prints 08:09:09.
    const stub = join(scratch, "bin");
    execFileSync("mkdir", ["-p", stub]);
    writeFileSync(join(stub, "date"), '#!/bin/sh\ncase "$1" in +%H) echo 08;; +%M) echo 09;; +%S) echo 09;; esac\n', { mode: 0o755 });
    const out = execFileSync("bash", ["-c", `PATH="${stub}:$PATH"; . "${LIB}"; local_seconds_of_day Asia/Ho_Chi_Minh`], { encoding: "utf8" }).trim();
    expect(out).toBe(String(8 * 3600 + 9 * 60 + 9));
  });
});

describe("stamp_from_epoch", () => {
  it("writes a sortable UTC stamp", () => {
    expect(bash("stamp_from_epoch 0")).toBe("19700101T000000Z");
    expect(bash("stamp_from_epoch 1700000000")).toBe("20231114T221320Z");
  });

  it("sorts in time order", () => {
    const stamps = [1_700_000_000, 1_600_000_000, 1_800_000_000].map((epoch) => bash(`stamp_from_epoch ${epoch}`));
    expect([...stamps].sort()).toEqual([stamps[1], stamps[0], stamps[2]]);
  });
});

describe("expired_backups", () => {
  const stamps = ["20260101T030000Z", "20260102T030000Z", "20260103T030000Z", "20260104T030000Z", "20260105T030000Z"];
  const expired = (cutoff: string, keepMin: number, list = stamps) => bash(`expired_backups ${cutoff} ${keepMin}`, `${list.join("\n")}\n`).split("\n").filter(Boolean);

  it("lists the backups older than the cutoff", () => {
    expect(expired("20260103T000000Z", 1)).toEqual(["20260101T030000Z", "20260102T030000Z"]);
  });

  it("keeps the newest few even when they are all older than the cutoff: a long run of failed backups must not leave none", () => {
    expect(expired("20270101T000000Z", 3)).toEqual(["20260101T030000Z", "20260102T030000Z"]);
    expect(expired("20270101T000000Z", 10)).toEqual([]);
  });

  it("does not depend on the order it is given", () => {
    expect(expired("20260103T000000Z", 1, [...stamps].reverse())).toEqual(["20260101T030000Z", "20260102T030000Z"]);
  });

  it("deletes nothing when nothing is old", () => {
    expect(expired("20250101T000000Z", 1)).toEqual([]);
    expect(expired("20260103T000000Z", 1, [])).toEqual([]);
  });
});

describe("compare_counts", () => {
  const compare = (before: string[], after: string[], restored: string[]) => {
    const result = bashStatus(`compare_counts "${file("before", before)}" "${file("after", after)}" "${file("restored", restored)}"`);
    return { ok: result.status === 0, report: result.stdout.trim() };
  };

  it("accepts a restored copy with exactly the live counts", () => {
    expect(compare(["public.a 5", "public.b 0"], ["public.a 5", "public.b 0"], ["public.a 5", "public.b 0"]).ok).toBe(true);
  });

  it("accepts a count between the one before the dump and the one after it: the database is live while pg_dump runs", () => {
    expect(compare(["public.audit_log 100"], ["public.audit_log 108"], ["public.audit_log 104"]).ok).toBe(true);
    // a table that shrank in the meantime (a session ended) is in range too
    expect(compare(["public.session 9"], ["public.session 7"], ["public.session 8"]).ok).toBe(true);
  });

  it("rejects a count outside that range, and says which table", () => {
    const result = compare(["public.a 5", "public.b 10"], ["public.a 5", "public.b 10"], ["public.a 5", "public.b 9"]);
    expect(result.ok).toBe(false);
    expect(result.report).toContain("public.b: restored 9, source had 10..10");
  });

  it("rejects a table missing from the restored copy", () => {
    const result = compare(["public.a 5", "public.b 1"], ["public.a 5", "public.b 1"], ["public.a 5"]);
    expect(result.ok).toBe(false);
    expect(result.report).toContain("public.b: missing from the restored copy");
  });

  it("rejects an extra table in the restored copy that the live database never had", () => {
    const result = compare(["public.a 5"], ["public.a 5"], ["public.a 5", "public.ghost 1"]);
    expect(result.ok).toBe(false);
    expect(result.report).toContain("public.ghost");
  });

  it("rejects an EMPTY restored list instead of reading it as the other files: counting failed, so nothing was proven", () => {
    const result = compare(["public.a 5"], ["public.a 5"], []);
    expect(result.ok).toBe(false);
    expect(result.report).toContain("public.a: missing from the restored copy");
  });

  it("rejects a restored count ABOVE everything the live database had", () => {
    const result = compare(["public.a 5"], ["public.a 8"], ["public.a 12"]);
    expect(result.ok).toBe(false);
    expect(result.report).toContain("public.a: restored 12, source had 5..8");
  });

  it("rejects when a live count file is empty, naming the table as not counted — whichever of the two it is", () => {
    for (const [before, after] of [[[], ["public.a 5"]], [["public.a 5"], []], [[], []]] as const) {
      const result = compare([...before], [...after], ["public.a 5"]);
      expect(result.ok).toBe(false);
      expect(result.report).toContain("public.a: not counted before and after the dump");
    }
  });

  it("rejects when nothing was counted anywhere: comparing nothing proves nothing", () => {
    const result = compare([], [], []);
    expect(result.ok).toBe(false);
    expect(result.report).toBe("no tables were counted");
  });
});

describe("diff_counts", () => {
  it("passes for the same counts in any order and fails for any difference", () => {
    const a = file("expected", ["public.a 1", "public.b 2"]);
    expect(bashStatus(`diff_counts "${a}" "${file("same", ["public.b 2", "public.a 1"])}"`).status).toBe(0);
    expect(bashStatus(`diff_counts "${a}" "${file("other", ["public.a 1", "public.b 3"])}"`).status).not.toBe(0);
  });
});

describe("the scripts", () => {
  const scripts = readdirSync(DIR).filter((name) => name.endsWith(".sh"));

  it("are all there", () => {
    expect(scripts.sort()).toEqual(["backup.sh", "entrypoint.sh", "healthcheck.sh", "lib.sh", "restore.sh", "verify.sh"]);
  });

  it.each(scripts)("%s is valid bash", (name) => {
    expect(spawnSync("bash", ["-n", join(DIR, name)], { encoding: "utf8" }).stderr).toBe("");
  });
});
