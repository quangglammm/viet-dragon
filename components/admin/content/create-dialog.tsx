"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Notice } from "@/components/admin/notice";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import type { DraftEntityType } from "@/lib/content/entity-types";
import { createContentApi } from "@/lib/content/editor/api";
import type { VocabOption } from "@/lib/content/editor/vocabulary";
import { ENTITY_META, editorUrl } from "@/lib/content/editor/entity-meta";
import { buildCreateRequest } from "@/lib/content/editor/templates";
import { encodeEntityId } from "@/lib/content/identity";
import { SPEC_KIND_VALUES } from "@/lib/content/schemas";
import { slugify } from "@/lib/content/slugify";

// "Tạo … mới": just enough to make a draft — names (the key is suggested from the Vietnamese one) — then the editor opens on it.

const SPEC_KIND_LABELS: Record<(typeof SPEC_KIND_VALUES)[number], string> = { technique: "Kỹ thuật in", finishing: "Hoàn thiện", material_hint: "Chất liệu phổ biến" };

export function CreateDialog({ type, groups, onClose }: Readonly<{ type: DraftEntityType; groups?: VocabOption[]; onClose: () => void }>) {
  const router = useRouter();
  const api = useMemo(() => createContentApi(), []);
  const meta = ENTITY_META[type];
  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [typedKey, setTypedKey] = useState<string | null>(null);
  const [category, setCategory] = useState(groups?.[0]?.value ?? "");
  const [specKind, setSpecKind] = useState<(typeof SPEC_KIND_VALUES)[number]>("technique");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const key = typedKey ?? (nameVi.trim() ? slugify(nameVi) : "");
  const word = type === "post" ? "Tiêu đề" : "Tên";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const request = buildCreateRequest(type, { nameVi, nameEn, key, specKind, category });
    if (!request.ok) return setMessage(request.message);
    setBusy(true);
    setMessage(null);
    const result = await api.create(type, { key: request.key, snapshot: request.snapshot });
    if (!result.ok) {
      setBusy(false);
      return setMessage(result.problem.message);
    }
    const { ref } = result.data.draft;
    router.push(editorUrl(type, encodeURIComponent(encodeEntityId(type, ref.id))));
  };

  return (
    <Modal title={`Tạo ${meta.singular} mới`} description="Điền tên rồi bấm Tạo; bạn sẽ bổ sung phần còn lại trong trình soạn. Bản nháp chưa hiển thị trên website." locked={busy} onClose={onClose}>
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        {message && <Notice tone="error">{message}</Notice>}
        {meta.group && (
          <label className="block text-xs font-bold text-slate-700">
            {meta.group.label}
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={`${INPUT_CLASS} mt-1.5`}>
              {(groups ?? []).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        )}
        {type === "spec_item" && (
          <label className="block text-xs font-bold text-slate-700">
            Loại thông số
            <select value={specKind} onChange={(event) => setSpecKind(event.target.value as typeof specKind)} className={`${INPUT_CLASS} mt-1.5`}>
              {SPEC_KIND_VALUES.map((kind) => (
                <option key={kind} value={kind}>{SPEC_KIND_LABELS[kind]}</option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-xs font-bold text-slate-700">
          {word} tiếng Việt <span className="text-rose-500">*</span>
          <input value={nameVi} onChange={(event) => setNameVi(event.target.value)} className={`${INPUT_CLASS} mt-1.5`} autoFocus />
        </label>
        <label className="block text-xs font-bold text-slate-700">
          {word} tiếng Anh
          <input value={nameEn} onChange={(event) => setNameEn(event.target.value)} className={`${INPUT_CLASS} mt-1.5`} />
          <span className="mt-1 block text-[11px] font-normal text-slate-500">Cần có trước khi xuất bản; có thể bổ sung sau.</span>
        </label>
        {type !== "product" && type !== "post" && (
          <label className="block text-xs font-bold text-slate-700">
            Mã
            <input value={key} onChange={(event) => setTypedKey(event.target.value)} className={`${INPUT_CLASS} mt-1.5 font-mono`} />
            <span className="mt-1 block text-[11px] font-normal text-slate-500">Chữ thường không dấu, số và dấu gạch ngang. Mã không đổi được sau khi tạo.</span>
          </label>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} disabled={busy} className={BUTTON_SECONDARY}>Hủy</button>
          <button type="submit" disabled={busy} className={BUTTON_PRIMARY}>
            {busy && <Loader2 size={14} className="animate-spin" aria-hidden />} Tạo
          </button>
        </div>
      </form>
    </Modal>
  );
}
