"use client";

import { ChevronDown, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// The strip an editor sees on every page while previewing their drafts (see components/ui/preview-notice.tsx, which decides whether to draw
// it). Vietnamese only, like the whole admin: it is a tool for the people who edit the site, not site copy.

export interface PreviewItem {
  label: string;
  /** «Sản phẩm», «Bài viết»… */
  kind: string;
  /** The editor that holds this draft. */
  href: string;
  /** Applied drafts: not published yet. Skipped drafts: why it is not shown. */
  note: string | null;
}

interface PreviewBannerProps {
  applied: readonly PreviewItem[];
  skipped: readonly PreviewItem[];
}

const EXIT_URL = "/api/admin/preview";

function ItemList({ title, items, tone }: Readonly<{ title: string; items: readonly PreviewItem[]; tone: "ok" | "warn" }>) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className={cn("mb-1 text-[11px] font-black uppercase tracking-wide", tone === "ok" ? "text-emerald-300" : "text-amber-300")}>{title}</h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href} className="text-xs leading-snug">
            <a href={item.href} className="font-bold underline decoration-white/40 underline-offset-2 hover:decoration-white">
              {item.kind}: {item.label}
            </a>
            {item.note && <span className="text-white/70"> — {item.note}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PreviewBanner({ applied, skipped }: Readonly<PreviewBannerProps>) {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const exit = async () => {
    setLeaving(true);
    setFailed(false);
    try {
      const response = await fetch(EXIT_URL, { method: "DELETE", credentials: "same-origin", headers: { "content-type": "application/json" } });
      if (!response.ok) throw new Error(String(response.status));
      window.location.reload();
    } catch {
      setFailed(true);
      setLeaving(false);
    }
  };

  return (
    <aside
      role="status"
      aria-label="Đang xem trước bản nháp"
      className="fixed bottom-3 left-1/2 z-[70] w-[min(34rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-2xl bg-brand-dark/95 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur"
    >
      {open && (
        <div className="max-h-[50vh] space-y-3 overflow-y-auto border-b border-white/10 p-3">
          <ItemList title="Đang hiển thị" items={applied} tone="ok" />
          <ItemList title="Chưa hợp lệ nên chưa hiển thị" items={skipped} tone="warn" />
          {applied.length === 0 && skipped.length === 0 && <p className="text-xs text-white/70">Không còn bản nháp nào đang mở.</p>}
        </div>
      )}
      <div className="flex items-center gap-2 p-2.5">
        <Eye size={16} className="shrink-0 text-emerald-300" aria-hidden />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-1 text-left text-xs font-bold"
        >
          <span className="truncate">
            Đang xem bản nháp · {applied.length} đang hiển thị
            {skipped.length > 0 && <span className="text-amber-300"> · {skipped.length} chưa hợp lệ</span>}
          </span>
          <ChevronDown size={14} className={cn("shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => void exit()}
          disabled={leaving}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-black text-brand-dark transition hover:bg-white/85 disabled:opacity-60"
        >
          {leaving && <Loader2 size={12} className="animate-spin" aria-hidden />}
          Thoát xem trước
        </button>
      </div>
      {failed && <p className="px-3 pb-2 text-[11px] text-rose-300">Không thoát được xem trước. Hãy thử lại.</p>}
    </aside>
  );
}
