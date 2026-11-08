import { authClient } from "@/lib/auth-client";
import { describeAuthError, type AuthErrorLike, type AuthFailure } from "@/lib/auth/error-messages";
import { generateTempPassword } from "@/lib/auth/temp-password";
import type { Role } from "@/lib/permissions";
import type { UserRow } from "./types";

// The calls the users page makes, one per button. Each goes through the HTTP auth endpoints (so the
// rate limit, origin check, freshness/self-action hooks and the audit trail all apply) and comes back
// as a plain result the UI can render. Passwords are generated here, in the browser, and returned once.

export type ActionResult = { ok: true; tempPassword?: string } | { ok: false; failure: AuthFailure };

/** An action that needs the admin to confirm first. */
export type PendingAction =
  | { type: "role"; user: UserRow; role: Role }
  | { type: "ban"; user: UserRow }
  | { type: "reset"; user: UserRow }
  | { type: "revoke"; user: UserRow };

const CONNECTION_FAILURE: AuthFailure = { message: "Không thể kết nối đến máy chủ", needsReauth: false };

async function settle(call: Promise<{ error: AuthErrorLike }>, tempPassword?: string): Promise<ActionResult> {
  try {
    const { error } = await call;
    return error ? { ok: false, failure: describeAuthError(error) } : { ok: true, tempPassword };
  } catch {
    return { ok: false, failure: CONNECTION_FAILURE };
  }
}

export function performAction(action: PendingAction, banReason: string): Promise<ActionResult> {
  const userId = action.user.id;
  switch (action.type) {
    case "role":
      return settle(authClient.admin.setRole({ userId, role: action.role }));
    case "ban":
      return settle(authClient.admin.banUser({ userId, banReason: banReason.trim() || undefined }));
    case "reset": {
      const newPassword = generateTempPassword();
      return settle(authClient.admin.setUserPassword({ userId, newPassword }), newPassword);
    }
    case "revoke":
      return settle(authClient.admin.revokeUserSessions({ userId }));
  }
}

export function unbanUser(user: UserRow): Promise<ActionResult> {
  return settle(authClient.admin.unbanUser({ userId: user.id }));
}

export type NewUser = { name: string; email: string; role: Role };

/** The account is created with `mustChangePassword`, so the temporary password only has to last until the first sign-in. */
export function createUser({ name, email, role }: NewUser): Promise<ActionResult> {
  const password = generateTempPassword();
  return settle(authClient.admin.createUser({ name, email, password, role }), password);
}
