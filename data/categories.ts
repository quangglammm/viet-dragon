// data/categories.ts
// Product category data for the Products/Catalogue section.
// Map over `productCategories` for the parent grid, and `.items` for each
// category's sub-item tag list (pairs well with shadcn `card` + `badge`).

import type { MaterialTraitKey } from "./material-traits";

/**
 * A selectable variant of the product (e.g. a paper stock), rendered as a
 * flashcard on the product detail page. Not paper-specific — reusable for any
 * future per-product option grouping (finish types, size options, etc.).
 */
export interface ProductOption {
  /** lucide-react icon name for the flashcard header. Falls back to a generic layers icon. */
  icon?: string;
  name: string;
  nameVi: string;
  /** Short second-person hook rendered above the flashcard (e.g. "Need a card that stands out?") — helps a customer self-select before reading the bullets. */
  tagline: string;
  taglineVi: string;
  /** Bullet points describing the material's physical characteristics. */
  description: string[];
  descriptionVi: string[];
  /** Trait key per `description` bullet (same index) — looked up in data/material-traits.ts for that bullet's icon. */
  descriptionTraits: MaterialTraitKey[];
  /** Bullet points describing the application contexts this option suits best. */
  bestFor: string[];
  bestForVi: string[];
  /**
   * Optional photo for the flashcard's flip-to-reveal back face (e.g. a shot of
   * this specific paper stock). Falls back to the parent product's `image` when
   * omitted — no distinct per-material photography exists yet.
   */
  image?: string;
  /**
   * Photo of the same stock with no foil accent — shown on the back face when
   * the "Ép kim" (foil stamping) checkbox is unchecked. The foil/double-sided
   * checkboxes are offered on every flashcard regardless of this field; when
   * omitted, checking foil has no back-face image swap and `image` is shown as-is.
   */
  pureImage?: string;
}

/** A row of option flashcards (e.g. the paper-stock choices for a product). */
export interface ProductOptionGroup {
  options: ProductOption[];
}

