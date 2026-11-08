"use client";

import { Link2 } from "lucide-react";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { useEditor } from "./editor-context";

// The old URLs of a record in the language being edited. A publish never drops one, so they are shown, not edited; letting one go is
// a separate act of its own (`onRelease`, offered only when the live product is shown with no draft open).

export type AliasEntry = { slug: string; category?: string };

type AliasListProps = {
  /** Path of the list, `slugs.*.aliases` or `shapes[1].slugs.*.aliases` (a `*` = the language tab). */
  path: string;
  /** A product's own aliases carry the category they were in; a shape's, option's, post's or category's are plain slugs. */
  withCategory?: boolean;
  onRelease?: (alias: AliasEntry) => void;
};

export function AliasList({ path, withCategory = false, onRelease }: Readonly<AliasListProps>) {
  const editor = useEditor();
  const concrete = editor.resolve(path);
  const registry = path.replace(/\[\d+]/g, "[]");
  const raw = (editor.read(path) as (string | { category: string; slug: string })[] | undefined) ?? [];
  const aliases: AliasEntry[] = raw.map((alias) => (typeof alias === "string" ? { slug: alias } : alias));
  if (aliases.length === 0) return <p className="text-[11px] font-semibold text-slate-400">Chưa có đường dẫn cũ.</p>;

  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-slate-700">Đường dẫn cũ (vẫn mở được)</p>
      <ul className="space-y-1.5">
        {aliases.map((alias, index) => (
          <li key={`${alias.category ?? ""}/${alias.slug}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="flex min-w-0 items-center gap-1.5 font-mono text-[11px] text-slate-700">
              <Link2 size={12} className="shrink-0 text-slate-400" aria-hidden />
              {withCategory ? (
                <>
                  <span data-field={`${registry}[].category`} data-path={`${concrete}[${index}].category`}>{alias.category}</span>/
                  <span data-field={`${registry}[].slug`} data-path={`${concrete}[${index}].slug`}>{alias.slug}</span>
                </>
              ) : (
                <span data-field={`${registry}[]`} data-path={`${concrete}[${index}]`}>{alias.slug}</span>
              )}
            </span>
            {onRelease && (
              <button type="button" onClick={() => onRelease(alias)} className={`${BUTTON_SECONDARY} shrink-0 text-rose-600`}>Gỡ</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
