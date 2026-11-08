"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/modal";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { ICON_NAMES, ICONS, isIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { FieldShell, useFieldFrame, type FieldProps } from "./field-shell";

// The icon is stored as a NAME; the picker lists exactly the icons the site can draw (lib/icons.ts), so an icon that cannot be
// shown can never be chosen.

type IconFieldProps = FieldProps & { nullable?: boolean };

export function IconField({ nullable = false, hint, className, ...frameProps }: Readonly<IconFieldProps>) {
  const frame = useFieldFrame(frameProps);
  const { editor } = frame;
  const value = (editor.read(frameProps.path) as string | null | undefined) || null;
  const [picking, setPicking] = useState(false);
  const Current = value && isIconName(value) ? ICONS[value] : null;

  return (
    <FieldShell frame={frame} hint={hint} className={className}>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">{Current && <Current size={22} aria-hidden />}</div>
        <p id={frame.id} className="flex-1 text-xs font-semibold text-slate-700">{value ?? "Chưa chọn"}</p>
        {!editor.readOnly && (
          <div className="flex gap-2">
            <button type="button" onClick={() => setPicking(true)} className={BUTTON_SECONDARY}>{value ? "Đổi" : "Chọn"}</button>
            {value && nullable && <button type="button" onClick={() => editor.change(frameProps.path, null)} className={BUTTON_SECONDARY}>Bỏ chọn</button>}
          </div>
        )}
      </div>
      {picking && (
        <Modal title="Chọn biểu tượng" description="Chỉ gồm các biểu tượng website có thể hiển thị." onClose={() => setPicking(false)}>
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {ICON_NAMES.map((name) => {
              const Icon = ICONS[name];
              return (
                <li key={name}>
                  <button
                    type="button"
                    title={name}
                    onClick={() => {
                      editor.change(frameProps.path, name);
                      setPicking(false);
                    }}
                    className={cn("flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl border p-2.5 text-slate-600 transition-colors hover:border-brand-primary hover:text-brand-primary", name === value ? "border-brand-primary bg-brand-primary/5 text-brand-primary" : "border-slate-200")}
                  >
                    <Icon size={20} aria-hidden />
                    <span className="max-w-full truncate text-[9px] font-semibold">{name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}
    </FieldShell>
  );
}
