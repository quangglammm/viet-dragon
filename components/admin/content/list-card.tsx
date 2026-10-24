"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { cn } from "@/lib/utils";
import { useEditor } from "./editor-context";

// One row of a list the editor can add to, reorder and remove from (a shape, an option, a bullet…). Collapsible, because a product
// can have dozens of options and only one is being edited at a time.

type ListCardProps = {
  title: string;
  subtitle?: string;
  /** Anchors "go to this problem" (`data-path`) for the row as a whole. */
  path?: string;
  open?: boolean;
  onToggle?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMove?: (step: -1 | 1) => void;
  onRemove?: () => void;
  removeLabel?: string;
  children?: React.ReactNode;
};

export function ListCard({ title, subtitle, path, open = true, onToggle, canMoveUp = true, canMoveDown = true, onMove, onRemove, removeLabel = "Xóa", children }: Readonly<ListCardProps>) {
  const { readOnly } = useEditor();
  return (
    <section data-path={path} className="rounded-2xl border border-slate-200 bg-white">
      <header className="flex items-center gap-2 px-4 py-3">
        {onToggle ? (
          <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left">
            <ChevronDown size={16} className={cn("shrink-0 text-slate-400 transition-transform", !open && "-rotate-90")} aria-hidden />
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-slate-900">{title}</span>
              {subtitle && <span className="block truncate text-[11px] font-semibold text-slate-500">{subtitle}</span>}
            </span>
          </button>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-900">{title}</p>
            {subtitle && <p className="truncate text-[11px] font-semibold text-slate-500">{subtitle}</p>}
          </div>
        )}
        {!readOnly && (
          <div className="flex shrink-0 items-center gap-1">
            {onMove && (
              <>
                <button type="button" onClick={() => onMove(-1)} disabled={!canMoveUp} aria-label="Lên trên" className={cn(BUTTON_SECONDARY, "px-2")}><ChevronUp size={14} aria-hidden /></button>
                <button type="button" onClick={() => onMove(1)} disabled={!canMoveDown} aria-label="Xuống dưới" className={cn(BUTTON_SECONDARY, "px-2")}><ChevronDown size={14} aria-hidden /></button>
              </>
            )}
            {onRemove && (
              <button type="button" onClick={onRemove} aria-label={removeLabel} title={removeLabel} className={cn(BUTTON_SECONDARY, "px-2 text-rose-600")}><Trash2 size={14} aria-hidden /></button>
            )}
          </div>
        )}
      </header>
      {open && children && <div className="space-y-4 border-t border-slate-100 p-4">{children}</div>}
    </section>
  );
}
