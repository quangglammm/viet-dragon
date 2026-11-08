import Link from "next/link";
import { Search } from "lucide-react";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import { AUDIT_ACTIONS, AUDIT_ACTION_LABELS } from "@/lib/auth/audit";
import { AUDIT_PATH, type AuditFilters } from "@/lib/audit-query";

/** A plain GET form: no client JavaScript, the filters live in the URL so a view can be shared or bookmarked. */
export function AuditFilterForm({ action, actor }: Readonly<Pick<AuditFilters, "action" | "actor">>) {
  return (
    <form method="get" action={AUDIT_PATH} className="mb-6 flex flex-wrap items-end gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/10">
      <div className="min-w-48 flex-1">
        <label htmlFor="audit-action" className="mb-1.5 block text-xs font-bold text-slate-700">
          Hành động
        </label>
        <select id="audit-action" name="action" defaultValue={action ?? ""} className={INPUT_CLASS}>
          <option value="">Tất cả</option>
          {AUDIT_ACTIONS.map((value) => (
            <option key={value} value={value}>
              {AUDIT_ACTION_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-48 flex-1">
        <label htmlFor="audit-actor" className="mb-1.5 block text-xs font-bold text-slate-700">
          Người thực hiện (email)
        </label>
        <input id="audit-actor" name="actor" defaultValue={actor ?? ""} maxLength={100} placeholder="vd. an@vietdragon.vn" className={INPUT_CLASS} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className={BUTTON_PRIMARY}>
          <Search size={14} /> Lọc
        </button>
        <Link href={AUDIT_PATH} className={BUTTON_SECONDARY}>
          Xóa lọc
        </Link>
      </div>
    </form>
  );
}
