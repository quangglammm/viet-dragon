import {
  FileText,
  Image as ImageIcon,
  Languages,
  LayoutTemplate,
  Package,
  ScrollText,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { hasPermission, type Permission } from "@/lib/permissions";

export type NavItem = {
  href: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  /** Hidden from roles without it. Cosmetic only — the page itself enforces access (lib/dal.ts). */
  permission?: Permission;
};

export type NavSection = { title: string; items: NavItem[] };

const ACCOUNT_ITEMS: NavItem[] = [
  { href: "/admin/account", label: "Tài Khoản Của Tôi", subtitle: "Hồ sơ, mật khẩu, phiên đăng nhập", icon: UserRound },
  { href: "/admin/users", label: "Người Dùng", subtitle: "Tạo tài khoản & phân quyền", icon: Users, permission: ["user", "list"] },
  {
    href: "/admin/audit",
    label: "Nhật Ký Hoạt Động",
    subtitle: "Đăng nhập & thay đổi quản trị",
    icon: ScrollText,
    permission: ["audit", "read"],
  },
];

// The pre-Phase-3 editors. They write to the source tree, so production hides them (Caddy blocks them too).
const LEGACY_EDITOR_ITEMS: NavItem[] = [
  { href: "/admin/site-content", label: "Quản Lý Giao Diện & Ảnh", subtitle: "Sửa tất cả chữ & ảnh website", icon: LayoutTemplate },
  { href: "/admin/products", label: "Sản Phẩm & Quy Cách In", subtitle: "Danh mục, quy cách & vật liệu", icon: Package },
  { href: "/admin/translations", label: "Bản Dịch 5 Ngôn Ngữ", subtitle: "VI · EN · ZH · JA · KO", icon: Languages },
  { href: "/admin/media", label: "Thư Viện Mẫu In & Ảnh", subtitle: "Ảnh mẫu in, bao bì & xưởng", icon: ImageIcon },
  { href: "/admin/blog", label: "Kiến Thức & Tin Tức In", subtitle: "Mẹo in ấn, case study", icon: FileText },
].map((item): NavItem => ({ ...item, permission: ["content", "edit"] }));

/** The sidebar for one role: sections the role cannot use at all are dropped, not left empty. */
export function buildNav(role: string, showLegacyEditors: boolean): NavSection[] {
  const sections: NavSection[] = [
    { title: "Tài Khoản & Hệ Thống", items: ACCOUNT_ITEMS },
    ...(showLegacyEditors ? [{ title: "Danh Mục Quản Trị", items: LEGACY_EDITOR_ITEMS }] : []),
  ];
  return sections
    .map((section) => ({ ...section, items: section.items.filter((item) => !item.permission || hasPermission(role, item.permission)) }))
    .filter((section) => section.items.length > 0);
}

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
