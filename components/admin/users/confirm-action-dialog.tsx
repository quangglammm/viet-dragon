"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { FailureNotice } from "@/components/admin/failure-notice";
import { Modal } from "@/components/admin/modal";
import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import type { AuthFailure } from "@/lib/auth/error-messages";
import { roleLabel } from "@/lib/permissions";
import { performAction, type ActionResult, type PendingAction } from "./user-actions";

const MAX_REASON_LENGTH = 200;

type ActionCopy = { title: string; body: string; confirm: string; danger: boolean };

function describe(action: PendingAction): ActionCopy {
  const who = `${action.user.name} (${action.user.email})`;
  switch (action.type) {
    case "role":
      return {
        title: "Đổi vai trò",
        body: `Đổi vai trò của ${who} từ “${roleLabel(action.user.role)}” thành “${roleLabel(action.role)}”?${
          action.role === "admin" ? " Quản trị viên có toàn quyền quản lý người dùng và xem nhật ký." : ""
        }`,
        confirm: "Đổi vai trò",
        danger: false,
      };
    case "ban":
      return {
        title: "Vô hiệu hóa tài khoản",
        body: `${who} sẽ bị đăng xuất ngay và không thể đăng nhập cho đến khi được kích hoạt lại. Tài khoản và lịch sử không bị xóa.`,
        confirm: "Vô hiệu hóa",
        danger: true,
      };
    case "reset":
      return {
        title: "Đặt lại mật khẩu",
        body: `Tạo mật khẩu tạm thời mới cho ${who}. Mọi phiên đăng nhập của họ sẽ bị đăng xuất và họ phải đổi mật khẩu khi đăng nhập lại.`,
        confirm: "Đặt lại mật khẩu",
        danger: true,
      };
    case "revoke":
      return {
        title: "Thu hồi phiên đăng nhập",
        body: `${who} sẽ bị đăng xuất khỏi mọi thiết bị, nhưng vẫn có thể đăng nhập lại bằng mật khẩu của mình.`,
        confirm: "Thu hồi phiên",
        danger: true,
      };
  }
}

type ConfirmActionDialogProps = {
  action: PendingAction;
  onClose: () => void;
  /** Called with the successful result; the page decides what to show next. */
  onDone: (action: PendingAction, result: Extract<ActionResult, { ok: true }>) => void;
};

export function ConfirmActionDialog({ action, onClose, onDone }: Readonly<ConfirmActionDialogProps>) {
  const reasonId = useId();
  const copy = describe(action);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<AuthFailure | null>(null);

  const confirm = async () => {
    setBusy(true);
    setFailure(null);
    const result = await performAction(action, reason);
    if (result.ok) {
      onDone(action, result);
      return;
    }
    setFailure(result.failure);
    setBusy(false);
  };

  return (
    <Modal locked={busy} onClose={onClose} title={copy.title}>
      <div className="space-y-4">
        {failure && <FailureNotice failure={failure} />}
        <p className="text-sm leading-relaxed text-slate-700">{copy.body}</p>

        {action.type === "ban" && (
          <div>
            <label htmlFor={reasonId} className="mb-1.5 block text-xs font-bold text-slate-700">
              Lý do (không bắt buộc)
            </label>
            <input
              id={reasonId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={MAX_REASON_LENGTH}
              className={INPUT_CLASS}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={busy} className={BUTTON_SECONDARY}>
            Hủy
          </button>
          <button type="button" onClick={() => void confirm()} disabled={busy} className={copy.danger ? BUTTON_DANGER : BUTTON_PRIMARY}>
            {busy && <Loader2 size={14} className="animate-spin" />} {copy.confirm}
          </button>
        </div>
      </div>
    </Modal>
  );
}
