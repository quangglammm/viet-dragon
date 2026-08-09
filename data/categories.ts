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
   * Optional array of photos for the flashcard's flip-to-reveal back face.
   * If provided, will be displayed as a grid on desktop.
   */
  images?: string[];
  /**
   * Photo of the same stock with no foil accent — shown on the back face when
   * the "Ép kim" (foil stamping) checkbox is unchecked. The foil/double-sided
   * checkboxes are offered on every flashcard regardless of this field; when
   * omitted, checking foil has no back-face image swap and `image` is shown as-is.
   */
  pureImage?: string;
  /**
   * Array of photos for the pure stock (no foil).
   */
  pureImages?: string[];
  /** If true, overrides the product-level hideFoilCheckbox setting */
  hideFoilCheckbox?: boolean;
  /** If true, overrides the product-level hideDoubleSidedCheckbox setting */
  hideDoubleSidedCheckbox?: boolean;
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
  image: string;
  images?: string[];
  pureImage?: string;
  pureImages?: string[];
  /** If true, the "Foil Stamping" (Ép kim) checkbox is hidden for all materials of this product */
  hideFoilCheckbox?: boolean;
  /** If true, the "Double Sided" (In 2 mặt) checkbox is hidden for all materials of this product */
  hideDoubleSidedCheckbox?: boolean;
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
        nameVi: "Danh\u00A0thiếp / Thẻ",
        description: "Business cards, membership and loyalty cards.",
        descriptionVi: "Danh thiếp, thẻ thành viên và thẻ tích điểm.",
        image: "/images/product/vd-item-card.jpeg",
        images: [
          "/images/product/vd-item-card.jpeg",
          "/images/product/vd-item-card.jpeg",
          "/images/product/vd-item-card.jpeg",
        ],
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
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-4.webp",
                pureImages: [
                  "/images/product/card-c300-4.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
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
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil5.webp",
                  "/images/product/card-f300-foil4.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
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
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil4.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
              {
                icon: "PenLine",
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
                image: "/images/product/card-digital1.webp",
                images: [
                  "/images/product/card-digital1.webp",
                  "/images/product/card-digital2.webp",
                  "/images/product/card-digital3.webp",
                ],
                hideFoilCheckbox: true,
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
                image: "/images/product/card-pearl1.webp",
                images: [
                  "/images/product/card-pearl1.webp",
                  "/images/product/card-pearl2.webp",
                  "/images/product/card-pearl3.webp",
                ],
                hideFoilCheckbox: true,
              },
              {
                icon: "ShieldCheck",
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
                image: "/images/product/card-plastic1.webp",
                images: [
                  "/images/product/card-plastic1.webp",
                  "/images/product/card-plastic2.webp",
                  "/images/product/card-plastic3.webp",
                ],
                hideFoilCheckbox: true,
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
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
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
        images: [
          "/images/product/vd-item-folder.jpeg",
          "/images/product/vd-item-folder.jpeg",
          "/images/product/vd-item-folder.jpeg",
        ],
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche 300 - 350gsm (Corporate Standard)",
                nameVi: "C300 - C350 Cán Màng (Chuẩn Doanh Nghiệp)",
                tagline: "Need a clean, durable, and highly professional folder for everyday presentations?",
                taglineVi: "Bạn cần bìa hồ sơ chuyên nghiệp, cứng cáp cho các buổi trình bày và họp thầu?",
                description: [
                  "Smooth coated surface with protective matte or glossy lamination",
                  "High paper stiffness that maintains a crisp, structured fold without bending",
                  "Vibrant and accurate CMYK reproduction for brand colors and imagery",
                ],
                descriptionVi: [
                  "Bề mặt tráng phủ mịn, được cán màng mờ hoặc bóng bảo vệ mực in chống trầy",
                  "Độ cứng cao, định hình phom bìa chắc chắn khi cầm tay hoặc kẹp tài liệu",
                  "Hiển thị màu sắc CMYK chuẩn xác, rực rỡ và sắc nét cho bộ nhận diện thương hiệu",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Corporate profile folders, project proposals, and sales kits",
                  "Real estate, finance, and automotive showroom presentations",
                  "Press kits and seminar handouts with business card insertion",
                ],
                bestForVi: [
                  "Hồ sơ năng lực doanh nghiệp, bản đề xuất dự án (Proposal)",
                  "Bộ tài liệu kinh doanh, sales kit ngành bất động sản, tài chính, ô tô",
                  "Bộ press kit họp báo, sự kiện ra mắt sản phẩm tích hợp khe cài danh thiếp",
                ],
                image: "/images/product/card-item-folder-c300-foil1.webp",
                images: [
                  "/images/product/card-item-folder-c300-foil1.webp",
                  "/images/product/card-item-folder-c300-foil4.webp",
                  "/images/product/card-item-folder-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-item-folder-c300-4.webp",
                pureImages: [
                  "/images/product/card-item-folder-c300-4.webp",
                  "/images/product/card-item-folder-c300-5.webp",
                  "/images/product/card-item-folder-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 300gsm (Uncoated Standard)",
                nameVi: "Ford 300gsm (Chuẩn Giấy Mộc)",
                tagline: "Need a natural, writable uncoated folder with a refined corporate tone?",
                taglineVi: "Bạn cần bìa hồ sơ giấy mộc tự nhiên, dễ viết tay và không phản quang?",
                description: [
                  "Natural matte uncoated surface with a fine paper grain",
                  "Diffused light absorption without glare under bright meeting room lights",
                  "Holds shape firmly while allowing hand-written notes or stamps",
                ],
                descriptionVi: [
                  "Bề mặt nhám mộc tự nhiên, không tráng phủ với vân giấy mịn",
                  "Ánh sáng khuếch tán đều, không chói mắt dưới ánh đèn phòng họp",
                  "Độ cứng tốt, đồng thời dễ dàng ký tên, ghi chú hoặc đóng dấu mộc",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Legal, financial, and educational proposal folders",
                  "Brands aiming for an understated, sustainable corporate aesthetic",
                  "Internal executive portfolios and contract folders",
                ],
                bestForVi: [
                  "Hồ sơ đề xuất ngành luật, tài chính, kiểm toán và giáo dục",
                  "Doanh nghiệp hướng đến thẩm mỹ thanh lịch, mộc mạc và bền vững",
                  "Kẹp tài liệu nội bộ cấp cao và bộ hợp đồng khách hàng",
                ],
                image: "/images/product/card-item-folder-ford300-foil1.webp",
                images: [
                  "/images/product/card-item-folder-ford300-foil1.webp",
                  "/images/product/card-item-folder-ford300-foil2.webp",
                  "/images/product/card-item-folder-ford300-foil3.webp",
                ],
                pureImage: "/images/product/card-item-folder-ford300-4.webp",
                pureImages: [
                  "/images/product/card-item-folder-ford300-4.webp",
                  "/images/product/card-item-folder-ford300-5.webp",
                  "/images/product/card-item-folder-ford300-6.webp",
                ],
              },
              {
                icon: "Palette",
                name: "Luxury Art Paper",
                nameVi: "Giấy Mỹ Thuật Cao Cấp",
                tagline: "Want a distinctive, artisan tactile texture that conveys prestige?",
                taglineVi: "Bạn muốn bìa hồ sơ mang đậm tính nghệ thuật, xúc giác cao cấp khi chạm tay?",
                description: [
                  "European textured art paper with subtle tactile grain and matte depth",
                  "Rich, warm ink absorption that gives designs an understated prestige",
                  "Pairs effortlessly with minimalist layouts and metallic foil stamping",
                ],
                descriptionVi: [
                  "Vân giấy mỹ thuật châu Âu đặc trưng, đem lại cảm giác xúc giác sang trọng khi chạm",
                  "Thấm màu mực tự nhiên tạo sắc thái trầm ấm, chiều sâu nghệ thuật cho thiết kế",
                  "Kết hợp hoàn hảo với bố cục tối giản và các chi tiết ép kim điểm nhấn",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "Architects, interior design studios, and creative agencies",
                  "Luxury real estate projects and private banking wealth management kits",
                  "VIP partner gifting and high-level stakeholder presentations",
                ],
                bestForVi: [
                  "Công ty kiến trúc, thiết kế nội thất và studio sáng tạo",
                  "Dự án bất động sản hạng sang, bộ tài liệu dịch vụ ngân hàng riêng (VIP)",
                  "Bộ hồ sơ gửi đối tác cấp cao, nhà đầu tư chiến lược",
                ],
                image: "/images/product/item-folder-art-foil1.webp",
                images: [
                  "/images/product/item-folder-art-foil1.webp",
                  "/images/product/item-folder-art-foil2.webp",
                  "/images/product/item-folder-art-foil3.webp",
                ],
                pureImage: "/images/product/item-folder-art1.webp",
                pureImages: [
                  "/images/product/item-folder-art1.webp",
                  "/images/product/item-folder-art2.webp",
                  "/images/product/item-folder-art3.webp",
                ],
              },
              {
                icon: "Briefcase",
                name: "Double Pocket / Spine Box Folder (5-10mm)",
                nameVi: "Bìa 2 Tay Gấp / Gáy Hộp (5 - 10mm)",
                tagline: "Need to pack comprehensive tender proposals or 20-50 page catalogues?",
                taglineVi: "Bạn cần kẹp bộ hồ sơ thầu công trình hoặc catalogue dày 20 - 50 trang không bị phồng?",
                description: [
                  "5mm to 10mm expandable spine designed specifically for high-capacity document storage",
                  "Dual internal pockets (left & right) with precision die-cut business card slits",
                  "Square-edge architectural fold that stands upright and professional",
                ],
                descriptionVi: [
                  "Thiết kế gáy hộp 5 - 10mm tạo không gian chứa tài liệu dung lượng lớn không cộm",
                  "Trang bị 2 tay gấp bên trái và bên phải cùng khe cấn cài danh thiếp thông minh",
                  "Phom gáy vuông vức, giữ thế đứng vững chắc và chuyên nghiệp trên bàn làm việc",
                ],
                descriptionTraits: ["smooth-base", "waterproof-durability", "embossed-depth"],
                bestFor: [
                  "Major construction, engineering, and government tender proposals",
                  "Comprehensive corporate onboarding manuals and training documentation",
                  "Full-service presentation kits bundling brochures, flyers, and quotations",
                ],
                bestForVi: [
                  "Hồ sơ dự thầu công trình kiến trúc, xây dựng, dự án trọng điểm",
                  "Bộ tài liệu huấn luyện, hướng dẫn hội nhập nhân sự toàn diện",
                  "Bộ sales kit tổng hợp bao gồm catalogue, bảng giá, tờ rơi và danh thiếp",
                ],
                image: "/images/product/item-folder-double-pocket-foil1.webp",
                images: [
                  "/images/product/item-folder-double-pocket-foil1.webp",
                  "/images/product/item-folder-double-pocket-foil2.webp",
                  "/images/product/item-folder-double-pocket-foil3.webp",
                ],
                pureImage: "/images/product/item-folder-double-pocket1.webp",
                pureImages: [
                  "/images/product/item-folder-double-pocket1.webp",
                  "/images/product/item-folder-double-pocket2.webp",
                  "/images/product/item-folder-double-pocket3.webp",
                ],
              },
              {
                icon: "Sparkles",
                name: "Foil Stamping & Spot UV Finish",
                nameVi: "Ép Kim & Phủ UV Định Hình",
                tagline: "Want your emblem to shimmer with gold foil and tactile raised UV accents?",
                taglineVi: "Bạn muốn logo thương hiệu lấp lánh ép kim nhũ vàng và nổi bật với UV định hình 3D?",
                description: [
                  "Metallic foil stamping (gold, silver, copper) applied to logos and headers",
                  "Glossy spot UV coating raises visual motifs against a silky matte background",
                  "Maximum shelf appeal and executive visual impact",
                ],
                descriptionVi: [
                  "Kết hợp ép kim nhũ vàng, nhũ bạc hoặc nhũ đồng cho logo và tiêu đề",
                  "Phủ UV bóng định hình logo hoặc họa tiết tạo độ tương phản cao trên nền cấn màng mờ",
                  "Tạo hiệu ứng thị giác đẳng cấp và nâng tầm giá trị thương hiệu ngay lần đầu chạm",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Luxury hospitality, fine dining, and high-end jewelry brands",
                  "C-suite contract signing ceremonies and VIP brand collateral",
                  "Companies seeking an unforgettable, multi-sensory brand impression",
                ],
                bestForVi: [
                  "Thương hiệu khách sạn 5 sao, nhà hàng cao cấp và trang sức xa xỉ",
                  "Lễ ký kết hợp đồng quan trọng của lãnh đạo cấp cao với đối tác chiến lược",
                  "Doanh nghiệp chú trọng xây dựng hình ảnh thương hiệu đa giác quan, đẳng cấp",
                ],
                image: "/images/product/item-folder-UV-foil1.webp",
                images: [
                  "/images/product/item-folder-UV-foil1.webp",
                  "/images/product/item-folder-UV-foil2.webp",
                  "/images/product/item-folder-UV-foil3.webp",
                ],
                pureImage: "/images/product/item-folder-UV4.webp",
                pureImages: [
                  "/images/product/item-folder-UV4.webp",
                  "/images/product/item-folder-UV2.webp",
                  "/images/product/item-folder-UV3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "catalogue",
        nameEn: "Catalogue",
        nameVi: "Catalogue / Cẩm nang sản phẩm",
        description: "Multi-page product showcases.",
        descriptionVi: "Ấn phẩm nhiều trang giới thiệu sản phẩm.",
        image: "/images/product/vd-item-catalogue.jpeg",
        images: [
          "/images/product/vd-item-catalogue.jpeg",
          "/images/product/vd-item-catalogue.jpeg",
          "/images/product/vd-item-catalogue.jpeg",
        ],
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Saddle-Stitched (C150/C200)",
                nameVi: "Đóng Ghim Giữa (C150/C200)",
                tagline: "Need a lightweight, cost-effective catalogue under 32 pages that opens flat?",
                taglineVi: "Bạn cần in catalogue dưới 32 trang gọn nhẹ, kinh tế và dễ mở phẳng 180 độ?",
                description: [
                  "Precision twin-staple saddle stitching for clean spine alignment",
                  "Sturdy C200/C250 cover paper combined with smooth C150 internal pages",
                  "Opens fully flat at 180 degrees for seamless two-page visual spreads",
                ],
                descriptionVi: [
                  "Quy cách đóng 2 ghim giữa chắc chắn, giữ chuẩn trục giữa các trang",
                  "Bìa giấy C200 - C250 dày dặn kết hợp ruột C150 láng mịn hiển thị màu tốt",
                  "Khả năng lật mở 180 độ phẳng phiu, hoàn hảo cho các trang ảnh trải dài",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Seasonal product lookbooks, project maps, and introductory guides",
                  "Restaurant & cafe dine-in menus and medical spa treatment menus",
                  "Product instruction booklets bundled with equipment or retail boxes",
                ],
                bestForVi: [
                  "Catalogue giới thiệu bộ sưu tập theo mùa, bản đồ mặt bằng dự án",
                  "Menu giới thiệu món ăn nhà hàng, bảng dịch vụ spa & thẩm mỹ viện",
                  "Tài liệu hướng dẫn sử dụng sản phẩm đi kèm thiết bị cao cấp",
                ],
                image: "/images/product/cotalogue-saddle-foil1.webp",
                images: [
                  "/images/product/cotalogue-saddle-foil1.webp",
                  "/images/product/cotalogue-saddle-foil2.webp",
                  "/images/product/cotalogue-saddle-foil3.webp",
                ],
                pureImage: "/images/product/cotalogue-saddle-1.webp",
                pureImages: [
                  "/images/product/cotalogue-saddle-1.webp",
                  "/images/product/cotalogue-saddle-2.webp",
                  "/images/product/cotalogue-saddle-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 120 - 150gsm (Uncoated Interior)",
                nameVi: "Ruột Giấy Ford (Chuẩn Giấy Mộc)",
                tagline: "Want a catalogue with natural uncoated pages that feel calm and readable?",
                taglineVi: "Bạn muốn catalogue ruột giấy mộc tự nhiên, thân thiện mắt đọc và không phản quang?",
                description: [
                  "High-whiteness uncoated Ford paper interior with soft light diffusion",
                  "Zero surface glare under indoor spotlights or sunlight",
                  "Allows handwriting, note-taking, or stamping directly on catalogue pages",
                ],
                descriptionVi: [
                  "Ruột giấy Ford nhám mịn tự nhiên, khuếch tán ánh sáng dịu nhẹ",
                  "Hoàn toàn không phản quang chói sáng dưới ánh đèn hay ánh nắng",
                  "Dễ dàng viết ghi chú, ký tên hoặc đóng dấu mộc lên trang catalogue",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Corporate training handbooks, educational course guides, and manuals",
                  "Art exhibition directories and academic publishing monographs",
                  "Minimalist brands prioritizing an authentic, sustainable reading feel",
                ],
                bestForVi: [
                  "Cẩm nang đào tạo nội bộ, giáo trình khóa học và hướng dẫn kỹ thuật",
                  "Kỷ yếu triển lãm nghệ thuật và các ấn phẩm học thuật cao cấp",
                  "Thương hiệu tối giản chú trọng trải nghiệm đọc tự nhiên, thân thiện",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Award",
                name: "Perfect Bound PUR Spine",
                nameVi: "Dán Gáy Keo Nhiệt PUR",
                tagline: "Need a prestigious 36-200 page catalogue with a crisp, magazine-like square spine?",
                taglineVi: "Bạn cần catalogue dày 36 - 200 trang mang phong cách như sách tạp chí sang trọng?",
                description: [
                  "High-strength PUR hot-melt adhesive binding for a sharp, squared spine",
                  "Protective laminated C300 cover with high-opacity CMYK internal pages",
                  "Maximum durability that prevents page shedding under frequent handling",
                ],
                descriptionVi: [
                  "Kỹ thuật phay gáy dán keo nhiệt PUR siêu bền, tạo dáng gáy vuông vức",
                  "Bìa C300 cán màng mờ/bóng bảo vệ, ruột in màu CMYK chuẩn màu sắc nét",
                  "Độ bền cơ học vượt trội, không bong tróc trang khi lật mở thường xuyên",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Comprehensive corporate product catalogues and industrial price lists",
                  "Corporate annual reports, company profiles, and anniversary books",
                  "Luxury lifestyle magazines, tourism guides, and furniture lookbooks",
                ],
                bestForVi: [
                  "Catalogue tổng hợp toàn bộ danh mục sản phẩm và bảng giá doanh nghiệp",
                  "Báo cáo thường niên (Annual Report), hồ sơ năng lực tập đoàn",
                  "Tạp chí thương hiệu cao cấp, cẩm nang du lịch & thiết kế nội thất",
                ],
                image: "/images/product/vd-item-catalogue.jpeg",
                images: [
                  "/images/product/vd-item-catalogue.jpeg",
                  "/images/product/vd-item-catalogue.jpeg",
                  "/images/product/vd-item-catalogue.jpeg",
                ],
              },
              {
                icon: "StickyNote",
                name: "Wire-O / Twin-Loop Binding (360° Open)",
                nameVi: "Lò Xo Gáy Biểu Mẫu / Mở 360°",
                tagline: "Want a functional catalogue that flips 360 degrees for effortless desk consulting?",
                taglineVi: "Bạn muốn catalogue lật xoay 360 độ tiện lợi khi tra cứu và trao đổi với khách?",
                description: [
                  "Durable double-loop wire binding in black, silver, or white metal",
                  "Allows 360-degree cover and page folding without bending or damaging the spine",
                  "Easy to update or replace individual sections in subsequent print runs",
                ],
                descriptionVi: [
                  "Gáy lò xo kim loại đôi (Wire-O) chắc chắn với màu đen, bạc hoặc trắng",
                  "Cho phép lật gập ngược trang 360 độ tiện lợi mà không làm cộm hay gãy gáy",
                  "Dễ dàng tái cấu trúc hoặc thay đổi số trang trong các đợt sản xuất sau",
                ],
                descriptionTraits: ["smooth-base", "waterproof-durability", "glossy-coat"],
                bestFor: [
                  "Building material swatch books, fabric samples, and paint color guides",
                  "Dine-in restaurant menus with frequently changing seasonal items",
                  "Field sales presentation flip-books and training manuals",
                ],
                bestForVi: [
                  "Catalogue mẫu vật liệu xây dựng, rèm cửa, bảng màu sơn thực tế",
                  "Thực đơn nhà hàng, quán cafe có thể tùy chỉnh món theo mùa",
                  "Sổ tay bán hàng (Sales Flipbook) dành cho nhân viên kinh doanh thực địa",
                ],
                image: "/images/product/vd-item-catalogue.jpeg",
                images: [
                  "/images/product/vd-item-catalogue.jpeg",
                  "/images/product/vd-item-catalogue.jpeg",
                  "/images/product/vd-item-catalogue.jpeg",
                ],
              },
              {
                icon: "Gem",
                name: "Hardcover Portfolio + Foil Stamping",
                nameVi: "Bìa Cứng Bồi Carton + Ép Kim",
                tagline: "Want your catalogue to endure for years as a monumental coffee-table book?",
                taglineVi: "Bạn muốn catalogue trường tồn như một cuốn sách ảnh nghệ thuật (Photobook) đẳng cấp?",
                description: [
                  "2mm to 3mm rigid greyboard hardcover binding for ultimate physical presence",
                  "Combined with metallic foil stamping and spot UV coating on the front cover",
                  "Transforms a standard product catalogue into a permanent reference piece",
                ],
                descriptionVi: [
                  "Bìa cứng bồi carton 2 - 3mm vững chãi, chống va đập và cong vênh tuyệt đối",
                  "Kết hợp gia công ép kim logo và phủ UV định hình họa tiết trên bề mặt bìa",
                  "Biến catalogue thông thường thành cuốn sách trưng bày nghệ thuật vĩnh cửu",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Architectural master plans and luxury resort real estate portfolios",
                  "Corporate 10, 20, or 50-year jubilee commemorative books",
                  "Permanent showroom reference catalogues for VIP lounges",
                ],
                bestForVi: [
                  "Portfolio công trình kiến trúc, bất động sản nghỉ dưỡng hạng sang",
                  "Sách kỷ niệm 10 - 20 - 50 năm thành lập doanh nghiệp, tập đoàn",
                  "Bộ catalogue trưng bày vĩnh cửu tại showroom và phòng tiếp khách VIP",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "brochure",
        nameEn: "Brochure",
        nameVi: "Tờ gấp giới thiệu",
        description: "Folded single-piece company or product introduction.",
        descriptionVi: "Tờ gấp giới thiệu công ty hoặc sản phẩm.",
        image: "/images/product/vd-item-brochure.jpeg",
        images: [
          "/images/product/vd-item-brochure.jpeg",
          "/images/product/vd-item-brochure.jpeg",
          "/images/product/vd-item-brochure.jpeg",
        ],
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Standard Tri-Fold (C200/C250)",
                nameVi: "Tờ Gấp 3 Cán Màng (Tri-Fold)",
                tagline: "Need the most versatile, pocket-friendly brochure format for events and showrooms?",
                taglineVi: "Bạn cần quy cách tờ gấp tiêu chuẩn cho sự kiện, showroom và tiếp thị trực tiếp?",
                description: [
                  "Standard A4 tri-fold layout creating 6 structured panels for storytelling",
                  "Sturdy C200 or C250 paper coated with protective matte or glossy lamination",
                  "Fits perfectly in standard brochure racks, welcome folders, and mailers",
                ],
                descriptionVi: [
                  "Kích thước A4 gấp 3 tạo bố cục 6 trang thông tin khoa học, rành mạch",
                  "Giấy C200 - C250 dày dặn được cán màng mờ hoặc bóng chống nhòe nước",
                  "Phù hợp hoàn hảo với giá đỡ brochure, kẹp hồ sơ và phong bì thư tay",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Real estate introductions, language schools, and training courses",
                  "Trade show handouts, exhibition booths, and retail counter displays",
                  "Healthcare clinics, tourism itineraries, and hotel service menus",
                ],
                bestForVi: [
                  "Tờ gấp giới thiệu dự án bất động sản, khóa học, trung tâm đào tạo",
                  "Tài liệu phát tại triển lãm, hội chợ thương mại, quầy lễ tân showroom",
                  "Brochure dịch vụ y tế, lịch trình du lịch, danh sách dịch vụ khách sạn",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 200 - 250gsm (Uncoated Tri-Fold)",
                nameVi: "Ford 200 - 250gsm (Tờ Gấp Giấy Mộc)",
                tagline: "Need a natural, glare-free brochure that feels authentic and writable?",
                taglineVi: "Bạn muốn tờ gấp giấy mộc tự nhiên, không chói mắt và dễ dàng ghi chú?",
                description: [
                  "Natural matte uncoated Ford paper with authentic tactile warmth",
                  "Zero lamination glare, making small text effortless to read under any lighting",
                  "Allows sales teams or clients to write notes and prices directly on the panels",
                ],
                descriptionVi: [
                  "Bề mặt giấy Ford nhám mịn tự nhiên, mang lại cảm giác mộc mạc và chân thực",
                  "Hoàn toàn không chói sáng, giúp đọc văn bản chữ nhỏ thoải mái dưới mọi nguồn sáng",
                  "Cho phép tư vấn viên hoặc khách hàng ghi chú bảng giá, thông tin trực tiếp lên tờ gấp",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Educational institutions, language centers, and study-abroad consultancies",
                  "Boutique resorts, wellness retreats, and eco-tourism destinations",
                  "Minimalist brands valuing a clean, organic presentation",
                ],
                bestForVi: [
                  "Trường học, trung tâm ngoại ngữ và tư vấn du học",
                  "Khu nghỉ dưỡng boutique, dịch vụ sức khỏe và du lịch sinh thái",
                  "Các thương hiệu tối giản chú trọng thẩm mỹ mộc mạc, tự nhiên",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Award",
                name: "Gate-Fold / 4-Panel Brochure",
                nameVi: "Tờ Gấp 4 Mở Cửa Sổ (Gate-Fold)",
                tagline: "Want to surprise your audience with a dramatic window-opening visual reveal?",
                taglineVi: "Bạn muốn tạo ấn tượng bất ngờ cho người xem bằng thiết kế mở cửa sổ 2 cánh?",
                description: [
                  "Gate-fold mechanism where outer panels open outward to reveal a wide interior",
                  "Creates high excitement and impact for panoramic imagery or master plans",
                  "Stands upright securely on reception desks and lounge tables",
                ],
                descriptionVi: [
                  "Quy cách gấp mở 4 mặt (Gate-fold) tạo không gian khám phá mở rộng bất ngờ",
                  "Bức tranh toàn cảnh khổ lớn được hé lộ đầy ấn tượng khi mở 2 cánh ngoài",
                  "Giữ thế đứng vững chắc khi trưng bày trên bàn khách sạn, quầy lễ tân",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Resort master plans and architectural landscape reveals",
                  "Luxury automobile model launches and yacht interior showcases",
                  "Premium hospitality brochures for 5-star hotel resorts and spas",
                ],
                bestForVi: [
                  "Tờ gấp giới thiệu mặt bằng tổng thể dự án bất động sản, resort nghỉ dưỡng",
                  "Giới thiệu mẫu xe hơi mới, du thuyền, không gian nội thất sang trọng",
                  "Brochure cao cấp giới thiệu chuỗi nhà hàng, khách sạn 5 sao",
                ],
                image: "/images/product/vd-item-brochure.jpeg",
                images: [
                  "/images/product/vd-item-brochure.jpeg",
                  "/images/product/vd-item-brochure.jpeg",
                  "/images/product/vd-item-brochure.jpeg",
                ],
              },
              {
                icon: "PenLine",
                name: "Digital Express Print (Same-Day)",
                nameVi: "In Nhanh KTS (Siêu Tốc Trong Ngày)",
                tagline: "Need a short run of 50-100 brochures delivered urgently for a same-day event?",
                taglineVi: "Bạn cần gấp 50 - 100 tờ brochure phục vụ sự kiện hoặc cuộc họp trong ngày?",
                description: [
                  "High-speed digital laser output with vibrant CMYK accuracy",
                  "Ideal for small batches from 50 copies without offset setup delays",
                  "Flexible paper stock options including smooth C200, C250, and Ford",
                ],
                descriptionVi: [
                  "In kỹ thuật số laser độ phân giải cao, chuẩn màu sắc CMYK sống động",
                  "Đáp ứng số lượng ít từ 50 bản mà không cần chờ ghép bài offset",
                  "Linh hoạt trên nhiều chất liệu giấy C200, C250 hoặc Ford 200",
                ],
                descriptionTraits: ["digital-precision", "smooth-base", "soft-light"],
                bestFor: [
                  "Last-minute PR events, press conferences, and executive travel",
                  "Testing real-world print samples before mass offset production",
                  "Short-term promotional campaigns and pop-up store marketing",
                ],
                bestForVi: [
                  "Sự kiện phát sinh gấp, họp báo, chuyến công tác đột xuất của lãnh đạo",
                  "Doanh nghiệp kiểm tra mẫu thực tế trước khi in sản xuất offset hàng loạt",
                  "Các chương trình ưu đãi ngắn ngày, sự kiện popup store thương mại",
                ],
                image: "/images/product/card-digital1.webp",
                images: [
                  "/images/product/card-digital1.webp",
                  "/images/product/card-digital2.webp",
                  "/images/product/card-digital3.webp",
                ],
                hideFoilCheckbox: true,
              },
              {
                icon: "Sparkles",
                name: "Custom Die-Cut & Foil Accent",
                nameVi: "Bế Hình Đặc Biệt + Ép Kim",
                tagline: "Want a unique silhouette and shimmering metallic logo to break the mold?",
                taglineVi: "Bạn muốn tờ gấp mang hình dáng độc bản và điểm nhấn logo ép kim sáng rực?",
                description: [
                  "Custom die-cutting for curved edges, rounded corners, or peek-through windows",
                  "Metallic foil stamping (gold/silver) highlighting logos on the front panel",
                  "High tactile curiosity that compels potential clients to open and read",
                ],
                descriptionVi: [
                  "Bế khuôn tạo hình dáng độc đáo (bo góc, viền cong, cắt cửa sổ hé lộ)",
                  "Ép kim logo nhũ vàng/bạc tinh tế trên mặt bìa chính thu hút sự chú ý",
                  "Gây ấn tượng mạnh mẽ, kích thích người cầm tò mò mở ra khám phá",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Luxury cosmetics, VIP medical spas, and high-end jewelry boutiques",
                  "Exclusive invitation brochures for VIP product launch events",
                  "Brands aiming to stand out with unconventional, sculptural print marketing",
                ],
                bestForVi: [
                  "Thương hiệu mỹ phẩm, viện thẩm mỹ spa cao cấp, trang sức xa xỉ",
                  "Tờ gấp mời sự kiện ra mắt sản phẩm cao cấp (VIP Launching)",
                  "Các thương hiệu muốn khẳng định sự độc bản, phá cách trong truyền thông",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
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
        images: [
          "/images/product/vd-item-calendar.jpeg",
          "/images/product/vd-item-calendar.jpeg",
          "/images/product/vd-item-calendar.jpeg",
        ],
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "A-Frame Desk Calendar (C230/C250)",
                nameVi: "Lịch Để Bàn Chữ A (C230 - C250)",
                tagline: "Need a practical, year-round corporate desk calendar for clients and staff?",
                taglineVi: "Bạn cần lịch để bàn 13 tờ chuẩn mực làm quà tặng đối tác và nhân viên?",
                description: [
                  "13-sheet A-frame desk calendar printed on smooth C230 or C250 coated paper",
                  "Sturdy rigid cardboard base in dark blue, black, or custom brand colors",
                  "Twin-loop metallic Wire-O binding for smooth page turning",
                ],
                descriptionVi: [
                  "Quy cách 13 tờ (1 tờ bìa + 12 tháng) in trên giấy Couche 230 - 250gsm mịn đẹp",
                  "Đế bìa cứng bồi chắc chắn với màu xanh đen, đen hoặc theo nhận diện riêng",
                  "Lò xo kim loại đôi (Wire-O) siêu bền, lật trang nhẹ nhàng không cộm",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Corporate New Year gifting for clients, vendors, and partners",
                  "Year-round brand visibility on executive office desks",
                  "Employee onboarding and internal company gifts",
                ],
                bestForVi: [
                  "Quà tặng tri ân cuối năm dành cho đối tác, khách hàng và nhà cung cấp",
                  "Tăng độ nhận diện thương hiệu suốt 365 ngày trên bàn làm việc",
                  "Quà tặng nhân viên và ấn phẩm văn phòng nội bộ doanh nghiệp",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 230 - 250gsm (Writable Calendar)",
                nameVi: "Lịch Để Bàn Giấy Ford (Dễ Ghi Chú)",
                tagline: "Want a desk calendar where your team can write appointments and reminders easily?",
                taglineVi: "Bạn muốn lịch để bàn giấy mộc không chói sáng, tiện ghi chú lịch họp hằng ngày?",
                description: [
                  "Uncoated Ford 230-250gsm paper that absorbs pen and pencil notes instantly",
                  "Soft matte surface with zero reflections under office fluorescent lighting",
                  "Clean, minimalist aesthetic that looks professional on executive desks",
                ],
                descriptionVi: [
                  "Giấy Ford 230 - 250gsm không tráng phủ, bám mực bút bi và bút chì cực tốt",
                  "Bề mặt nhám mịn không phản quang, bảo vệ mắt dưới ánh đèn văn phòng",
                  "Phong cách tối giản, chuẩn mực, phù hợp không gian làm việc hiện đại",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Project managers, accountants, and executives who take daily notes",
                  "Academic institutions, law offices, and consulting firms",
                  "Companies desiring a practical, non-glossy desktop organizer",
                ],
                bestForVi: [
                  "Quản lý dự án, kế toán và lãnh đạo thường xuyên ghi chú lịch công tác",
                  "Trường học, văn phòng luật sư và các tổ chức tư vấn chuyên nghiệp",
                  "Doanh nghiệp ưu tiên trải nghiệm tiện dụng, không bóng chói",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Award",
                name: "Wall Calendar 7 / 13 Sheets (Wire-O)",
                nameVi: "Lịch Treo Tường Lò Xo 7 / 13 Tờ",
                tagline: "Need large-format wall calendars to showcase stunning project photography?",
                taglineVi: "Bạn cần lịch treo tường khổ lớn in ảnh công trình hay cảnh quan ấn tượng?",
                description: [
                  "Large-format 7-sheet (bi-monthly) or 13-sheet wall calendar with top wire loop",
                  "High-resolution CMYK lamination preserving vivid photography colors all year",
                  "Strong central hanger loop designed to support large sheet weights without sagging",
                ],
                descriptionVi: [
                  "Lịch treo tường khổ lớn 7 tờ (2 tháng/tờ) hoặc 13 tờ gắn lò xo kim loại trên đỉnh",
                  "In màu CMYK độ phân giải cao, hiển thị hình ảnh công trình và phong cảnh rực rỡ",
                  "Móc treo kim loại chịu lực chắc chắn, giữ lịch thẳng thớm suốt năm",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Construction firms, architecture studios, and real estate developers",
                  "Manufacturing, aviation, and logistics corporate giveaways",
                  "High-impact wall branding in client reception areas and lobbies",
                ],
                bestForVi: [
                  "Công ty xây dựng, kiến trúc và chủ đầu tư dự án bất động sản",
                  "Quà tặng doanh nghiệp ngành sản xuất, hàng không và logistics",
                  "Trang trí và truyền thông thương hiệu tại khu vực lễ tân, phòng khách",
                ],
                image: "/images/product/vd-item-calendar.jpeg",
                images: [
                  "/images/product/vd-item-calendar.jpeg",
                  "/images/product/vd-item-calendar.jpeg",
                  "/images/product/vd-item-calendar.jpeg",
                ],
              },
              {
                icon: "Palette",
                name: "Luxury Art Paper Calendar",
                nameVi: "Lịch Giấy Mỹ Thuật Cao Cấp",
                tagline: "Want a bespoke artisan calendar that feels like an art gallery piece?",
                taglineVi: "Bạn muốn lịch để bàn mang đậm xúc giác nghệ thuật sang trọng như một bộ sưu tập?",
                description: [
                  "Printed on European textured art paper with subtle tactile grain",
                  "Warm, muted ink absorption conveying artisan craftsmanship and exclusivity",
                  "Combined with custom wooden or rigid hardboard stands",
                ],
                descriptionVi: [
                  "In trên giấy mỹ thuật châu Âu có vân nhám đặc trưng, sang trọng khi chạm",
                  "Màu mực thấm tự nhiên tạo sắc thái trầm ấm, tinh tế và độc bản",
                  "Kết hợp hài hòa với đế lịch bằng gỗ tự nhiên hoặc bìa cứng bồi thủ công",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "VIP client gifting, luxury real estate, and private banking wealth management",
                  "Art galleries, museums, and high-end design agencies",
                  "Commemorative corporate anniversary editions",
                ],
                bestForVi: [
                  "Quà tặng tri ân khách hàng VIP, bất động sản hạng sang, ngân hàng riêng",
                  "Gallery nghệ thuật, bảo tàng và các studio thiết kế danh tiếng",
                  "Ấn phẩm kỷ niệm thành lập doanh nghiệp phiên bản giới hạn",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
              {
                icon: "Sparkles",
                name: "Foil Stamped & Embossed Stand",
                nameVi: "Đế Bìa Cứng Ép Kim & Dập Nổi",
                tagline: "Want your brand logo on the calendar stand to gleam in metallic gold or silver?",
                taglineVi: "Bạn muốn logo thương hiệu trên đế lịch lấp lánh ép kim nhũ vàng và dập nổi 3D?",
                description: [
                  "Precision metallic foil stamping applied directly to the rigid calendar base",
                  "Optional 3D embossing creates tactile depth for crests and year titles",
                  "Ensure your corporate identity stands out immediately on any desk",
                ],
                descriptionVi: [
                  "Ép kim nhũ vàng, nhũ bạc hoặc nhũ đồng trực tiếp lên phần chân đế lịch",
                  "Kết hợp dập nổi 3D tạo chiều sâu xúc giác cho logo và con số năm mới",
                  "Đảm bảo thương hiệu nổi bật và đẳng cấp ở vị trí trang trọng nhất",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Top-tier corporate gifting for C-suite partners and investors",
                  "Luxury hotel brands, fine dining groups, and fashion houses",
                  "Companies seeking maximum brand prestige throughout the calendar year",
                ],
                bestForVi: [
                  "Quà tặng đẳng cấp cao nhất dành cho đối tác chiến lược và nhà đầu tư",
                  "Tập đoàn khách sạn, ẩm thực cao cấp và thương hiệu thời trang",
                  "Doanh nghiệp muốn khẳng định vị thế và uy tín thương hiệu suốt cả năm",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "menu",
        nameEn: "Menu",
        nameVi: "Menu",
        description: "Restaurant and café menus.",
        descriptionVi: "Menu nhà hàng và quán cà phê.",
        image: "/images/product/vd-item-menu.jpeg",
        images: [
          "/images/product/vd-item-menu.jpeg",
          "/images/product/vd-item-menu.jpeg",
          "/images/product/vd-item-menu.jpeg",
        ],
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Hardcover Menu (C300 on Rigid Board)",
                nameVi: "Menu Bìa Cứng Bồi Carton (C300)",
                tagline: "Need a durable, upscale hardcover menu that withstands daily restaurant table use?",
                taglineVi: "Bạn cần menu bìa cứng dày dặn, sang trọng và bền bỉ cho nhà hàng?",
                description: [
                  "C300 coated paper laminated and mounted onto 2-3mm rigid greyboard",
                  "Water-resistant matte or glossy film protection against spills and stains",
                  "Substantial physical weight conveying quality and dining standards",
                ],
                descriptionVi: [
                  "Giấy C300 cán màng bảo vệ được bồi chắc chắn lên bìa cứng carton 2 - 3mm",
                  "Cán màng mờ hoặc bóng chống thấm nước, lau chùi vết bẩn dễ dàng",
                  "Độ cầm chắc tay, dày dặn, thể hiện đẳng cấp dịch vụ của nhà hàng",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Full-service restaurants, bistros, and hotel dining rooms",
                  "Wine lists, cocktail menus, and dessert selections",
                  "Establishments requiring a permanent, easy-to-clean table menu",
                ],
                bestForVi: [
                  "Nhà hàng phục vụ món chính, bistro và nhà hàng trong khách sạn",
                  "Menu rượu vang, thực đơn cocktail và danh sách món tráng miệng",
                  "Các cơ sở ẩm thực cần menu trưng bày tại bàn lâu dài, dễ vệ sinh",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 300gsm (Uncoated Artisan Menu)",
                nameVi: "Menu Giấy Ford 300gsm (Mộc Mạc)",
                tagline: "Want a matte, glare-free menu with an authentic artisanal dining atmosphere?",
                taglineVi: "Bạn muốn menu giấy mộc tự nhiên, không chói mắt cho quán cafe hay tiệm bánh?",
                description: [
                  "Uncoated Ford 300gsm paper with soft tactile warmth and zero reflection",
                  "Perfect for rustic, organic, or farm-to-table culinary branding",
                  "Easy to replace seasonally or write daily specials directly on paper",
                ],
                descriptionVi: [
                  "Giấy Ford 300gsm nhám mịn tự nhiên, không phản quang dưới ánh đèn quán",
                  "Hoàn hảo cho phong cách ẩm thực thủ công, organic, tiệm trà và tiệm bánh",
                  "Chi phí tiết kiệm, dễ dàng thay đổi thực đơn theo mùa hoặc theo tuần",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Specialty coffee shops, artisan bakeries, and organic tea rooms",
                  "Seasonal tasting menus and chef's daily recommendation sheets",
                  "Minimalist cafes prioritizing a calm, authentic aesthetic",
                ],
                bestForVi: [
                  "Quán cafe đặc sản, tiệm bánh thủ công và phòng trà organic",
                  "Thực đơn theo mùa hoặc danh sách món đặc biệt hằng ngày của Bếp trưởng",
                  "Quán cafe tối giản chú trọng không gian mộc mạc, tĩnh lặng",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "100% Waterproof Synthetic Plastic Menu",
                nameVi: "Menu Nhựa Tổng Hợp (Chống Nước 100%)",
                tagline: "Need an indestructible menu that won't tear, wrinkle, or absorb liquid spills?",
                taglineVi: "Bạn cần menu chống nước 100%, không bao giờ rách hay phai màu khi rớt nước?",
                description: [
                  "100% waterproof synthetic PVC/PET film that never absorbs moisture or grease",
                  "Ultra-durable and tear-resistant, surviving heavy daily handling",
                  "Crisp, modern colors that can be rinsed or sanitized after every customer",
                ],
                descriptionVi: [
                  "Chất liệu nhựa PVC/PET tổng hợp chống thấm nước và dầu mỡ 100%",
                  "Độ bền vượt trội, không thể xé rách hay gập nếp dưới tần suất sử dụng cao",
                  "Màu in sắc nét, có thể rửa nước hoặc lau cồn vệ sinh thoải mái mỗi ngày",
                ],
                descriptionTraits: ["waterproof-durability", "smooth-base", "glossy-coat"],
                bestFor: [
                  "Poolside bars, beach clubs, seafood restaurants, and hot pot venues",
                  "High-traffic beer gardens, sports bars, and bustling cafes",
                  "Long-term menu investments eliminating reprint costs from water damage",
                ],
                bestForVi: [
                  "Quán bar hồ bơi, nhà hàng bãi biển, hải sản và quán lẩu nướng",
                  "Quán bia ngoài trời, bar thể thao và chuỗi cafe đông khách",
                  "Đầu tư menu sử dụng dài hạn, loại bỏ chi phí in lại do thấm nước hư hỏng",
                ],
                image: "/images/product/card-plastic1.webp",
                images: [
                  "/images/product/card-plastic1.webp",
                  "/images/product/card-plastic2.webp",
                  "/images/product/card-plastic3.webp",
                ],
                hideFoilCheckbox: true,
              },
              {
                icon: "StickyNote",
                name: "Wire-O Bound Multi-Page Menu",
                nameVi: "Menu Lò Xo Gáy Lật Mở Tiện Lợi",
                tagline: "Want a multi-page menu that turns smoothly 360 degrees without jamming?",
                taglineVi: "Bạn muốn menu nhiều trang lật xoay 360 độ nhẹ nhàng, không bị gập gáy?",
                description: [
                  "Sturdy metallic double-loop Wire-O binding for 8 to 40 page menus",
                  "Pages lie completely flat on the table, making ordering effortless",
                  "Allows individual menu leaves to be replaced when prices or dishes change",
                ],
                descriptionVi: [
                  "Gáy lò xo kim loại đôi (Wire-O) chắc chắn cho menu từ 8 đến 40 trang",
                  "Lật mở phẳng 180 độ hoặc gập ngược 360 độ tiện lợi trên bàn ăn",
                  "Cho phép thay thế từng trang thực đơn khi có thay đổi món hoặc giá tiền",
                ],
                descriptionTraits: ["smooth-base", "waterproof-durability", "glossy-coat"],
                bestFor: [
                  "Extensive beverage menus, cocktail bibles, and family restaurant catalogues",
                  "Dessert and ice cream parlors with rich photographic spreads",
                  "Cafes requiring a modular, easy-to-update menu layout",
                ],
                bestForVi: [
                  "Menu tổng hợp thức ăn & nước uống của nhà hàng gia đình, quán ăn lớn",
                  "Thực đơn quán kem, tráng miệng với hình ảnh hấp dẫn trải nhiều trang",
                  "Quán cafe cần quy cách menu linh hoạt, dễ dàng cập nhật từng trang",
                ],
                image: "/images/product/vd-item-menu.jpeg",
                images: [
                  "/images/product/vd-item-menu.jpeg",
                  "/images/product/vd-item-menu.jpeg",
                  "/images/product/vd-item-menu.jpeg",
                ],
              },
              {
                icon: "Sparkles",
                name: "Single-Sheet Laminated Menu + Foil",
                nameVi: "Menu Tờ Đơn Cán Màng + Ép Kim",
                tagline: "Need a chic, rigid single-board menu with shimmering gold foil headers?",
                taglineVi: "Bạn cần menu tờ đơn bồi dày cứng cáp, điểm nhấn ép kim nhũ vàng sang trọng?",
                description: [
                  "Thick 350-400gsm card laminated for stiffness and liquid protection",
                  "Metallic foil stamping applied to restaurant emblems and category titles",
                  "Compact A4, A3, or slim bar-menu formats that look refined in hand",
                ],
                descriptionVi: [
                  "Giấy dày 350 - 400gsm cán màng mờ bảo vệ, cầm cứng cáp, không cong vênh",
                  "Gia công ép kim nhũ vàng/bạc cho logo và tiêu đề thực đơn thu hút ánh nhìn",
                  "Kích thước A4, A3 hoặc khổ dài (bar menu) gọn gàng, tinh tế khi trao tay",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Cocktail lounges, wine bars, and fine dining dessert sheets",
                  "Room service menus for luxury boutique hotels and resorts",
                  "Special holiday set menus (Valentine's, Christmas, Tet feasts)",
                ],
                bestForVi: [
                  "Cocktail lounge, quầy bar rượu vang và thực đơn tráng miệng nhà hàng 5 sao",
                  "Menu phục vụ tại phòng (Room Service) trong các khách sạn, resort cao cấp",
                  "Thực đơn đặc biệt dịp lễ (Valentine, Giáng Sinh, Tiệc Tết Nguyên Đán)",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "notepad",
        nameEn: "Notepad",
        nameVi: "Note",
        description: "Note pads and sticky notes.",
        descriptionVi: "Sổ note và giấy ghi chú.",
        image: "/images/product/vd-item-notepad.jpeg",
        images: [
          "/images/product/vd-item-notepad.jpeg",
          "/images/product/vd-item-notepad.jpeg",
          "/images/product/vd-item-notepad.jpeg",
        ],
        optionGroups: [
          {
            options: [
              {
                icon: "Feather",
                name: "Ford 80 - 100gsm (Standard Writable Interior)",
                nameVi: "Ruột Ford 80 - 100gsm (Chuẩn Sổ Note)",
                tagline: "Need crisp, smooth uncoated pages that make taking daily notes a pleasure?",
                taglineVi: "Bạn cần ruột sổ giấy Ford mịn đẹp, bám mực bút bi và bút máy mượt mà?",
                description: [
                  "High-whiteness uncoated Ford paper with optimal ink absorption",
                  "Zero feathering or bleed-through with gel pens, ballpoints, and pencils",
                  "Lightweight 80-100gsm thickness perfect for 50 to 100 page notepads",
                ],
                descriptionVi: [
                  "Giấy Ford 80 - 100gsm độ trắng cao, bề mặt nhám mịn bám mực tốt",
                  "Không nhòe mực hay thấm xuyên trang khi sử dụng bút bi, bút máy hoặc mực nước",
                  "Định lượng chuẩn mực cho cuốn sổ note từ 50 đến 100 tờ tiện dụng",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Corporate employee stationery, desk pads, and meeting room supplies",
                  "Promotional giveaways at conferences, seminars, and trade shows",
                  "Hotel guest room notepads and front desk reminder blocks",
                ],
                bestForVi: [
                  "Văn phòng phẩm cho nhân viên, sổ ghi chú phòng họp và bàn làm việc",
                  "Quà tặng hội nghị, hội thảo, triển lãm thương mại cho khách mời",
                  "Sổ ghi chú tại phòng khách sạn và quầy lễ tân doanh nghiệp",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Layers",
                name: "Couche 250 - 300gsm Laminated Cover",
                nameVi: "Bìa Couche 250 - 300gsm Cán Màng",
                tagline: "Want a sturdy, colorful promotional notepad cover that protects internal pages?",
                taglineVi: "Bạn muốn bìa sổ note màu sắc sắc nét, cán màng bảo vệ ruột giấy bên trong?",
                description: [
                  "Thick C250 or C300 coated paper cover with protective matte lamination",
                  "Vibrant full-color CMYK printing for company branding and artwork",
                  "Prevents dog-eared corners and liquid splashes on executive desks",
                ],
                descriptionVi: [
                  "Bìa giấy Couche 250 - 300gsm dày dặn được cán màng mờ hoặc bóng bảo vệ",
                  "In màu CMYK tràn viền sắc nét, hiển thị trọn vẹn hình ảnh thương hiệu",
                  "Chống trầy xước, ngăn quăn mép và bảo vệ trang ruột khi để trên bàn",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Branded promotional notepads for sales teams and client giveaways",
                  "Training center course notebooks and seminar study packs",
                  "Corporate anniversary gifts paired with branded pens",
                ],
                bestForVi: [
                  "Sổ note nhận diện thương hiệu cho đội ngũ sales và tặng khách hàng",
                  "Bộ tài liệu học tập của trung tâm đào tạo, lớp huấn luyện nội bộ",
                  "Quà tặng sự kiện, kỷ niệm thành lập doanh nghiệp kèm bút ký",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "StickyNote",
                name: "Wire-O Bound Hardcover Notebook",
                nameVi: "Sổ Note Lò Xo Gáy Bìa Cứng",
                tagline: "Need an executive Wire-O notebook that opens 360 degrees for active note-takers?",
                taglineVi: "Bạn cần sổ note gáy lò xo tiện lợi, lật mở 360 độ cho các cuộc họp quan trọng?",
                description: [
                  "Metallic twin-loop Wire-O binding allowing 360-degree page turning",
                  "Rigid cardboard or C300 cover providing a solid writing surface anywhere",
                  "Includes custom perforated tear-out pages or calendar inserts on request",
                ],
                descriptionVi: [
                  "Gáy lò xo kim loại đôi (Wire-O) chắc chắn, lật mở phẳng 180 độ hoặc gập 360 độ",
                  "Bìa cứng carton hoặc C300 dày dặn, tạo thế tựa vững vàng khi ghi chú đứng",
                  "Có thể tích hợp rãnh xé rời từng trang hoặc chèn lịch năm theo yêu cầu",
                ],
                descriptionTraits: ["smooth-base", "waterproof-durability", "glossy-coat"],
                bestFor: [
                  "Engineers, architects, and field managers requiring on-the-go notebooks",
                  "Executive gifts for partners, attendees, and seminar delegates",
                  "High-end corporate stationery sets for annual staff kickoff events",
                ],
                bestForVi: [
                  "Kỹ sư, kiến trúc sư và quản lý giám sát công trình cần ghi chú thực địa",
                  "Quà tặng cao cấp cho đối tác, đại biểu tham dự hội nghị lớn",
                  "Bộ văn phòng phẩm đồng bộ cho sự kiện khởi động năm mới của công ty",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
              },
              {
                icon: "Award",
                name: "Tear-Off Top Glue Bound Notepad",
                nameVi: "Sổ Note Gáy Keo Xé Từng Tờ",
                tagline: "Need classic tear-off notepads for quick reminders, prescriptions, or forms?",
                taglineVi: "Bạn cần sổ note gáy keo xé rời từng tờ tiện dụng cho văn phòng hoặc bệnh viện?",
                description: [
                  "Flexible EVA glue binding along the top edge for clean sheet detachment",
                  "Sturdy greyboard backing card for structural rigidity during writing",
                  "Ideal for daily task checklists, medical prescriptions, and order slips",
                ],
                descriptionVi: [
                  "Gia công dán keo nhiệt gáy trên đầu, giúp xé rời từng tờ phẳng phiu không rách",
                  "Lót đáy bằng bìa cứng carton giữ cho tập giấy thẳng phẳng khi viết",
                  "Hoàn hảo cho phiếu ghi chú hằng ngày, toa thuốc bệnh viện và phiếu gọi món",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Hospital and clinical prescription pads and appointment reminders",
                  "Office desk to-do lists and inter-departmental note memos",
                  "Cafe server order pads and restaurant ticketing blocks",
                ],
                bestForVi: [
                  "Toa thuốc bệnh viện, phòng khám và phiếu hẹn lịch khám bệnh",
                  "Phiếu ghi chú việc cần làm (To-do list) trên bàn làm việc văn phòng",
                  "Phiếu gọi món của phục vụ nhà hàng, quán cafe",
                ],
                image: "/images/product/vd-item-notepad.jpeg",
                images: [
                  "/images/product/vd-item-notepad.jpeg",
                  "/images/product/vd-item-notepad.jpeg",
                  "/images/product/vd-item-notepad.jpeg",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "Natural Kraft Eco Notepad",
                nameVi: "Sổ Note Bìa Giấy Kraft Tự Nhiên",
                tagline: "Want a sustainable, vintage-style notepad with a distinctive rustic charm?",
                taglineVi: "Bạn muốn sổ note mang phong cách mộc mạc, xanh và thân thiện môi trường?",
                description: [
                  "Cover printed on 250-300gsm recycled brown Kraft paper",
                  "Interior pages available in warm cream Ford or natural recycled stock",
                  "Communicates environmental responsibility and minimalist design taste",
                ],
                descriptionVi: [
                  "Bìa in trên giấy Kraft nâu tự nhiên tái chế định lượng 250 - 300gsm",
                  "Ruột giấy Ford kem ấm áp hoặc giấy tái chế thân thiện môi trường",
                  "Khẳng định trách nhiệm bảo vệ môi trường và thẩm mỹ tối giản, tinh tế",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Eco-friendly brands, organic grocery stores, and green energy firms",
                  "Sustainable workshops, craft fairs, and design studio giveaways",
                  "Universities and NGOs promoting environmental awareness campaigns",
                ],
                bestForVi: [
                  "Thương hiệu xanh, thực phẩm hữu cơ và doanh nghiệp năng lượng sạch",
                  "Workshop thủ công, hội chợ xanh và quà tặng từ các studio sáng tạo",
                  "Trường đại học, tổ chức phi chính phủ trong các chiến dịch môi trường",
                ],
                image: "/images/product/vd-card-f300.png",
                images: [
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "form",
        nameEn: "Form",
        nameVi: "Biểu mẫu",
        description: "Internal forms, order sheets, receipts.",
        descriptionVi: "Biểu mẫu nội bộ, phiếu đặt hàng, biên nhận.",
        image: "/images/product/vd-item-form.jpg",
        images: [
          "/images/product/vd-item-form.jpg",
          "/images/product/vd-item-form.jpg",
          "/images/product/vd-item-form.jpg",
        ],
        hideFoilCheckbox: true,
        hideDoubleSidedCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Feather",
                name: "Ford 70 - 80gsm (Single-Sheet Form)",
                nameVi: "Giấy Ford 70 - 80gsm (1 Liên)",
                tagline: "Need clean, standard single-sheet business forms for daily accounting and orders?",
                taglineVi: "Bạn cần in biểu mẫu 1 liên giấy Ford chuẩn mực cho phiếu chi, hóa đơn nội bộ?",
                description: [
                  "High-whiteness uncoated Ford 70-80gsm paper for sharp pen handwriting",
                  "Compatible with office stamps, dot-matrix, and inkjet printers",
                  "Cost-effective solution for single-sheet records and internal handovers",
                ],
                descriptionVi: [
                  "Giấy Ford 70 - 80gsm độ trắng sáng cao, viết tay mượt mà không nhòe",
                  "Phù hợp để đóng dấu mộc văn phòng, in thêm nội dung bằng máy in văn phòng",
                  "Giải pháp tối ưu chi phí cho các chứng từ, phiếu xuất nhập kho 1 liên",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Internal payment vouchers, receipt slips, and petty cash forms",
                  "Medical laboratory requisition sheets and patient consent forms",
                  "Standard order blanks and inventory check-off sheets",
                ],
                bestForVi: [
                  "Phiếu thu chi nội bộ, biên nhận tiền và phiếu tạm ứng văn phòng",
                  "Phiếu chỉ định xét nghiệm bệnh viện, giấy cam kết khám chữa bệnh",
                  "Phiếu đặt hàng tiêu chuẩn và bảng kiểm kê hàng hóa kho bãi",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Layers",
                name: "Carbonless Paper (2 - 3 Ply Auto-Copy)",
                nameVi: "Giấy Carbonless (2 - 3 Liên Tự In)",
                tagline: "Need multi-ply carbonless forms that transfer signatures cleanly without carbon paper?",
                taglineVi: "Bạn cần biểu mẫu 2 - 3 liên tự in mực khi viết tay mà không cần giấy than?",
                description: [
                  "Premium carbonless NCR paper in white, pink, yellow, and blue plies",
                  "Transfers pen pressure clearly to lower plies without messy carbon sheets",
                  "Essential for sales receipts, delivery dockets, and multi-department records",
                ],
                descriptionVi: [
                  "Giấy NCR Carbonless chất lượng cao với các màu: Trắng, Hồng, Vàng, Xanh dương",
                  "Tự động in mực sắc nét xuống các liên dưới khi viết tay mà không cần giấy than",
                  "Giải pháp bắt buộc cho hóa đơn bán lẻ, phiếu giao hàng và chứng từ nhiều liên",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Sales receipts, tax invoices, and retail order slips (2 or 3 plies)",
                  "Warehouse delivery orders, transport waybills, and packing lists",
                  "Hospital billing forms and clinical test result handover slips",
                ],
                bestForVi: [
                  "Hóa đơn bán lẻ, hóa đơn xuất kho và phiếu đặt hàng (2 hoặc 3 liên)",
                  "Phiếu giao hàng kho bãi, vận đơn vận tải và phiếu kiểm tra đóng gói",
                  "Phiếu thanh toán viện phí và phiếu trả kết quả xét nghiệm bệnh viện",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
                hideFoilCheckbox: true,
              },
              {
                icon: "Award",
                name: "Perforated Tear-Off Book Binding",
                nameVi: "Biểu Mẫu Đóng Cuốn Rãnh Xé",
                tagline: "Want forms bound neatly into books with micro-perforation for clean tearing?",
                taglineVi: "Bạn muốn biểu mẫu đóng cuốn chắc chắn, cấn rãnh xé răng cưa phẳng phiu?",
                description: [
                  "Bound into 50 or 100 set books with protective kraft paper covers",
                  "Precision micro-perforation line allows clean tearing of client copies",
                  "Spine stapled and taped securely to keep archival copies intact",
                ],
                descriptionVi: [
                  "Đóng thành cuốn 50 hoặc 100 bộ với bìa giấy kraft hoặc giấy bìa bảo vệ",
                  "Đường cấn răng cưa siêu mịn giúp xé rời liên khách hàng dễ dàng, thẳng thớm",
                  "Gáy bấm ghim dán băng keo chắc chắn, giữ liên lưu trữ nội bộ an toàn",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Retail store cashier receipt books and field service order books",
                  "Logistics driver delivery proof books and transport log sheets",
                  "Property management rent collection books and maintenance slips",
                ],
                bestForVi: [
                  "Sổ biên nhận bán hàng tại cửa hàng và phiếu đặt dịch vụ thực địa",
                  "Sổ xác nhận giao hàng của tài xế logistics và nhật ký vận chuyển",
                  "Sổ thu tiền thuê nhà, phí quản lý tòa nhà và phiếu bảo trì kỹ thuật",
                ],
                image: "/images/product/vd-item-form.jpg",
                images: [
                  "/images/product/vd-item-form.jpg",
                  "/images/product/vd-item-form.jpg",
                  "/images/product/vd-item-form.jpg",
                ],
              },
              {
                icon: "StickyNote",
                name: "Sequential Numbering & Perforation",
                nameVi: "Đánh Số Nhảy & Rãnh Răng Cưa",
                tagline: "Need automated sequential numbering to prevent fraud and simplify accounting?",
                taglineVi: "Bạn cần đóng số nhảy tự động để kiểm soát chứng từ và chống thất thoát?",
                description: [
                  "Precision red ink sequential serial numbering (e.g., No. 000001 - 001000)",
                  "Crucial for financial auditing, inventory control, and legal traceability",
                  "Can be combined with multi-ply carbonless paper and perforation lines",
                ],
                descriptionVi: [
                  "Đóng số nhảy serial tự động màu đỏ chuẩn xác (Ví dụ: Số 000001 - 001000)",
                  "Yếu tố then chốt để kiểm toán tài chính, quản lý kho và truy xuất trách nhiệm",
                  "Kết hợp hoàn hảo cùng giấy carbonless nhiều liên và rãnh xé răng cưa",
                ],
                descriptionTraits: ["smooth-base", "waterproof-durability", "glossy-coat"],
                bestFor: [
                  "Official corporate tax invoices and fiscal transaction receipts",
                  "Event ticketing blocks, lottery vouchers, and parking control slips",
                  "Strictly audited hospital medical records and laboratory numbering",
                ],
                bestForVi: [
                  "Hóa đơn chứng từ tài chính, thu chi chính thức của doanh nghiệp",
                  "Vé tham dự sự kiện, phiếu bốc thăm trúng thưởng và vé gửi xe tự quản",
                  "Hồ sơ bệnh án kiểm soát nghiêm ngặt và mã số xét nghiệm bệnh viện",
                ],
                image: "/images/product/vd-item-form.jpg",
                images: [
                  "/images/product/vd-item-form.jpg",
                  "/images/product/vd-item-form.jpg",
                  "/images/product/vd-item-form.jpg",
                ],
              },
              {
                icon: "PenLine",
                name: "Express Digital Same-Day Form Print",
                nameVi: "In Nhanh KTS Biểu Mẫu Lấy Ngay",
                tagline: "Need an urgent batch of 10-20 receipt books printed today for a new branch?",
                taglineVi: "Bạn cần in gấp 10 - 20 cuốn biểu mẫu lấy ngay trong ngày cho chi nhánh mới?",
                description: [
                  "High-speed digital laser output for urgent single or multi-ply forms",
                  "Ideal for emergency supply shortages or pop-up event registrations",
                  "Delivered bound, numbered, and perforated within hours of artwork approval",
                ],
                descriptionVi: [
                  "In kỹ thuật số tốc độ cao cho biểu mẫu 1 liên hoặc carbonless nhiều liên",
                  "Giải pháp cứu cánh khi hết chứng từ đột xuất hoặc sự kiện popup ngắn ngày",
                  "Hoàn thiện đóng cuốn, cấn rãnh xé và số nhảy nhanh chóng trong vài giờ",
                ],
                descriptionTraits: ["digital-precision", "smooth-base", "soft-light"],
                bestFor: [
                  "Newly opened retail branches needing immediate receipt books",
                  "Emergency restocking when standard offset supply is delayed",
                  "Temporary exhibition booths and short-term promotional pop-ups",
                ],
                bestForVi: [
                  "Chi nhánh, cửa hàng mới khai trương cần ngay sổ biên nhận giao dịch",
                  "Bổ sung chứng từ khẩn cấp khi chờ đơn hàng in offset số lượng lớn",
                  "Gian hàng hội chợ triển lãm và các sự kiện thương mại ngắn ngày",
                ],
                image: "/images/product/card-digital1.webp",
                images: [
                  "/images/product/card-digital1.webp",
                  "/images/product/card-digital2.webp",
                  "/images/product/card-digital3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
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
        images: [
          "/images/product/vd-item-box.jpg",
          "/images/product/vd-item-box.jpg",
          "/images/product/vd-item-box.jpg",
        ],
        hideDoubleSidedCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche 300 - 350gsm (Laminated Box)",
                nameVi: "Couche 300 - 350gsm (Hộp Cán Màng)",
                tagline: "Need vibrant, full-color retail packaging that protects your product on shelves?",
                taglineVi: "Bạn cần hộp giấy màu sắc rực rỡ, cán màng chống trầy cho sản phẩm bán lẻ?",
                description: [
                  "Smooth coated C300 or C350 paper with protective matte or glossy lamination",
                  "Vibrant full-color CMYK reproduction for photographic product imagery",
                  "Ideal folding carton structure for retail display and consumer goods",
                ],
                descriptionVi: [
                  "Giấy Couche 300 - 350gsm tráng phủ mịn, cán màng mờ hoặc bóng bảo vệ",
                  "In màu CMYK rực rỡ, hiển thị hình ảnh sản phẩm và đồ họa bắt mắt",
                  "Quy cách hộp gấp tiện lợi, chuẩn mực cho quầy kệ trưng bày bán lẻ",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Cosmetics, skincare creams, and perfume retail packaging",
                  "Consumer electronics, accessories, and tech gadget boxes",
                  "Food supplements, confectionery, and specialty retail goods",
                ],
                bestForVi: [
                  "Hộp bao bì mỹ phẩm, kem dưỡng da, nước hoa trưng bày kệ bán lẻ",
                  "Hộp đựng phụ kiện công nghệ, thiết bị điện tử tiêu dùng",
                  "Hộp thực phẩm chức năng, bánh kẹo và hàng tiêu dùng cao cấp",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "Ivory 300 - 350gsm (Pharma & Luxury Standard)",
                nameVi: "Ivory 300 - 350gsm (Siêu Cứng & Chuẩn Dược)",
                tagline: "Need maximum box rigidity and crisp high-white cleanliness for pharma or luxury?",
                taglineVi: "Bạn cần hộp giấy siêu cứng, độ trắng cao chuẩn mực cho dược phẩm hay quà tặng?",
                description: [
                  "Bright-white coated exterior with a clean, natural uncoated interior",
                  "Superior stiffness and tear resistance that prevents structural crushing",
                  "Holds complex die-cut locks, tuck flaps, and foil stamping beautifully",
                ],
                descriptionVi: [
                  "Mặt ngoài trắng mịn tráng phủ cao cấp, mặt trong trắng sạch tự nhiên",
                  "Độ dai và cứng vượt trội, chịu lực tốt, không bị bóp méo khi đóng gói",
                  "Giữ phom khóa đáy, nắp gài chuẩn xác, bắt nhũ ép kim cực kỳ sắc nét",
                ],
                descriptionTraits: ["smooth-base", "natural-grain", "foil-accent"],
                bestFor: [
                  "Pharmaceutical medicine boxes, clinical supplies, and healthcare goods",
                  "Premium cosmetic serums, facial kits, and luxury beauty packaging",
                  "High-end corporate gift sets requiring structural integrity",
                ],
                bestForVi: [
                  "Hộp thuốc dược phẩm, thiết bị y tế và sản phẩm chăm sóc sức khỏe",
                  "Hộp mỹ phẩm serum cao cấp, bộ sản phẩm làm đẹp sang trọng",
                  "Hộp quà tặng doanh nghiệp yêu cầu phom hộp vững chãi, đứng dáng",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Award",
                name: "E-Flute Corrugated Board (Bồi Sóng E)",
                nameVi: "Couche Bồi Carton Sóng E / Sóng B",
                tagline: "Need extra shock-proof protection for heavier items or e-commerce shipping?",
                taglineVi: "Bạn cần hộp bồi sóng cứng cáp chịu lực va đập khi gửi hàng chuyển phát nhanh?",
                description: [
                  "Laminated C250/C300 printed sheet mounted onto strong E-flute corrugated cardboard",
                  "Provides superior cushioning and compression resistance during transit",
                  "Combines high-definition retail print quality with shipping box ruggedness",
                ],
                descriptionVi: [
                  "Giấy Couche in màu sắc nét được bồi lên lớp carton sóng E hoặc sóng B cứng cáp",
                  "Khả năng chống va đập, chịu lực đè nén vượt trội trong quá trình vận chuyển",
                  "Kết hợp hoàn hảo giữa thẩm mỹ in ấn bán lẻ và độ bền của hộp bảo vệ",
                ],
                descriptionTraits: ["smooth-base", "waterproof-durability", "glossy-coat"],
                bestFor: [
                  "E-commerce subscription boxes and courier shipping mailers",
                  "Heavy glass bottles, wine, ceramics, and electronic appliances",
                  "Fruit gift boxes, agricultural exports, and bulk retail packs",
                ],
                bestForVi: [
                  "Hộp ship COD thương mại điện tử, hộp quà gửi chuyển phát nhanh",
                  "Hộp đựng chai lọ thủy tinh nặng, rượu vang, gốm sứ và thiết bị điện",
                  "Hộp quà trái cây, nông sản xuất khẩu và giỏ quà thực phẩm",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Natural Kraft 250 - 350gsm (Eco-Box)",
                nameVi: "Hộp Giấy Kraft Nâu Tự Nhiên (Eco-Box)",
                tagline: "Want sustainable, rustic packaging that appeals to eco-conscious consumers?",
                taglineVi: "Bạn muốn bao bì hộp giấy mộc mạc, thân thiện môi trường cho sản phẩm xanh?",
                description: [
                  "100% recycled natural brown Kraft paper with organic tactile texture",
                  "High tear resistance and authentic artisan visual warmth",
                  "Looks exceptional with minimalist black ink, white ink, or foil stamping",
                ],
                descriptionVi: [
                  "Giấy Kraft nâu tự nhiên tái chế 100% với vân xơ giấy mộc mạc, chân thực",
                  "Độ dai cao, mang lại thiện cảm thẩm mỹ thân thiện, bảo vệ môi trường",
                  "Hiệu ứng thị giác ấn tượng khi in đơn sắc đen, in mực trắng hoặc ép kim",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Organic soaps, handmade cosmetics, and natural skincare bars",
                  "Artisan tea, roasted coffee beans, and dried herbal products",
                  "Sustainable fashion accessories and eco-friendly home goods",
                ],
                bestForVi: [
                  "Hộp xà phòng hữu cơ, mỹ phẩm handmade và sản phẩm thiên nhiên",
                  "Hộp trà thảo mộc, cà phê rang xay và đặc sản nông sản khô",
                  "Hộp đựng phụ kiện thời trang xanh và đồ gia dụng thân thiện môi trường",
                ],
                image: "/images/product/vd-card-f300.png",
                images: [
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                ],
              },
              {
                icon: "Gem",
                name: "Rigid Hardcover Gift Box (Bồi Carton 2mm)",
                nameVi: "Hộp Cứng Cao Cấp (Bồi Carton 2mm)",
                tagline: "Want a luxurious rigid gift box that creates an unforgettable unboxing moment?",
                taglineVi: "Bạn muốn hộp quà cứng cao cấp tạo trải nghiệm mở hộp đẳng cấp khó quên?",
                description: [
                  "2mm to 3mm rigid greyboard wrapped in printed C150 paper or luxury art paper",
                  "Available in magnetic closure, lift-off lid, or sliding drawer box styles",
                  "Enhanced with hot foil stamping, embossing, and custom velvet/EVA inserts",
                ],
                descriptionVi: [
                  "Carton lạnh dày 2 - 3mm bồi giấy Couche in màu hoặc giấy mỹ thuật xa xỉ",
                  "Quy cách hộp nam châm nắp gập, hộp âm dương hoặc hộp kéo bao diêm sang trọng",
                  "Tích hợp ép kim nhũ vàng, dập nổi logo và khay mút lót nhung bảo vệ sản phẩm",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "VIP corporate Tet gift hampers and Mid-Autumn mooncake boxes",
                  "High-end spirits, vintage wine, and premium jewelry boxes",
                  "Luxury cosmetics gift sets and VIP commemorative watches",
                ],
                bestForVi: [
                  "Hộp quà Tết doanh nghiệp VIP và bộ hộp bánh trung thu cao cấp",
                  "Hộp rượu ngoại sang trọng, yến sào và trang sức giá trị cao",
                  "Bộ hộp quà mỹ phẩm giới hạn và đồng hồ kỷ niệm cho đại biểu",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "paper-bag",
        nameEn: "Paper Bag",
        nameVi: "Túi giấy",
        description: "Carry-out and shopping bags.",
        descriptionVi: "Túi giấy mang đi và túi mua sắm.",
        image: "/images/product/vd-item-bag.jpeg",
        images: [
          "/images/product/vd-item-bag.jpeg",
          "/images/product/vd-item-bag.jpeg",
          "/images/product/vd-item-bag.jpeg",
        ],
        hideDoubleSidedCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche 250 - 300gsm (Laminated Shopping Bag)",
                nameVi: "Couche 250 - 300gsm Cán Màng (Túi Shopping)",
                tagline: "Need vibrant, waterproof shopping bags that showcase your retail brand everywhere?",
                taglineVi: "Bạn cần túi shopping màu sắc sắc nét, cán màng chống thấm cho cửa hàng bán lẻ?",
                description: [
                  "C250 or C300 coated paper laminated matte or glossy for extra carrying strength",
                  "Full-bleed CMYK color printing that makes logos and brand patterns stand out",
                  "Reinforced top fold and cardboard bottom insert to carry heavy weights securely",
                ],
                descriptionVi: [
                  "Giấy Couche 250 - 300gsm dày dặn được cán màng mờ hoặc bóng gia tăng độ dai",
                  "In màu CMYK tràn viền rực rỡ, hiển thị trọn vẹn logo và họa tiết thương hiệu",
                  "Gia cố nắp gấp và lót đáy bằng bìa cứng, chịu lực xách nặng không rách đáy",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Fashion boutiques, clothing brands, and shoe retail stores",
                  "Cosmetics, perfume counters, and beauty gift packaging",
                  "Corporate event giveaways and trade show attendee gift bags",
                ],
                bestForVi: [
                  "Cửa hàng thời trang, shop quần áo, giày dép và phụ kiện bán lẻ",
                  "Showroom mỹ phẩm, nước hoa và túi đựng quà làm đẹp cao cấp",
                  "Túi phát tài liệu, quà tặng sự kiện hội nghị và triển lãm doanh nghiệp",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "Ivory 250 - 300gsm (Rigid Luxury Bag)",
                nameVi: "Ivory 250 - 300gsm (Siêu Cứng & Dai)",
                tagline: "Need maximum bag rigidity and a crisp high-white look for luxury gifts?",
                taglineVi: "Bạn cần túi giấy siêu bền, độ cứng cao và mặt trắng mịn cho quà tặng VIP?",
                description: [
                  "Bright-white coated exterior with high tensile strength and tear resistance",
                  "Maintains a structured, upright shape without wrinkling during carrying",
                  "Holds hot foil stamping and embossed brand crests with exceptional sharpness",
                ],
                descriptionVi: [
                  "Mặt ngoài trắng mịn tráng phủ cao cấp, độ dai và chịu lực kéo vượt trội",
                  "Giữ phom túi vuông vức, đứng dáng, không bị nhăn nhúm trong quá trình xách",
                  "Khả năng bắt nhũ ép kim và dập nổi logo cực kỳ sắc nét, sang trọng",
                ],
                descriptionTraits: ["smooth-base", "natural-grain", "foil-accent"],
                bestFor: [
                  "Luxury jewelry boutiques, Swiss watches, and high-end fashion",
                  "Pharmaceutical corporate gifting and premium healthcare hampers",
                  "C-suite executive gift bags for VIP partner conferences",
                ],
                bestForVi: [
                  "Thương hiệu trang sức xa xỉ, đồng hồ và thời trang hàng hiệu",
                  "Túi quà tặng dược phẩm, y tế cao cấp và quà biếu tập đoàn",
                  "Túi xách quà tặng VIP trong các hội nghị đối tác chiến lược",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Natural Kraft 180 - 250gsm (Eco-Bag)",
                nameVi: "Giấy Kraft Nâu / Trắng Tự Nhiên (Eco-Bag)",
                tagline: "Want eco-friendly carry bags that signal your sustainability commitment?",
                taglineVi: "Bạn muốn túi giấy xanh, thân thiện môi trường cho nhà hàng hoặc cửa hàng?",
                description: [
                  "100% recycled natural brown or bleached white Kraft paper",
                  "High wood-fiber tensile strength with twisted paper or cotton rope handles",
                  "Biodegradable material looking authentic with minimalist ink or foil branding",
                ],
                descriptionVi: [
                  "Giấy Kraft nâu tự nhiên hoặc Kraft trắng tái chế 100% thân thiện môi trường",
                  "Độ dai xơ giấy cao, kết hợp quai dây giấy xoắn hoặc quai cotton mộc mạc",
                  "Dễ phân hủy hữu cơ, thẩm mỹ ấn tượng khi in logo đơn sắc hoặc ép kim",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Artisan bakeries, specialty coffee shops, and organic food takeaways",
                  "Sustainable clothing brands and eco-friendly cosmetics boutiques",
                  "Corporate CSR campaigns and environmental conference gift bags",
                ],
                bestForVi: [
                  "Tiệm bánh thủ công, cafe mang đi và chuỗi thực phẩm hữu cơ",
                  "Thương hiệu thời trang bền vững, cửa hàng mỹ phẩm thiên nhiên",
                  "Túi quà trong các chiến dịch xanh và hội thảo bảo vệ môi trường",
                ],
                image: "/images/product/vd-card-f300.png",
                images: [
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                ],
              },
              {
                icon: "Palette",
                name: "Luxury Textured Art Paper Bag",
                nameVi: "Giấy Mỹ Thuật Nhám Cao Cấp",
                tagline: "Want a bespoke artisan shopping bag that feels like a collector's item?",
                taglineVi: "Bạn muốn túi giấy mang đậm xúc giác nghệ thuật châu Âu khác biệt khi chạm?",
                description: [
                  "Printed on European textured art paper with tactile surface grain",
                  "Rich, understated matte colors conveying boutique craftsmanship",
                  "Paired with satin ribbon, grosgrain, or braided cotton handles",
                ],
                descriptionVi: [
                  "In trên giấy mỹ thuật châu Âu có vân nhám đặc trưng, cảm giác chạm xa xỉ",
                  "Màu sắc trầm ấm, tĩnh lặng, tôn vinh giá trị thủ công cao cấp của thương hiệu",
                  "Kết hợp quai dây lụa satin, ruy băng gân hoặc dây cotton tết thủ công",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "Haute couture fashion houses, bespoke tailors, and luxury bridal salons",
                  "High-end art galleries, museums, and architectural firms",
                  "Exclusive VIP client gifting packages and holiday luxury sets",
                ],
                bestForVi: [
                  "Thương hiệu thời trang xa xỉ, tiệm may đo cao cấp và salon áo cưới",
                  "Gallery nghệ thuật, bảo tàng và các công ty kiến trúc hàng đầu",
                  "Túi quà tặng giới hạn dành riêng cho đối tác VVIP và tiệc thượng lưu",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
              {
                icon: "Sparkles",
                name: "Foil Stamping & Silk Ribbon Handle Bag",
                nameVi: "Ép Kim Logo & Quai Dây Lụa / Ruy Băng",
                tagline: "Want your brand logo on the bag to shimmer in metallic gold with silk handles?",
                taglineVi: "Bạn muốn túi giấy lấp lánh ép kim nhũ vàng kết hợp quai lụa ruy băng sang trọng?",
                description: [
                  "Metallic hot foil stamping applied to central brand logos and crests",
                  "Soft satin silk ribbon or grosgrain handles color-matched to brand identity",
                  "Transforms packaging into an unforgettable luxury walking billboard",
                ],
                descriptionVi: [
                  "Ép kim nhũ vàng, nhũ bạc hoặc nhũ đồng trực tiếp lên logo chính trên túi",
                  "Quai xách bằng dây lụa satin mềm mại hoặc ruy băng gân đồng màu nhận diện",
                  "Biến chiếc túi shopping thành biển quảng cáo di động đẳng cấp trên phố",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "5-star hotel resorts, luxury spa retreats, and fine jewelry brands",
                  "Corporate anniversary gala gift bags and CEO partner gifts",
                  "High-end confectionery and seasonal luxury hamper bags",
                ],
                bestForVi: [
                  "Khách sạn resort 5 sao, spa xa xỉ và thương hiệu trang sức đá quý",
                  "Túi quà sự kiện kỷ niệm thành lập tập đoàn và quà biếu của CEO",
                  "Túi xách hộp bánh trung thu, quà Tết hạng sang và yến sào",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "envelope",
        nameEn: "Envelope",
        nameVi: "Bao thư",
        description: "Document mailing envelopes.",
        descriptionVi: "Bao thư gửi tài liệu.",
        image: "/images/product/vd-item-envelope.jpeg",
        images: [
          "/images/product/vd-item-envelope.jpeg",
          "/images/product/vd-item-envelope.jpeg",
          "/images/product/vd-item-envelope.jpeg",
        ],
        hideDoubleSidedCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Feather",
                name: "Ford 100 - 120gsm (Standard Corporate)",
                nameVi: "Ford 100 - 120gsm (Chuẩn Bao Thư Văn Phòng)",
                tagline: "Need classic uncoated envelopes that are easy to write on and stamp?",
                taglineVi: "Bạn cần bao thư văn phòng chuẩn mực, dễ dàng viết tay và đóng dấu mộc?",
                description: [
                  "High-whiteness uncoated surface with a smooth, natural paper grain",
                  "Absorbs ink instantly without smudging when signing or stamping",
                  "Industry standard for corporate invoices, contracts, and daily correspondence",
                ],
                descriptionVi: [
                  "Bề mặt giấy nhám mịn tự nhiên, độ trắng cao chuẩn văn phòng",
                  "Thấm hút mực ký tên, viết tay và mực dấu mộc tức thì không bị nhòe",
                  "Chất liệu chuẩn mực cho gửi hóa đơn, hợp đồng và thư từ giao dịch hằng ngày",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Corporate daily correspondence, invoices, and legal contracts",
                  "Government, educational, and administrative mailings",
                  "Companies seeking a professional, reliable, and cost-effective envelope",
                ],
                bestForVi: [
                  "Gửi thư từ giao dịch hằng ngày, hóa đơn, hợp đồng pháp lý doanh nghiệp",
                  "Các cơ quan hành chính, trường học và tổ chức giáo dục",
                  "Doanh nghiệp cần bao thư chuẩn mực, uy tín và tối ưu ngân sách",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Layers",
                name: "Couche 150 - 200gsm (Laminated Finish)",
                nameVi: "Couche 150 - 200gsm (Cán Màng Bảo Vệ)",
                tagline: "Need durable, waterproof envelopes with sharp corporate brand colors?",
                taglineVi: "Bạn cần bao thư màu sắc rực rỡ, cứng cáp và cán màng chống ẩm ướt?",
                description: [
                  "Smooth coated surface with protective matte lamination for extra water resistance",
                  "Vibrant CMYK full-bleed color printing that makes logos pop",
                  "Higher paper weight providing a sturdy, substantial feel in the hand",
                ],
                descriptionVi: [
                  "Bề mặt tráng phủ láng mịn, cán màng mờ bảo vệ hạn chế thấm nước",
                  "In màu CMYK tràn viền rực rỡ, giúp logo và màu thương hiệu sắc nét",
                  "Định lượng giấy dày dặn, tạo cảm giác sang trọng và chắc tay khi nhận",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Real estate brochures, VIP event invitations, and sales kits",
                  "Marketing agencies and brands with rich graphic identities",
                  "Protecting important documents during courier or post delivery",
                ],
                bestForVi: [
                  "Gửi brochure dự án bất động sản, thiệp mời sự kiện VIP, bộ sales kit",
                  "Các thương hiệu chú trọng hình ảnh đồ họa màu sắc rực rỡ",
                  "Bảo vệ tài liệu quan trọng khi gửi qua bưu điện hoặc chuyển phát nhanh",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Palette",
                name: "Luxury Art Paper (EconoWhite / Modigliani)",
                nameVi: "Giấy Mỹ Thuật Cao Cấp (EconoWhite / Modigliani)",
                tagline: "Want a prestige tactile envelope that conveys high status before it's opened?",
                taglineVi: "Bạn muốn bao thư mang đẳng cấp xúc giác sang trọng ngay trước khi mở thư?",
                description: [
                  "European textured art paper with distinctive tactile grain and warmth",
                  "Refined, muted color tone that exudes luxury and understated elegance",
                  "Pairs beautifully with metallic gold or silver foil logo stamping",
                ],
                descriptionVi: [
                  "Giấy mỹ thuật châu Âu có vân nhám đặc trưng, cảm giác chạm cao cấp",
                  "Màu sắc trầm ấm, thanh lịch, mang lại ấn tượng thẩm mỹ sang trọng",
                  "Kết hợp hoàn hảo với chi tiết ép kim logo nhũ vàng hoặc nhũ bạc",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "C-suite executive mailings, luxury real estate, and private banking",
                  "Law firms, architecture studios, and high-end hospitality brands",
                  "Exclusive event invitations and VIP client correspondence",
                ],
                bestForVi: [
                  "Thư tín của lãnh đạo cấp cao, bất động sản hạng sang, ngân hàng VIP",
                  "Văn phòng luật sư, studio kiến trúc và chuỗi khách sạn 5 sao",
                  "Thiệp mời sự kiện đặc biệt và thư cảm ơn gửi khách hàng VIP",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "Natural Kraft Paper 180 - 250gsm",
                nameVi: "Giấy Kraft Tự Nhiên (Eco-Rustic)",
                tagline: "Need eco-friendly envelopes with a distinctive rustic, sustainable look?",
                taglineVi: "Bạn cần bao thư mang phong cách mộc mạc, thân thiện với môi trường?",
                description: [
                  "100% recycled natural brown kraft paper with organic fiber texture",
                  "High tensile strength and tear resistance for secure mailing",
                  "Creates an authentic, artisanal aesthetic when printed with black ink or foil",
                ],
                descriptionVi: [
                  "Giấy kraft nâu tự nhiên tái chế 100% với vân xơ giấy mộc mạc, chân thực",
                  "Độ dai cao, chống rách tốt khi vận chuyển bưu phẩm",
                  "Tạo phong cách nghệ thuật cổ điển, tinh tế khi in màu đơn sắc hoặc ép kim",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Eco-conscious brands, sustainable fashion, and organic cosmetics",
                  "Artisan coffee shops, boutique hotels, and craft workshops",
                  "Creative direct mail campaigns aiming to stand out from white mail",
                ],
                bestForVi: [
                  "Thương hiệu xanh, thời trang bền vững và mỹ phẩm hữu cơ",
                  "Quán cafe thủ công, boutique hotel và studio sáng tạo",
                  "Chiến dịch marketing gửi thư tay tạo điểm nhấn khác biệt với bao thư trắng",
                ],
                image: "/images/product/vd-card-f300.png",
                images: [
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                ],
              },
              {
                icon: "PenLine",
                name: "Same-Day Digital Print (Express)",
                nameVi: "In Nhanh KTS Lấy Ngay Trong Ngày",
                tagline: "Need custom envelopes printed and ready within 2-4 hours for an urgent mailing?",
                taglineVi: "Bạn cần in gấp bao thư lấy ngay trong 2-4 giờ phục vụ sự kiện hoặc họp báo?",
                description: [
                  "High-speed digital laser printing with crisp CMYK text and logo accuracy",
                  "No minimum offset setup wait — perfect for batches from 50 to 200 envelopes",
                  "Available on both Ford 120gsm and smooth Couche 150gsm stocks",
                ],
                descriptionVi: [
                  "In kỹ thuật số laser tốc độ cao, hiển thị logo và chữ in sắc nét",
                  "Không cần chờ ghép bài offset, đáp ứng nhanh cho số lượng từ 50 - 200 cái",
                  "Tùy chọn linh hoạt trên cả giấy Ford 120gsm và Couche 150gsm",
                ],
                descriptionTraits: ["digital-precision", "smooth-base", "soft-light"],
                bestFor: [
                  "Urgent press conferences, contract signings, and unexpected PR events",
                  "Small businesses or start-ups needing short-run branded stationery",
                  "Testing new envelope sizes and designs before volume offset production",
                ],
                bestForVi: [
                  "Họp báo khẩn, lễ ký kết hợp đồng và sự kiện PR phát sinh trong ngày",
                  "Doanh nghiệp mới thành lập cần in số lượng ít bộ nhận diện văn phòng",
                  "In thử nghiệm mẫu thiết kế trước khi đặt sản xuất offset số lượng lớn",
                ],
                image: "/images/product/card-digital1.webp",
                images: [
                  "/images/product/card-digital1.webp",
                  "/images/product/card-digital2.webp",
                  "/images/product/card-digital3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "flyer",
        nameEn: "Flyer",
        nameVi: "Tờ rơi",
        description: "Single-sheet mass handout or leaflet.",
        descriptionVi: "Tờ rơi phát hàng loạt, một mặt giấy.",
        image: "/images/product/vd-item-flyer.jpeg",
        images: [
          "/images/product/vd-item-flyer.jpeg",
          "/images/product/vd-item-flyer.jpeg",
          "/images/product/vd-item-flyer.jpeg",
        ],
        hideFoilCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche 150gsm (Standard Handout)",
                nameVi: "Couche 150gsm (Chuẩn Phát Hàng Loạt)",
                tagline: "Need the industry-standard glossy flyer for mass distribution and events?",
                taglineVi: "Bạn cần tờ rơi tiêu chuẩn láng mịn, chuẩn màu cho chiến dịch phát quảng cáo?",
                description: [
                  "Smooth coated C150 paper balancing stiffness with economical distribution weight",
                  "Vibrant full-bleed CMYK color reproduction that grabs immediate attention",
                  "Most popular choice for street marketing, store openings, and mailboxes",
                ],
                descriptionVi: [
                  "Giấy Couche 150gsm láng mịn, cân bằng hoàn hảo giữa độ dày và chi phí",
                  "In màu CMYK rực rỡ tràn viền, thu hút sự chú ý của khách hàng ngay lập tức",
                  "Lựa chọn phổ biến nhất cho phát tờ rơi đường phố, khai trương và showroom",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Grand openings, promotional sales events, and supermarket flyers",
                  "Real estate project launches and educational course recruitments",
                  "Restaurant takeaway menus and food delivery promotional inserts",
                ],
                bestForVi: [
                  "Khai trương cửa hàng, sự kiện khuyến mãi lớn và tờ rơi siêu thị",
                  "Mở bán dự án bất động sản và tuyển sinh các khóa học trung tâm",
                  "Menu gọi món mang đi của nhà hàng và tờ quảng cáo kẹp trong hộp hàng",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 100 - 120gsm (Writable & Matte)",
                nameVi: "Ford 100 - 120gsm (Giấy Mộc Dễ Viết)",
                tagline: "Want a natural uncoated flyer that clients can read without glare or write on?",
                taglineVi: "Bạn muốn tờ rơi giấy mộc tự nhiên, không chói mắt và khách có thể điền thông tin?",
                description: [
                  "Natural uncoated matte Ford paper with soft light diffusion",
                  "Zero glare under sunlight or bright store lighting",
                  "Allows customers to write notes, fill questionnaires, or clip coupons easily",
                ],
                descriptionVi: [
                  "Giấy Ford không tráng phủ nhám mịn tự nhiên, khuếch tán ánh sáng dịu nhẹ",
                  "Hoàn toàn không chói lóa dưới ánh nắng mặt trời hay đèn showroom",
                  "Khách hàng có thể viết ghi chú, điền phiếu khảo sát hoặc cắt coupon khuyến mãi",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Medical clinic handouts, educational questionnaires, and training sheets",
                  "Minimalist brands favoring an organic, non-glossy communication style",
                  "Direct mail coupon inserts and customer survey forms",
                ],
                bestForVi: [
                  "Tờ rơi thông tin y tế bệnh viện, phiếu khảo sát học sinh và đào tạo",
                  "Thương hiệu tối giản ưa chuộng phong cách giao tiếp mộc mạc, tự nhiên",
                  "Tờ rơi kẹp coupon giảm giá và phiếu thăm dò ý kiến khách hàng",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Award",
                name: "Couche 100 - 120gsm (Economy Mass Print)",
                nameVi: "Couche 100 - 120gsm (Siêu Kinh Tế)",
                tagline: "Need to print tens of thousands of flyers at the most economical budget possible?",
                taglineVi: "Bạn cần in số lượng lớn hàng vạn tờ rơi với chi phí tối ưu nhất cho chiến dịch?",
                description: [
                  "Lightweight coated paper optimized for high-volume offset print runs",
                  "Maintains bright, punchy colors while minimizing paper and shipping costs",
                  "Ideal for broad-reach neighborhood distribution and newspaper inserts",
                ],
                descriptionVi: [
                  "Định lượng giấy nhẹ được tối ưu hóa cho các lô in offset số lượng cực lớn",
                  "Giữ màu sắc tươi sáng trong khi tối thiểu hóa chi phí giấy và vận chuyển",
                  "Hoàn hảo cho phát hàng loạt khu dân cư, kẹp báo hoặc phát sự kiện ngoài trời",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Supermarket weekly sale flyers and department store catalogues",
                  "Political campaigns, public awareness drives, and charity events",
                  "High-volume local neighborhood promotional drops",
                ],
                bestForVi: [
                  "Tờ rơi khuyến mãi tuần của siêu thị và trung tâm thương mại lớn",
                  "Chiến dịch truyền thông cộng đồng, từ thiện và sự kiện công cộng",
                  "Phát tờ rơi quảng bá định kỳ trên diện rộng tại các khu dân cư",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "StickyNote",
                name: "Couche 200 - 250gsm (Premium Heavy Flyer)",
                nameVi: "Couche 200 - 250gsm (Dày Dặn Cao Cấp)",
                tagline: "Want a thick, substantial flyer that feels like an invitation card in hand?",
                taglineVi: "Bạn muốn tờ rơi dày dặn, sang trọng khi cầm tay như một tấm thiệp mời cao cấp?",
                description: [
                  "Heavyweight C200 or C250 paper with optional protective lamination",
                  "Conveys immediate quality and prevents discarding or crumpling",
                  "Perfect for showroom counters, luxury real estate, and automotive reveals",
                ],
                descriptionVi: [
                  "Giấy Couche 200 - 250gsm dày dặn, có thể cán màng mờ/bóng bảo vệ sang trọng",
                  "Tạo thiện cảm cao cấp ngay khi cầm tay, hạn chế bị vứt bỏ hay nhàu nát",
                  "Hoàn hảo cho trưng bày quầy lễ tân, bất động sản hạng sang và ra mắt xe hơi",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Luxury real estate project sheets and automotive showroom handouts",
                  "VIP event invitations and jewelry boutique promotional cards",
                  "High-end wellness retreats and aesthetic clinic menus",
                ],
                bestForVi: [
                  "Tờ rơi giới thiệu dự án bất động sản hạng sang và showroom ô tô",
                  "Thư ngỏ sự kiện VIP và thẻ giới thiệu của thương hiệu trang sức",
                  "Tờ giới thiệu liệu trình của viện thẩm mỹ, spa và resort 5 sao",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "PenLine",
                name: "Same-Day Express Digital Flyer",
                nameVi: "In Nhanh KTS Tờ Rơi Sự Kiện Lấy Ngay",
                tagline: "Need 100-500 flyers printed and ready within hours for a sudden event?",
                taglineVi: "Bạn cần in gấp 100 - 500 tờ rơi lấy ngay trong ngày phục vụ sự kiện khẩn cấp?",
                description: [
                  "High-speed digital laser printing with vibrant color consistency",
                  "No offset plating delays — short-run orders completed in 2 to 4 hours",
                  "Available on C150, C200, or Ford 100 stocks to match your urgent deadline",
                ],
                descriptionVi: [
                  "In kỹ thuật số laser tốc độ cao, hiển thị màu sắc sống động và đồng nhất",
                  "Không cần chờ ra kẽm offset — hoàn thành đơn hàng trong 2 đến 4 giờ",
                  "Tùy chọn linh hoạt trên giấy C150, C200 hoặc Ford 100 kịp tiến độ sự kiện",
                ],
                descriptionTraits: ["digital-precision", "smooth-base", "soft-light"],
                bestFor: [
                  "Last-minute trade show booth handouts and press conferences",
                  "Testing marketing flyer copy and designs before mass offset printing",
                  "Flash sales, pop-up stores, and weekend promotional campaigns",
                ],
                bestForVi: [
                  "Tài liệu phát gấp tại gian hàng triển lãm, họp báo và sự kiện đột xuất",
                  "In kiểm tra nội dung và phản hồi thị trường trước khi in offset hàng vạn tờ",
                  "Chương trình khuyến mãi chớp nhoáng, cửa hàng popup và sự kiện cuối tuần",
                ],
                image: "/images/product/card-digital1.webp",
                images: [
                  "/images/product/card-digital1.webp",
                  "/images/product/card-digital2.webp",
                  "/images/product/card-digital3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "decal",
        nameEn: "Decal",
        nameVi: "Decal các loại",
        description: "Surface and product decals, various types.",
        descriptionVi: "Decal bề mặt và sản phẩm, nhiều loại.",
        image: "/images/product/vd-item-decal.jpeg",
        images: [
          "/images/product/vd-item-decal.jpeg",
          "/images/product/vd-item-decal.jpeg",
          "/images/product/vd-item-decal.jpeg",
        ],
        hideFoilCheckbox: true,
        hideDoubleSidedCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Paper Decal Laminated (Couche Sticker)",
                nameVi: "Decal Giấy Cán Màng (Chuẩn Nhãn Hàng)",
                tagline: "Need the most cost-effective, vibrant sticker decal for dry indoor products?",
                taglineVi: "Bạn cần tem decal giấy sắc nét, kinh tế nhất cho sản phẩm khô và bao bì?",
                description: [
                  "Smooth coated paper adhesive decal with protective matte or glossy lamination",
                  "Vibrant CMYK printing that adheres firmly to paper boxes, jars, and bags",
                  "Optimal choice for products stored in normal indoor temperature and humidity",
                ],
                descriptionVi: [
                  "Decal giấy bề mặt láng mịn được cán màng mờ hoặc bóng bảo vệ chống trầy",
                  "In màu CMYK sắc nét, bám dính chắc chắn lên hộp giấy, chai lọ và túi bao bì",
                  "Lựa chọn tối ưu chi phí cho sản phẩm lưu trữ trong điều kiện nhiệt độ phòng",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Food packaging boxes, confectionery jars, and bakery containers",
                  "Dry cosmetic jars, perfume cartons, and candle vessels",
                  "Shipping parcel address labels and promotional giveaway stickers",
                ],
                bestForVi: [
                  "Hộp bao bì thực phẩm, hũ bánh kẹo và hộp đồ ăn khô",
                  "Hũ mỹ phẩm khô, vỏ hộp nước hoa và cốc nến thơm tinh dầu",
                  "Nhãn dán địa chỉ gói hàng bưu phẩm và sticker khuyến mãi tặng kèm",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Uncoated Writable Paper Decal (Ford)",
                nameVi: "Decal Giấy Ford (Dễ Viết Tay & Đóng Dấu)",
                tagline: "Want a writable sticker decal where you can fill in expiry dates or batch numbers?",
                taglineVi: "Bạn muốn tem decal giấy mộc tự nhiên có thể viết tay ngày sản xuất hay hạn dùng?",
                description: [
                  "Natural uncoated Ford paper adhesive surface without lamination glare",
                  "Absorbs ballpoint ink, markers, and date stamps immediately without smearing",
                  "Authentic, artisanal aesthetic for handmade goods and organic products",
                ],
                descriptionVi: [
                  "Bề mặt decal giấy Ford mộc nhám tự nhiên, không tráng phủ hay cán màng",
                  "Bám mực viết tay, bút bi, bút lông và dấu mộc ngày tháng không bị nhòe",
                  "Thẩm mỹ thủ công chân thực cho sản phẩm handmade và đồ hữu cơ",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Handmade bakery expiration stickers and harvest date labels",
                  "Medical laboratory test tube labels and pharmacy prescriptions",
                  "Artisan craft workshops and organic farmers' market packaging",
                ],
                bestForVi: [
                  "Sticker ghi ngày sản xuất, hạn sử dụng cho bánh ngọt thủ công",
                  "Nhãn dán ống nghiệm phòng xét nghiệm và nhãn toa thuốc nhà thuốc",
                  "Sản phẩm thủ công truyền thống và nông sản sạch tự nhiên",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "100% Waterproof Transparent PVC Decal",
                nameVi: "Decal Nhựa Trong Suốt (Chống Nước 100%)",
                tagline: "Need a clear, invisible waterproof decal that lets your product show through?",
                taglineVi: "Bạn cần tem decal trong suốt chống nước 100%, nhìn thấu màu sản phẩm bên trong?",
                description: [
                  "Transparent synthetic PVC/PET film with strong water-resistant adhesive",
                  "Creates a seamless 'no-label' printed directly on bottle look",
                  "100% waterproof and tear-resistant, ideal for wet bathroom or chilled use",
                ],
                descriptionVi: [
                  "Chất liệu nhựa trong suốt PVC/PET với lớp keo chống thấm nước vượt trội",
                  "Tạo hiệu ứng 'nhãn tàng hình' như được in trực tiếp lên bề mặt chai lọ",
                  "Chống nước 100% và không rách, hoàn hảo cho môi trường phòng tắm hoặc ướp lạnh",
                ],
                descriptionTraits: ["waterproof-durability", "smooth-base", "glossy-coat"],
                bestFor: [
                  "Clear glass beverage bottles, cold-pressed juice jars, and milk tea cups",
                  "Shampoo, shower gel, and skincare cosmetics used in bathrooms",
                  "Window decal branding and transparent gift box seals",
                ],
                bestForVi: [
                  "Chai thủy tinh nước giải khát, chai nước ép lạnh và ly trà sữa",
                  "Chai dầu gội, sữa tắm và mỹ phẩm sử dụng trong môi trường ẩm ướt",
                  "Sticker dán kính cửa hàng và tem niêm phong hộp quà trong suốt",
                ],
                image: "/images/product/card-plastic1.webp",
                images: [
                  "/images/product/card-plastic1.webp",
                  "/images/product/card-plastic2.webp",
                  "/images/product/card-plastic3.webp",
                ],
                hideFoilCheckbox: true,
              },
              {
                icon: "Award",
                name: "White Synthetic PVC Plastic Decal",
                nameVi: "Decal Nhựa Trắng Sữa (Siêu Bền Chống Nước)",
                tagline: "Need an indestructible white plastic sticker for refrigerated or chemical products?",
                taglineVi: "Bạn cần tem nhựa trắng sữa chống rách, chịu lạnh và nước cho chai lọ thủy hải sản?",
                description: [
                  "Opaque white synthetic plastic film with exceptional durability and opacity",
                  "Resists ice, freezing temperatures, condensation, and chemical oils",
                  "Vibrant CMYK colors stay sharp even after months in cold storage",
                ],
                descriptionVi: [
                  "Màng nhựa tổng hợp màu trắng sữa đục, độ bền kéo và độ che phủ tuyệt đối",
                  "Chịu nước đá, nhiệt độ cấp đông, nước đọng và hóa chất dầu mỡ cực tốt",
                  "Màu in CMYK sắc nét, không phai kể cả sau nhiều tháng bảo quản lạnh",
                ],
                descriptionTraits: ["waterproof-durability", "smooth-base", "glossy-coat"],
                bestFor: [
                  "Frozen seafood packaging, ice cream containers, and chilled dairy goods",
                  "Automotive chemical lubricants, industrial oils, and cleaning spray bottles",
                  "Outdoor machinery warning labels and weatherproof equipment stickers",
                ],
                bestForVi: [
                  "Bao bì hải sản đông lạnh, hộp kem và các sản phẩm sữa ướp lạnh",
                  "Chai nhớt xe cộ, hóa chất công nghiệp và chai xịt tẩy rửa gia dụng",
                  "Nhãn cảnh báo trên máy móc ngoài trời và tem thiết bị chịu thời tiết",
                ],
                image: "/images/product/card-plastic1.webp",
                images: [
                  "/images/product/card-plastic1.webp",
                  "/images/product/card-plastic2.webp",
                  "/images/product/card-plastic3.webp",
                ],
                hideFoilCheckbox: true,
              },
              {
                icon: "Sparkles",
                name: "Custom Die-Cut Shape Decal + Foil",
                nameVi: "Decal Bế Theo Hình Dáng Bất Kỳ + Ép Kim",
                tagline: "Want custom contour-cut stickers with shimmering metallic foil logo accents?",
                taglineVi: "Bạn muốn tem decal bế theo hình dáng độc quyền kèm ép kim logo lấp lánh?",
                description: [
                  "Precision digital die-cutting following any intricate logo outline or shape",
                  "Combined with hot foil stamping in gold, silver, or holographic metallic sheen",
                  "Delivered on easy-peel kiss-cut sheets or individual promotional sticker die-cuts",
                ],
                descriptionVi: [
                  "Bế cắt kỹ thuật số viền chính xác theo mọi hình dáng logo hay hoa văn phức tạp",
                  "Kết hợp ép kim nhũ vàng, nhũ bạc hoặc nhũ holographic lấp lánh điểm nhấn",
                  "Bàn giao dạng tờ cấn màng xé (Kiss-cut sheet) hoặc cắt rời từng hình (Die-cut)",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Luxury wine bottles, perfume seals, and high-end cosmetic labels",
                  "Branded promotional stickers for skateboards, laptops, and water bottles",
                  "Limited-edition holiday gift seals and VIP packaging authentication",
                ],
                bestForVi: [
                  "Nhãn chai rượu vang sang trọng, tem niêm phong nước hoa và mỹ phẩm VIP",
                  "Sticker nhận diện thương hiệu dán laptop, bình nước, mũ bảo hiểm quà tặng",
                  "Tem niêm phong quà Tết giới hạn và chứng nhận hàng chính hãng",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "stamp",
        nameEn: "Stamp / Sticker",
        nameVi: "Tem",
        description: "Seals and authentication stickers.",
        descriptionVi: "Tem niêm phong và tem xác thực.",
        image: "/images/product/vd-item-stamp.jpg",
        images: [
          "/images/product/vd-item-stamp.jpg",
          "/images/product/vd-item-stamp.jpg",
          "/images/product/vd-item-stamp.jpg",
        ],
        hideFoilCheckbox: true,
        hideDoubleSidedCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche Paper Stamp (Laminated Seal)",
                nameVi: "Tem Nhãn Giấy Couche Cán Màng",
                tagline: "Need affordable, crisp paper seals for product boxes and envelope closures?",
                taglineVi: "Bạn cần tem nhãn giấy láng mịn, kinh tế để niêm phong hộp giấy và bao thư?",
                description: [
                  "C150 or C200 coated adhesive paper with protective matte or glossy lamination",
                  "High-definition CMYK printing for barcodes, QR codes, and logo emblems",
                  "Strong permanent adhesive securing box flaps and gift bags reliably",
                ],
                descriptionVi: [
                  "Giấy Couche 150 - 200gsm láng mịn có keo dán, cán màng mờ/bóng bảo vệ",
                  "In CMYK sắc nét, hiển thị chính xác mã vạch, mã QR và biểu tượng logo",
                  "Lớp keo bám dính chắc chắn, niêm phong nắp hộp và túi quà an toàn",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Gift box seal closures, shopping bag seals, and envelope flaps",
                  "Retail product barcode stickers and SKU identifier labels",
                  "Food box closures for bakeries, pastry shops, and cafes",
                ],
                bestForVi: [
                  "Tem niêm phong nắp hộp quà, miệng túi giấy shopping và nắp bao thư",
                  "Tem mã vạch sản phẩm bán lẻ và nhãn thông số SKU hàng hóa",
                  "Tem niêm phong hộp bánh ngọt, thực phẩm mang đi của nhà hàng",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford Paper Writable Date Stamp",
                nameVi: "Tem Giấy Ford (Dễ Viết Ngày & Ký Tên)",
                tagline: "Want a natural uncoated stamp where inspectors can write signatures and dates?",
                taglineVi: "Bạn muốn tem giấy mộc tự nhiên để nhân viên kiểm tra ký tên và ghi ngày tháng?",
                description: [
                  "Uncoated natural Ford adhesive surface without slippery lamination",
                  "Absorbs pens, markers, and quality inspection QC stamps without smudging",
                  "Essential for manual quality control workflows and handmade date markings",
                ],
                descriptionVi: [
                  "Bề mặt giấy Ford mộc tự nhiên có keo dán, không cán màng trơn trượt",
                  "Bám mực bút bi, bút lông và con dấu kiểm định QC không bị nhòe mực",
                  "Quy chuẩn thiết yếu cho quy trình kiểm tra chất lượng QC và ghi tay hạn dùng",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "QC passed inspection seals and production shift sign-off stamps",
                  "Handwritten roast date seals for specialty coffee bean bags",
                  "Artisan workshop batch number stickers and pharmacy instruction seals",
                ],
                bestForVi: [
                  "Tem kiểm định chất lượng QC passed và xác nhận xuất xưởng của nhà máy",
                  "Tem ghi tay ngày rang của bao bì cà phê đặc sản cao cấp",
                  "Sticker ghi số lô sản xuất thủ công và tem hướng dẫn sử dụng nhà thuốc",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "Tamper-Evident Warranty Stamp (Tem Vỡ)",
                nameVi: "Tem Bảo Hành Vỡ (Tem Niêm Phong)",
                tagline: "Need brittle security stamps that shatter upon attempted removal to prevent tampering?",
                taglineVi: "Bạn cần tem bảo hành vỡ tự hủy khi có hành vi bóc gỡ để bảo vệ linh kiện?",
                description: [
                  "Special brittle vinyl stock that shatters into fragments if peeled after sticking",
                  "Provides absolute proof of tampering for warranty and electronic seals",
                  "Sharp micro-text and serial number printing for verification tracking",
                ],
                descriptionVi: [
                  "Chất liệu giòn đặc biệt, tự động vỡ vụn thành từng mảnh nếu có tác động bóc gỡ",
                  "Bằng chứng tuyệt đối chống mở ốc, tháo máy và niêm phong bảo hành",
                  "In viền chữ siêu nhỏ và số nhảy serial theo dõi thời hạn bảo hành chính xác",
                ],
                descriptionTraits: ["waterproof-durability", "smooth-base", "glossy-coat"],
                bestFor: [
                  "Electronic smartphone, computer, and appliance screw-hole warranty seals",
                  "High-value component authentication and repair shop warranty tracking",
                  "Cosmetic container lid security seals preventing in-store sampling",
                ],
                bestForVi: [
                  "Tem niêm phong ốc vít bảo hành điện thoại, máy tính và thiết bị điện tử",
                  "Xác thực linh kiện chính hãng và theo dõi thời hạn bảo hành của trung tâm",
                  "Tem niêm phong nắp hộp mỹ phẩm chống mở dùng thử trước tại cửa hàng",
                ],
                image: "/images/product/vd-item-stamp.jpg",
                images: [
                  "/images/product/vd-item-stamp.jpg",
                  "/images/product/vd-item-stamp.jpg",
                  "/images/product/vd-item-stamp.jpg",
                ],
              },
              {
                icon: "Award",
                name: "Holographic Anti-Counterfeit Stamp (7 Màu)",
                nameVi: "Tem Hologram 7 Màu (Chống Giả Cao Cấp)",
                tagline: "Want multi-spectrum holographic security stamps to authenticate your genuine products?",
                taglineVi: "Bạn muốn tem hologram lấp lánh 7 màu chống làm giả cho hàng chính hãng?",
                description: [
                  "Laser-etched rainbow holographic foil reflecting dynamic spectrum colors",
                  "Extremely difficult to counterfeit, building high consumer trust and prestige",
                  "Customized with 2D/3D optical motion logos and hidden security marks",
                ],
                descriptionVi: [
                  "Chất liệu màng hologram quang học khắc laser phản chiếu ánh sáng 7 màu",
                  "Cực kỳ khó làm giả, gia tăng sự an tâm tuyệt đối cho người tiêu dùng",
                  "Cá nhân hóa với logo quang học 2D/3D và các ký tự chống giả ẩn dưới đèn",
                ],
                descriptionTraits: ["metallic-shine", "smooth-base", "glossy-coat"],
                bestFor: [
                  "Official brand authentication stamps for cosmetics and pharmaceuticals",
                  "Luxury garment authenticity hangtag seals and designer footwear",
                  "Software licenses, textbook security stamps, and VIP certificates",
                ],
                bestForVi: [
                  "Tem xác thực hàng chính hãng cho mỹ phẩm, dược phẩm và thực phẩm chức năng",
                  "Tem niêm phong mác quần áo hàng hiệu và giày dép thời trang cao cấp",
                  "Tem bản quyền phần mềm, tem an ninh sách giáo khoa và chứng nhận VIP",
                ],
                image: "/images/product/vd-item-stamp.jpg",
                images: [
                  "/images/product/vd-item-stamp.jpg",
                  "/images/product/vd-item-stamp.jpg",
                  "/images/product/vd-item-stamp.jpg",
                ],
              },
              {
                icon: "Sparkles",
                name: "Metallic Foil Stamped Stamp",
                nameVi: "Tem Ép Kim Nhũ Vàng / Nhũ Bạc Sang Trọng",
                tagline: "Want a shimmering metallic foil emblem sticker to elevate gift wrapping and cards?",
                taglineVi: "Bạn muốn tem dán điểm nhấn ép kim nhũ vàng sang trọng niêm phong hộp quà?",
                description: [
                  "Metallic gold, silver, or copper foil stamped onto paper or vinyl base",
                  "Creates a jewelry-like, embossed luxury finish that catches every light",
                  "Elevates standard packaging into an upscale boutique gifting experience",
                ],
                descriptionVi: [
                  "Ép kim nhũ vàng, nhũ bạc hoặc nhũ đồng lên nền tem giấy hoặc tem nhựa",
                  "Tạo hiệu ứng sang trọng như món trang sức bắt sáng rực rỡ ở mọi góc nhìn",
                  "Nâng tầm gói quà thông thường thành trải nghiệm quà tặng thượng lưu",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Wedding invitation envelope seals and luxury stationery closures",
                  "Special holiday gift box badges (Tet, Mid-Autumn, Christmas)",
                  "Artisan chocolate, fine wine, and perfume box decorative stamps",
                ],
                bestForVi: [
                  "Tem niêm phong thiệp cưới cao cấp và thiệp mời sự kiện quan trọng",
                  "Tem trang trí hộp quà lễ Tết (Tết Nguyên Đán, Trung Thu, Giáng Sinh)",
                  "Tem nhãn trang trí hộp sô-cô-la thủ công, rượu vang và nước hoa xa xỉ",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "label",
        nameEn: "Label",
        nameVi: "Nhãn",
        description: "Product and packaging labels.",
        descriptionVi: "Nhãn sản phẩm và bao bì.",
        image: "/images/product/vd-item-label.jpeg",
        images: [
          "/images/product/vd-item-label.jpeg",
          "/images/product/vd-item-label.jpeg",
          "/images/product/vd-item-label.jpeg",
        ],
        hideFoilCheckbox: true,
        hideDoubleSidedCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche 80 - 100gsm Laminated Label",
                nameVi: "Nhãn Giấy Couche Cán Màng (Chuẩn Chai Lọ)",
                tagline: "Need standard, cost-effective product labels for bottles, jars, and cartons?",
                taglineVi: "Bạn cần nhãn dán chai lọ láng mịn, chuẩn màu và kinh tế cho bao bì?",
                description: [
                  "C80 or C100 coated adhesive paper with matte or glossy lamination",
                  "High-resolution CMYK graphics for ingredients, instructions, and branding",
                  "Adheres smoothly to curved glass, plastic bottles, and cardboard boxes",
                ],
                descriptionVi: [
                  "Giấy Couche 80 - 100gsm láng mịn có keo dán, cán màng mờ hoặc bóng bảo vệ",
                  "In đồ họa CMYK sắc nét cho thành phần, hướng dẫn sử dụng và logo",
                  "Bám dính mượt mà lên bề mặt cong của chai lọ thủy tinh, nhựa và hộp giấy",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Food jars, condiment bottles, and confectionery retail packs",
                  "Shampoo, lotion, and household cleaning spray bottle labels",
                  "Secondary nutritional and importer labels on retail packaging",
                ],
                bestForVi: [
                  "Hũ thực phẩm, chai gia vị và hộp bánh kẹo trưng bày bán lẻ",
                  "Nhãn chai dầu gội, sữa dưỡng thể và bình xịt tẩy rửa gia dụng",
                  "Nhãn phụ thông tin nhập khẩu, hướng dẫn sử dụng trên hàng tiêu dùng",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Uncoated Ford Writable Product Label",
                nameVi: "Nhãn Giấy Ford (Dễ Viết Ngày & Lô Sản Xuất)",
                tagline: "Want an uncoated natural label where you can stamp batch codes or roast dates?",
                taglineVi: "Bạn muốn nhãn giấy mộc tự nhiên có thể viết tay hạn dùng hay số lô sản xuất?",
                description: [
                  "Uncoated Ford paper adhesive surface without shiny lamination",
                  "Absorbs pens, markers, and date-stamping inks immediately without smearing",
                  "Conveys an authentic, small-batch artisanal feel for handmade goods",
                ],
                descriptionVi: [
                  "Bề mặt nhãn giấy Ford mộc tự nhiên có keo dán, không cán màng bóng",
                  "Bám mực bút viết tay và mực dấu đóng ngày tháng ngay lập tức không bị nhòe",
                  "Mang lại cảm giác thủ công, tinh tế cho sản phẩm số lượng nhỏ (small-batch)",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Specialty coffee bag roast date labels and bakery freshness tags",
                  "Small-batch organic honey, jam jars, and artisanal sauce bottles",
                  "Pharmacy prescription bottles and laboratory reagent jar labels",
                ],
                bestForVi: [
                  "Nhãn ghi ngày rang cà phê đặc sản và tem ngày hết hạn tiệm bánh",
                  "Hũ mật ong hữu cơ thủ công, mứt và gia vị truyền thống",
                  "Nhãn chai thuốc nhà thuốc và lọ hóa chất phòng xét nghiệm y khoa",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Palette",
                name: "Wine Luxury Art Paper Label",
                nameVi: "Nhãn Giấy Mỹ Thuật Rượu Vang Cao Cấp",
                tagline: "Want a textured European wine-label paper that exudes cellar heritage and prestige?",
                taglineVi: "Bạn muốn nhãn chai mang vân giấy mỹ thuật châu Âu đẳng cấp như chai rượu vang?",
                description: [
                  "Premium European wine-label art paper with distinctive tactile texture",
                  "Treated for wet-strength resistance in wine ice buckets and refrigerators",
                  "Warm, classic ink absorption that looks exceptional with metallic foil",
                ],
                descriptionVi: [
                  "Giấy mỹ thuật nhãn rượu châu Âu có vân nhám đặc trưng, xúc giác xa xỉ",
                  "Xử lý đặc biệt chống bong tróc khi ngâm trong xô đá rượu vang hoặc ướp lạnh",
                  "Màu in trầm tĩnh, hoàn hảo khi kết hợp cùng ép kim nhũ vàng hoặc nhũ đồng",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "Fine red wine, champagne, and craft botanical gin bottles",
                  "Luxury perfume bottles, scented candles, and artisan room sprays",
                  "High-end gourmet olive oil and imported balsamic vinegar bottles",
                ],
                bestForVi: [
                  "Chai rượu vang cao cấp, rượu sâm-panh và rượu thủ công",
                  "Chai nước hoa xa xỉ, cốc nến thơm tinh dầu và chai xịt phòng cao cấp",
                  "Chai dầu ô-liu thượng hạng và dấm lên men nhập khẩu",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "Waterproof White Synthetic PVC Label",
                nameVi: "Nhãn Nhựa PVC Chống Nước (Ướt & Lạnh)",
                tagline: "Need an indestructible waterproof label for chilled beverages or bath cosmetics?",
                taglineVi: "Bạn cần nhãn nhựa chống nước 100%, chịu lạnh cho chai đồ uống hay mỹ phẩm phòng tắm?",
                description: [
                  "100% waterproof synthetic PVC/PET film with permanent waterproof adhesive",
                  "Survives ice immersion, condensation, refrigeration, and hot humid showers",
                  "Crisp, vibrant colors that won't scratch, peel, or fade in harsh environments",
                ],
                descriptionVi: [
                  "Màng nhựa PVC/PET chống thấm nước 100% với lớp keo dán chịu lạnh đặc biệt",
                  "Bền bỉ khi ngâm nước đá, nhiệt độ tủ lạnh, nước đọng và môi trường phòng tắm",
                  "Màu in sắc nét, không trầy xước, không bong tróc kể cả khi tiếp xúc nước hằng ngày",
                ],
                descriptionTraits: ["waterproof-durability", "smooth-base", "glossy-coat"],
                bestFor: [
                  "Cold-pressed juice bottles, craft beer cans, and refrigerated dairy milk",
                  "Shampoo, shower gel, and bathroom cosmetic bottles",
                  "Outdoor agricultural chemical bottles and marine supply containers",
                ],
                bestForVi: [
                  "Chai nước ép lạnh, lon bia thủ công và các sản phẩm sữa ướp lạnh",
                  "Chai dầu gội, sữa tắm và mỹ phẩm chăm sóc sử dụng trong phòng tắm",
                  "Chai thuốc nông nghiệp ngoài trời và bao bì thiết bị hằng hải",
                ],
                image: "/images/product/card-plastic1.webp",
                images: [
                  "/images/product/card-plastic1.webp",
                  "/images/product/card-plastic2.webp",
                  "/images/product/card-plastic3.webp",
                ],
              },
              {
                icon: "Sparkles",
                name: "Foil Stamped & Spot UV Luxury Label",
                nameVi: "Nhãn Ép Kim & Phủ UV Định Hình Sang Trọng",
                tagline: "Want your brand logo on the bottle to shimmer with metallic foil and raised 3D UV?",
                taglineVi: "Bạn muốn logo thương hiệu trên chai lọ lấp lánh ép kim và nổi bật với UV 3D?",
                description: [
                  "Metallic gold, silver, or bronze hot foil stamping applied to focal logos",
                  "Raised Spot UV coating adds sculptural 3D gloss over a velvety matte background",
                  "Maximum shelf presence that elevates perceived product value instantly",
                ],
                descriptionVi: [
                  "Gia công ép kim nhũ vàng, nhũ bạc hoặc nhũ đồng cho logo và biểu tượng chính",
                  "Phủ UV bóng định hình tạo độ tương phản nổi 3D trên nền màng mờ mịn màng",
                  "Tạo sức hút mãnh liệt trên quầy kệ, nâng tầm giá trị cảm nhận của sản phẩm",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Luxury facial serums, anti-aging creams, and VIP beauty collections",
                  "Premium spirits, limited-edition whisky, and celebration champagne",
                  "High-end nutritional supplements and VIP corporate gifts",
                ],
                bestForVi: [
                  "Chai mỹ phẩm serum, kem dưỡng cao cấp và bộ sưu tập làm đẹp VIP",
                  "Chai rượu ngoại sang trọng, rượu whisky giới hạn và rượu mừng sự kiện",
                  "Hộp thực phẩm chức năng cao cấp và giỏ quà tặng doanh nghiệp VIP",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "tag",
        nameEn: "Tag",
        nameVi: "Mác",
        description: "Hang tags and garment tags.",
        descriptionVi: "Mác treo và mác quần áo.",
        image: "/images/product/vd-item-tag.jpeg",
        images: [
          "/images/product/vd-item-tag.jpeg",
          "/images/product/vd-item-tag.jpeg",
          "/images/product/vd-item-tag.jpeg",
        ],
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche 300 - 350gsm (Standard Garment Tag)",
                nameVi: "Couche 300 - 350gsm (Mác Quần Áo Chuẩn)",
                tagline: "Need clean, rigid hang tags with drilled holes for your apparel collection?",
                taglineVi: "Bạn cần mác treo quần áo dày dặn, khoan lỗ chuẩn mực cho bộ sưu tập thời trang?",
                description: [
                  "Smooth C300 or C350 coated paper laminated matte or glossy for extra rigidity",
                  "Vibrant CMYK printing for brand logos, barcodes, sizes, and care instructions",
                  "Precision 3mm or 4mm drilled hole ready for stringing or tagging guns",
                ],
                descriptionVi: [
                  "Giấy Couche 300 - 350gsm láng mịn, cán màng mờ hoặc bóng cứng cáp",
                  "In màu CMYK sắc nét logo thương hiệu, mã vạch, kích cỡ và hướng dẫn giặt ủi",
                  "Khoan lỗ tròn 3mm hoặc 4mm chuẩn xác, sẵn sàng xỏ dây hoặc gắn súng bắn mác",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Fashion retail apparel, denim wear, and casual clothing collections",
                  "Luggage tags, handbag identification tags, and footwear labels",
                  "Retail price tags and barcode swing tags for department stores",
                ],
                bestForVi: [
                  "Quần áo thời trang bán lẻ, trang phục denim và bộ sưu tập thường nhật",
                  "Mác treo túi xách, hành lý và mác giày dép thời trang",
                  "Mác giá bán lẻ và thẻ treo mã vạch tại các trung tâm thương mại",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 300gsm (Uncoated Natural Tag)",
                nameVi: "Ford 300gsm (Mác Giấy Mộc Dễ Viết)",
                tagline: "Want an uncoated natural tag where sales staff can write prices or batch codes?",
                taglineVi: "Bạn muốn mác treo giấy mộc tự nhiên để nhân viên ghi tay giá tiền hay mã lô?",
                description: [
                  "Natural matte uncoated Ford 300gsm paper with soft light diffusion",
                  "Zero glare under boutique spotlights, making typography clean and readable",
                  "Absorbs pens and stamps easily for handwritten price tags or SKU markers",
                ],
                descriptionVi: [
                  "Giấy Ford 300gsm nhám mịn tự nhiên, không tráng phủ hay cán màng trơn",
                  "Hoàn toàn không chói sáng dưới đèn showroom, giúp đọc thông tin rõ ràng",
                  "Dễ dàng viết tay giá bán, mã lô hoặc đóng dấu mộc bảo hành lên mác",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Boutique apparel brands, vintage thrift stores, and handmade crafts",
                  "Artisan ceramic, homeware, and organic textile hang tags",
                  "Minimalist fashion brands favoring an organic, uncoated aesthetic",
                ],
                bestForVi: [
                  "Thương hiệu thời trang boutique, cửa hàng đồ vintage và thủ công",
                  "Mác treo đồ gốm sứ thủ công, đồ trang trí nhà cửa và vải vóc hữu cơ",
                  "Thương hiệu thời trang tối giản ưu tiên phong cách mộc mạc, tự nhiên",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "Ivory 300 - 350gsm (Ultra-Rigid Luxury Tag)",
                nameVi: "Ivory 300 - 350gsm (Mác Siêu Cứng Cao Cấp)",
                tagline: "Need maximum tag stiffness and a crisp high-white executive appearance?",
                taglineVi: "Bạn cần mác treo siêu cứng, độ trắng mịn chuẩn mực cho thời trang hàng hiệu?",
                description: [
                  "Bright-white coated front side with exceptional structural stiffness",
                  "Prevents bending or curling when garments are handled on store racks",
                  "Holds sharp metallic foil stamping and embossed crests beautifully",
                ],
                descriptionVi: [
                  "Mặt ngoài trắng mịn tráng phủ cao cấp, độ cứng và chịu lực vượt trội",
                  "Không bị quăn mép hay cong vênh khi khách hàng xem quần áo trên giá treo",
                  "Khả năng bắt nhũ ép kim và dập nổi biểu tượng thương hiệu cực kỳ sắc nét",
                ],
                descriptionTraits: ["smooth-base", "natural-grain", "foil-accent"],
                bestFor: [
                  "Designer fashion collections, tailoring houses, and luxury coats",
                  "High-end leather goods, luxury handbags, and leather footwear",
                  "VIP corporate gift swing tags and warranty cards",
                ],
                bestForVi: [
                  "Bộ sưu tập thời trang thiết kế, tiệm may đo cao cấp và áo khoác xa xỉ",
                  "Đồ da hàng hiệu, túi xách cao cấp và giày da sang trọng",
                  "Mác treo quà tặng doanh nghiệp VIP và thẻ bảo hành sản phẩm",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Palette",
                name: "Luxury Art Paper Hang Tag",
                nameVi: "Mác Giấy Mỹ Thuật Nhám Cao Cấp",
                tagline: "Want a bespoke European textured art tag that feels like an artisan label?",
                taglineVi: "Bạn muốn mác treo mang vân giấy mỹ thuật châu Âu khác biệt khi chạm tay?",
                description: [
                  "Printed on European textured art paper with subtle tactile grain",
                  "Muted, warm color absorption conveying couture craftsmanship",
                  "Pairs beautifully with cotton string, eyelet grommets, and foil stamping",
                ],
                descriptionVi: [
                  "In trên giấy mỹ thuật châu Âu có vân nhám đặc trưng, sang trọng khi chạm",
                  "Màu mực thấm tự nhiên tạo sắc thái trầm tĩnh, tôn vinh kỹ thuật may đo",
                  "Kết hợp hoàn hảo với dây cotton, khoen kim loại và chi tiết ép kim logo",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "Haute couture apparel, wedding dresses, and evening gowns",
                  "Artisan jewelry collections and luxury cashmere/silk garments",
                  "Exclusive designer collaborations and limited-edition releases",
                ],
                bestForVi: [
                  "Thời trang thiết kế cao cấp, váy cưới và dạ hội hạng sang",
                  "Bộ sưu tập trang sức thủ công và trang phục cashmere/lụa xa xỉ",
                  "Các phiên bản hợp tác đặc biệt của nhà thiết kế và hàng giới hạn",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
              {
                icon: "Sparkles",
                name: "Custom Die-Cut & Foil Stamped Tag",
                nameVi: "Mác Bế Hình Đặc Biệt + Ép Kim Logo",
                tagline: "Want a custom silhouette and shimmering metallic logo to distinguish your brand?",
                taglineVi: "Bạn muốn mác treo bế theo hình dáng độc quyền kèm ép kim logo lấp lánh?",
                description: [
                  "Custom die-cutting for round, arched, folded, or sculptural tag silhouettes",
                  "Metallic hot foil stamping (gold/silver/bronze) highlighting the brand crest",
                  "Optional metal eyelet grommet reinforcement around the drill hole",
                ],
                descriptionVi: [
                  "Bế khuôn tạo hình dáng độc đáo (tròn, vòm, gập đôi hoặc hình tượng đặc thù)",
                  "Ép kim logo nhũ vàng, nhũ bạc hoặc nhũ đồng nổi bật trên mặt chính",
                  "Có thể đóng thêm khoen kim loại bảo vệ lỗ xỏ dây thêm phần chắc chắn",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Premium denim brands, streetwear capsules, and luxury menswear",
                  "High-fashion lingerie, swimwear, and bespoke accessory brands",
                  "Brands seeking an unforgettable, sculptural swing tag presentation",
                ],
                bestForVi: [
                  "Thương hiệu denim cao cấp, streetwear bộ sưu tập và thời trang nam xa xỉ",
                  "Nội y cao cấp, trang phục bãi biển và phụ kiện thiết kế độc quyền",
                  "Các thương hiệu muốn tạo dấu ấn hình ảnh khác biệt qua chiếc mác treo",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
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
        images: [
          "/images/product/vd-item-lixi.jpeg",
          "/images/product/vd-item-lixi.jpeg",
          "/images/product/vd-item-lixi.jpeg",
        ],
        hideDoubleSidedCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche 150gsm Laminated (Standard Lì Xì)",
                nameVi: "Couche 150gsm Cán Màng (Chuẩn Lì Xì)",
                tagline: "Need vibrant red lucky envelopes with protective lamination for corporate gifting?",
                taglineVi: "Bạn cần bao lì xì đỏ rực rỡ, cán màng chống trầy cho quà tặng Tết doanh nghiệp?",
                description: [
                  "Smooth C150 coated paper with protective matte lamination for elegance",
                  "Vibrant Lunar New Year red and gold CMYK full-bleed reproduction",
                  "Standard 8x16cm size fitting Vietnamese banknotes straight without folding",
                ],
                descriptionVi: [
                  "Giấy Couche 150gsm láng mịn, cán màng mờ bảo vệ chống trầy xước, sang trọng",
                  "In màu CMYK rực rỡ sắc đỏ và vàng mang không khí may mắn ngày Tết",
                  "Kích thước chuẩn 8x16cm, vừa vặn tờ tiền Việt Nam thẳng phẳng không gập",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Corporate Tet giveaways for clients, employees, and partners",
                  "Bank, insurance, and real estate customer appreciation sets",
                  "Retail promotional gifts during the Lunar New Year shopping season",
                ],
                bestForVi: [
                  "Quà tặng tri ân dịp Tết dành cho đối tác, khách hàng và nhân viên",
                  "Bộ quà tặng tri ân của các ngân hàng, bảo hiểm và bất động sản",
                  "Quà tặng khuyến mãi dịp mua sắm sắm Tết cho cửa hàng bán lẻ",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 120 - 150gsm (Traditional Uncoated Lì Xì)",
                nameVi: "Ford 120 - 150gsm (Lì Xì Giấy Mộc Cổ Truyền)",
                tagline: "Want a traditional uncoated red envelope where you can write New Year wishes?",
                taglineVi: "Bạn muốn bao lì xì giấy mộc cổ truyền, dễ dàng viết lời chúc Tết lên phong bao?",
                description: [
                  "Natural matte uncoated Ford paper with authentic traditional warmth",
                  "Zero lamination glare, creating a nostalgic, artisanal holiday aesthetic",
                  "Allows handwritten New Year blessings and calligraphy pen signatures",
                ],
                descriptionVi: [
                  "Giấy Ford nhám mịn tự nhiên, mang lại cảm giác truyền thống ấm áp",
                  "Hoàn toàn không bóng chói, tạo thẩm mỹ thủ công, hoài niệm ngày Tết",
                  "Dễ dàng dùng bút thư pháp hoặc bút mực viết lời chúc may mắn lên phong bao",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Traditional cultural brands, tea houses, and Vietnamese heritage gifts",
                  "Schools, universities, and cultural organizations celebrating Tet",
                  "Minimalist holiday designs pairing red paper with gold calligraphy",
                ],
                bestForVi: [
                  "Thương hiệu văn hóa truyền thống, tiệm trà và quà tặng đậm chất Việt",
                  "Trường học, đại học và các tổ chức văn hóa mừng xuân mới",
                  "Thiết kế tối giản kết hợp nền giấy đỏ mộc và chữ thư pháp vàng",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Palette",
                name: "Luxury Red Textured Art Paper",
                nameVi: "Giấy Mỹ Thuật Đỏ Vân Nhám Sang Trọng",
                tagline: "Want a bespoke European textured art paper red envelope that conveys prestige?",
                taglineVi: "Bạn muốn bao lì xì trên giấy mỹ thuật đỏ có vân nhám châu Âu khác biệt khi chạm?",
                description: [
                  "Crafted from premium dyed-red European textured art paper",
                  "Rich tactile surface grain exuding executive exclusivity and respect",
                  "Pairs immaculately with metallic gold foil stamping and blind debossing",
                ],
                descriptionVi: [
                  "Chế tác từ giấy mỹ thuật châu Âu nhuộm đỏ nguyên bản từ xơ giấy",
                  "Vân nhám đặc trưng sang trọng, thể hiện sự trân quý và uy tín của chủ nhân",
                  "Kết hợp hoàn hảo với gia công ép kim nhũ vàng 24K và dập chìm họa tiết",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "C-suite executive gifting for VIP partners and major investors",
                  "Luxury hotels, private banking wealth management, and high-end fashion",
                  "Exclusive limited-edition Tet gift sets for discerning clients",
                ],
                bestForVi: [
                  "Quà tặng Tết đẳng cấp của lãnh đạo C-suite gửi đối tác và nhà đầu tư lớn",
                  "Khách sạn 5 sao, dịch vụ ngân hàng VIP và thương hiệu thời trang xa xỉ",
                  "Bộ lì xì phiên bản giới hạn dành riêng cho khách hàng VIP",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
              {
                icon: "Sparkles",
                name: "24K Gold Foil Stamped Lì Xì",
                nameVi: "Ép Kim Nhũ Vàng 24K Rực Rỡ",
                tagline: "Want your brand logo and New Year dragon motif to blaze in metallic gold foil?",
                taglineVi: "Bạn muốn logo thương hiệu và linh vật Tết bừng sáng với nhũ vàng 24K lấp lánh?",
                description: [
                  "Precision hot foil stamping in radiant 24K gold, silver, or holographic metallic",
                  "Creates a dazzling contrast against red matte lamination or art paper",
                  "Symbolizes prosperity, good fortune, and corporate success for the new year",
                ],
                descriptionVi: [
                  "Gia công ép kim nhũ vàng 24K, nhũ bạc hoặc nhũ ánh kim hologram rực rỡ",
                  "Tạo độ tương phản lấp lánh mạnh mẽ trên nền đỏ cán mờ hoặc giấy mỹ thuật",
                  "Biểu tượng cho tài lộc, thịnh vượng và thành công vượt bậc trong năm mới",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Premium corporate Tet hampers and executive appreciation packages",
                  "Fine jewelry houses, luxury automotive brands, and real estate groups",
                  "Brands seeking a prosperous, celebratory Lunar New Year statement",
                ],
                bestForVi: [
                  "Giỏ quà Tết doanh nghiệp VIP và bộ quà tri ân đối tác cao cấp",
                  "Thương hiệu trang sức đá quý, xe hơi hạng sang và tập đoàn bất động sản",
                  "Doanh nghiệp muốn khẳng định hình ảnh thịnh vượng, may mắn đầu xuân",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
              {
                icon: "Layers",
                name: "3D Embossed Festive Pattern Lì Xì",
                nameVi: "Dập Nổi 3D Hoa Văn Thần Tài / Linh Vật",
                tagline: "Want intricate 3D sculptural relief for auspicious symbols and traditional crests?",
                taglineVi: "Bạn muốn họa tiết linh vật hay Thần Tài nổi bật với độ sâu 3D trên bao lì xì?",
                description: [
                  "Tactile 3D embossing raising dragons, blossoms, and prosperity symbols",
                  "Adds sculptural luxury that recipients can feel immediately in their hands",
                  "Combined with gold foil for a multi-sensory Lunar New Year masterpiece",
                ],
                descriptionVi: [
                  "Kỹ thuật dập nổi 3D tạo khối cho rồng, hoa mai, hoa đào và chữ Lộc/Phúc",
                  "Tạo cảm giác xúc giác sống động, sang trọng khi người nhận cầm trên tay",
                  "Kết hợp cùng ép kim vàng tạo nên tác phẩm nghệ thuật chúc xuân hoàn hảo",
                ],
                descriptionTraits: ["embossed-depth", "natural-grain", "foil-accent"],
                bestFor: [
                  "Top-tier corporate jubilee Tet gifts and VIP investor correspondence",
                  "Luxury resort Tet welcome packages for VIP guests",
                  "Collector's edition red envelopes designed for permanent remembrance",
                ],
                bestForVi: [
                  "Quà Tết cao cấp nhất của tập đoàn gửi đối tác chiến lược và nhà đầu tư",
                  "Bộ quà mừng xuân chào mừng khách VIP tại các khu nghỉ dưỡng 5 sao",
                  "Bao lì xì phiên bản sưu tầm mang tính nghệ thuật và lưu niệm cao",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "thiep-tet",
        nameEn: "Tet Greeting Card",
        nameVi: "Thiệp chúc Tết",
        description: "Printed New Year greeting cards for clients and partners.",
        descriptionVi: "Thiệp chúc mừng năm mới gửi đến khách hàng và đối tác.",
        image: "/images/product/vd-item-thieptet.jpg",
        images: [
          "/images/product/vd-item-thieptet.jpg",
          "/images/product/vd-item-thieptet.jpg",
          "/images/product/vd-item-thieptet.jpg",
        ],
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche 300gsm Laminated (Standard Card)",
                nameVi: "Couche 300gsm Cán Màng (Chuẩn Thiệp Tết)",
                tagline: "Need a crisp, rigid New Year greeting card with vibrant festive artwork?",
                taglineVi: "Bạn cần thiệp chúc Tết cứng cáp, màu sắc sắc nét cho khách hàng và đối tác?",
                description: [
                  "Heavyweight C300 coated board with protective matte or glossy lamination",
                  "Vibrant CMYK reproduction of spring blossoms, fireworks, and calligraphy",
                  "Standard folded A5 or long greeting format with matching envelopes",
                ],
                descriptionVi: [
                  "Giấy Couche 300gsm dày dặn được cán màng mờ hoặc bóng bảo vệ sang trọng",
                  "In màu CMYK rực rỡ hình ảnh hoa xuân, pháo hoa và lời chúc năm mới",
                  "Quy cách thiệp gấp A5 hoặc thiệp dài chuẩn mực kèm bao thư đồng bộ",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Corporate New Year greetings for clients, suppliers, and staff",
                  "Bank and insurance client appreciation holiday cards",
                  "Retail loyalty program holiday thank-you mailers",
                ],
                bestForVi: [
                  "Thiệp chúc Tết doanh nghiệp gửi đối tác, nhà cung cấp và nhân viên",
                  "Thiệp chúc mừng xuân mới của các ngân hàng, công ty bảo hiểm",
                  "Thư ngỏ tri ân khách hàng thân thiết dịp cuối năm",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 300gsm (Writable Holiday Card)",
                nameVi: "Ford 300gsm (Thiệp Giấy Mộc Dễ Viết)",
                tagline: "Want an uncoated holiday card where executives can pen handwritten messages?",
                taglineVi: "Bạn muốn thiệp Tết giấy mộc để lãnh đạo viết tay lời chúc riêng tới đối tác?",
                description: [
                  "Natural matte uncoated Ford 300gsm board with warm tactile texture",
                  "Absorbs fountain pens, calligraphic ink, and signatures without bleeding",
                  "Conveys a heartfelt, personal corporate touch that glossy cards cannot match",
                ],
                descriptionVi: [
                  "Giấy Ford 300gsm nhám mịn tự nhiên, mang lại cảm giác mộc mạc và chân thành",
                  "Bám mực bút máy, bút thư pháp và bút ký lãnh đạo mượt mà không bị nhòe",
                  "Thể hiện sự trân quý cá nhân hóa sâu sắc gửi đến từng đối tác quan trọng",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "CEO and C-suite handwritten New Year greetings to key partners",
                  "Educational, cultural, and diplomatic New Year correspondence",
                  "Minimalist holiday cards prioritizing authentic warmth and simplicity",
                ],
                bestForVi: [
                  "Lãnh đạo CEO viết tay lời chúc mừng năm mới gửi đối tác chiến lược",
                  "Thiệp chúc Tết của các cơ quan ngoại giao, giáo dục và tổ chức văn hóa",
                  "Thiệp Tết tối giản chú trọng sự tinh tế, ấm áp và chân thật",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Palette",
                name: "Luxury Textured Art Paper Greeting Card",
                nameVi: "Giấy Mỹ Thuật Vân Nhám Sang Trọng",
                tagline: "Want a bespoke European textured art card that conveys exceptional prestige?",
                taglineVi: "Bạn muốn thiệp chúc Tết mang vân giấy mỹ thuật châu Âu sang trọng khi chạm tay?",
                description: [
                  "Printed on European textured art paper with tactile surface grain",
                  "Subtle, refined color absorption creating an artisan holiday aesthetic",
                  "Pairs immaculately with metallic foil stamping and custom envelope liners",
                ],
                descriptionVi: [
                  "In trên giấy mỹ thuật châu Âu có vân nhám đặc trưng, sang trọng khi chạm",
                  "Thấm màu mực tự nhiên tạo sắc thái trầm ấm, thanh lịch và nghệ thuật",
                  "Kết hợp hoàn hảo với ép kim nhũ vàng và bao thư lót họa tiết đồng bộ",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "Luxury real estate, private banking, and 5-star hotel New Year greetings",
                  "Architecture studios, interior designers, and fashion brand cards",
                  "VIP partner gifting accompanied by luxury holiday hampers",
                ],
                bestForVi: [
                  "Bất động sản hạng sang, ngân hàng VIP và khách sạn 5 sao chúc Tết",
                  "Studio kiến trúc, thiết kế nội thất và các thương hiệu thời trang cao cấp",
                  "Thiệp chúc mừng đi kèm giỏ quà Tết thượng hạng gửi đối tác VVIP",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
              {
                icon: "Sparkles",
                name: "Pearl Metallic Shimmer Card",
                nameVi: "Giấy Ngọc Trai Ánh Kim Lấp Lánh",
                tagline: "Want your Tet greeting card to shimmer with a festive pearlescent glow?",
                taglineVi: "Bạn muốn thiệp chúc Tết lấp lánh ánh ngọc trai sang trọng dưới ánh đèn xuân?",
                description: [
                  "Infused with mica metallic particles for a radiant pearlescent sheen",
                  "Shifts luminosity beautifully when the recipient opens the card",
                  "Elevates traditional spring blossoms and gold typography without extra foil",
                ],
                descriptionVi: [
                  "Bề mặt phủ tinh thể vi mica tạo ánh lấp lánh như ngọc trai sang trọng",
                  "Hiệu ứng chuyển đổi độ sáng rực rỡ khi người nhận lật mở thiệp chúc",
                  "Tôn vinh họa tiết hoa mai, hoa đào và lời chúc xuân lấp lánh tự nhiên",
                ],
                descriptionTraits: ["metallic-shine", "smooth-base", "soft-light"],
                bestFor: [
                  "High-end cosmetic brands, jewelry boutiques, and luxury spas",
                  "Upscale corporate event invitations for New Year gala celebrations",
                  "Brands seeking a radiant, feminine, or opulent holiday presentation",
                ],
                bestForVi: [
                  "Thương hiệu mỹ phẩm cao cấp, trang sức, viện thẩm mỹ và spa",
                  "Thiệp mời tiệc tân niên, tiệc mừng xuân của tập đoàn lớn",
                  "Doanh nghiệp hướng tới phong cách chúc xuân sang trọng, rực rỡ",
                ],
                image: "/images/product/card-pearl1.webp",
                images: [
                  "/images/product/card-pearl1.webp",
                  "/images/product/card-pearl2.webp",
                  "/images/product/card-pearl3.webp",
                ],
                hideFoilCheckbox: true,
              },
              {
                icon: "Layers",
                name: "Gold Foil Stamped & 3D Embossed Card",
                nameVi: "Ép Kim Nhũ Vàng & Dập Nổi 3D",
                tagline: "Want auspicious New Year calligraphy to gleam in gold foil and raised 3D relief?",
                taglineVi: "Bạn muốn chữ Lộc/Phúc và hoa xuân lấp lánh ép kim vàng cùng dập nổi 3D?",
                description: [
                  "Precision hot foil stamping applied to holiday greetings and brand logos",
                  "3D embossing raises festive dragon or floral motifs into sculptural relief",
                  "Delivers an unforgettable multi-sensory masterpiece of holiday respect",
                ],
                descriptionVi: [
                  "Ép kim nhũ vàng 24K sắc nét cho lời chúc mừng năm mới và logo công ty",
                  "Dập nổi 3D tạo khối cho hoa mai, hoa đào, linh vật và chữ Phúc/Lộc/Thọ",
                  "Tạo tác phẩm chúc xuân đa giác quan hoàn hảo, khẳng định vị thế thương hiệu",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Top-tier corporate gifting for C-suite partners and investors",
                  "Luxury hotel brands, fine dining groups, and fashion houses",
                  "Companies seeking maximum brand prestige during the Lunar New Year",
                ],
                bestForVi: [
                  "Quà tặng đẳng cấp cao nhất dành cho đối tác chiến lược và nhà đầu tư",
                  "Tập đoàn khách sạn, ẩm thực cao cấp và thương hiệu thời trang",
                  "Doanh nghiệp muốn khẳng định uy tín và lời chúc thịnh vượng đầu xuân",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
      {
        id: "lich-tet",
        nameEn: "Tet Calendar",
        nameVi: "Lịch Tết",
        description: "Desk and wall calendars themed for the Lunar New Year season.",
        descriptionVi: "Lịch để bàn và lịch treo tường mang chủ đề Tết Nguyên Đán.",
        image: "/images/product/vd-item-lichtet.jpg",
        images: [
          "/images/product/vd-item-lichtet.jpg",
          "/images/product/vd-item-lichtet.jpg",
          "/images/product/vd-item-lichtet.jpg",
        ],
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "A-Frame Desk Calendar (C230gsm Laminated)",
                nameVi: "Lịch Để Bàn Chữ A (C230 - C250 Cán Màng)",
                tagline: "Need a practical 13-sheet corporate Tet desk calendar for client gifting?",
                taglineVi: "Bạn cần lịch để bàn 13 tờ chuẩn mực làm quà Tết tặng đối tác và nhân viên?",
                description: [
                  "13-sheet A-frame desk calendar printed on smooth C230 or C250 coated paper",
                  "Sturdy rigid cardboard base in dark blue, red, or custom brand colors",
                  "Twin-loop metallic Wire-O binding for smooth year-round page turning",
                ],
                descriptionVi: [
                  "Quy cách 13 tờ (1 tờ bìa + 12 tháng) in trên giấy Couche 230 - 250gsm mịn đẹp",
                  "Đế bìa cứng bồi chắc chắn với màu đỏ Tết, xanh đen hoặc theo nhận diện riêng",
                  "Lò xo kim loại đôi (Wire-O) siêu bền, lật trang nhẹ nhàng không cộm",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Corporate New Year gifting for clients, vendors, and partners",
                  "Year-round brand visibility on executive office desks",
                  "Employee onboarding and internal company Tet gifts",
                ],
                bestForVi: [
                  "Quà tặng tri ân dịp Tết dành cho đối tác, khách hàng và nhà cung cấp",
                  "Tăng độ nhận diện thương hiệu suốt 365 ngày trên bàn làm việc",
                  "Quà tặng nhân viên và ấn phẩm văn phòng mừng xuân mới",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Ford 230 - 250gsm (Writable Tet Calendar)",
                nameVi: "Lịch Để Bàn Giấy Ford (Dễ Ghi Chú)",
                tagline: "Want a non-glossy desk calendar where your team can write reminders easily?",
                taglineVi: "Bạn muốn lịch để bàn giấy mộc không chói sáng, tiện ghi chú lịch làm việc?",
                description: [
                  "Uncoated Ford 230-250gsm paper that absorbs pen and pencil notes instantly",
                  "Soft matte surface with zero reflections under office fluorescent lighting",
                  "Clean, minimalist aesthetic that looks professional on executive desks",
                ],
                descriptionVi: [
                  "Giấy Ford 230 - 250gsm không tráng phủ, bám mực bút bi và bút chì cực tốt",
                  "Bề mặt nhám mịn không phản quang, bảo vệ mắt dưới ánh đèn văn phòng",
                  "Phong cách tối giản, chuẩn mực, phù hợp không gian làm việc hiện đại",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Project managers, accountants, and executives who take daily notes",
                  "Academic institutions, law offices, and consulting firms",
                  "Companies desiring a practical, non-glossy desktop organizer",
                ],
                bestForVi: [
                  "Quản lý dự án, kế toán và lãnh đạo thường xuyên ghi chú lịch công tác",
                  "Trường học, văn phòng luật sư và các tổ chức tư vấn chuyên nghiệp",
                  "Doanh nghiệp ưu tiên trải nghiệm tiện dụng, không bóng chói",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Award",
                name: "Large Wall Calendar 7 Sheets (Wire-O)",
                nameVi: "Lịch Treo Tường Lò Xo 7 Tờ Khổ Lớn",
                tagline: "Need large-format wall calendars showcasing auspicious spring landscapes?",
                taglineVi: "Bạn cần lịch treo tường khổ lớn in ảnh phong cảnh xuân rực rỡ may mắn?",
                description: [
                  "Large-format 7-sheet (bi-monthly) wall calendar with top wire loop",
                  "High-resolution CMYK lamination preserving vivid seasonal colors all year",
                  "Strong central hanger loop designed to support large sheet weights without sagging",
                ],
                descriptionVi: [
                  "Lịch treo tường khổ lớn 7 tờ (2 tháng/tờ) gắn lò xo kim loại trên đỉnh",
                  "In màu CMYK độ phân giải cao, hiển thị hình ảnh xuân thịnh vượng rực rỡ",
                  "Móc treo kim loại chịu lực chắc chắn, giữ lịch thẳng thớm suốt năm",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Construction firms, architecture studios, and real estate developers",
                  "Manufacturing, aviation, and logistics corporate giveaways",
                  "High-impact wall branding in client reception areas and lobbies",
                ],
                bestForVi: [
                  "Công ty xây dựng, kiến trúc và chủ đầu tư dự án bất động sản",
                  "Quà tặng doanh nghiệp ngành sản xuất, hàng không và logistics",
                  "Trang trí và truyền thông thương hiệu tại khu vực lễ tân, phòng khách",
                ],
                image: "/images/product/vd-item-lichtet.jpg",
                images: [
                  "/images/product/vd-item-lichtet.jpg",
                  "/images/product/vd-item-lichtet.jpg",
                  "/images/product/vd-item-lichtet.jpg",
                ],
              },
              {
                icon: "Gem",
                name: "Luxury Bloc Calendar + Foil Board",
                nameVi: "Lịch Bloc Siêu Đại Bìa Cứng Ép Kim",
                tagline: "Want a monumental 365-day bloc calendar mounted on an embossed foil backboard?",
                taglineVi: "Bạn muốn lịch bloc siêu đại 365 ngày bồi bìa cứng ép kim vàng đẳng cấp?",
                description: [
                  "365-day tear-off calendar bloc mounted onto a 3mm rigid embossed backboard",
                  "Extensive hot foil stamping in 24K gold on traditional dragons and symbols",
                  "A monumental corporate Tet gift that anchors office or living room decor",
                ],
                descriptionVi: [
                  "Lịch bloc xé từng ngày 365 tờ bồi lên bìa cứng carton lạnh 3mm sang trọng",
                  "Ép kim nhũ vàng 24K rực rỡ trên biểu tượng linh vật, Thần Tài và Phúc/Lộc",
                  "Món quà Tết trọng lượng, khẳng định uy tín vượt trội của thương hiệu",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Top-tier corporate gifting for major shareholders and VIP customers",
                  "Traditional Vietnamese enterprises, banking groups, and conglomerates",
                  "Prestigious New Year presents designed to occupy pride of place in homes",
                ],
                bestForVi: [
                  "Quà tặng tri ân đặc biệt cho cổ đông lớn và khách hàng VIP chiến lược",
                  "Tập đoàn truyền thống, ngân hàng, bảo hiểm và các tổng công ty",
                  "Món quà xuân đẳng cấp được treo ở vị trí trang trọng nhất trong nhà",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
              },
              {
                icon: "Palette",
                name: "Wooden Stand VIP Corporate Calendar",
                nameVi: "Lịch Đế Gỗ Cao Cấp Doanh Nghiệp",
                tagline: "Want a bespoke calendar with individual art paper sheets on a solid wood base?",
                taglineVi: "Bạn muốn bộ lịch đế gỗ tự nhiên sang trọng kèm từng tờ lịch giấy mỹ thuật?",
                description: [
                  "Individual monthly sheets printed on European textured art paper",
                  "Mounted on a custom-crafted natural walnut or beech wooden base",
                  "Refined executive tabletop accessory that doubles as an art piece",
                ],
                descriptionVi: [
                  "Từng tờ lịch tháng rời được in trên giấy mỹ thuật châu Âu vân nhám cao cấp",
                  "Đặt trên chân đế bằng gỗ sồi hoặc gỗ óc chó tự nhiên gia công tinh xảo",
                  "Vật phẩm để bàn sang trọng, vừa xem ngày vừa làm điểm nhấn trang trí VIP",
                ],
                descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
                bestFor: [
                  "C-suite executive desk gifts for CEO partners and private wealth clients",
                  "Luxury interior design, architecture studios, and boutique hotels",
                  "Limited-edition corporate gifts for key brand ambassadors",
                ],
                bestForVi: [
                  "Quà tặng để bàn lãnh đạo CEO, đối tác VIP và khách hàng tài chính riêng",
                  "Studio kiến trúc, thiết kế nội thất và chuỗi khách sạn boutique 5 sao",
                  "Quà tặng phiên bản giới hạn dành cho các đại sứ thương hiệu trọng điểm",
                ],
                image: "/images/product/vd-item-lichtet.jpg",
                images: [
                  "/images/product/vd-item-lichtet.jpg",
                  "/images/product/vd-item-lichtet.jpg",
                  "/images/product/vd-item-lichtet.jpg",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "hop-qua-tet",
        nameEn: "Tet Gift Box",
        nameVi: "Hộp quà Tết",
        description: "Festive gift boxes for Tet hampers and corporate gifting.",
        descriptionVi: "Hộp quà mang không khí Tết dùng cho giỏ quà và quà tặng doanh nghiệp.",
        image: "/images/product/vd-item-hopquatet.jpeg",
        images: [
          "/images/product/vd-item-hopquatet.jpeg",
          "/images/product/vd-item-hopquatet.jpeg",
          "/images/product/vd-item-hopquatet.jpeg",
        ],
        hideDoubleSidedCheckbox: true,
        optionGroups: [
          {
            options: [
              {
                icon: "Layers",
                name: "Couche 350gsm (Laminated Gift Box)",
                nameVi: "Couche 350gsm Cán Màng (Chuẩn Hộp Quà)",
                tagline: "Need vibrant, sturdy folding gift boxes for Tet confectioneries and wine?",
                taglineVi: "Bạn cần hộp quà Tết màu sắc rực rỡ, cứng cáp đựng bánh kẹo và trà rượu?",
                description: [
                  "Smooth C350 coated board with protective matte or glossy lamination",
                  "Vibrant Lunar New Year red and gold CMYK full-bleed reproduction",
                  "Reinforced locking base designed to hold wine bottles and heavy hampers",
                ],
                descriptionVi: [
                  "Giấy Couche 350gsm dày dặn được cán màng mờ hoặc bóng bảo vệ sang trọng",
                  "In màu CMYK sắc đỏ và vàng rực rỡ mang không khí may mắn ngày Tết",
                  "Gia cố khóa đáy chịu lực tốt khi đựng chai rượu vang và hộp quà nặng",
                ],
                descriptionTraits: ["smooth-base", "glossy-coat", "soft-light"],
                bestFor: [
                  "Corporate Tet gift sets bundling wine, tea, and traditional sweetmeats",
                  "Retail confectionery, biscuit, and dried fruit holiday packaging",
                  "Staff and employee holiday appreciation gift packs",
                ],
                bestForVi: [
                  "Bộ hộp quà Tết doanh nghiệp kết hợp rượu vang, trà và mứt tết",
                  "Bao bì bánh kẹo, các loại hạt và hoa quả sấy mùa Tết bán lẻ",
                  "Hộp quà tặng tri ân công đoàn dành cho nhân viên cuối năm",
                ],
                image: "/images/product/card-c300-foil1.webp",
                images: [
                  "/images/product/card-c300-foil1.webp",
                  "/images/product/card-c300-foil2.webp",
                  "/images/product/card-c300-foil3.webp",
                ],
                pureImage: "/images/product/card-c300-1.webp",
                pureImages: [
                  "/images/product/card-c300-1.webp",
                  "/images/product/card-c300-2.webp",
                  "/images/product/card-c300-3.webp",
                ],
              },
              {
                icon: "ShieldCheck",
                name: "Ivory 350 - 400gsm (Ultra-Rigid Box)",
                nameVi: "Ivory 350 - 400gsm (Hộp Siêu Cứng)",
                tagline: "Need maximum folding box stiffness and crisp white interior for premium hampers?",
                taglineVi: "Bạn cần hộp quà siêu cứng, độ bền cao và mặt trong trắng sạch cho quà VIP?",
                description: [
                  "Bright-white coated exterior with high tensile strength and tear resistance",
                  "Superior structural rigidity preventing box crushing during transport",
                  "Holds hot foil stamping and embossed festive crests beautifully",
                ],
                descriptionVi: [
                  "Mặt ngoài trắng mịn tráng phủ cao cấp, độ dai và chịu lực vượt trội",
                  "Độ cứng phom hộp vượt trội, không bị bóp méo khi đóng gói và vận chuyển",
                  "Khả năng bắt nhũ ép kim và dập nổi biểu tượng Tết cực kỳ sắc nét",
                ],
                descriptionTraits: ["smooth-base", "natural-grain", "foil-accent"],
                bestFor: [
                  "Premium bird's nest (yến sào), ginseng, and health tonic Tet hampers",
                  "Luxury cosmetic and personal care holiday gift sets",
                  "Corporate gift packages requiring structural elegance and durability",
                ],
                bestForVi: [
                  "Hộp quà yến sào, nhân sâm và thực phẩm bồi bổ sức khỏe cao cấp mùa Tết",
                  "Bộ quà tặng mỹ phẩm, chăm sóc sức khỏe và làm đẹp ngày xuân",
                  "Quà tặng doanh nghiệp yêu cầu phom hộp vững chãi, sang trọng",
                ],
                image: "/images/product/card-f300-foil1.webp",
                images: [
                  "/images/product/card-f300-foil1.webp",
                  "/images/product/card-f300-foil2.webp",
                  "/images/product/card-f300-foil3.webp",
                ],
                pureImage: "/images/product/card-f300-3.webp",
                pureImages: [
                  "/images/product/card-f300.webp",
                  "/images/product/card-f300-2.webp",
                  "/images/product/card-f300-3.webp",
                ],
              },
              {
                icon: "Gem",
                name: "Rigid Hardcover Box (Bồi Carton 2-3mm)",
                nameVi: "Hộp Cứng Bồi Carton 2 - 3mm (Hộp Quà VIP)",
                tagline: "Want an opulent rigid hamper box that makes a monumental VIP statement?",
                taglineVi: "Bạn muốn hộp quà cứng cao cấp bồi carton dày 2-3mm cho đối tác VVIP?",
                description: [
                  "2mm to 3mm rigid greyboard wrapped in printed C150 or luxury art paper",
                  "Available in magnetic closure, lift-off lid, or sliding drawer box styles",
                  "Enhanced with hot foil stamping, embossing, and custom velvet/EVA inserts",
                ],
                descriptionVi: [
                  "Carton lạnh dày 2 - 3mm bồi giấy Couche in màu hoặc giấy mỹ thuật xa xỉ",
                  "Quy cách hộp nam châm nắp gập, hộp âm dương hoặc hộp kéo bao diêm sang trọng",
                  "Tích hợp ép kim nhũ vàng, dập nổi logo và khay mút lót nhung bảo vệ sản phẩm",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "VIP corporate Tet gift hampers and C-suite executive presents",
                  "High-end imported spirits, vintage wine, and premium cigar hampers",
                  "Luxury limited-edition holiday sets for major shareholders",
                ],
                bestForVi: [
                  "Hộp quà Tết doanh nghiệp VIP và quà tri ân đối tác cấp cao C-suite",
                  "Hộp rượu ngoại nhập khẩu sang trọng, xì gà và quà thượng hạng",
                  "Bộ hộp quà giới hạn mừng xuân dành cho các cổ đông và nhà đầu tư lớn",
                ],
                image: "/images/product/card-art-foil1.webp",
                images: [
                  "/images/product/card-art-foil1.webp",
                  "/images/product/card-art-foil2.webp",
                  "/images/product/card-art-foil3.webp",
                ],
                pureImage: "/images/product/card-art1.webp",
                pureImages: [
                  "/images/product/card-art1.webp",
                  "/images/product/card-art2.webp",
                  "/images/product/card-art3.webp",
                ],
              },
              {
                icon: "Feather",
                name: "Natural Kraft 300 - 350gsm (Eco Tet Box)",
                nameVi: "Hộp Quà Giấy Kraft Nâu (Rustic Tet)",
                tagline: "Want a sustainable, rustic Tet hamper box with traditional Vietnamese warmth?",
                taglineVi: "Bạn muốn hộp quà Tết mang phong cách mộc mạc, truyền thống và thân thiện?",
                description: [
                  "100% recycled natural brown Kraft paper with authentic organic texture",
                  "High tear resistance and traditional wood-fiber visual warmth",
                  "Looks stunning with red calligraphy, black ink, or gold foil stamping",
                ],
                descriptionVi: [
                  "Giấy Kraft nâu tự nhiên tái chế 100% với vân xơ giấy mộc mạc, chân thực",
                  "Độ dai cao, mang lại thiện cảm thẩm mỹ truyền thống ấm áp ngày Tết",
                  "Hiệu ứng thị giác tuyệt đẹp khi kết hợp thư pháp đỏ, mực đen hoặc ép kim",
                ],
                descriptionTraits: ["natural-grain", "soft-light", "foil-accent"],
                bestFor: [
                  "Traditional Vietnamese dried fruits (mứt tết), tea, and organic nuts",
                  "Artisan agricultural cooperatives and eco-friendly brand gift sets",
                  "Rustic holiday hampers celebrating heritage and natural wellness",
                ],
                bestForVi: [
                  "Hộp mứt Tết truyền thống, trà đặc sản, hạt điều và hoa quả sấy tự nhiên",
                  "Quà Tết từ các hợp tác xã nông sản sạch và thương hiệu hữu cơ",
                  "Giỏ quà xuân mộc mạc tôn vinh văn hóa truyền thống và lối sống xanh",
                ],
                image: "/images/product/vd-card-f300.png",
                images: [
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                  "/images/product/vd-card-f300.png",
                ],
              },
              {
                icon: "Sparkles",
                name: "Foil Stamped & Spot UV Festive Pattern",
                nameVi: "Ép Kim Hoa Văn Tết & UV Định Hình 3D",
                tagline: "Want your Tet box to shimmer with 24K gold foil dragons and raised gloss motifs?",
                taglineVi: "Bạn muốn hộp quà Tết rực rỡ ép kim nhũ vàng linh vật và nổi bật UV 3D?",
                description: [
                  "Metallic gold or holographic foil applied to dragons, blossoms, and logos",
                  "Raised Spot UV gloss creates tactile contrast against velvet matte covers",
                  "Maximum festive luxury that commands prestige in any living room",
                ],
                descriptionVi: [
                  "Ép kim nhũ vàng 24K hoặc ánh kim hologram cho rồng, hoa mai và logo",
                  "Phủ UV bóng định hình tạo họa tiết nổi 3D tương phản trên nền cán mờ mịn",
                  "Tạo vẻ đẹp đẳng cấp vượt trội, bừng sáng không gian phòng khách ngày xuân",
                ],
                descriptionTraits: ["foil-accent", "embossed-depth", "glossy-coat"],
                bestFor: [
                  "Top-tier corporate Tet hampers for strategic business partners",
                  "5-star hotel and luxury restaurant festive takeaway hampers",
                  "Brands seeking an unforgettable, prosperous Lunar New Year statement",
                ],
                bestForVi: [
                  "Hộp quà Tết doanh nghiệp đẳng cấp cao nhất gửi đối tác chiến lược",
                  "Giỏ quà mang đi (Hamper takeaway) của chuỗi khách sạn 5 sao, nhà hàng sang trọng",
                  "Doanh nghiệp muốn tạo ấn tượng thịnh vượng, đẳng cấp dịp Tết Nguyên Đán",
                ],
                image: "/images/product/card-embossed-foil1.webp",
                images: [
                  "/images/product/card-embossed-foil1.webp",
                  "/images/product/card-embossed-foil2.webp",
                  "/images/product/card-embossed-foil3.webp",
                ],
                pureImage: "/images/product/card-embossed1.webp",
                pureImages: [
                  "/images/product/card-embossed1.webp",
                  "/images/product/card-embossed2.webp",
                  "/images/product/card-embossed3.webp",
                ],
                hideFoilCheckbox: true,
              },
            ],
          },
        ],
      },
    ],
  },
];

// Curated showcase images for the /products listing page hero gallery.
// Reuses real product photos whose subject matches the showcase label.
export const showcaseImages = [
  { seed: "vd-show-1", src: "/images/product/vd-item-card.jpeg", label: "Danh thiếp cao cấp", labelEn: "Premium Business Cards", aspect: "tall" },
  { seed: "vd-show-2", src: "/images/product/vd-item-box.jpg", label: "Hộp giấy sang trọng", labelEn: "Luxury Packaging", aspect: "square" },
  { seed: "vd-show-3", src: "/images/product/vd-item-catalogue.jpeg", label: "Catalogue chuyên nghiệp", labelEn: "Professional Catalogue", aspect: "square" },
  { seed: "vd-show-4", src: "/images/product/vd-item-label.jpeg", label: "Nhãn mác tinh tế", labelEn: "Premium Labels", aspect: "wide" },
  { seed: "vd-show-5", src: "/images/product/vd-item-lixi.jpeg", label: "Bao lì xì Tết", labelEn: "Tet Lucky Envelopes", aspect: "wide" },
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
