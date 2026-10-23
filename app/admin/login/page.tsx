import { redirect } from "next/navigation";
import { AuthCardShell } from "@/components/admin/auth-card-shell";
import { ACCOUNT_PATH, PASSWORD_CHANGE_PATH, safeAdminNextPath } from "@/lib/admin-access";
import { getSessionUser } from "@/lib/dal";
import { firstParam } from "@/lib/search-params";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Why the visitor is here, from `?reason=` — only these values are honoured.
const NOTICES: Record<string, string> = {
  fresh: "Để bảo mật, vui lòng đăng nhập lại để tiếp tục thao tác vừa rồi.",
};

export default async function AdminLoginPage({ searchParams }: Readonly<LoginPageProps>) {
  const params = await searchParams;
  const next = safeAdminNextPath(firstParam(params.next));

  // The real session, not just the cookie (the proxy only sees that): a signed-in visitor skips the form,
  // while a stale cookie falls through to it.
  const user = await getSessionUser();
  if (user) redirect(user.mustChangePassword ? PASSWORD_CHANGE_PATH : (next ?? ACCOUNT_PATH));

  const reason = firstParam(params.reason);
  const notice = reason && Object.hasOwn(NOTICES, reason) ? NOTICES[reason] : undefined;

  return (
    <AuthCardShell heading="Cổng Đăng Nhập Quản Trị">
      <LoginForm next={next} notice={notice} />
    </AuthCardShell>
  );
}
