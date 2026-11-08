"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AtSign } from "lucide-react";
import { Notice } from "@/components/admin/notice";
import { PasswordField } from "@/components/admin/password-field";
import { ACCOUNT_PATH } from "@/lib/admin-access";
import { authClient } from "@/lib/auth-client";
import { describeAuthError, parseRetryAfter } from "@/lib/auth/error-messages";

type LoginFormProps = {
  /** Already sanitised by the server (safeAdminNextPath); null means "go to the account page". */
  next: string | null;
  notice?: string;
};

export function LoginForm({ next, notice }: Readonly<LoginFormProps>) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    // Only the raw response carries Retry-After; a holder object because TS does not track closure writes.
    const retry: { afterSeconds: number | null } = { afterSeconds: null };
    try {
      const { error: failure } = await authClient.signIn.email(
        { email: email.trim(), password },
        {
          onError: (context) => {
            retry.afterSeconds = parseRetryAfter(context.response.headers);
          },
        },
      );
      if (failure) {
        setError(describeAuthError(failure, retry.afterSeconds).message);
        setLoading(false);
        return;
      }
      // The server decides the rest: a forced password change redirects from the console layout.
      router.replace(next ?? ACCOUNT_PATH);
    } catch {
      setError("Không thể kết nối đến máy chủ");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {notice && <Notice tone="info">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-xs font-bold text-zinc-200">
          Email
        </label>
        <div className="relative flex items-center">
          <AtSign size={16} className="absolute left-3.5 text-zinc-400" aria-hidden />
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ten@vietdragon.vn"
            autoComplete="username"
            autoFocus
            required
            className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-zinc-500 transition-all focus:border-brand-primary focus:bg-white/10 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>
      </div>

      <PasswordField label="Mật khẩu" value={password} onChange={setPassword} autoComplete="current-password" />

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary via-purple-600 to-pink-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-brand-primary/35 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            Đăng Nhập <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}
