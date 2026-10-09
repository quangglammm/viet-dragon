// lib/shape-aliases.ts
// Central dictionary mapping English keys, slugs, and menu IDs to standard shape IDs.

export const SHAPE_ALIASES: Record<string, string> = {
  // poster-bangron-standee
  "hanging-board": "bang-treo",
  "bang-treo": "bang-treo",
  "pp-format-board": "pp-boi-format",
  "pp-boi-format": "pp-boi-format",
  "hashtag-handheld": "hashtag-cam-tay",
  "hashtag-cam-tay": "hashtag-cam-tay",
  "hashtag-detachable": "hashtag-tay-cam-roi",
  "hashtag-tay-cam-roi": "hashtag-tay-cam-roi",
  "decal-large-format": "decal-kho-lon",
  "decal-kho-lon": "decal-kho-lon",
  "canvas-high-quality": "tranh-canvas",
  "tranh-canvas": "tranh-canvas",
  "tranh-canvas-chat-luong-cao": "tranh-canvas",

  // to-roi
  "flyer-budget": "to-roi-gia-re",
  "to-roi-gia-re": "to-roi-gia-re",
  "flyer-short-run": "to-roi-so-luong-it",
  "to-roi-so-luong-it": "to-roi-so-luong-it",
  "flyer-bulk": "to-roi-so-luong-lon",
  "to-roi-so-luong-lon": "to-roi-so-luong-lon",
  "flyer-premium": "to-roi-cao-cap",
  "to-roi-cao-cap": "to-roi-cao-cap",

  // to-gap
  "brochure-short-run": "to-gap-so-luong-it",
  "to-gap-so-luong-it": "to-gap-so-luong-it",
  "brochure-tri-fold": "to-gap-ba",
  "to-gap-ba": "to-gap-ba",
  "brochure-bi-fold-a4": "to-gap-doi-a4",
  "to-gap-doi-a4": "to-gap-doi-a4",
  "brochure-premium": "to-gap-cao-cap",
  "to-gap-cao-cap": "to-gap-cao-cap",

  // ve-tickets
  "ticket-invitation": "ve-moi-su-kien",
  "ve-moi-su-kien": "ve-moi-su-kien",
  "ticket-wristband": "vong-tay-su-kien",
  "vong-tay-su-kien": "vong-tay-su-kien",

  // vouchers
  "voucher-standard": "phieu-qua-tang-pho-thong",
  "phieu-qua-tang-pho-thong": "phieu-qua-tang-pho-thong",
  "voucher-gift": "gift-vouchers",
  "gift-vouchers": "gift-vouchers",
  "card-loyalty": "the-tich-diem",
  "the-tich-diem": "the-tich-diem",
  "card-scratch": "the-cao-khuyen-mai",
  "the-cao-khuyen-mai": "the-cao-khuyen-mai",

  // catalogues
  "catalogue-standard": "catalogue-tieu-chuan",
  "catalogue-tieu-chuan": "catalogue-tieu-chuan",
  "catalogue-budget": "catalogue-gia-re",
  "catalogue-gia-re": "catalogue-gia-re",
  "catalogue-premium": "catalogue-cao-cap",
  "catalogue-cao-cap": "catalogue-cao-cap",
  "profile-company": "ho-so-nang-luc",
  "ho-so-nang-luc": "ho-so-nang-luc",
  "handbook-pocket": "cam-nang-cam-tay",
  "cam-nang-cam-tay": "cam-nang-cam-tay",

  // bao-thu
  "envelope-express": "bao-thu-lay-ngay",
  "bao-thu-lay-ngay": "bao-thu-lay-ngay",
  "envelope-small": "bao-thu-nho",
  "bao-thu-nho": "bao-thu-nho",
  "envelope-medium": "bao-thu-trung",
  "bao-thu-trung": "bao-thu-trung",
  "envelope-large": "bao-thu-lon",
  "bao-thu-lon": "bao-thu-lon",
  "envelope-window": "bao-thu-cua-so",
  "bao-thu-cua-so": "bao-thu-cua-so",

  // mac-san-pham
  "tag-common": "mac-pho-thong",
  "mac-pho-thong": "mac-pho-thong",
  "tag-premium": "mac-cao-cap",
  "mac-cao-cap": "mac-cao-cap",
  "tag-fashion": "tag-thoi-trang",
  "tag-thoi-trang": "tag-thoi-trang",
  "tag-jewelry": "tag-trang-suc",
  "tag-trang-suc": "tag-trang-suc",
  "tag-thank-you": "tag-cam-on",
  "tag-cam-on": "tag-cam-on",

  // lich-tet
  "calendar-desk-standard": "lich-de-ban",
  "lich-de-ban": "lich-de-ban",
  "calendar-desk-2026": "lich-ban-2026",
  "lich-ban-2026": "lich-ban-2026",
  "calendar-magnetic-flexible": "lich-nam-cham",
  "lich-nam-cham": "lich-nam-cham",

  // tet submenu shapes & labels
  "tag-product": "tag-san-pham",
  "tag-san-pham": "tag-san-pham",
  "label-paper": "nhan-decal-giay",
  "nhan-decal-giay": "nhan-decal-giay",
  "label-plastic": "nhan-decal-nhua",
  "nhan-decal-nhua": "nhan-decal-nhua",
  "label-kraft": "nhan-decal-giay-kraft",
  "nhan-decal-giay-kraft": "nhan-decal-giay-kraft",
  "label-art-paper": "nhan-decal-giay-my-thuat",
  "nhan-decal-giay-my-thuat": "nhan-decal-giay-my-thuat",
  "label-metallic": "nhan-decal-xi-bac",
  "label-metallic-foil": "nhan-decal-xi-bac",
  "nhan-decal-xi-bac": "nhan-decal-xi-bac",
  "hashtag-paper": "hashtag-giay",
  "hashtag-giay": "hashtag-giay",
  "certificate-award": "bang-khen",
  "bang-khen": "bang-khen",
  "banner-hiflex": "bang-ron-hiflex",
  "bang-ron-hiflex": "bang-ron-hiflex",
  "poster-pp": "poster-chat-lieu-pp",
  "poster-chat-lieu-pp": "poster-chat-lieu-pp",
  "wristband": "vong-tay-su-kien",
  "lixi-standard": "bao-li-xi-chuan",
  "bao-li-xi-chuan": "bao-li-xi-chuan",
  "lixi-2026": "bao-li-xi-2026",
  "bao-li-xi-2026": "bao-li-xi-2026",
  "lixi-foil-premium": "bao-li-xi-ep-kim",
  "bao-li-xi-ep-kim": "bao-li-xi-ep-kim",
  "invitation-event": "thiep-su-kien",
  "thiep-su-kien": "thiep-su-kien",

  // danh-thiep
  "card-standard": "danh-thiep-chuan",
  "danh-thiep-chuan": "danh-thiep-chuan",
  "card-digital": "ky-thuat-so",
  "ky-thuat-so": "ky-thuat-so",
  "card-smart": "thong-minh",
  "thong-minh": "thong-minh",
  "card-embossed": "dap-noi-chim",
  "dap-noi-chim": "dap-noi-chim",
  "card-rounded": "bo-goc-chuan",
  "bo-goc-chuan": "bo-goc-chuan",
  "card-highlight": "highlight",
  "highlight": "highlight",
  "card-square-rounded": "vuong-bo-goc",
  "vuong-bo-goc": "vuong-bo-goc",
  "card-square": "vuong",
  "vuong": "vuong",
  "card-folded": "gap-doi",
  "gap-doi": "gap-doi",

  // ao-thun
  "tshirt-polo": "ao-thun-co-tru",
  "ao-thun-co-tru": "ao-thun-co-tru",
  "tshirt-round-neck": "ao-thun-co-tron",
  "ao-thun-co-tron": "ao-thun-co-tron",

  // giay-ghi-chu
  "note-block": "giay-ghi-chu-block",
  "giay-ghi-chu-block": "giay-ghi-chu-block",

  // giay-tieu-de
  "letterhead-short-run": "giay-tieu-de-it",
  "giay-tieu-de-it": "giay-tieu-de-it",
  "letterhead-bulk": "giay-tieu-de-lon",
  "giay-tieu-de-lon": "giay-tieu-de-lon",

  // bia-dung-ho-so
  "folder-single-pocket": "bia-ho-so-1-tay-gap",
  "bia-ho-so-1-tay-gap": "bia-ho-so-1-tay-gap",
  "folder-double-pocket": "bia-ho-so-2-tay-gap",
  "bia-ho-so-2-tay-gap": "bia-ho-so-2-tay-gap",
  "folder-premium": "bia-ho-so-cao-cap",
  "bia-ho-so-cao-cap": "bia-ho-so-cao-cap",

  // packaging tui-giay
  "bag-standard": "tui-giay-chuan",
  "tui-giay-chuan": "tui-giay-chuan",
  "bag-kraft": "tui-giay-kraft",
  "tui-giay-kraft": "tui-giay-kraft",
  "bag-flap": "tui-giay-co-nap",
  "tui-giay-co-nap": "tui-giay-co-nap",
  "bag-foil": "tui-giay-ep-kim",
  "tui-giay-ep-kim": "tui-giay-ep-kim",
  "bag-punch-handle": "tui-giay-quai-hot-xoai",
  "tui-giay-quai-hot-xoai": "tui-giay-quai-hot-xoai",
  "bag-ready-made": "tui-giay-co-san",
  "tui-giay-co-san": "tui-giay-co-san",
  "bag-bread": "tui-giay-banh-mi",
  "tui-giay-banh-mi": "tui-giay-banh-mi",

  // packaging hop-giay
  "box-standard": "hop-giay-thong-dung",
  "hop-giay-thong-dung": "hop-giay-thong-dung",
  "box-kraft": "hop-giay-kraft",
  "hop-giay-kraft": "hop-giay-kraft",
  "box-carton": "hop-giay-carton",
  "hop-giay-carton": "hop-giay-carton",

  // packaging nhan-dan
  "label-sticker-sheets": "sticker-sheets",
  "sticker-sheets": "sticker-sheets",
  "nhan-sticker-dang-to": "sticker-sheets",
  "label-uv-dtf": "decal-uv-dtf",
  "decal-uv-dtf": "decal-uv-dtf",
  "nhan-decal-uv-noi": "decal-uv-dtf",
  "label-warranty-tamper": "decal-tem-be",
  "decal-tem-be": "decal-tem-be",
  "nhan-decal-tem-be": "decal-tem-be",
  "nhan-decal-xi-bac-vang": "nhan-decal-xi-bac",
};

export function toSlug(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveShapeAlias(token?: string | null): string {
  if (!token) return "";
  const cleaned = token.replace(/^#/, "").trim().toLowerCase();
  const slugified = toSlug(cleaned);
  return SHAPE_ALIASES[cleaned] ?? SHAPE_ALIASES[slugified] ?? slugified;
}
