"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { moveItem } from "@/lib/content/editor/lists";
import { FieldShell, useFieldFrame, type FieldProps } from "./field-shell";
import { MediaPickerDialog, Thumbnail } from "./media-field";

// A list of images (an option's photos): add from the library, reorder, remove. The order is the order the site shows them in.

type MediaListFieldProps = FieldProps & { imageOnly?: boolean };

export function MediaListField({ imageOnly = true, hint, className, ...frameProps }: Readonly<MediaListFieldProps>) {
  const frame = useFieldFrame({ ...frameProps, list: true });
  const { editor } = frame;
  const keys = (editor.read(frameProps.path) as string[] | undefined) ?? [];
  const [picking, setPicking] = useState(false);

  return (
    <FieldShell frame={frame} hint={hint} className={className}>
      <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-white p-2.5">
        {keys.map((key, index) => (
          <figure key={`${key}:${index}`} className="w-24">
            <Thumbnail mediaKey={key} size={96} />
            <figcaption className="mt-1 truncate text-[10px] font-semibold text-slate-500" title={key}>{key.split("/").pop()}</figcaption>
            {!editor.readOnly && (
              <div className="mt-1 flex justify-between gap-1">
                <button type="button" disabled={index === 0} onClick={() => editor.change(frameProps.path, moveItem(keys, index, index - 1))} aria-label="Dịch sang trái" className={`${BUTTON_SECONDARY} px-1.5`}><ArrowLeft size={12} aria-hidden /></button>
                <button type="button" onClick={() => editor.change(frameProps.path, keys.filter((_, i) => i !== index))} aria-label="Bỏ ảnh" className={`${BUTTON_SECONDARY} px-1.5 text-rose-600`}><X size={12} aria-hidden /></button>
                <button type="button" disabled={index === keys.length - 1} onClick={() => editor.change(frameProps.path, moveItem(keys, index, index + 1))} aria-label="Dịch sang phải" className={`${BUTTON_SECONDARY} px-1.5`}><ArrowRight size={12} aria-hidden /></button>
              </div>
            )}
          </figure>
        ))}
        {keys.length === 0 && <p className="py-3 text-xs font-semibold text-slate-400">Chưa có ảnh.</p>}
        {!editor.readOnly && (
          <button type="button" onClick={() => setPicking(true)} className={`${BUTTON_SECONDARY} h-24 w-24 flex-col`}>
            <Plus size={18} aria-hidden /> Thêm ảnh
          </button>
        )}
      </div>
      {picking && (
        <MediaPickerDialog
          imageOnly={imageOnly}
          current={null}
          onPick={(key) => {
            editor.change(frameProps.path, [...keys, key]);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </FieldShell>
  );
}
