import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { auditPageHref, formatAuditDetail, type AuditFilters, type AuditPage, type AuditRow } from "@/lib/audit-query";
import { AUDIT_ACTIONS, AUDIT_ACTION_LABELS, type AuditAction } from "@/lib/auth/audit";
import { formatAdminDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

const DANGER_ACTIONS: ReadonlySet<string> = new Set(["auth.sign_in_failed", "auth.account_locked"]);
const SENSITIVE_ACTIONS: ReadonlySet<string> = new Set(["user.banned", "user.password_reset", "user.role_changed", "user.sessions_revoked"]);

function isKnownAction(action: string): action is AuditAction {
  return AUDIT_ACTIONS.some((known) => known === action);
}

function actionTone(action: string): string {
  if (DANGER_ACTIONS.has(action)) return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
  if (SENSITIVE_ACTIONS.has(action)) return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300";
  return "bg-slate-100 text-slate-700";
}

function targetOf(row: AuditRow): string {
  if (row.targetEmail) return row.targetEmail;
  if (!row.entityId) return "—";
  return `${row.entityType ?? "?"}:${row.entityId.slice(0, 8)}…`;
}

function AuditTableRow({ row }: Readonly<{ row: AuditRow }>) {
  const detail = formatAuditDetail(row.detail);
  return (
    <tr className="align-top">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatAdminDateTime(row.at)}</td>
      <td className="px-4 py-3 text-xs font-bold text-slate-900">{row.actorLabel}</td>
      <td className="px-4 py-3">
        <span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold", actionTone(row.action))}>
          {isKnownAction(row.action) ? AUDIT_ACTION_LABELS[row.action] : row.action}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-600">{targetOf(row)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{row.ip ?? "—"}</td>
      <td className="px-4 py-3 text-xs text-slate-500">{detail || "—"}</td>
    </tr>
  );
}

function Pagination({ filters, page, pageCount }: Readonly<{ filters: AuditFilters; page: number; pageCount: number }>) {
  return (
    <nav aria-label="Phân trang" className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">
        Trang {page} / {pageCount}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={auditPageHref(filters, page - 1)} className={BUTTON_SECONDARY}>
            <ChevronLeft size={13} /> Trước
          </Link>
        )}
        {page < pageCount && (
          <Link href={auditPageHref(filters, page + 1)} className={BUTTON_SECONDARY}>
            Sau <ChevronRight size={13} />
          </Link>
        )}
      </div>
    </nav>
  );
}

type AuditTableProps = { result: AuditPage; filters: AuditFilters };

export function AuditTable({ result, filters }: Readonly<AuditTableProps>) {
  const { rows, total, page, pageCount } = result;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-white/10">
      <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">{total} bản ghi</div>
      {rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm font-semibold text-slate-500">Không có bản ghi nào khớp bộ lọc.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Người thực hiện</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <AuditTableRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pageCount > 1 && <Pagination filters={filters} page={page} pageCount={pageCount} />}
    </div>
  );
}
