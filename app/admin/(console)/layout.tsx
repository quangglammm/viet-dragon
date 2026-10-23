import { AdminShell } from "@/components/admin/admin-shell";
import { requireUser } from "@/lib/dal";
import { getSiteEnv } from "@/lib/env";

// Everything in the console needs a signed-in user who has already replaced their temporary password.
// A layout does not re-render on client-side navigation, so this is the first gate, not the only one:
// every page below calls requireUser({ permission }) itself, and the legacy editors' data goes through
// /api/admin/*, which authenticates each request.
export default async function ConsoleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  // The pre-Phase-3 editors write to the source tree and are Caddy-blocked in production: don't link to them there.
  const showLegacyEditors = getSiteEnv().NODE_ENV !== "production";

  return (
    <AdminShell user={user} showLegacyEditors={showLegacyEditors}>
      {children}
    </AdminShell>
  );
}
