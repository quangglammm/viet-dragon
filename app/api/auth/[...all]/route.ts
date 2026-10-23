import { getAuth } from "@/lib/auth";

// Better Auth's HTTP surface (/api/auth/*): sign-in, sign-out, session, password change and the
// admin plugin's user management. Sign-in must come through here, not through `auth.api.*` calls —
// only HTTP requests are rate limited.
function handle(request: Request): Promise<Response> {
  return getAuth().handler(request);
}

export { handle as GET, handle as POST };
