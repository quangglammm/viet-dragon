"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { AdminCard, BUTTON_DANGER, BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { Modal } from "@/components/admin/modal";
import { Notice } from "@/components/admin/notice";
import { createContentApi, type Ref } from "@/lib/content/editor/api";
import { ENTITY_META, listUrl } from "@/lib/content/editor/entity-meta";

// Deleting is permanent and admin-only. The server refuses what must not go (still used, not archived yet, an open draft) and says
// why; this card shows that answer as it is. Records others refer to also show how many places use them.

const USED_BY_TYPES: readonly string[] = ["material", "unit", "trait", "spec_item", "post_category"];

type DangerCardProps = { entity: Ref; label: string; canDelete: boolean };

export function DangerCard({ entity, label, canDelete }: Readonly<DangerCardProps>) {
  const api = useMemo(() => createContentApi(), []);
  const router = useRouter();
  const [usage, setUsage] = useState<{ live: number; drafts: number } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const meta = ENTITY_META[entity.type];

  useEffect(() => {
    if (!USED_BY_TYPES.includes(entity.type)) return;
    let cancelled = false;
    void api.usedBy(entity).then((result) => {
      if (!cancelled && result.ok) setUsage(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [api, entity]);

  const remove = async () => {
    setBusy(true);
    setProblem(null);
    const result = await api.deleteEntity(entity);
    setBusy(false);
    if (result.ok) router.push(listUrl(entity.type));
    else {
      setProblem(result.problem.message);
      setConfirming(false);
    }
  };

  return (
    <AdminCard title="Sử dụng & xóa" description={meta.hasStatus ? "Mục này phải được lưu trữ (đổi Trạng thái sang «Đã lưu trữ» và xuất bản) trước khi xóa hẳn." : "Chỉ xóa được khi không còn nơi nào dùng đến."}>
      {usage && (
        <p className="mb-3 text-xs font-semibold text-slate-600">
          Đang được dùng ở {usage.live} nơi đang hiển thị và {usage.drafts} bản nháp.
        </p>
      )}
      {problem && <Notice tone="error" className="mb-3">{problem}</Notice>}
      {canDelete ? (
        <button type="button" onClick={() => setConfirming(true)} className={BUTTON_DANGER}>
          <Trash2 size={14} aria-hidden /> Xóa vĩnh viễn
        </button>
      ) : (
        <p className="text-xs text-slate-500">Chỉ quản trị viên mới xóa được nội dung.</p>
      )}
      {confirming && (
        <Modal title="Xóa vĩnh viễn?" description={`«${label}» sẽ bị xóa khỏi website. Lịch sử vẫn được giữ để khôi phục.`} locked={busy} onClose={() => setConfirming(false)}>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className={BUTTON_SECONDARY}>Không xóa</button>
            <button type="button" onClick={() => void remove()} disabled={busy} className={BUTTON_DANGER}>
              {busy && <Loader2 size={14} className="animate-spin" aria-hidden />} Xóa vĩnh viễn
            </button>
          </div>
        </Modal>
      )}
    </AdminCard>
  );
}
