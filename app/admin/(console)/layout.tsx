import { AdminShell } from "@/components/admin/admin-shell";
import { requireUser } from "@/lib/dal";

// Everything in the console needs a signed-in user who has already replaced their temporary password.
// A layout does not re-render on client-side navigation, so this is the first gate, not the only one:
// every page below calls requireUser({ permission }) itself, and the editors' data goes through
// /api/admin/*, which authenticates each request.
export default async function ConsoleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <AdminShell user={user}>
      {children}
    </AdminShell>
  );
}
