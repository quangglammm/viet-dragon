// data/categories.ts
// Product category data for the Products/Catalogue section.
// Map over `productCategories` for the parent grid, and `.items` for each
// category's sub-item tag list (pairs well with shadcn `card` + `badge`).
// Replace coverImage / items[].image with real URLs before launch.

export interface ProductItem {
  id: string;
  nameEn: string;
  nameVi: string;
  /** English description */
  description: string;
  descriptionVi: string;
  /** Placeholder image URL – swap with real product photo */
  image: string;
}

export interface ProductCategory {
  id: string;
  nameEn: string;
  nameVi: string;
  /** English description */
  description: string;
  descriptionVi: string;
  /** lucide-react icon name, for use with shadcn components */
  icon: string;
  /** Hero / cover image for the category page */
  coverImage: string;
  items: ProductItem[];
}

export const productCategories: ProductCategory[] = [
  {
    id: "marketing",
    nameEn: "Marketing",
    nameVi: "Tiếp thị",
    description:
      "Materials used to present the brand or product to a customer or partner — first-impression and sales-support items.",
    descriptionVi:
      "Những ấn phẩm giúp giới thiệu thương hiệu hoặc sản phẩm đến khách hàng và đối tác — tạo ấn tượng đầu tiên và hỗ trợ bán hàng.",
    icon: "Briefcase",
    coverImage: "/images/category/vd-mkt-cover.jpg",
    items: [
      {
        id: "card",
        nameEn: "Card",
        nameVi: "Danh thiếp / Thẻ",
        description: "Business cards, membership and loyalty cards.",
        descriptionVi: "Danh thiếp, thẻ thành viên và thẻ tích điểm.",
        image: "/images/product/vd-item-card.jpeg",
      },
      {
        id: "folder",
        nameEn: "Folder",
        nameVi: "Bìa hồ sơ",
        description: "Presentation folders for proposals and press kits.",
        descriptionVi: "Bìa hồ sơ dùng cho bản đề xuất và tài liệu báo chí.",
        image: "/images/product/vd-item-folder.jpeg",
      },
      {
        id: "catalogue",
        nameEn: "Catalogue",
        nameVi: "Catalogue / Cẩm nang sản phẩm",
        description: "Multi-page product showcases.",
        descriptionVi: "Ấn phẩm nhiều trang giới thiệu sản phẩm.",
        image: "/images/product/vd-item-catalogue.jpeg",
      },
      {
        id: "brochure",
        nameEn: "Brochure",
        nameVi: "Tờ gấp giới thiệu",
        description: "Folded single-piece company or product introduction.",
        descriptionVi: "Tờ gấp giới thiệu công ty hoặc sản phẩm.",
        image: "/images/product/vd-item-brochure.jpeg",
      },
    ],
  },
  {
    id: "office",
    nameEn: "Office",
    nameVi: "Văn phòng",
    description:
      "Everyday functional print used in daily business operation, internal or customer-facing.",
    descriptionVi:
      "Ấn phẩm chức năng dùng hằng ngày trong vận hành doanh nghiệp, cả nội bộ lẫn đối ngoại.",
    icon: "Calendar",
    coverImage: "/images/category/vd-sta-cover.jpg",
    items: [
      {
        id: "calendar",
        nameEn: "Calendar",
        nameVi: "Lịch",
        description: "Desk and wall calendars.",
        descriptionVi: "Lịch để bàn và lịch treo tường.",
        image: "/images/product/vd-item-calendar.jpeg",
      },
      {
        id: "menu",
        nameEn: "Menu",
        nameVi: "Menu",
        description: "Restaurant and café menus.",
        descriptionVi: "Menu nhà hàng và quán cà phê.",
        image: "/images/product/vd-item-menu.jpeg",
      },
      {
        id: "notepad",
        nameEn: "Notepad",
        nameVi: "Note",
        description: "Note pads and sticky notes.",
        descriptionVi: "Sổ note và giấy ghi chú.",
        image: "/images/product/vd-item-notepad.jpeg",
      },
      {
        id: "form",
        nameEn: "Form",
        nameVi: "Biểu mẫu",
        description: "Internal forms, order sheets, receipts.",
        descriptionVi: "Biểu mẫu nội bộ, phiếu đặt hàng, biên nhận.",
        image: "/images/product/vd-item-form.jpg",
      },
    ],
  },
  {
    id: "packaging",
    nameEn: "Packaging",
    nameVi: "Bao bì",
    description:
      "Items that hold, wrap, mail, distribute, or identify a product — from boxes and bags to labels and seals.",
    descriptionVi:
      "Những vật phẩm dùng để chứa, bọc, gửi, phân phối hoặc định danh sản phẩm — từ hộp, túi đến nhãn mác và tem.",
    icon: "Package",
    coverImage: "/images/category/vd-pkg-cover.jpg",
    items: [
      {
        id: "paper-box",
        nameEn: "Paper Box",
        nameVi: "Hộp giấy",
        description: "Retail and gift packaging.",
        descriptionVi: "Bao bì bán lẻ và quà tặng.",
        image: "/images/product/vd-item-box.jpg",
      },
      {
        id: "paper-bag",
        nameEn: "Paper Bag",
        nameVi: "Túi giấy",
        description: "Carry-out and shopping bags.",
        descriptionVi: "Túi giấy mang đi và túi mua sắm.",
        image: "/images/product/vd-item-bag.jpeg",
      },
      {
        id: "envelope",
        nameEn: "Envelope",
        nameVi: "Bao thư",
        description: "Document mailing envelopes.",
        descriptionVi: "Bao thư gửi tài liệu.",
        image: "/images/product/vd-item-envelope.jpeg",
      },
      {
        id: "flyer",
        nameEn: "Flyer",
        nameVi: "Tờ rơi",
        description: "Single-sheet mass handout or leaflet.",
        descriptionVi: "Tờ rơi phát hàng loạt, một mặt giấy.",
        image: "/images/product/vd-item-flyer.jpeg",
      },
      {
        id: "decal",
        nameEn: "Decal",
        nameVi: "Decal các loại",
        description: "Surface and product decals, various types.",
        descriptionVi: "Decal bề mặt và sản phẩm, nhiều loại.",
        image: "/images/product/vd-item-decal.jpeg",
      },
      {
        id: "stamp",
        nameEn: "Stamp / Sticker",
        nameVi: "Tem",
        description: "Seals and authentication stickers.",
        descriptionVi: "Tem niêm phong và tem xác thực.",
        image: "/images/product/vd-item-stamp.jpg",
      },
      {
        id: "label",
        nameEn: "Label",
        nameVi: "Nhãn",
        description: "Product and packaging labels.",
        descriptionVi: "Nhãn sản phẩm và bao bì.",
        image: "/images/product/vd-item-label.jpeg",
      },
      {
        id: "tag",
        nameEn: "Tag",
        nameVi: "Mác",
        description: "Hang tags and garment tags.",
        descriptionVi: "Mác treo và mác quần áo.",
        image: "/images/product/vd-item-tag.jpeg",
      },
    ],
  },
  {
    id: "tet",
    nameEn: "Tet Publications",
    nameVi: "Ấn phẩm Tết",
    description:
      "Seasonal Lunar New Year print items — gifting, greeting, and festive packaging for the Tet season.",
    descriptionVi:
      "Ấn phẩm Tết theo mùa — quà tặng, thiệp chúc và bao bì mang không khí ngày Tết.",
    icon: "Gift",
    coverImage: "/images/category/vd-tet-cover.jpg",
    items: [
      {
        id: "li-xi",
        nameEn: "Lucky Money Envelope",
        nameVi: "Bao lì xì",
        description: "Red envelopes for Tet cash gifts, custom-printed with your brand.",
        descriptionVi: "Bao lì xì đỏ dùng để mừng tuổi dịp Tết, in theo yêu cầu với thương hiệu riêng.",
        image: "/images/product/vd-item-lixi.jpeg",
      },
      {
        id: "thiep-tet",
        nameEn: "Tet Greeting Card",
        nameVi: "Thiệp chúc Tết",
        description: "Printed New Year greeting cards for clients and partners.",
        descriptionVi: "Thiệp chúc mừng năm mới gửi đến khách hàng và đối tác.",
        image: "/images/product/vd-item-thieptet.jpg",
      },
      {
        id: "lich-tet",
        nameEn: "Tet Calendar",
        nameVi: "Lịch Tết",
        description: "Desk and wall calendars themed for the Lunar New Year season.",
        descriptionVi: "Lịch để bàn và lịch treo tường mang chủ đề Tết Nguyên Đán.",
        image: "/images/product/vd-item-lichtet.jpg",
      },
      {
        id: "hop-qua-tet",
        nameEn: "Tet Gift Box",
        nameVi: "Hộp quà Tết",
        description: "Festive gift boxes for Tet hampers and corporate gifting.",
        descriptionVi: "Hộp quà mang không khí Tết dùng cho giỏ quà và quà tặng doanh nghiệp.",
        image: "/images/product/vd-item-hopquatet.jpeg",
      },
    ],
  },
];

// Curated showcase images for the /products listing page hero gallery.
// Reuses real product photos whose subject matches the showcase label.
export const showcaseImages = [
  { seed: "vd-show-1", src: "/images/product/vd-item-card.jpeg", label: "Danh thiếp cao cấp", labelEn: "Premium Business Cards", aspect: "tall" },
  { seed: "vd-show-2", src: "/images/product/vd-item-box.jpg", label: "Hộp giấy sang trọng", labelEn: "Luxury Packaging",       aspect: "square" },
  { seed: "vd-show-3", src: "/images/product/vd-item-catalogue.jpeg", label: "Catalogue chuyên nghiệp", labelEn: "Professional Catalogue", aspect: "square" },
  { seed: "vd-show-4", src: "/images/product/vd-item-label.jpeg", label: "Nhãn mác tinh tế",    labelEn: "Premium Labels",         aspect: "wide" },
  { seed: "vd-show-5", src: "/images/product/vd-item-lixi.jpeg", label: "Bao lì xì Tết",       labelEn: "Tet Lucky Envelopes",    aspect: "wide" },
] as const;
