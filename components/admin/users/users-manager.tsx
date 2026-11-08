"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { FailureNotice } from "@/components/admin/failure-notice";
import { Notice } from "@/components/admin/notice";
import { BUTTON_PRIMARY } from "@/components/admin/page-parts";
import type { AuthFailure } from "@/lib/auth/error-messages";
import { ConfirmActionDialog } from "./confirm-action-dialog";
import { CreateUserDialog } from "./create-user-dialog";
import { TempPasswordDialog } from "./temp-password-dialog";
import type { UserRow } from "./types";
import { UserCard } from "./user-card";
import { unbanUser, type ActionResult, type PendingAction } from "./user-actions";

type Dialog =
  | { kind: "create" }
  | { kind: "confirm"; action: PendingAction }
  | { kind: "password"; email: string; password: string; reason: "created" | "reset" };

type UsersManagerProps = {
  users: UserRow[];
  currentUserId: string;
  /** More accounts exist than the page loaded. */
  truncated: boolean;
};

const DONE_MESSAGES: Record<PendingAction["type"], string> = {
  role: "Đã đổi vai trò.",
  ban: "Đã vô hiệu hóa tài khoản.",
  reset: "Đã đặt lại mật khẩu.",
  revoke: "Đã thu hồi các phiên đăng nhập.",
};

export function UsersManager({ users, currentUserId, truncated }: Readonly<UsersManagerProps>) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [busy, setBusy] = useState(false); // a direct (unconfirmed) action is running

  const closeDialog = () => setDialog(null);

  const handleCreated = (email: string, password: string) => {
    setDialog({ kind: "password", email, password, reason: "created" });
    setSuccess(null);
    router.refresh();
  };

  const handleConfirmed = (action: PendingAction, result: Extract<ActionResult, { ok: true }>) => {
    if (action.type === "reset" && result.tempPassword) {
      setDialog({ kind: "password", email: action.user.email, password: result.tempPassword, reason: "reset" });
      setSuccess(null);
    } else {
      setDialog(null);
      setSuccess(DONE_MESSAGES[action.type]);
    }
    router.refresh();
  };

  const handleUnban = async (user: UserRow) => {
    setBusy(true);
    setSuccess(null);
    setFailure(null);
    const result = await unbanUser(user);
    if (result.ok) {
      setSuccess(`Đã kích hoạt lại tài khoản ${user.email}.`);
      router.refresh();
    } else {
      setFailure(result.failure);
    }
    setBusy(false);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500">{users.length} tài khoản</p>
        <button type="button" onClick={() => setDialog({ kind: "create" })} className={BUTTON_PRIMARY}>
          <UserPlus size={14} /> Tạo tài khoản
        </button>
      </div>

      <div className="mb-6 space-y-3 empty:hidden">
        {success && <Notice tone="success">{success}</Notice>}
        {failure && <FailureNotice failure={failure} />}
        {truncated && <Notice tone="warning">Danh sách chỉ hiển thị một phần tài khoản.</Notice>}
      </div>

      <ul className="space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isSelf={user.id === currentUserId}
            busy={busy}
            onAction={(action) => {
              setSuccess(null);
              setFailure(null);
              setDialog({ kind: "confirm", action });
            }}
            onUnban={(target) => void handleUnban(target)}
          />
        ))}
      </ul>

      {dialog?.kind === "create" && <CreateUserDialog onClose={closeDialog} onCreated={handleCreated} />}
      {dialog?.kind === "confirm" && <ConfirmActionDialog action={dialog.action} onClose={closeDialog} onDone={handleConfirmed} />}
      {dialog?.kind === "password" && (
        <TempPasswordDialog email={dialog.email} password={dialog.password} reason={dialog.reason} onClose={closeDialog} />
      )}
    </>
  );
}
