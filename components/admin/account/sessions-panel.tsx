"use client";

import { useEffect, useState } from "react";
import { Laptop, Loader2, LogOut } from "lucide-react";
import { AdminCard, BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { Notice } from "@/components/admin/notice";
import { authClient } from "@/lib/auth-client";
import { describeAuthError, type AuthErrorLike, type AuthFailure } from "@/lib/auth/error-messages";
import { formatAdminDateTime } from "@/lib/format-date";
import { describeUserAgent } from "@/lib/user-agent";

type SessionRow = {
  id: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  expiresAt: Date;
};

/** This device first, then the most recently signed-in. */
function sortSessions(rows: SessionRow[], currentToken: string | undefined): SessionRow[] {
  return [...rows].sort((a, b) => {
    if (a.token === currentToken) return -1;
    if (b.token === currentToken) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function SessionsPanel() {
  const { data: current } = authClient.useSession();
  const currentToken = current?.session.token;

  const [sessions, setSessions] = useState<SessionRow[] | null>(null); // null while the first load runs
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // a session token, or "others"
  const [reloads, setReloads] = useState(0); // bumped after every change to fetch the list again

  useEffect(() => {
    let cancelled = false;
    void authClient.listSessions().then(({ data, error }) => {
      if (cancelled) return;
      if (error) setFailure(describeAuthError(error));
      else setSessions(data);
      setBusy(null);
    });
    return () => {
      cancelled = true;
    };
  }, [reloads]);

  const run = async (key: string, call: () => Promise<{ error: AuthErrorLike }>) => {
    setBusy(key);
    setFailure(null);
    const { error } = await call();
    if (error) setFailure(describeAuthError(error));
    setReloads((count) => count + 1);
  };

  const rows = sessions ? sortSessions(sessions, currentToken) : null;
  const hasOthers = (rows?.length ?? 0) > 1;

  return (
    <AdminCard
      title="Phiên đăng nhập đang hoạt động"
      description="Các thiết bị đang đăng nhập bằng tài khoản của bạn. Thu hồi những phiên bạn không nhận ra."
      action={
        hasOthers && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void run("others", () => authClient.revokeOtherSessions())}
            className={BUTTON_SECONDARY}
          >
            {busy === "others" ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />} Đăng xuất các thiết bị khác
          </button>
        )
      }
    >
      {failure && <Notice tone="error" className="mb-4">{failure.message}</Notice>}

      {rows === null ? (
        <div className="flex items-center gap-2 py-6 text-xs font-semibold text-slate-500">
          <Loader2 size={14} className="animate-spin" /> Đang tải danh sách phiên...
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((row) => {
            const isCurrent = row.token === currentToken;
            return (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Laptop size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                      {describeUserAgent(row.userAgent)}
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          Thiết bị này
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {row.ipAddress ?? "Không rõ IP"} · đăng nhập {formatAdminDateTime(row.createdAt)} · hết hạn {formatAdminDateTime(row.expiresAt)}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void run(row.token, () => authClient.revokeSession({ token: row.token }))}
                    className={BUTTON_SECONDARY}
                  >
                    {busy === row.token && <Loader2 size={13} className="animate-spin" />} Thu hồi
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
