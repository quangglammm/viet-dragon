import { randomBytes } from "node:crypto";
import { getAuth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// Shared helpers for the integration tests. Every call gets its own email and client IP so tests never
// trip each other's lockouts or rate limits — the audit_log table is append-only, so tests cannot clean up.

export const ORIGIN = "http://localhost:3000";
export const PASSWORD = "integration test password 1";

// Test files run in separate workers that share ONE database, so a bare counter would hand the same IP
// to two files and trip the rate limit the first one already used up. A per-process random salt keeps
// every generated email and address distinct across files.
const SALT = randomBytes(3);
let counter = 0;

export function uniqueEmail(label: string): string {
  counter += 1;
  return `${label}-${counter}-${SALT.toString("hex")}@example.test`;
}

export function uniqueIp(): string {
  counter += 1;
  return `10.${SALT[0]}.${(SALT[1] + (counter >> 8)) & 255}.${counter & 255}`;
}

export async function createUser(
  email: string,
  role: "admin" | "editor",
  { password = PASSWORD, mustChangePassword = false }: { password?: string; mustChangePassword?: boolean } = {},
): Promise<string> {
  const { user } = await getAuth().api.createUser({
    body: { email, password, name: email.split("@")[0], role, data: { mustChangePassword } },
  });
  return user.id;
}

type RequestInit = {
  method?: "GET" | "POST";
  body?: unknown;
  cookie?: string;
  /** `null` sends no Origin header at all. */
  origin?: string | null;
  ip?: string;
};

/** A request to Better Auth's HTTP surface, as the browser (and Caddy's X-Real-IP) would make it. */
export function authRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers({ "x-real-ip": init.ip ?? uniqueIp(), "user-agent": "vitest-integration" });
  if (init.origin !== null) headers.set("origin", init.origin ?? ORIGIN);
  if (init.cookie) headers.set("cookie", init.cookie);
  const hasBody = init.body !== undefined;
  if (hasBody) headers.set("content-type", "application/json");
  return getAuth().handler(
    new Request(`${ORIGIN}/api/auth${path}`, {
      method: init.method ?? (hasBody ? "POST" : "GET"),
      headers,
      body: hasBody ? JSON.stringify(init.body) : undefined,
    }),
  );
}

export function signIn(email: string, password: string, ip?: string, origin?: string): Promise<Response> {
  return authRequest("/sign-in/email", { body: { email, password }, ip, origin });
}

/** `name=value; name=value` from a response's Set-Cookie headers, ready for a Cookie header. */
export function cookieOf(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

export async function login(email: string, password = PASSWORD): Promise<string> {
  const response = await signIn(email, password);
  if (response.status !== 200) throw new Error(`login(${email}) failed with ${response.status}`);
  return cookieOf(response);
}

export async function body(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

/** Makes the user's sessions look `seconds` older, to cross the freshness boundary without waiting. */
export async function ageSessions(email: string, seconds: number): Promise<void> {
  await getPool().query(
    `update session set created_at = created_at - make_interval(secs => $2)
       where user_id = (select id from app_user where email = $1)`,
    [email, seconds],
  );
}

export async function userRow(email: string): Promise<Record<string, unknown>> {
  const { rows } = await getPool().query(`select * from app_user where email = $1`, [email]);
  return rows[0];
}

type AuditFilter = { actorLabel?: string; action?: string; entityId?: string };

export async function auditRows(filter: AuditFilter): Promise<Array<Record<string, unknown>>> {
  const { rows } = await getPool().query(
    `select * from audit_log
      where ($1::text is null or actor_label = $1)
        and ($2::text is null or action = $2)
        and ($3::text is null or entity_id = $3)
      order by id`,
    [filter.actorLabel ?? null, filter.action ?? null, filter.entityId ?? null],
  );
  return rows;
}

export async function lockedUntil(emailKey: string): Promise<Date | null> {
  const { rows } = await getPool().query(`select locked_until from login_attempt where email_key = $1`, [emailKey]);
  return rows[0]?.locked_until ?? null;
}

export async function expireLock(emailKey: string): Promise<void> {
  await getPool().query(`update login_attempt set locked_until = now() - interval '1 second' where email_key = $1`, [emailKey]);
}
