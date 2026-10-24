"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { INPUT_CLASS } from "@/components/admin/page-parts";
import { finishedSlug, typedSlug } from "@/lib/content/editor/slugs";
import { cn } from "@/lib/utils";
import { FieldShell, useFieldFrame, type FieldProps } from "./field-shell";

// The URL slug of the language being edited. Changing one keeps the old URL working (the server turns it into an alias), which the
// hint says; what is typed is cleaned as it goes (no diacritics, spaces become dashes).

type SlugFieldProps = FieldProps & {
  /** Stores the slug (the form also removes an alias that the new slug would equal). */
  onSlug: (slug: string) => void;
  /** The slug this language's name would give; offered as a one-click fill when it differs. */
  suggestion?: string;
};

export function SlugField({ onSlug, suggestion, hint, className, ...frameProps }: Readonly<SlugFieldProps>) {
  const frame = useFieldFrame(frameProps);
  const { editor } = frame;
  const stored = (editor.read(frameProps.path) as string | undefined) ?? "";
  const [typed, setTyped] = useState<string | null>(null);

  return (
    <FieldShell
      frame={frame}
      hint={hint ?? "Chữ thường không dấu, số và dấu gạch ngang. Đổi đường dẫn vẫn giữ đường dẫn cũ (vẫn mở được)."}
      className={className}
      aside={
        suggestion && suggestion !== stored && !editor.readOnly ? (
          <button type="button" onClick={() => onSlug(suggestion)} className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline">
            <Wand2 size={11} aria-hidden /> Gợi ý: {suggestion}
          </button>
        ) : undefined
      }
    >
      <input
        id={frame.id}
        value={typed ?? stored}
        disabled={editor.readOnly}
        aria-invalid={frame.issues.length > 0}
        onChange={(event) => {
          const text = typedSlug(event.target.value);
          setTyped(text);
          onSlug(finishedSlug(text));
        }}
        onBlur={() => setTyped(null)}
        className={cn(INPUT_CLASS, "font-mono", frame.issues.length > 0 && "border-rose-300")}
      />
    </FieldShell>
  );
}
