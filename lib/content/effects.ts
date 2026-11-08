import { revalidateTag } from "next/cache";
import { recordAudit, requestMeta, type AuditAction } from "@/lib/auth/audit";
import type { SessionUser } from "@/lib/dal";
import { getLogger } from "@/lib/logger";
import { cacheTags, type Affected } from "./cache-tags";
import type { EntityRef } from "./compose";

// What happens AFTER a content change has committed: the public site is told, the audit trail is written. Neither may turn a
// change that already happened into an error for the editor, so a failure here is logged, not thrown.

const log = getLogger("content-api");

export function revalidateContent(affected: readonly Affected[]): void {
  try {
    for (const tag of cacheTags(affected)) revalidateTag(tag, { expire: 0 });
  } catch (error) {
    log.error({ err: error }, "failed to revalidate content tags");
  }
}

export async function auditContent(request: Request, user: SessionUser, action: AuditAction, ref: EntityRef, detail?: Record<string, unknown>): Promise<void> {
  await recordAudit({ actorId: user.id, actorLabel: user.email, action, entityType: ref.type, entityId: ref.id, ...requestMeta(request.headers), detail });
}
