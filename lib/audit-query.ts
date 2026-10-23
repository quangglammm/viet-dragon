import { and, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { AUDIT_ACTIONS, type AuditAction } from "@/lib/auth/audit";
import { getDb } from "@/lib/db";
import { app_user, auditLog } from "@/lib/db/schema";
import { firstParam } from "@/lib/search-params";

// Read side of the audit trail for /admin/audit. Writes live in lib/auth/audit.ts (append-only).

export const AUDIT_PAGE_SIZE = 50;
const MAX_ACTOR_FILTER_LENGTH = 100;
// Far beyond any real log, but keeps `OFFSET` from taking a user-supplied 10-digit number.
const MAX_PAGE = 100_000;

export type AuditFilters = { action?: AuditAction; actor?: string; page: number };

export type AuditRow = {
  id: number;
  at: Date;
  actorLabel: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  /** Email of the affected account when the entry is about a user; null when unknown or deleted. */
  targetEmail: string | null;
  ip: string | null;
  detail: unknown;
};

export type AuditPage = { rows: AuditRow[]; total: number; page: number; pageCount: number };

function isAuditAction(value: string | undefined): value is AuditAction {
  return AUDIT_ACTIONS.some((action) => action === value);
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1;
}

/** Turns untrusted `searchParams` into filters: unknown actions and junk page numbers are dropped, not errors. */
export function parseAuditFilters(params: Record<string, string | string[] | undefined>): AuditFilters {
  const action = firstParam(params.action);
  const actor = firstParam(params.actor)?.trim().slice(0, MAX_ACTOR_FILTER_LENGTH);
  return {
    action: isAuditAction(action) ? action : undefined,
    actor: actor || undefined,
    page: parsePage(firstParam(params.page)),
  };
}

/** `%`, `_` and `\` are LIKE wildcards; a person typing "a_b" means those characters. */
function escapeLike(value: string): string {
  return value.replaceAll(/[\\%_]/g, "\\$&");
}

function whereClause({ action, actor }: AuditFilters): SQL | undefined {
  const conditions: SQL[] = [];
  if (action) conditions.push(eq(auditLog.action, action));
  if (actor) conditions.push(ilike(auditLog.actorLabel, `%${escapeLike(actor)}%`));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function queryAuditLog(filters: AuditFilters): Promise<AuditPage> {
  const db = getDb();
  const where = whereClause(filters);

  const [{ total }] = await db.select({ total: count() }).from(auditLog).where(where);
  const pageCount = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const rows = await db
    .select({
      id: auditLog.id,
      at: auditLog.at,
      actorLabel: auditLog.actorLabel,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      targetEmail: app_user.email,
      ip: auditLog.ip,
      detail: auditLog.detail,
    })
    .from(auditLog)
    .leftJoin(app_user, and(eq(auditLog.entityType, "user"), eq(auditLog.entityId, app_user.id)))
    .where(where)
    .orderBy(desc(auditLog.at), desc(auditLog.id))
    .limit(AUDIT_PAGE_SIZE)
    .offset((page - 1) * AUDIT_PAGE_SIZE);

  return { rows, total, page, pageCount };
}

export const AUDIT_PATH = "/admin/audit";

/** Link to another page of the same filtered view; page 1 and empty filters are left out of the URL. */
export function auditPageHref({ action, actor }: AuditFilters, page: number): string {
  const query = new URLSearchParams();
  if (action) query.set("action", action);
  if (actor) query.set("actor", actor);
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  return search ? `${AUDIT_PATH}?${search}` : AUDIT_PATH;
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** "from: editor · to: admin" — a compact, key-ordered view of an entry's detail object. */
export function formatAuditDetail(detail: unknown): string {
  if (typeof detail !== "object" || detail === null || Array.isArray(detail)) return "";
  return Object.entries(detail)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}: ${formatDetailValue(value)}`)
    .join(" · ");
}
