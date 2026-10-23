"use client";

import { useId, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { FailureNotice } from "@/components/admin/failure-notice";
import { Modal } from "@/components/admin/modal";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import type { AuthFailure } from "@/lib/auth/error-messages";
import { DEFAULT_ROLE, isRole, ROLE_LABELS, ROLE_NAMES, type Role } from "@/lib/permissions";
import { createUser } from "./user-actions";

const MAX_NAME_LENGTH = 100;

type CreateUserDialogProps = {
  onClose: () => void;
  /** The account exists; hand its one-time password to the page. */
  onCreated: (email: string, tempPassword: string) => void;
};

export function CreateUserDialog({ onClose, onCreated }: Readonly<CreateUserDialogProps>) {
  const ids = { name: useId(), email: useId(), role: useId() };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<AuthFailure | null>(null);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFailure(null);
    const trimmedEmail = email.trim();
    const result = await createUser({ name: name.trim(), email: trimmedEmail, role });
    if (result.ok && result.tempPassword) {
      onCreated(trimmedEmail, result.tempPassword);
      return;
    }
    if (!result.ok) setFailure(result.failure);
    setBusy(false);
  };

  return (
    <Modal
      locked={busy}
      onClose={onClose}
      title="Tạo tài khoản mới"
      description="Hệ thống tạo mật khẩu tạm thời; người dùng phải đổi khi đăng nhập lần đầu."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {failure && <FailureNotice failure={failure} />}

        <div>
          <label htmlFor={ids.name} className="mb-1.5 block text-xs font-bold text-slate-700">
            Họ tên
          </label>
          <input
            id={ids.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="off"
            autoFocus
            required
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor={ids.email} className="mb-1.5 block text-xs font-bold text-slate-700">
            Email đăng nhập
          </label>
          <input
            id={ids.email}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
            required
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor={ids.role} className="mb-1.5 block text-xs font-bold text-slate-700">
            Vai trò
          </label>
          <select
            id={ids.role}
            value={role}
            onChange={(event) => isRole(event.target.value) && setRole(event.target.value)}
            className={INPUT_CLASS}
          >
            {ROLE_NAMES.map((roleName) => (
              <option key={roleName} value={roleName}>
                {ROLE_LABELS[roleName]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={busy} className={BUTTON_SECONDARY}>
            Hủy
          </button>
          <button type="submit" disabled={busy} className={BUTTON_PRIMARY}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Tạo tài khoản
          </button>
        </div>
      </form>
    </Modal>
  );
}
