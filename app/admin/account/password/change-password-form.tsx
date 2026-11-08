"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { FailureNotice } from "@/components/admin/failure-notice";
import { Notice } from "@/components/admin/notice";
import { PasswordField } from "@/components/admin/password-field";
import { ACCOUNT_PATH, ADMIN_LOGIN_PATH } from "@/lib/admin-access";
import { authClient } from "@/lib/auth-client";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, PASSWORD_POLICY_MESSAGE } from "@/lib/auth/constants";
import { describeAuthError, type AuthFailure } from "@/lib/auth/error-messages";

type ChangePasswordFormProps = {
  /** First sign-in or after an admin reset: the console is closed until this succeeds. */
  forced: boolean;
  /** Lets the browser's password manager file the new password under the right account. */
  email: string;
};

function validate(current: string, next: string, confirm: string): string | null {
  if (next.length < MIN_PASSWORD_LENGTH || next.length > MAX_PASSWORD_LENGTH) return PASSWORD_POLICY_MESSAGE;
  if (next !== confirm) return "Mật khẩu nhập lại không khớp.";
  if (next === current) return "Mật khẩu mới phải khác mật khẩu hiện tại.";
  return null;
}

export function ChangePasswordForm({ forced, email }: Readonly<ChangePasswordFormProps>) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<AuthFailure | null>(null);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = validate(current, next, confirm);
    if (problem) {
      setFailure({ message: problem, needsReauth: false });
      return;
    }

    setFailure(null);
    setLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: revokeOthers,
      });
      if (error) {
        setFailure(describeAuthError(error));
        setLoading(false);
        return;
      }
      router.replace(ACCOUNT_PATH);
    } catch {
      setFailure({ message: "Không thể kết nối đến máy chủ", needsReauth: false });
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut().catch(() => undefined);
    router.replace(ADMIN_LOGIN_PATH);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="username" value={email} autoComplete="username" readOnly hidden />
      {forced ? (
        <Notice tone="warning">
          Đây là lần đăng nhập đầu tiên hoặc mật khẩu của bạn vừa được quản trị viên đặt lại. Hãy đặt mật khẩu mới để tiếp tục.
        </Notice>
      ) : (
        <p className="text-xs text-zinc-300">Mật khẩu mới cần từ {MIN_PASSWORD_LENGTH} ký tự trở lên.</p>
      )}

      {failure && <FailureNotice failure={failure} />}

      <PasswordField label="Mật khẩu hiện tại" value={current} onChange={setCurrent} autoComplete="current-password" autoFocus />
      <PasswordField label="Mật khẩu mới" value={next} onChange={setNext} autoComplete="new-password" />
      <PasswordField label="Nhập lại mật khẩu mới" value={confirm} onChange={setConfirm} autoComplete="new-password" />

      <label className="flex items-start gap-2.5 text-xs text-zinc-300">
        <input
          type="checkbox"
          checked={revokeOthers}
          onChange={(event) => setRevokeOthers(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brand-primary"
        />
        Đăng xuất khỏi các thiết bị khác sau khi đổi mật khẩu
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary via-purple-600 to-pink-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-brand-primary/35 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <KeyRound size={15} /> Đổi Mật Khẩu
          </>
        )}
      </button>

      {forced && (
        <button type="button" onClick={() => void handleSignOut()} className="w-full text-center text-xs text-zinc-400 transition-colors hover:text-white cursor-pointer">
          Đăng xuất
        </button>
      )}
    </form>
  );
}
