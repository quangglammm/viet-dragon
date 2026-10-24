import { notFound } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { EntityList } from "@/components/admin/content/entity-list";
import { PageHeader } from "@/components/admin/page-parts";
import { ENTITY_META } from "@/lib/content/editor/entity-meta";
import { CREATABLE_TYPES } from "@/lib/content/editor/templates";
import { entityTypeFromUrl } from "@/lib/content/identity";
import { listSummaries } from "@/lib/content/summaries";
import { loadVocabulary } from "@/lib/content/vocabulary";
import { requireUser } from "@/lib/dal";
import { getDb } from "@/lib/db";

type ListPageProps = { params: Promise<{ type: string }> };

export default async function ContentListPage({ params }: Readonly<ListPageProps>) {
  await requireUser({ permission: ["content", "edit"] });
  const type = entityTypeFromUrl((await params).type);
  if (!type || !ENTITY_META[type].editable) notFound();

  const db = getDb();
  const items = await listSummaries(db, type);
  // A product is filed under a category: the list shows it, and a new product is created in one.
  const groups = type === "product" ? (await loadVocabulary(db, ["category"])).category : undefined;
  items.sort((a, b) => (a.label ?? a.ref.id).localeCompare(b.label ?? b.ref.id, "vi"));
  const meta = ENTITY_META[type];

  return (
    <>
      <PageHeader
        icon={<FolderOpen size={15} />}
        eyebrow="Nội dung website"
        title={meta.label}
        description="Mọi thay đổi được lưu thành bản nháp và chỉ hiển thị trên website sau khi bạn xuất bản."
      />
      {/* The row objects cross to the client as plain data; dates become ISO strings. */}
      <EntityList type={type} items={JSON.parse(JSON.stringify(items))} creatable={CREATABLE_TYPES.includes(type)} groups={groups} />
    </>
  );
}
