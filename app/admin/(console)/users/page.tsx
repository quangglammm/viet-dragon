import { headers } from "next/headers";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/admin/page-parts";
import type { UserRow } from "@/components/admin/users/types";
import { UsersManager } from "@/components/admin/users/users-manager";
import { getAuth } from "@/lib/auth";
import { requireUser } from "@/lib/dal";

// A print shop has a handful of staff; this is a ceiling, not a page size.
const MAX_USERS = 200;

type ListedUser = Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["listUsers"]>>["users"][number];

function toUserRow(user: ListedUser): UserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "",
    banned: user.banned === true,
    banReason: user.banReason ?? null,
    // The column is ours (additionalFields) and the plugin's row type predates it; absent means "not yet changed".
    mustChangePassword: (user as { mustChangePassword?: boolean }).mustChangePassword !== false,
    createdAt: new Date(user.createdAt).toISOString(),
  };
}

export default async function UsersPage() {
  const me = await requireUser({ permission: ["user", "list"] });
  // The plugin re-checks the caller's role itself; passing the request headers is what identifies them.
  const { users, total } = await getAuth().api.listUsers({
    headers: await headers(),
    query: { limit: MAX_USERS, sortBy: "createdAt", sortDirection: "asc" },
  });

  return (
    <>
      <PageHeader
        icon={<Users size={15} />}
        eyebrow="Quản trị"
        title="Người Dùng & Phân Quyền"
        description="Tài khoản chỉ được tạo bởi quản trị viên. Tài khoản bị vô hiệu hóa, không bao giờ bị xóa, để giữ nguyên lịch sử thao tác."
      />
      <UsersManager users={users.map(toUserRow)} currentUserId={me.id} truncated={total > users.length} />
    </>
  );
}
