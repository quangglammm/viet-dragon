"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { BUTTON_PRIMARY, INPUT_CLASS } from "@/components/admin/page-parts";
import type { DraftEntityType } from "@/lib/content/entity-types";
import type { SummaryRow } from "@/lib/content/editor/api";
import type { VocabOption } from "@/lib/content/editor/vocabulary";
import { ENTITY_META, editorUrl } from "@/lib/content/editor/entity-meta";
import { encodeEntityId } from "@/lib/content/identity";
import { formatAdminDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { CreateDialog } from "./create-dialog";

// The rows of one entity type: live records and records that exist only as a draft, each with its open draft.

type EntityListProps = {
  type: DraftEntityType;
  items: SummaryRow[];
  creatable: boolean;
  /** Names for the `group` column (a product's category), and the categories a new product can be created in. */
  groups?: VocabOption[];
};

export function EntityList({ type, items, creatable, groups }: Readonly<EntityListProps>) {
  const [filter, setFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const meta = ENTITY_META[type];
  const needle = filter.trim().toLowerCase();
  const groupLabel = (id: string | null) => groups?.find((group) => group.value === id)?.label ?? id ?? "—";
  const rows = items.filter((row) => !needle || `${row.label ?? ""} ${row.ref.id} ${groupLabel(row.group)}`.toLowerCase().includes(needle));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-60 max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
          <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Lọc theo tên hoặc mã…" aria-label="Lọc danh sách" className={cn(INPUT_CLASS, "pl-9")} />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-slate-500">{rows.length} {meta.singular}</p>
          {creatable && (
            <button type="button" onClick={() => setCreating(true)} className={BUTTON_PRIMARY}>
              <Plus size={14} aria-hidden /> Tạo {meta.singular} mới
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Tên</th>
              {groups && <th className="hidden px-4 py-3 sm:table-cell">Danh mục</th>}
              <th className="hidden px-4 py-3 sm:table-cell">Mã</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="hidden px-4 py-3 md:table-cell">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.ref.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <Link href={editorUrl(type, encodeURIComponent(encodeEntityId(type, row.ref.id)))} className="font-bold text-slate-900 hover:text-brand-primary">
                    {row.label ?? row.ref.id}
                  </Link>
                </td>
                {groups && <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{groupLabel(row.group)}</td>}
                <td className="hidden max-w-48 truncate px-4 py-3 font-mono text-[11px] text-slate-500 sm:table-cell">{row.ref.id}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {row.version === null ? <Chip tone="amber">Chưa xuất bản</Chip> : <Chip tone="green">v{row.version}</Chip>}
                    {row.status === "archived" && <Chip tone="slate">Đã lưu trữ</Chip>}
                    {row.draft && <Chip tone="purple">Có bản nháp</Chip>}
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-slate-500 md:table-cell">{row.updatedAt ? formatAdminDate(row.updatedAt) : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center font-semibold text-slate-400">Không có {meta.singular} nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {creating && <CreateDialog type={type} categories={groups} onClose={() => setCreating(false)} />}
    </>
  );
}

const TONES = { green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-800", purple: "bg-purple-100 text-purple-700", slate: "bg-slate-200 text-slate-700" } as const;

function Chip({ tone, children }: Readonly<{ tone: keyof typeof TONES; children: React.ReactNode }>) {
  return <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-black", TONES[tone])}>{children}</span>;
}
