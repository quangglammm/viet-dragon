import { KeyRound, LogOut, ShieldOff, UserCheck } from "lucide-react";
import { BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import { formatAdminDate } from "@/lib/format-date";
import { isRole, ROLE_LABELS, ROLE_NAMES, roleLabel, type Role } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { UserRow } from "./types";
import type { PendingAction } from "./user-actions";

type StatusBadge = { label: string; className: string };

function statusOf(user: UserRow): StatusBadge {
  if (user.banned) return { label: "Đã vô hiệu hóa", className: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" };
  if (user.mustChangePassword) {
    return { label: "Chờ đổi mật khẩu", className: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300" };
  }
  return { label: "Đang hoạt động", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" };
}

type UserCardProps = {
  user: UserRow;
  isSelf: boolean;
  busy: boolean;
  onAction: (action: PendingAction) => void;
  onUnban: (user: UserRow) => void;
};

export function UserCard({ user, isSelf, busy, onAction, onUnban }: Readonly<UserCardProps>) {
  const status = statusOf(user);

  return (
    <li className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-900">
            {user.name}
            {isSelf && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-brand-primary/25 dark:text-purple-300">Bạn</span>}
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", status.className)}>{status.label}</span>
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {user.email} · tạo ngày {formatAdminDate(user.createdAt)}
          </p>
          {user.banned && user.banReason && <p className="mt-1 text-xs text-rose-600">Lý do: {user.banReason}</p>}
        </div>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{roleLabel(user.role)}</span>
      </div>

      {isSelf ? (
        <p className="mt-3 text-xs text-slate-500">Đổi mật khẩu và quản lý phiên của bạn tại trang “Tài Khoản Của Tôi”.</p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
            Vai trò
            <select
              value={isRole(user.role) ? user.role : ""}
              disabled={busy}
              onChange={(event) => {
                const role = event.target.value;
                if (isRole(role) && role !== user.role) onAction({ type: "role", user, role });
              }}
              className={cn(INPUT_CLASS, "w-auto py-2")}
            >
              {!isRole(user.role) && <option value="">{roleLabel(user.role)}</option>}
              {ROLE_NAMES.map((name: Role) => (
                <option key={name} value={name}>
                  {ROLE_LABELS[name]}
                </option>
              ))}
            </select>
          </label>

          {!user.banned && (
            <>
              <button type="button" disabled={busy} onClick={() => onAction({ type: "reset", user })} className={BUTTON_SECONDARY}>
                <KeyRound size={13} /> Đặt lại mật khẩu
              </button>
              <button type="button" disabled={busy} onClick={() => onAction({ type: "revoke", user })} className={BUTTON_SECONDARY}>
                <LogOut size={13} /> Thu hồi phiên
              </button>
            </>
          )}

          {user.banned ? (
            <button type="button" disabled={busy} onClick={() => onUnban(user)} className={BUTTON_SECONDARY}>
              <UserCheck size={13} /> Kích hoạt lại
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction({ type: "ban", user })}
              className={cn(BUTTON_SECONDARY, "text-rose-600 hover:bg-rose-50")}
            >
              <ShieldOff size={13} /> Vô hiệu hóa
            </button>
          )}
        </div>
      )}
    </li>
  );
}
