"use client";

import { useId } from "react";
import { FIELD_REGISTRY, registryPathOf } from "@/lib/content/field-registry";
import { cn } from "@/lib/utils";
import { useEditor } from "./editor-context";

// The frame around every control: label, the hint, and the document's own complaints about this field. `data-field` carries the
// REGISTRY path (what the coverage test looks for), `data-path` the concrete one (where "go to this problem" scrolls).

export interface FieldProps {
  /** Path into the document; a `*` stands for the language tab being edited. */
  path: string;
  /** Overrides the registry's label (a list row says "Tên", not "Tên hình thức"). */
  label?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  /** The registry path the control stands for, when it cannot be derived from `path` (a UI text sits at `data.vi.faq.items[2].a`, registered as `data.*.*`). */
  registryPath?: string;
}

export function useFieldFrame({ path, label, required, registryPath: registered, list = false }: Pick<FieldProps, "path" | "label" | "required" | "registryPath"> & { list?: boolean }) {
  const editor = useEditor();
  const id = useId();
  const concrete = editor.resolve(path);
  // A list of plain values (a gallery of images) is registered by its element: `options[].images.default[]`.
  const registryPath = registered ?? registryPathOf(concrete) + (list ? "[]" : "");
  const field = FIELD_REGISTRY[editor.type].find((candidate) => candidate.path === registryPath);
  return {
    editor,
    id,
    concrete,
    registryPath,
    label: label ?? field?.label ?? registryPath,
    required: required ?? false,
    issues: editor.issues.filter((issue) => issue.path === concrete),
  };
}

type FieldShellProps = {
  frame: ReturnType<typeof useFieldFrame>;
  hint?: string;
  className?: string;
  /** Extra controls on the label row (a "copy from English" button). */
  aside?: React.ReactNode;
  children: React.ReactNode;
};

export function FieldShell({ frame, hint, className, aside, children }: Readonly<FieldShellProps>) {
  return (
    <div data-field={frame.registryPath} data-path={frame.concrete} className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={frame.id} className="text-xs font-bold text-slate-700">
          {frame.label}
          {frame.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
        {aside}
      </div>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-slate-500">{hint}</p>}
      {frame.issues.map((issue) => (
        <p key={issue.message} role="alert" className="text-[11px] font-semibold text-rose-600">
          {issue.message}
        </p>
      ))}
    </div>
  );
}
