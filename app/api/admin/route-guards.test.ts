import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// "Every /api/admin/* handler authenticates, regardless of what the UI hides." This reads the route
// files themselves, so a handler added in Phase 3 without the guard — or with one placed after the
// body is parsed — fails here instead of shipping.

const ADMIN_API_DIR = __dirname;
const HANDLER = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(([^)]*)\)\s*\{/g;
const GUARD_FIRST = /^\s*const\s+auth\s*=\s*await\s+requireApiUser\(\s*request\b/;

function routeFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return routeFiles(path);
    return entry.name === "route.ts" ? [path] : [];
  });
}

const files = routeFiles(ADMIN_API_DIR);

describe("/api/admin route guards", () => {
  it("finds the admin routes (so this test cannot pass by scanning nothing)", () => {
    expect(files.length).toBeGreaterThanOrEqual(5);
  });

  it.each(files.map((file) => [file.slice(ADMIN_API_DIR.length + 1), file]))("%s authenticates every handler first", (_name, file) => {
    const source = readFileSync(file, "utf8");
    const handlers = [...source.matchAll(HANDLER)];
    expect(handlers.length).toBeGreaterThan(0);

    for (const handler of handlers) {
      const [signature, method, params] = handler;
      // The guard needs the request, so a handler cannot be declared without it.
      expect(params, `${method} must take (request: Request)`).toMatch(/\brequest\b/);
      const body = source.slice((handler.index ?? 0) + signature.length);
      expect(body, `${method} must call requireApiUser(request, …) as its first statement`).toMatch(GUARD_FIRST);
      expect(body, `${method} must return auth.response when the guard fails`).toMatch(/if\s*\(\s*!auth\.ok\s*\)\s*return\s+auth\.response/);
    }
  });

  it("no route imports the removed shared-password session", () => {
    for (const file of files) expect(readFileSync(file, "utf8")).not.toMatch(/admin-auth|getAdminSession/);
  });
});