export interface ProductItem {
  id: string;
  nameEn: string;
  nameVi: string;
  /** English description */
  description: string;
  descriptionVi: string;
  /** Local product photo path, e.g. /images/product/vd-item-card.jpeg */
  image: string;
  /** Optional flashcard groups — reserve this for capability dimensions worth a real use-case summary. */
  optionGroups?: ProductOptionGroup[];
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
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "C300",
                nameVi: "C300 (Chuẩn)",
                tagline: "Need a business card that feels premium and stands out?",
                taglineVi: "Bạn đang cần danh thiếp sang trọng, nổi bật?",
                description: [
                  "Glossy coated surface with sharp, mirror-like light reflections",
                  "Smooth ivory-white base with no visible paper grain",
                  "Gold foil stamping sits crisp and bright against the glossy coat",
                ],
                descriptionVi: [
                  "Bề mặt tráng phủ bóng, phản chiếu ánh sáng rõ nét",
                  "Nền trắng ngà mịn, không lộ vân giấy",
                  "Chi tiết ép kim vàng sắc nét, nổi bật trên nền bóng",
                ],
                descriptionTraits: ["glossy-coat", "smooth-base", "foil-accent"],
                bestFor: [
                  "Premium business cards and invitations built around a foil accent",
                  "Restaurant, hospitality, and luxury event branding",
                  "Logos or monograms meant to catch the light",
                ],
                bestForVi: [
                  "Danh thiếp, thiệp mời cao cấp lấy chi tiết ép kim làm điểm nhấn",
                  "Thương hiệu nhà hàng, khách sạn, sự kiện sang trọng",
                  "Logo hoặc monogram cần bắt sáng, gây ấn tượng",
                ],
                image: "/images/product/vd-card-c300-foil.png",
                pureImage: "/images/product/vd-card-c300-pure.png",
              },
              {
                icon: "Feather",
                name: "Ford 300",
                nameVi: "Ford 300",
                tagline: "Need a minimalist, refined card for everyday work?",
                taglineVi: "Bạn đang cần danh thiếp tối giản, tinh tế cho công việc hằng ngày?",
                description: [
                  "Natural matte surface with a fine, visible paper grain",
                  "Diffused light with no glare or reflection",
                  "Gold foil still stands out, but with a more understated, refined tone",
                ],
                descriptionVi: [
                  "Bề mặt nhám tự nhiên, có vân giấy mịn",
                  "Ánh sáng khuếch tán đều, không chói, không phản quang",
                  "Chi tiết ép kim vàng vẫn nổi bật nhưng mang tông trầm, tinh tế hơn",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Corporate and office cards with a minimalist feel",
                  "Premium brands that want an understated, non-flashy look",
                  "Designs pairing a subtle foil detail with a natural paper base",
                ],
                bestForVi: [
                  "Danh thiếp doanh nghiệp, văn phòng theo phong cách tối giản",
                  "Thương hiệu cao cấp muốn vẻ ngoài tinh tế, không phô trương",
                  "Thiết kế kết hợp chi tiết ép kim tinh giản trên nền giấy tự nhiên",
                ],
                image: "/images/product/vd-card-f300-foil.png",
                pureImage: "/images/product/vd-card-f300-pure.png",
              },
              {
                icon: "Palette",
                name: "Art Paper",
                nameVi: "Giấy Mỹ Thuật",
                tagline: "Need a tactile, artistic card that conveys craftsmanship?",
                taglineVi: "Bạn muốn danh thiếp mang đậm chất nghệ thuật và cảm giác xúc giác đặc biệt?",
                description: [
                  "Distinct textured surface with luxury European art paper feel",
                  "Rich ink absorption that gives colors a deep, matte aesthetic",
                  "Pairs beautifully with minimal typography and foil stamping",
                ],
                descriptionVi: [
                  "Bề mặt có vân giấy đặc trưng, mang lại cảm giác sang trọng khi chạm",
                  "Độ thấm hút mực cao, giúp màu sắc hiển thị sâu và trầm ấm",
                  "Kết hợp tuyệt vời với thiết kế tối giản và ép kim điểm nhấn",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "Creative directors, architects, and luxury boutique brands",
                  "High-end corporate executives seeking a distinctive tactile card",
                  "Minimalist designs where the paper texture itself is the highlight",
                ],
                bestForVi: [
                  "Giám đốc sáng tạo, kiến trúc sư và thương hiệu cao cấp",
                  "Lãnh đạo doanh nghiệp muốn danh thiếp tạo ấn tượng xúc giác khác biệt",
                  "Thiết kế tối giản lấy chính vân giấy làm điểm nhấn chủ đạo",
                ],
                image: "/images/product/vd-card-c300-foil.png",
                pureImage: "/images/product/vd-card-c300-pure.png",
              },
              {
                icon: "Zap",
                name: "Digital Print (Fast)",
                nameVi: "Kỹ Thuật Số (In Nhanh)",
                tagline: "Need high-quality business cards in small quantities or urgent turnaround?",
                taglineVi: "Bạn cần in danh thiếp số lượng ít hoặc cần lấy gấp trong ngày?",
                description: [
                  "High-precision digital laser output with vibrant CMYK accuracy",
                  "Ideal for small batches from 2 boxes without offset setup delay",
                  "Flexible paper stock options including smooth C300 and Ford 300",
                ],
                descriptionVi: [
                  "Công nghệ in kỹ thuật số laser độ phân giải cao, chuẩn màu CMYK",
                  "Phù hợp cho số lượng ít từ 2 hộp mà không cần chờ ghép bài offset",
                  "Tùy chọn đa dạng trên nhiều nền giấy như C300 mịn hoặc Ford 300",
                ],
                descriptionTraits: ["digital-precision", "smooth-base", "soft-light"],
                bestFor: [
                  "Urgent business travel, events, or newly onboarded staff",
                  "Small startups or freelancers needing small quantities",
                  "Testing multiple card designs before mass offset printing",
                ],
                bestForVi: [
                  "Cần gấp cho chuyến công tác, sự kiện hoặc nhân sự mới",
                  "Startup hoặc freelancer cần in số lượng ít, tiết kiệm chi phí",
                  "In thử nhiều mẫu thiết kế trước khi đặt sản xuất offset hàng loạt",
                ],
                image: "/images/product/vd-card-f300-foil.png",
                pureImage: "/images/product/vd-card-f300-pure.png",
              },
              {
                icon: "Sparkles",
                name: "Pearl Metallic Paper",
                nameVi: "Giấy Ngọc Trai",
                tagline: "Want your card to shimmer with a sophisticated pearlescent glow?",
                taglineVi: "Bạn muốn danh thiếp lấp lánh ánh ngọc trai sang trọng dưới ánh sáng?",
                description: [
                  "Infused with metallic mica particles for a radiant pearlescent sheen",
                  "Shifts luminosity and color tone depending on the viewing angle",
                  "Elevates logos and minimalist artwork without needing extra foil",
                ],
                descriptionVi: [
                  "Bề mặt phủ tinh thể vi mica tạo ánh lấp lánh như ngọc trai",
                  "Hiệu ứng chuyển đổi độ sáng và sắc độ tùy thuộc vào góc nhìn",
                  "Tôn vinh logo và thiết kế sang trọng mà không cần thêm ép kim",
                ],
                descriptionTraits: ["metallic-shine", "smooth-base", "soft-light"],
                bestFor: [
                  "Beauty brands, jewelry boutiques, and luxury spas",
                  "VIP membership cards and upscale event invitations",
                  "Brands looking for a radiant, feminine, or opulent aesthetic",
                ],
                bestForVi: [
                  "Thương hiệu mỹ phẩm, trang sức, viện thẩm mỹ và spa cao cấp",
                  "Thẻ thành viên VIP và thiệp mời sự kiện thượng lưu",
                  "Doanh nghiệp hướng tới phong cách sang trọng, tinh tế và rực rỡ",
                ],
                image: "/images/product/vd-card-c300-foil.png",
                pureImage: "/images/product/vd-card-c300-pure.png",
              },
              {
                icon: "Shield",
                name: "Waterproof Plastic Card",
                nameVi: "Giấy Nhựa (Siêu Bền)",
                tagline: "Need an indestructible card that won't tear, wrinkle, or absorb water?",
                taglineVi: "Bạn cần danh thiếp chống nước 100%, không bao giờ rách hay phai màu?",
                description: [
                  "100% waterproof synthetic PVC/PET film that never absorbs moisture",
                  "Ultra-durable and tear-resistant against bending and heavy wear",
                  "Crisp, modern surface with optional frosted or translucent finishes",
                ],
                descriptionVi: [
                  "Chất liệu nhựa PVC/PET tổng hợp chống thấm nước 100%",
                  "Độ bền vượt trội, không thể xé rách hay gấp nếp trong quá trình sử dụng",
                  "Bề mặt hiện đại, sắc nét với tùy chọn trong mờ hoặc trắng sứ",
                ],
                descriptionTraits: ["waterproof-durability", "smooth-base", "glossy-coat"],
                bestFor: [
                  "Hospitality, bars, poolside clubs, and marine industries",
                  "Long-lasting membership, VIP, or warranty cards",
                  "Professionals wanting a unique, conversation-starting material",
                ],
                bestForVi: [
                  "Nhà hàng, quán bar, câu lạc bộ và môi trường thường xuyên tiếp xúc nước",
                  "Thẻ thành viên dài hạn, thẻ VIP hoặc thẻ bảo hành cao cấp",
                  "Khách hàng muốn sở hữu tấm thẻ độc đáo, không bao giờ bị hỏng",
                ],
                image: "/images/product/vd-card-f300-foil.png",
                pureImage: "/images/product/vd-card-f300-pure.png",
              },
              {
                icon: "Layers",
                name: "Embossed / Debossed",
                nameVi: "Dập Nổi / Dập Chìm",
                tagline: "Want your brand emblem to stand out in dramatic 3D relief?",
                taglineVi: "Bạn muốn logo hoặc biểu tượng thương hiệu nổi bật với độ sâu 3D?",
                description: [
                  "Precision die-stamping creates raised (embossed) or recessed (debossed) elements",
                  "Adds sculptural depth and premium tactile emphasis to logos",
                  "Can be combined with foil stamping or left blind for subtle elegance",
                ],
                descriptionVi: [
                  "Kỹ thuật dập khuôn tạo ra chi tiết nổi (emboss) hoặc lõm sâu (deboss)",
                  "Tạo chiều sâu 3D và xúc giác mạnh mẽ cho logo hoặc hoa văn",
                  "Có thể kết hợp cùng ép kim hoặc dập không màu (blind emboss) tinh tế",
                ],
                descriptionTraits: ["embossed-depth", "natural-grain", "foil-accent"],
                bestFor: [
                  "Logos, monograms, and crests on premium business cards",
                  "Architectural, fashion, and luxury interior design firms",
                  "High-impact tactile cards designed to leave an unforgettable impression",
                ],
                bestForVi: [
                  "Logo, monogram, biểu tượng gia tộc trên danh thiếp cao cấp",
                  "Công ty kiến trúc, thời trang và thiết kế nội thất hạng sang",
                  "Danh thiếp tạo điểm nhấn xúc giác mạnh mẽ, khó quên khi trao tay",
                ],
                image: "/images/product/vd-card-c300-foil.png",
                pureImage: "/images/product/vd-card-c300-pure.png",
              },
            ],
          },
        ],
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

