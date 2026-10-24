"use client";

import { productTargets, targetFromKey, targetKey, type MenuTarget } from "@/lib/content/editor/menu-ops";
import { INPUT_CLASS } from "@/components/admin/page-parts";
import { cn } from "@/lib/utils";
import { useEditor } from "../../editor-context";
import { FieldShell, useFieldFrame } from "../../field-shell";

// What a menu item links to: a shape (the link goes to its anchor on the product page) or an option (its own page). Only the shapes and
// options of the group's product can be chosen, and only published ones — the server resolves the link from what is live.

type TargetFieldProps = { base: string; product: string; target: MenuTarget; onTarget: (target: MenuTarget) => void };

export function TargetField({ base, product, target, onTarget }: Readonly<TargetFieldProps>) {
  const editor = useEditor();
  const kind = "shape" in target ? "shape" : "option";
  const frame = useFieldFrame({ path: `${base}.target.${kind}` });
  const { shapes, options } = productTargets(editor.vocab, product);
  const current = targetKey(target);
  const known = (kind === "shape" ? shapes : options).some((entry) => entry.value === ("shape" in target ? target.shape : target.option));
  // What the server says about the link as a whole (it names `…target`, not the shape or option inside it).
  const own = editor.issues.filter((issue) => issue.path === `${base}.target`);

  return (
    <FieldShell frame={frame} hint="Chỉ chọn được hình thức và chất liệu đã xuất bản của sản phẩm này (mục mới tạo trong bản nháp sản phẩm chưa chọn được).">
      <select
        id={frame.id}
        value={current}
        disabled={editor.readOnly}
        aria-invalid={frame.issues.length + own.length > 0}
        onChange={(event) => {
          const chosen = targetFromKey(event.target.value);
          if (chosen) onTarget(chosen);
        }}
        className={cn(INPUT_CLASS, frame.issues.length + own.length > 0 && "border-rose-300")}
      >
        {!known && <option value={current}>(không còn tồn tại)</option>}
        {shapes.length > 0 && (
          <optgroup label="Hình thức">
            {shapes.map((shape) => (
              <option key={shape.value} value={`shape:${shape.value}`}>{shape.label}</option>
            ))}
          </optgroup>
        )}
        {options.length > 0 && (
          <optgroup label="Chất liệu">
            {options.map((option) => (
              <option key={option.value} value={`option:${option.value}`}>{option.label}</option>
            ))}
          </optgroup>
        )}
      </select>
      {own.map((issue) => (
        <p key={issue.message} role="alert" className="mt-1 text-[11px] font-semibold text-rose-600">{issue.message}</p>
      ))}
    </FieldShell>
  );
}
