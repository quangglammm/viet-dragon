"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Notice } from "@/components/admin/notice";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/admin/page-parts";

type TempPasswordDialogProps = {
  email: string;
  password: string;
  /** "created" for a new account, "reset" after an admin reset — only the wording differs. */
  reason: "created" | "reset";
  onClose: () => void;
};

/** Shows a temporary password exactly once. Closing is only possible through the explicit button. */
export function TempPasswordDialog({ email, password, reason, onClose }: Readonly<TempPasswordDialogProps>) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      // Clipboard access can be denied (insecure context, permissions); the text is selectable as a fallback.
      setCopyFailed(true);
    }
  };

  return (
    <Modal
      locked
      onClose={onClose}
      title={reason === "created" ? "Đã tạo tài khoản" : "Đã đặt lại mật khẩu"}
      description={`Mật khẩu tạm thời cho ${email}`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <code className="min-w-0 flex-1 select-all break-all text-center font-mono text-lg font-bold tracking-wider text-slate-900">
            {password}
          </code>
          <button type="button" onClick={() => void copy()} className={BUTTON_SECONDARY}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Đã chép" : "Sao chép"}
          </button>
        </div>

        {copyFailed && <Notice tone="warning">Không thể tự sao chép. Hãy bôi đen và chép mật khẩu ở trên.</Notice>}

        <Notice tone="warning">
          Mật khẩu này <strong>chỉ hiển thị một lần</strong> và sẽ không xem lại được. Hãy gửi cho người dùng qua kênh riêng tư.
          Họ sẽ phải đặt mật khẩu mới ngay khi đăng nhập lần đầu.
        </Notice>

        <button type="button" onClick={onClose} className={`${BUTTON_PRIMARY} w-full`}>
          Tôi đã lưu mật khẩu
        </button>
      </div>
    </Modal>
  );
}