export function isFastPrint(id: string): boolean {
  return ["card", "flyer", "voucher", "envelope", "letterhead", "decal", "li-xi"].includes(id);
}

export function getStartingPrice(id: string, locale: string): string {
  const isVi = locale === "vi";
  const prices: Record<string, { vi: string; en: string }> = {
    card: { vi: "Chỉ từ 200.000đ/Hộp", en: "From 200,000đ/Box" },
    folder: { vi: "Chỉ từ 8.000đ/Cái", en: "From 8,000đ/Pcs" },
    catalogue: { vi: "Chỉ từ 25.000đ/Cuốn", en: "From 25,000đ/Book" },
    letterhead: { vi: "Chỉ từ 180.000đ/Ram", en: "From 180,000đ/Ream" },
    envelope: { vi: "Chỉ từ 150.000đ/Hộp", en: "From 150,000đ/Box" },
    "paper-bag": { vi: "Chỉ từ 12.000đ/Túi", en: "From 12,000đ/Bag" },
    box: { vi: "Chỉ từ 15.000đ/Hộp", en: "From 15,000đ/Box" },
    decal: { vi: "Chỉ từ 500đ/Tem", en: "From 500đ/Stamp" },
    "li-xi": { vi: "Chỉ từ 1.500đ/Cái", en: "From 1,500đ/Pcs" },
  };
  const match = prices[id];
  if (match) return isVi ? match.vi : match.en;
  return isVi ? "Nhận báo giá trong 30 phút" : "Get a quote in 30 mins";
}
