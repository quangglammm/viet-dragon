import { ScrollText } from "lucide-react";
import { AuditFilterForm } from "@/components/admin/audit/audit-filters";
import { AuditTable } from "@/components/admin/audit/audit-table";
import { PageHeader } from "@/components/admin/page-parts";
import { parseAuditFilters, queryAuditLog } from "@/lib/audit-query";
import { requireUser } from "@/lib/dal";

type AuditPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuditPage({ searchParams }: Readonly<AuditPageProps>) {
  await requireUser({ permission: ["audit", "read"] });
  const filters = parseAuditFilters(await searchParams);
  const result = await queryAuditLog(filters);

  return (
    <>
      <PageHeader
        icon={<ScrollText size={15} />}
        eyebrow="Quản trị"
        title="Nhật Ký Hoạt Động"
        description="Ai đã đăng nhập, đổi quyền hay đặt lại mật khẩu, và từ địa chỉ nào. Nhật ký chỉ ghi thêm, không thể sửa hoặc xóa."
      />
      <AuditFilterForm action={filters.action} actor={filters.actor} />
      <AuditTable result={result} filters={filters} />
    </>
  );
}
