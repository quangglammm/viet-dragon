import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-access";
import { ac, roles } from "@/lib/permissions";

// Browser-side Better Auth client for the admin UI. It talks to /api/auth/* on the same origin, so
// every call goes through the HTTP surface that carries the rate limit, origin check and our hooks.
export const authClient = createAuthClient({ plugins: [adminClient({ ac, roles })] });

/**
 * For SESSION_NOT_FRESH: end this session and come back to the page just left after signing in again.
 * A full navigation (not router.replace) so no cached page from the old session survives.
 */
export async function reauthenticate(): Promise<void> {
  const here = `${window.location.pathname}${window.location.search}`;
  await authClient.signOut().catch(() => undefined);
  window.location.assign(`${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(here)}&reason=fresh`);
}
