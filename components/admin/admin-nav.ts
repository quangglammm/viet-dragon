import {
  FileText,
  FolderTree,
  Gem,
  ImagePlus,
  Images,
  Languages,
  ListChecks,
  Package,
  PanelTop,
  Ruler,
  ScrollText,
  Sparkles,
  Tags,
  UserRound,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { DraftEntityType } from "@/lib/content/entity-types";
import { EDITABLE_TYPES, ENTITY_META, listUrl } from "@/lib/content/editor/entity-meta";
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

// The editors on the content database (Phase 3d). A type appears here as soon as its editor exists.
const CONTENT_ITEM_LOOK: Partial<Record<DraftEntityType, { subtitle: string; icon: LucideIcon }>> = {
  product: { subtitle: "Hình thức, chất liệu, giá, đường dẫn", icon: Package },
  category: { subtitle: "Tên, ảnh và đường dẫn 4 danh mục", icon: FolderTree },
  menu: { subtitle: "Menu lớn của từng danh mục", icon: PanelTop },
  post: { subtitle: "Mẹo in ấn, case study, tin tức", icon: FileText },
  material: { subtitle: "Giấy, màng, vật liệu in", icon: Gem },
  trait: { subtitle: "Biểu tượng & lời giải thích", icon: Sparkles },
  unit: { subtitle: "Hộp, tờ, cuốn…", icon: Ruler },
  spec_item: { subtitle: "Kỹ thuật in & hoàn thiện", icon: ListChecks },
  post_category: { subtitle: "Nhóm bài viết", icon: Tags },
  fast_print_item: { subtitle: "Trang «In nhanh lấy liền»", icon: Zap },
  showcase_item: { subtitle: "Thư viện ảnh trang Sản phẩm", icon: Images },
  site_message: { subtitle: "Chữ trên giao diện, 5 ngôn ngữ", icon: Languages },
};

/** The picture library: not an entity type (a file has no document, draft or revisions), so it is listed beside the editors. */
export const MEDIA_LIBRARY_HREF = "/admin/media";

const CONTENT_ITEMS: NavItem[] = [
  ...EDITABLE_TYPES.map(
    (type): NavItem => ({
      href: listUrl(type),
      label: ENTITY_META[type].label,
      subtitle: CONTENT_ITEM_LOOK[type]?.subtitle ?? "",
      icon: CONTENT_ITEM_LOOK[type]?.icon ?? FileText,
      permission: ["content", "edit"],
    }),
  ),
  { href: MEDIA_LIBRARY_HREF, label: "Thư viện ảnh", subtitle: "Tải ảnh lên, tìm lại ảnh đã dùng", icon: ImagePlus, permission: ["content", "edit"] },
];

/** The sidebar for one role: sections the role cannot use at all are dropped, not left empty. */
export function buildNav(role: string): NavSection[] {
  const sections: NavSection[] = [
    { title: "Tài Khoản & Hệ Thống", items: ACCOUNT_ITEMS },
    { title: "Nội Dung Website", items: CONTENT_ITEMS },
  ];
  return sections
    .map((section) => ({ ...section, items: section.items.filter((item) => !item.permission || hasPermission(role, item.permission)) }))
    .filter((section) => section.items.length > 0);
}

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
