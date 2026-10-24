import { getDb } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { getLogger } from "@/lib/logger";

const log = getLogger("audit");

const MAX_USER_AGENT_LENGTH = 512;

export const AUDIT_ACTIONS = [
  "auth.sign_in",
  "auth.sign_in_failed",
  "auth.account_locked",
  "auth.sign_out",
  "auth.password_changed",
  "user.created",
  "user.role_changed",
  "user.banned",
  "user.unbanned",
  "user.password_reset",
  "user.sessions_revoked",
  "content.seeded",
  "content.published",
  "content.restored",
  "content.discarded",
  "content.deleted",
  "content.alias_released",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/** Vietnamese label per action — exhaustive, so adding an action without a label fails to compile. */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  "auth.sign_in": "Đăng nhập",
  "auth.sign_in_failed": "Đăng nhập sai",
  "auth.account_locked": "Khóa tài khoản tạm thời",
  "auth.sign_out": "Đăng xuất",
  "auth.password_changed": "Đổi mật khẩu",
  "user.created": "Tạo tài khoản",
  "user.role_changed": "Đổi vai trò",
  "user.banned": "Vô hiệu hóa tài khoản",
  "user.unbanned": "Kích hoạt lại tài khoản",
  "user.password_reset": "Đặt lại mật khẩu",
  "user.sessions_revoked": "Thu hồi phiên đăng nhập",
  "content.seeded": "Nhập dữ liệu gốc của website",
  "content.published": "Xuất bản nội dung",
  "content.restored": "Khôi phục phiên bản nội dung",
  "content.discarded": "Hủy bản nháp",
  "content.deleted": "Xóa nội dung",
  "content.alias_released": "Gỡ đường dẫn cũ",
};

/** Who acted when there is no signed-in user: the CLI (`pnpm admin:create`) or an unauthenticated visitor. */
export const CLI_ACTOR = "cli";

export type AuditEntry = {
  /** Null for failed sign-ins and the CLI. */
  actorId?: string | null;
  /** Email at the time, the attempted address for a failed sign-in, or CLI_ACTOR. Kept even if the user changes. */
  actorLabel: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  ip?: string | null;
  userAgent?: string | null;
  /** Never put passwords, tokens or other secrets here. */
  detail?: Record<string, unknown>;
};

/** `x-real-ip` is the only trustworthy client address (Caddy overwrites it); absent in plain dev and server-side calls. */
export function requestMeta(headers: Headers | undefined | null): { ip: string | null; userAgent: string | null } {
  const ip = headers?.get("x-real-ip")?.trim() || null;
  const userAgent = headers?.get("user-agent")?.slice(0, MAX_USER_AGENT_LENGTH) || null;
  return { ip, userAgent };
}

/**
 * Appends one audit row. Never throws: it runs after the audited action already succeeded, so a
 * failed write is logged loudly instead of turning a completed action into an error for the user.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await getDb()
      .insert(auditLog)
      .values({
        actorId: entry.actorId ?? null,
        actorLabel: entry.actorLabel,
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        detail: entry.detail ?? null,
      });
  } catch (error) {
    log.error({ err: error, action: entry.action }, "failed to write audit entry");
  }
}
