"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  description?: string;
  /** Blocks closing (Esc, backdrop, ✕): while a request is in flight, or until a one-time secret is acknowledged. */
  locked?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

/** The admin's dialog shell — same look as media-delete-modal (backdrop, rounded card, header row). */
export function Modal({ title, description, locked = false, onClose, children }: Readonly<ModalProps>) {
  const titleId = useId();

  useEffect(() => {
    if (locked) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [locked, onClose]);

  return (
    <div
      onClick={locked ? undefined : onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div>
            <h2 id={titleId} className="text-base font-black text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Đóng"
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
