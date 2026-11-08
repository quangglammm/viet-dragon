import { AuthCardShell } from "@/components/admin/auth-card-shell";
import { ACCOUNT_PATH } from "@/lib/admin-access";
import { requireUser } from "@/lib/dal";
import { ChangePasswordForm } from "./change-password-form";

// Outside the (console) group on purpose: while `mustChangePassword` is set the console layout redirects
// here, so this page must not sit under it. It is the only page that lets a not-yet-changed user in.
export default async function ChangePasswordPage() {
  const user = await requireUser({ allowPasswordChange: true });

  return (
    <AuthCardShell
      heading="Đổi Mật Khẩu"
      backHref={user.mustChangePassword ? "/" : ACCOUNT_PATH}
      backLabel={user.mustChangePassword ? "← Quay lại website Viet Dragon" : "← Quay lại trang tài khoản"}
    >
      <ChangePasswordForm forced={user.mustChangePassword} email={user.email} />
    </AuthCardShell>
  );
}
