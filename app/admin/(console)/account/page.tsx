import Link from "next/link";
import { KeyRound, UserRound } from "lucide-react";
import { SessionsPanel } from "@/components/admin/account/sessions-panel";
import { Notice } from "@/components/admin/notice";
import { AdminCard, BUTTON_SECONDARY, PageHeader } from "@/components/admin/page-parts";
import { PASSWORD_CHANGE_PATH } from "@/lib/admin-access";
import { requireUser } from "@/lib/dal";
import { roleLabel } from "@/lib/permissions";
import { firstParam } from "@/lib/search-params";

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountPage({ searchParams }: Readonly<AccountPageProps>) {
  const user = await requireUser();
  // requireUser() sends someone who lacks a page's permission here with ?denied=1.
  const denied = firstParam((await searchParams).denied) === "1";

  return (
    <>
      <PageHeader
        icon={<UserRound size={15} />}
        eyebrow="Tài khoản"
        title="Tài Khoản Của Tôi"
        description="Thông tin đăng nhập, mật khẩu và các thiết bị đang truy cập trang quản trị."
      />

      {denied && (
        <Notice tone="warning" className="mb-6">
          Tài khoản của bạn không có quyền truy cập trang vừa rồi.
        </Notice>
      )}

      <div className="space-y-6">
        <AdminCard title="Thông tin tài khoản">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Họ tên</dt>
              <dd className="mt-1 font-bold text-slate-900">{user.name}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</dt>
              <dd className="mt-1 truncate font-bold text-slate-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Vai trò</dt>
              <dd className="mt-1 font-bold text-slate-900">{roleLabel(user.role)}</dd>
            </div>
          </dl>
        </AdminCard>

        <AdminCard
          title="Mật khẩu"
          description="Nên đổi mật khẩu định kỳ và không dùng lại mật khẩu của dịch vụ khác."
          action={
            <Link href={PASSWORD_CHANGE_PATH} className={BUTTON_SECONDARY}>
              <KeyRound size={13} /> Đổi mật khẩu
            </Link>
          }
        >
          <p className="text-xs text-slate-500">
            Nếu quên mật khẩu, hãy nhờ quản trị viên đặt lại — bạn sẽ nhận mật khẩu tạm thời và được yêu cầu đổi ngay khi đăng nhập.
          </p>
        </AdminCard>

        <SessionsPanel />
      </div>
    </>
  );
}
