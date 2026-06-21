// data/categories.ts
// Product category data for the Products/Catalogue section.
// Map over `productCategories` for the parent grid, and `.items` for each
// category's sub-item tag list (pairs well with shadcn `card` + `badge`).
// Replace coverImage / items[].image with real URLs before launch.

export interface ProductItem {
  id: string;
  nameEn: string;
  nameVi: string;
  description: string;
  /** Placeholder image URL – swap with real product photo */
  image: string;
}

export interface ProductCategory {
  id: string;
  nameEn: string;
  nameVi: string;
  description: string;
  /** lucide-react icon name, for use with shadcn components */
  icon: string;
  /** Hero / cover image for the category page */
  coverImage: string;
  items: ProductItem[];
}

export const productCategories: ProductCategory[] = [
  {
    id: "marketing-collateral",
    nameEn: "Marketing & Brand Collateral",
    nameVi: "Ấn phẩm Marketing & Thương hiệu",
    description:
      "Materials used to present the brand or product to a customer or partner — first-impression and sales-support items.",
    icon: "Briefcase",
    coverImage: "https://picsum.photos/seed/vd-mkt-cover/1200/600",
    items: [
      {
        id: "card",
        nameEn: "Card",
        nameVi: "Danh thiếp / Thẻ",
        description: "Business cards, membership and loyalty cards.",
        image: "https://picsum.photos/seed/vd-item-card/600/400",
      },
      {
        id: "folder",
        nameEn: "Folder",
        nameVi: "Bìa hồ sơ",
        description: "Presentation folders for proposals and press kits.",
        image: "https://picsum.photos/seed/vd-item-folder/600/400",
      },
      {
        id: "catalogue",
        nameEn: "Catalogue",
        nameVi: "Catalogue / Cẩm nang sản phẩm",
        description: "Multi-page product showcases.",
        image: "https://picsum.photos/seed/vd-item-catalogue/600/400",
      },
      {
        id: "brochure",
        nameEn: "Brochure",
        nameVi: "Tờ gấp giới thiệu",
        description: "Folded single-piece company or product introduction.",
        image: "https://picsum.photos/seed/vd-item-brochure/600/400",
      },
    ],
  },
  {
    id: "packaging-carrier",
    nameEn: "Packaging & Carrier Print",
    nameVi: "Bao bì & Vật phẩm vận chuyển",
    description:
      "Items that hold, wrap, mail, or distribute a product or message.",
    icon: "Package",
    coverImage: "https://picsum.photos/seed/vd-pkg-cover/1200/600",
    items: [
      {
        id: "paper-box",
        nameEn: "Paper Box",
        nameVi: "Hộp giấy",
        description: "Retail and gift packaging.",
        image: "https://picsum.photos/seed/vd-item-box/600/400",
      },
      {
        id: "paper-bag",
        nameEn: "Paper Bag",
        nameVi: "Túi giấy",
        description: "Carry-out and shopping bags.",
        image: "https://picsum.photos/seed/vd-item-bag/600/400",
      },
      {
        id: "envelope",
        nameEn: "Envelope",
        nameVi: "Bao thư",
        description: "Document mailing envelopes.",
        image: "https://picsum.photos/seed/vd-item-envelope/600/400",
      },
      {
        id: "flyer",
        nameEn: "Flyer",
        nameVi: "Tờ rơi",
        description: "Single-sheet mass handout or leaflet.",
        image: "https://picsum.photos/seed/vd-item-flyer/600/400",
      },
    ],
  },
  {
    id: "labels-identification",
    nameEn: "Labels & Identification",
    nameVi: "Nhãn mác & Định danh",
    description:
      "Adhesive or attached pieces that identify, seal, or authenticate a product or surface.",
    icon: "Tag",
    coverImage: "https://picsum.photos/seed/vd-lbl-cover/1200/600",
    items: [
      {
        id: "decal",
        nameEn: "Decal",
        nameVi: "Decal các loại",
        description: "Surface and product decals, various types.",
        image: "https://picsum.photos/seed/vd-item-decal/600/400",
      },
      {
        id: "stamp",
        nameEn: "Stamp / Sticker",
        nameVi: "Tem",
        description: "Seals and authentication stickers.",
        image: "https://picsum.photos/seed/vd-item-stamp/600/400",
      },
      {
        id: "label",
        nameEn: "Label",
        nameVi: "Nhãn",
        description: "Product and packaging labels.",
        image: "https://picsum.photos/seed/vd-item-label/600/400",
      },
      {
        id: "tag",
        nameEn: "Tag",
        nameVi: "Mác",
        description: "Hang tags and garment tags.",
        image: "https://picsum.photos/seed/vd-item-tag/600/400",
      },
    ],
  },
  {
    id: "stationery-operational",
    nameEn: "Stationery & Operational Print",
    nameVi: "Văn phòng phẩm & Ấn phẩm vận hành",
    description:
      "Everyday functional print used in daily business operation, internal or customer-facing.",
    icon: "Calendar",
    coverImage: "https://picsum.photos/seed/vd-sta-cover/1200/600",
    items: [
      {
        id: "calendar",
        nameEn: "Calendar",
        nameVi: "Lịch",
        description: "Desk and wall calendars.",
        image: "https://picsum.photos/seed/vd-item-calendar/600/400",
      },
      {
        id: "menu",
        nameEn: "Menu",
        nameVi: "Menu",
        description: "Restaurant and café menus.",
        image: "https://picsum.photos/seed/vd-item-menu/600/400",
      },
      {
        id: "notepad",
        nameEn: "Notepad",
        nameVi: "Note",
        description: "Note pads and sticky notes.",
        image: "https://picsum.photos/seed/vd-item-notepad/600/400",
      },
      {
        id: "form",
        nameEn: "Form",
        nameVi: "Biểu mẫu",
        description: "Internal forms, order sheets, receipts.",
        image: "https://picsum.photos/seed/vd-item-form/600/400",
      },
    ],
  },
];

// Curated showcase images for the /products listing page hero gallery.
// Replace with real printed-product photos before launch.
export const showcaseImages = [
  { seed: "vd-show-1", label: "Danh thiếp cao cấp", labelEn: "Premium Business Cards", aspect: "tall" },
  { seed: "vd-show-2", label: "Hộp giấy sang trọng", labelEn: "Luxury Packaging",       aspect: "square" },
  { seed: "vd-show-3", label: "Catalogue chuyên nghiệp", labelEn: "Professional Catalogue", aspect: "square" },
  { seed: "vd-show-4", label: "Nhãn mác tinh tế",    labelEn: "Premium Labels",         aspect: "wide" },
  { seed: "vd-show-5", label: "Brochure ấn tượng",   labelEn: "Impactful Brochure",     aspect: "wide" },
] as const;
