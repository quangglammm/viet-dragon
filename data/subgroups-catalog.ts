// data/subgroups-catalog.ts
// Structured catalog for Subgroups (Menu con) containing:
// - Shapes (Hình thức) -> rendered as cards on /products/[categoryId]/[subgroupId]
// - Materials (Chất liệu) -> rendered as flashcards on /products/[categoryId]/[subgroupId]/[shapeId]

import type { ProductCategory, ProductOption } from "@/data/categories";
import storedProducts from "./content/products.json";

export interface ShapeItem {
  id: string;
  nameVi: string;
  nameEn: string;
  nameZh?: string;
  nameJa?: string;
  nameKo?: string;
  descriptionVi: string;
  descriptionEn: string;
  image: string;
  badgeVi?: string;
  badgeEn?: string;
}

export interface SubgroupCategory {
  id: string; // e.g. "poster-bangron-standee", "danh-thiep", "tui-giay", "bao-li-xi", "to-roi", etc.
  categoryId: "marketing" | "office" | "packaging" | "tet";
  titleVi: string;
  titleEn: string;
  titleZh?: string;
  titleJa?: string;
  titleKo?: string;
  descriptionVi: string;
  descriptionEn: string;
  coverImage: string;
  shapes: ShapeItem[];
  materials: ProductOption[];
}

export function getOriginalOptions(...productIds: string[]): ProductOption[] {
  const list: ProductOption[] = [];
  const categories = storedProducts as unknown as ProductCategory[];
  for (const pid of productIds) {
    for (const cat of categories) {
      const item = cat.items?.find((i) => i.id === pid);
      if (item?.optionGroups?.[0]?.options) {
        list.push(...item.optionGroups[0].options);
      }
    }
  }
  return list;
}

export function mergeMaterials(
  originalOpts: ProductOption[],
  submenuOpts: ProductOption[],
  priority: "original-first" | "submenu-first" = "original-first"
): ProductOption[] {
  const primary = priority === "original-first" ? originalOpts : submenuOpts;
  const secondary = priority === "original-first" ? submenuOpts : originalOpts;

  const result: ProductOption[] = [...primary];
  for (const opt of secondary) {
    const existing = result.find(
      (r) =>
        r.nameVi.trim().toLowerCase() === opt.nameVi.trim().toLowerCase() ||
        r.name.trim().toLowerCase() === opt.name.trim().toLowerCase()
    );
    if (!existing) {
      result.push(opt);
    }
  }

  // Ensure every option has 3 pureImages
  return result.map((opt) => {
    let pureImages = opt.pureImages;
    if (!pureImages || pureImages.length === 0) {
      if (opt.images && opt.images.length >= 3) {
        pureImages = opt.images;
      } else if (opt.pureImage) {
        pureImages = [opt.pureImage, opt.pureImage, opt.pureImage];
      } else if (opt.image) {
        pureImages = [opt.image, opt.image, opt.image];
      }
    } else if (pureImages.length === 1) {
      pureImages = [pureImages[0], pureImages[0], pureImages[0]];
    } else if (pureImages.length === 2) {
      pureImages = [pureImages[0], pureImages[1], pureImages[0]];
    }
    return {
      ...opt,
      pureImages,
    };
  });
}

export const SUBGROUPS_CATALOG: SubgroupCategory[] = [
  // ==========================================
  // 1. MARKETING: Poster - Băng rôn - Standee
  // ==========================================
  {
    id: "poster-bangron-standee",
    categoryId: "marketing",
    titleVi: "Poster - Băng rôn - Standee",
    titleEn: "Posters - Banners - Standees",
    titleZh: "海报 - 横幅 - 展架",
    titleJa: "ポスター・横断幕・スタンド看板",
    titleKo: "포스터 - 현수막 - 배너거치대",
    descriptionVi: "Giải pháp in ấn quảng cáo khổ lớn, sự kiện, showroom và truyền thông trực quan ngoài trời lẫn trong nhà.",
    descriptionEn: "Large-format advertising prints, event displays, showroom decor, and indoor/outdoor visual signage.",
    coverImage: "/images/category/poster-bangron-standee.webp",
    shapes: [
      {
        id: "decal-kho-lon",
        nameVi: "Decal Khổ Lớn",
        nameEn: "Large Format Vinyl Decals",
        nameZh: "大幅面车贴/背胶",
        nameJa: "大判インクジェットステッカー",
        nameKo: "대형 실사출력 데칼 시트지",
        descriptionVi: "In decal khổ lớn dán kính mặt tiền, tường showroom, xe tải và vách ngăn sự kiện.",
        descriptionEn: "Large-format adhesive vinyl graphics for glass storefronts, vehicle wraps, and event backdrops.",
        image: "/images/category/decalkholon.webp",
        badgeVi: "Khổ lớn",
        badgeEn: "Large Format",
      },
      {
        id: "pp-boi-format",
        nameVi: "PP bồi Format",
        nameEn: "PP Mounted on Foam Board",
        nameZh: "PP背胶裱雪弗板",
        nameJa: "PPスチレンボード貼り",
        nameKo: "폼보드 합지 PP 실사출력",
        descriptionVi: "In PP sắc nét cán bồi tấm formex cứng cáp 3mm - 5mm làm Standee đứng, bảng thông báo, bảng trao giải.",
        descriptionEn: "High-res PP print laminated onto rigid 3mm-5mm foam board for standees, promo signs, and presentation checks.",
        image: "/images/category/ppboiformat.webp",
        badgeVi: "Standee cứng",
        badgeEn: "Rigid Standee",
      },
      {
        id: "hashtag-cam-tay",
        nameVi: "Hashtag cầm tay",
        nameEn: "Handheld Event Hashtags",
        nameZh: "手持拍照手牌",
        nameJa: "手持ちフォトプロップス",
        nameKo: "핸드헬드 촬영 해시태그 피켓",
        descriptionVi: "Biển chụp hình check-in sự kiện, tiệc cưới, sinh nhật, hội thảo bế theo hình dáng thiết kế.",
        descriptionEn: "Custom-shaped photo props for corporate galas, weddings, product launches, and birthdays.",
        image: "/images/category/hashtagcamtay.webp",
        badgeVi: "Check-in",
        badgeEn: "Photo Prop",
      },
      {
        id: "hashtag-tay-cam-roi",
        nameVi: "Hashtag tay cầm rời",
        nameEn: "Detachable Handle Hashtags",
        nameZh: "可拆卸手柄手牌",
        nameJa: "持ち手分離型フォトプロップス",
        nameKo: "분리형 손잡이 해시태그 피켓",
        descriptionVi: "Quy cách cán rời gắn khớp tiện tháo lắp, đóng gói gọn gàng vận chuyển đường dài không lo gãy.",
        descriptionEn: "Hashtag signs with snap-on detachable handles, easy to pack flat and ship nationwide without breakage.",
        image: "/images/category/hashtagtaycamroi.webp",
        badgeVi: "Tiện đóng gói",
        badgeEn: "Flat-Pack",
      },
      {
        id: "bang-treo",
        nameVi: "Bảng treo",
        nameEn: "Hanging Boards & Wobblers",
        nameZh: "超市促销吊牌/吊旗",
        nameJa: "POP吊り下げボード",
        nameKo: "매장 천장 행잉 배너 / 보드",
        descriptionVi: "Bảng treo trần siêu thị, hanger quảng cáo tại quầy kệ thu hút ánh nhìn khách hàng từ xa.",
        descriptionEn: "Eye-catching overhead hanging signs and point-of-sale wobblers for retail aisles and supermarket displays.",
        image: "/images/category/bangtreo.webp",
        badgeVi: "POSM",
        badgeEn: "Point of Sale",
      },
    ],
    materials: [
      {
        icon: "Layers",
        name: "PP Film (Polypropylene)",
        nameVi: "Poster chất liệu PP",
        basePrice: 65000,
        doubleSidedPrice: 20000,
        unitVi: "m²",
        unitEn: "sqm",
        tagline: "High-resolution PP synthetic paper for indoor posters and roll-up banners",
        taglineVi: "Giấy nhựa PP tổng hợp láng mịn, in độ phân giải cao cho poster trong nhà và standee cuộn",
        description: [
          "Super-smooth synthetic paper base with zero visible paper fibers",
          "Rich, high-density color reproduction for photo-realistic graphics",
          "Coated with protective matte or glossy lamination against scratches"
        ],
        descriptionVi: [
          "Bề mặt giấy nhựa tổng hợp siêu mịn, không lộ xơ giấy",
          "Tái tạo màu sắc chân thực chuẩn sắc nét đến từng chi tiết ảnh",
          "Cán màng mờ hoặc màng bóng bảo vệ bề mặt chống trầy xước nước nhẹ"
        ],
        descriptionTraits: ["smooth-base", "digital-precision", "glossy-coat"],
        bestFor: ["Indoor event roll-up banners, cinema posters, showroom displays"],
        bestForVi: ["Standee cuộn sự kiện, poster rạp chiếu phim, biển quảng cáo showroom"],
        pureImage: "/images/category/poster-bangron-standee.webp",
        pureImages: [
          "/images/category/poster-bangron-standee.webp",
          "/images/hero/mayinngoaitroi.webp",
          "/images/hero/slide-1.jpg"
        ],
      },
      {
        icon: "Shield",
        name: "Hiflex PVC Banner",
        nameVi: "Băng rôn Hiflex",
        basePrice: 35000,
        doubleSidedPrice: 15000,
        unitVi: "m²",
        unitEn: "sqm",
        tagline: "Durable waterproof PVC vinyl for large outdoor banners and hoardings",
        taglineVi: "Bạt PVC dẻo dai chống thấm nước 100%, chịu mưa nắng chuyên cho băng rôn ngoài trời",
        description: [
          "Reinforced PVC fabric withstands heavy rain, direct sunlight, and wind",
          "Most economical solution for large-scale outdoor visibility",
          "Finished with reinforced hemmed edges and brass eyelets for easy hanging"
        ],
        descriptionVi: [
          "Chất liệu bạt PVC cốt sợi chịu lực tốt trước nắng gắt và mưa bão",
          "Giải pháp tiết kiệm ngân sách nhất cho quảng cáo diện rộng ngoài trời",
          "Hoàn thiện gấp mép dán gia cường và đóng khoen nhôm tiện xỏ dây treo"
        ],
        descriptionTraits: ["waterproof-durability", "thick-weight"],
        bestFor: ["Street banners, construction fences, grand opening announcements"],
        bestForVi: ["Băng rôn ngang đường, hàng rào công trình, banner khai trương cửa hàng"],
        pureImage: "/images/category/poster-bangron-standee.webp",
        pureImages: [
          "/images/hero/mayinngoaitroi.webp",
          "/images/category/poster-bangron-standee.webp",
          "/images/hero/mayinoffset.webp"
        ],
      },
      {
        icon: "Palette",
        name: "Artistic Canvas Fabric",
        nameVi: "Tranh Canvas chất lượng cao",
        basePrice: 150000,
        doubleSidedPrice: 0,
        unitVi: "m²",
        unitEn: "sqm",
        tagline: "Woven cotton-poly canvas for fine art wall décor and premium displays",
        taglineVi: "Vải bố dệt nghệ thuật sần nổi cao cấp chuyên in tranh trang trí không gian",
        description: [
          "Authentic canvas weave creates an elegant artistic oil-painting texture",
          "Vibrant UV-cured pigment inks resist fading for over 5 years indoors",
          "Mounted seamlessly on composite floating frames or solid wood stretcher bars"
        ],
        descriptionVi: [
          "Vân vải dệt mộc sần tạo chiều sâu nghệ thuật như tranh sơn dầu",
          "Mực in UV sắc nét bền màu hơn 5 năm trong không gian nội thất",
          "Căng khung composite hoặc khung gỗ thông tự nhiên sang trọng"
        ],
        descriptionTraits: ["textured-art", "soft-light", "eco-friendly"],
        bestFor: ["Living room art, hotel suites, wedding portrait canvases, cafe décor"],
        bestForVi: ["Tranh treo phòng khách, khách sạn, tranh cưới canvas, quán cafe"],
        pureImage: "/images/product/anhtreotuong.webp",
        pureImages: [
          "/images/product/canvascotton.webp",
          "/images/product/canvascotton2.webp",
          "/images/product/canvascotton3.webp"
        ],
      },
      {
        icon: "Eye",
        name: "One-Way Perforated Vinyl",
        nameVi: "Decal Lưới",
        basePrice: 95000,
        doubleSidedPrice: 0,
        unitVi: "m²",
        unitEn: "sqm",
        tagline: "Micro-perforated one-way window film for exterior advertising with internal see-through",
        taglineVi: "Decal đục lỗ li ti nhìn 1 chiều dán kính showroom (bên trong nhìn ra thấy, bên ngoài thấy tranh)",
        description: [
          "Micro-holes allow 40% light transmittance without blocking outdoor view from inside",
          "Displays full-color vibrant branding to passersby outside the window",
          "Blocks harsh sunlight and reduces interior heat"
        ],
        descriptionVi: [
          "Các lỗ li ti cho phép ánh sáng tự nhiên lọt qua, người bên trong nhìn ra rõ ràng",
          "Người bên ngoài nhìn vào chỉ thấy hình ảnh quảng cáo sắc nét toàn phần",
          "Hỗ trợ giảm bớt chói nắng và nhiệt độ cho không gian bên trong showroom"
        ],
        descriptionTraits: ["waterproof-durability", "digital-precision"],
        bestFor: ["Automotive rear glass, glass showroom facades, street-facing office windows"],
        bestForVi: ["Dán kính ô tô xe buýt, kính mặt tiền showroom, cửa kính văn phòng"],
        pureImage: "/images/category/decalkholon.webp",
        pureImages: [
          "/images/category/decalkholon.webp",
          "/images/category/poster-bangron-standee.webp",
          "/images/product/vd-item-card.jpeg"
        ],
      },
      {
        icon: "SunMedium",
        name: "Backlit Lightbox Film",
        nameVi: "Backlit Film",
        basePrice: 120000,
        doubleSidedPrice: 0,
        unitVi: "m²",
        unitEn: "sqm",
        tagline: "Ultra-clear polyester translucent film engineered for backlit LED lightboxes",
        taglineVi: "Phim nhựa polyester xuyên sáng cao cấp chuyên dụng cho hộp đèn LED siêu mỏng",
        description: [
          "Even light dispersion creates brilliant luminous glow under LED illumination",
          "Ultra-high resolution output with deep, rich contrast that never looks washed out",
          "Available in adhesive or non-adhesive film for snap-frame lightboxes"
        ],
        descriptionVi: [
          "Khả năng tán xạ ánh sáng đều giúp hình ảnh bừng sáng rực rỡ khi bật đèn LED",
          "Độ tương phản và độ đen cực sâu, hình ảnh sắc sảo không bị nhợt nhạt",
          "Tùy chọn phim có keo hoặc không keo lắp đặt dễ dàng trong hộp đèn nắp bật"
        ],
        descriptionTraits: ["smooth-base", "digital-precision", "glossy-coat"],
        bestFor: ["Airport advertising lightboxes, fast-food menu boards, luxury mall displays"],
        bestForVi: ["Hộp đèn menu quầy trà sữa, biển hộp đèn trung tâm thương mại, sân bay"],
        pureImage: "/images/category/poster-bangron-standee.webp",
        pureImages: [
          "/images/category/poster-bangron-standee.webp",
          "/images/hero/mayinnhanh.webp",
          "/images/category/catalogue-camnang.webp"
        ],
      },
    ],
  },

  // ==========================================
  // 2. MARKETING: Tờ rơi - Flyers
  // ==========================================
  {
    id: "to-roi",
    categoryId: "marketing",
    titleVi: "Tờ rơi - Flyers",
    titleEn: "Flyers & Leaflets",
    titleZh: "宣传单 - Flyers",
    titleJa: "チラシ・フライヤー",
    titleKo: "전단지 - Flyers",
    descriptionVi: "Công cụ tiếp thị trực tiếp hiệu quả, phân phát nhanh chóng thông tin sản phẩm và chương trình khuyến mãi đến khách hàng mục tiêu.",
    descriptionEn: "High-impact direct marketing flyers for product launches, seasonal promotions, and neighborhood distributions.",
    coverImage: "/images/category/toroi.webp",
    shapes: [
      {
        id: "to-roi-gia-re",
        nameVi: "Tờ rơi giá rẻ",
        nameEn: "Budget Promotion Flyers",
        nameZh: "特惠促销传单",
        nameJa: "格安チラシ印刷",
        nameKo: "실속형 가성비 전단지",
        descriptionVi: "In offset số lượng lớn định lượng C100 - C150 tiết kiệm tối đa ngân sách phân phát đại trà.",
        descriptionEn: "Economical offset volume printing on 100-150gsm Couche, best for mass hand-to-hand distribution.",
        image: "/images/category/toroigiare.webp",
        badgeVi: "Tiết kiệm",
        badgeEn: "Budget",
      },
      {
        id: "to-roi-so-luong-it",
        nameVi: "Tờ rơi số lượng ít",
        nameEn: "Short-run Digital Flyers",
        nameZh: "少量数码快印传单",
        nameJa: "小ロットオンデマンドチラシ",
        nameKo: "소량 디지털 전단지",
        descriptionVi: "In kỹ thuật số số lượng từ 50 - 200 tờ lấy ngay trong ngày, thích hợp cho sự kiện khai trương, hội chợ gấp.",
        descriptionEn: "Same-day digital printing from 50-200 copies, ideal for store openings, pop-up events, and urgent promos.",
        image: "/images/category/toroisoluongit.webp",
        badgeVi: "Lấy nhanh",
        badgeEn: "Fast Print",
      },
      {
        id: "to-roi-so-luong-lon",
        nameVi: "Tờ rơi số lượng lớn",
        nameEn: "Bulk Offset Flyers",
        nameZh: "批量胶印高品质传单",
        nameJa: "大ロットオフセットチラシ",
        nameKo: "대량 오프셋 인쇄 전단지",
        descriptionVi: "In offset công nghiệp từ 1.000 - 100.000 tờ, màu sắc đồng đều chuẩn nét với giá thành trên mỗi tờ thấp nhất.",
        descriptionEn: "Industrial offset runs from 1,000 to 100,000+ copies with uniform color fidelity and maximum volume savings.",
        image: "/images/category/toroisoluonglon.webp",
        badgeVi: "Giá sỉ",
        badgeEn: "Bulk Offset",
      },
      {
        id: "to-roi-cao-cap",
        nameVi: "Tờ rơi cao cấp",
        nameEn: "Premium Luxury Flyers",
        nameZh: "高端覆膜精装传单",
        nameJa: "プレミアム高級チラシ",
        nameKo: "고급 코팅 프리미엄 전단지",
        descriptionVi: "Chất liệu giấy dày C250 - C300 cán màng mờ 2 mặt sang trọng, ép kim logo đẳng cấp.",
        descriptionEn: "Heavyweight 250-300gsm artboard with double-sided matte lamination and optional metallic foil stamping.",
        image: "/images/category/toroicaocap.webp",
        badgeVi: "Cao cấp",
        badgeEn: "Premium",
      },
    ],
    materials: [
      {
        icon: "Layers",
        name: "Couche 150gsm Paper",
        nameVi: "Giấy Couche 150gsm",
        basePrice: 850,
        doubleSidedPrice: 300,
        unitVi: "Tờ",
        unitEn: "Sheets",
        tagline: "Balanced glossy art paper ideal for vivid color reproduction in commercial flyers",
        taglineVi: "Định lượng tiêu chuẩn bóng láng, bắt sáng tốt, thể hiện hình ảnh và câu chữ sắc nét",
        description: [
          "Smooth semi-gloss surface ensures crisp text and vibrant graphic reproduction",
          "Moderate thickness easy to fold and distribute hand-to-hand",
          "Most cost-effective choice for medium to large distribution runs"
        ],
        descriptionVi: [
          "Bề mặt láng bóng vừa phải, hiển thị hình ảnh món ăn, sản phẩm cực kỳ bắt mắt",
          "Độ dày vừa vặn dễ cầm nắm, phát tay hoặc bỏ hộp thư",
          "Chi phí cực kỳ tối ưu cho các đợt phát tờ rơi diện rộng"
        ],
        descriptionTraits: ["smooth-base", "digital-precision"],
        bestFor: ["Restaurant menus, retail sale circulars, real estate property listings"],
        bestForVi: ["Tờ rơi quán ăn, khai trương cửa hàng, tờ rơi bất động sản"],
        pureImage: "/images/category/toroi.webp",
      },
      {
        icon: "ShieldCheck",
        name: "Couche 300gsm Matte Laminated",
        nameVi: "Giấy Couche 300gsm cán màng mờ",
        basePrice: 1800,
        doubleSidedPrice: 500,
        unitVi: "Tờ",
        unitEn: "Sheets",
        tagline: "Rigid heavy paperboard with protective matte lamination for lasting prestige",
        taglineVi: "Giấy C300 dày dặn cán màng mờ 2 mặt chống nước nhẹ và chống trầy xước",
        description: [
          "Heavy cardstock feel similar to a postcard or voucher",
          "Matte lamination repels moisture and gives a silky non-glare touch",
          "Supports premium enhancements like foil stamping and spot UV"
        ],
        descriptionVi: [
          "Độ cứng như thiệp quà tặng, tạo cảm giác sang trọng khi trao tay",
          "Màng mờ mịn màng sang trọng, chống bám vân tay và chống thấm nước nhẹ",
          "Dễ dàng kết hợp ép kim logo thương hiệu nổi bật"
        ],
        descriptionTraits: ["thick-weight", "glossy-coat", "foil-accent"],
        bestFor: ["Luxury spa vouchers, aesthetic clinics, high-end automotive brochures"],
        bestForVi: ["Thẩm mỹ viện, spa cao cấp, showroom ô tô, trang sức"],
        pureImage: "/images/product/c300-foil.webp",
      },
    ],
  },

  // ==========================================
  // 3. MARKETING: Tờ gấp - Leaflets, Brochures
  // ==========================================
  {
    id: "to-gap",
    categoryId: "marketing",
    titleVi: "Tờ gấp - Leaflets, Brochures",
    titleEn: "Leaflets & Brochures",
    titleZh: "折页手册 - Brochures",
    titleJa: "折りパンフレット",
    titleKo: "접지 리플렛 - Brochures",
    descriptionVi: "Ấn phẩm gấp nhiều nếp cấn mở ra nhiều mặt thông tin mạch lạc, giới thiệu trọn vẹn dịch vụ công ty.",
    descriptionEn: "Multi-fold leaflets and brochures presenting clear, structured corporate and product narratives.",
    coverImage: "/images/category/togap.webp",
    shapes: [
      {
        id: "to-gap-so-luong-it",
        nameVi: "Tờ gấp số lượng ít",
        nameEn: "Short-run Folded Brochures",
        nameZh: "少量数码折页",
        nameJa: "小ロット折りパンフレット",
        nameKo: "소량 디지털 접지 리플렛",
        descriptionVi: "In kỹ thuật số lấy nhanh từ 10 - 50 tờ, cấn gấp hoàn thiện chuẩn xác, giải pháp tối ưu cho hội thảo và sự kiện gấp.",
        descriptionEn: "Digital on-demand printing from 10-50 copies with precision creasing, ideal for seminars, trade shows, and urgent events.",
        image: "/images/category/togapsoluongit.webp",
        badgeVi: "Lấy nhanh",
        badgeEn: "Fast Print",
      },
      {
        id: "to-gap-ba",
        nameVi: "Tờ gấp ba (Tri-fold)",
        nameEn: "Tri-fold Brochures",
        nameZh: "三折页",
        nameJa: "巻き三つ折り",
        nameKo: "3단 접지 리플렛",
        descriptionVi: "Quy cách cấn 2 đường gấp 3 chia thành 6 trang thông tin gọn gàng, kích thước mở ra A4.",
        descriptionEn: "Two crease lines creating 6 organized panels, the timeless format for company presentations.",
        image: "/images/category/togap3.webp",
        badgeVi: "6 trang",
        badgeEn: "6 Panels",
      },
      {
        id: "to-gap-doi-a4",
        nameVi: "Tờ gấp đôi A4",
        nameEn: "Bi-fold A4 Leaflets",
        nameZh: "A4对折页",
        nameJa: "A4二つ折り",
        nameKo: "A4 반접지 리플렛",
        descriptionVi: "Khổ trải A3 cấn 1 nếp gấp đôi thành A4 4 trang rộng rãi, thoải mái trình bày biểu đồ và bảng giá.",
        descriptionEn: "A3 flat sheet folded down to A4 4 spacious pages, perfect for product specs and pricing tables.",
        image: "/images/category/togapdoi.webp",
        badgeVi: "Khổ A4",
        badgeEn: "Bi-Fold A4",
      },
      {
        id: "to-gap-cao-cap",
        nameVi: "Tờ gấp cao cấp",
        nameEn: "Premium Luxury Brochures",
        nameZh: "烫金UV高档折页",
        nameJa: "高級折りパンフレット",
        nameKo: "프리미엄 가공 리플렛",
        descriptionVi: "Giấy mỹ thuật cao cấp hoặc C300 ép kim, phủ UV định hình tạo dấu ấn đẳng cấp vượt trội.",
        descriptionEn: "Imported art stock or C300 with selective spot UV and metallic foil stamping for VIP pitches.",
        image: "/images/category/togapcaocap.webp",
        badgeVi: "Ép kim / UV",
        badgeEn: "Luxury Finish",
      },
    ],
    materials: [
      {
        icon: "Layers",
        name: "Couche 150gsm - 200gsm",
        nameVi: "Giấy Couche 150gsm - 200gsm",
        basePrice: 1500,
        doubleSidedPrice: 500,
        unitVi: "Tờ",
        unitEn: "Sheets",
        tagline: "Vibrant high-contrast art paper with precision machine crease lines",
        taglineVi: "Giấy Couche láng mịn, cán nếp gấp máy chuẩn xác không bị nứt vỡ gân giấy",
        description: [
          "Calendered smooth coating brings photos and diagrams to life",
          "Machine scored along folding creases to eliminate paper cracking",
          "Optional protective aqueous or matte film coating"
        ],
        descriptionVi: [
          "Bề mặt láng mịn tôn vinh hình ảnh minh họa và biểu đồ sắc nét",
          "Cấn máy tự động giúp các đường gấp thẳng tắp, không bị rạn nứt mực",
          "Tùy chọn cán màng mờ bảo vệ chống ẩm và tăng độ bền"
        ],
        descriptionTraits: ["smooth-base", "digital-precision"],
        bestFor: ["Corporate overview pamphlets, tour itineraries, medical clinic profiles"],
        bestForVi: ["Giới thiệu công ty, lịch trình tour du lịch, cẩm nang y tế phòng khám"],
        pureImage: "/images/category/togap.webp",
      },
    ],
  },

  // ==========================================
  // 4. MARKETING: Vé - Tickets
  // ==========================================
  {
    id: "ve-tickets",
    categoryId: "marketing",
    titleVi: "Vé - Tickets",
    titleEn: "Tickets & Event Passes",
    titleZh: "门票/入场券 - Tickets",
    titleJa: "チケット・入場券",
    titleKo: "티켓 / 입장권",
    descriptionVi: "Vé vào cổng, vé mời VIP và vòng tay sự kiện tích hợp số nhảy, mã QR và cấn răng cưa xé cuống tiện lợi.",
    descriptionEn: "Admission tickets, VIP event invitations, and wristbands with serial numbers, QR codes, and tear-off stubs.",
    coverImage: "/images/category/ve.webp",
    shapes: [
      {
        id: "ve-moi-su-kien",
        nameVi: "Vé mời sự kiện",
        nameEn: "Event Invitation Passes",
        nameZh: "活动邀请门票",
        nameJa: "イベント招待チケット",
        nameKo: "행사 VIP 초청 티켓",
        descriptionVi: "Quy cách vé giấy cứng cấn răng cưa xé cuống, đóng số nhảy kiểm soát an ninh sự kiện.",
        descriptionEn: "Cardstock ticket with perforated tear-off stub, sequential numbering, and security barcode.",
        image: "/images/category/vemoisukien.webp",
        badgeVi: "Xé cuống",
        badgeEn: "Perforated",
      },
      {
        id: "vong-tay-su-kien",
        nameVi: "Vòng tay sự kiện",
        nameEn: "Event Wristbands",
        nameZh: "活动防水手环",
        nameJa: "イベント用リストバンド",
        nameKo: "행사용 방수 손목 밴드",
        descriptionVi: "Vòng tay giấy nhựa Tyvek dai không rách, keo dán dùng 1 lần chống giả mạo tại đại nhạc hội.",
        descriptionEn: "Tear-proof waterproof Tyvek wristband with tamper-evident adhesive closure for concerts and waterparks.",
        image: "/images/category/vongtaysukien.webp",
        badgeVi: "Chống nước",
        badgeEn: "Waterproof",
      },
    ],
    materials: [
      {
        icon: "ShieldCheck",
        name: "Couche 300 & Tyvek Synthetic",
        nameVi: "Giấy C300 & Tyvek Chống Nước",
        basePrice: 1200,
        doubleSidedPrice: 400,
        unitVi: "Vé",
        unitEn: "Tickets",
        tagline: "Secure, tamper-evident materials engineered for event control",
        taglineVi: "Chất liệu bền chắc bảo mật cao, chống rách và dễ dàng kiểm soát cửa vào",
        description: [
          "High-opacity rigid stock or waterproof synthetic Tyvek",
          "Tamper-proof adhesive tab prevents transfer between guests",
          "Sharp barcode and QR code reading under event scanners"
        ],
        descriptionVi: [
          "Chất giấy C300 cứng cáp hoặc giấy nhựa Tyvek kháng nước 100%",
          "Keo dán niêm phong chỉ dùng 1 lần, chống tháo gỡ chuyển giao",
          "Độ phân giải cao quét mã vạch và QR code cực nhạy tại cửa soát vé"
        ],
        descriptionTraits: ["waterproof-durability", "thick-weight"],
        bestFor: ["Music festivals, gala dinners, conferences, theme parks"],
        bestForVi: ["Lễ hội âm nhạc, dạ tiệc cuối năm, hội nghị hội thảo, khu vui chơi"],
        pureImage: "/images/product/art-foil2.webp",
        pureImages: [
          "/images/product/art-foil2.webp",
          "/images/product/art-foil3.webp",
          "/images/product/vd-item-tag.jpeg"
        ],
      },
    ],
  },

  // ==========================================
  // 5. MARKETING: Phiếu Quà Tặng - Gift Vouchers
  // ==========================================
  {
    id: "vouchers",
    categoryId: "marketing",
    titleVi: "Phiếu Quà Tặng - Gift Vouchers",
    titleEn: "Gift Vouchers & Cards",
    titleZh: "礼券卡券 - Gift Vouchers",
    titleJa: "ギフト券・引換券",
    titleKo: "기프트 상품권 / 바우처",
    descriptionVi: "Thẻ quà tặng tri ân khách hàng, kích cầu mua sắm và gia tăng doanh thu với thiết kế sang trọng, chuyên nghiệp.",
    descriptionEn: "Gift vouchers and loyalty cards driving customer retention and shopping excitement with luxury presentation.",
    coverImage: "/images/category/phieuquatang.webp",
    shapes: [
      {
        id: "phieu-qua-tang-pho-thong",
        nameVi: "Phiếu quà tặng phổ thông",
        nameEn: "Standard Gift Vouchers",
        nameZh: "标准代金券/礼品券",
        nameJa: "スタンダード商品券",
        nameKo: "일반 상품권 바우처",
        descriptionVi: "Kích thước tiêu chuẩn 7x15cm hoặc 10x20cm, in giấy C300 cán màng mờ hoặc bóng, phù hợp cho cửa hàng, spa và nhà hàng.",
        descriptionEn: "Standard 7x15cm or 10x20cm vouchers on 300gsm Couche with matte or gloss lamination for retail and dining.",
        image: "/images/category/phieuquatangphothong.webp",
        badgeVi: "Phổ thông",
        badgeEn: "Standard",
      },
      {
        id: "gift-vouchers",
        nameVi: "Gift Vouchers",
        nameEn: "Luxury Gift Vouchers",
        nameZh: "精装定制Gift Vouchers",
        nameJa: "高級ギフトバウチャー",
        nameKo: "프리미엄 기프트 바우처",
        descriptionVi: "Phiếu voucher cao cấp thiết kế kèm bao thư sang trọng, gia công ép kim vàng/bạc ấn tượng.",
        descriptionEn: "Premium voucher packaged in matching custom envelope with gold foil logo accents.",
        image: "/images/category/giftvouchers.webp",
        badgeVi: "Kèm bao thư",
        badgeEn: "With Envelope",
      },
      {
        id: "the-tich-diem",
        nameVi: "Thẻ Tích Điểm",
        nameEn: "Loyalty / Stamp Cards",
        nameZh: "会员积分/集点卡",
        nameJa: "スタンプカード・ポイントカード",
        nameKo: "스탬프 쿠폰 / 포인트 적립 카드",
        descriptionVi: "Kích thước namecard nhỏ gọn, giấy Ford hoặc Kraft thấm mực tốt để đóng dấu, tích điểm đổi quà giữ chân khách hàng.",
        descriptionEn: "Compact pocket-sized cards on uncoated Ford or Kraft paper for easy ink stamping and customer loyalty rewards.",
        image: "/images/category/thetichdiem.webp",
        badgeVi: "Tích điểm",
        badgeEn: "Loyalty",
      },
      {
        id: "the-cao-khuyen-mai",
        nameVi: "Thẻ cào khuyến mãi",
        nameEn: "Scratch-off Promo Cards",
        nameZh: "刮刮乐抽奖卡",
        nameJa: "スクラッチくじカード",
        nameKo: "스크래치 복권 카드",
        descriptionVi: "Phủ lớp nhũ bạc cào trúng thưởng bảo mật, khơi gợi hào hứng cho các chương trình bốc thăm may mắn.",
        descriptionEn: "Security scratch-off latex coating concealing winning codes for interactive promotional campaigns.",
        image: "/images/category/thecaokhuyenmai.webp",
        badgeVi: "Nhũ cào",
        badgeEn: "Scratch Off",
      },
    ],
    materials: [
      {
        icon: "Palette",
        name: "Couche 300 & Luxury Art Stock",
        nameVi: "Giấy Couche 300 & Giấy Mỹ Thuật",
        basePrice: 1100,
        doubleSidedPrice: 350,
        foilPrice: 40000,
        unitVi: "Phiếu",
        unitEn: "Vouchers",
        tagline: "Prestige stock elevating your brand gift value in customers' eyes",
        taglineVi: "Chất liệu giấy dày dặn nâng tầm giá trị món quà thương hiệu trao gửi",
        description: [
          "Heavy cardstock provides a crisp tactile gift experience",
          "Supports scratch-off silver coating or metallic foil highlights",
          "Silky matte lamination protects against finger oils"
        ],
        descriptionVi: [
          "Định lượng dày dặn cầm chắc tay như tấm thẻ ngân hàng",
          "Hỗ trợ phủ nhũ cào bí mật hoặc ép kim lấp lánh",
          "Cán màng mờ bảo vệ chống lem nhòe mực"
        ],
        descriptionTraits: ["thick-weight", "smooth-base", "foil-accent"],
        bestFor: ["Fashion retail vouchers, spa discounts, dining gift certificates"],
        bestForVi: ["Voucher thời trang, phiếu giảm giá spa làm đẹp, voucher ẩm thực"],
        pureImage: "/images/product/c3002.webp",
        pureImages: [
          "/images/product/c3002.webp",
          "/images/product/art-foil3.webp",
          "/images/product/c300.webp"
        ],
      },
    ],
  },

  // ==========================================
  // 6. MARKETING: Catalogue - Cẩm Nang
  // ==========================================
  {
    id: "catalogues",
    categoryId: "marketing",
    titleVi: "Catalogue - Cẩm Nang",
    titleEn: "Catalogues & Booklets",
    titleZh: "产品画册/手册 - Catalogue",
    titleJa: "カタログ・小冊子",
    titleKo: "카탈로그 / 핸드북",
    descriptionVi: "Cuốn tài liệu bán hàng toàn diện, tập hợp toàn bộ danh mục sản phẩm, thông số kỹ thuật và hồ sơ năng lực doanh nghiệp.",
    descriptionEn: "Comprehensive corporate catalogues and product guides showcasing your full portfolio and technical specs.",
    coverImage: "/images/category/catalogue-camnang.webp",
    shapes: [
      {
        id: "catalogue-tieu-chuan",
        nameVi: "Catalogue Tiêu Chuẩn",
        nameEn: "Standard Product Catalogues",
        nameZh: "标准企业产品画册",
        nameJa: "標準製品カタログ",
        nameKo: "표준 제품 카탈로그",
        descriptionVi: "Quy cách đóng cuốn chuẩn khổ A4, bìa Couche 300 cán màng mờ sang trọng, ruột Couche 150 hiển thị hình ảnh chi tiết sắc nét.",
        descriptionEn: "Standard A4 saddle-stitched or perfect-bound product catalogue with 300gsm laminated cover and 150gsm vibrant art paper inner pages.",
        image: "/images/category/cataloguetieuchuan.webp",
        badgeVi: "Tiêu chuẩn A4",
        badgeEn: "Standard A4",
      },
      {
        id: "catalogue-gia-re",
        nameVi: "Catalogue Giá Rẻ",
        nameEn: "Economy Budget Catalogues",
        nameZh: "高性价比宣传画册",
        nameJa: "格安カタログ製本",
        nameKo: "실속형 가성비 카탈로그",
        descriptionVi: "Quy cách đóng cuốn bấm kim giữa, bìa C250 ruột C120 tiết kiệm tối ưu chi phí phân phát hội chợ.",
        descriptionEn: "Saddle-stitched booklet with 250gsm cover and 120gsm inner pages for cost-efficient trade show hand-outs.",
        image: "/images/category/cataloguegiare.webp",
        badgeVi: "Bấm kim",
        badgeEn: "Saddle Stitched",
      },
      {
        id: "catalogue-cao-cap",
        nameVi: "Catalogue Cao Cấp",
        nameEn: "Premium Luxury Catalogues",
        nameZh: "精装锁线特种纸画册",
        nameJa: "上製本・高級アートカタログ",
        nameKo: "최고급 양장 하드커버 카탈로그",
        descriptionVi: "Đóng gáy may chỉ keo nhiệt hoặc bìa cứng bồi carton, ép kim UV định hình bìa ngoài sang trọng.",
        descriptionEn: "Section-sewn perfect bound or hardbound album with cover foil stamping for flagship presentations.",
        image: "/images/category/cataloguecaocap.webp",
        badgeVi: "May chỉ keo gáy",
        badgeEn: "Hardcover / Bound",
      },
      {
        id: "profile-company",
        nameVi: "Hồ sơ năng lực",
        nameEn: "Company Profile Booklets",
        nameZh: "企业简介/资质实力画册",
        nameJa: "会社案内・事業実績パンフレット",
        nameKo: "기업 회사소개서 / 지명원",
        descriptionVi: "Cuốn hồ sơ năng lực công ty (Company Profile) thể hiện tầm nhìn, năng lực thi công và dự án tiêu biểu phục vụ đấu thầu và gặp gỡ đối tác.",
        descriptionEn: "Corporate profile and credentials booklet showcasing executive vision, completed projects, and competitive capabilities for bidding and pitches.",
        image: "/images/category/hosonangluc.webp",
        badgeVi: "Hồ sơ thầu",
        badgeEn: "Profile",
      },
      {
        id: "cam-nang-cam-tay",
        nameVi: "Cẩm Nang Cầm Tay",
        nameEn: "Pocket Handbooks & Guides",
        nameZh: "便携口袋手册",
        nameJa: "ポケットハンドブック",
        nameKo: "포켓용 핸드북 / 가이드북",
        descriptionVi: "Kích thước A5 / A6 nhỏ gọn tiện mang theo, phù hợp hướng dẫn sử dụng sản phẩm và cẩm nang du lịch.",
        descriptionEn: "Compact A5/A6 booklet designed for user manuals, field guides, and tourist travel companions.",
        image: "/images/category/camnangcamtay.webp",
        badgeVi: "Bỏ túi A5/A6",
        badgeEn: "Pocket Size",
      },
    ],
    materials: [
      {
        icon: "BookOpen",
        name: "Standard Couche Art Paper",
        nameVi: "Bìa C300 Cán Màng + Ruột C150",
        basePrice: 18000,
        doubleSidedPrice: 0,
        unitVi: "Cuốn",
        unitEn: "Books",
        tagline: "Crisp full-color photographic reproduction on heavyweight coated stock",
        taglineVi: "Bìa cứng cáp cán màng mờ chống trầy, ruột láng mịn thể hiện hình ảnh sản phẩm rực rỡ",
        description: [
          "300gsm laminated cover withstands repeated shelf handling",
          "150gsm inner pages prevent show-through and turn smoothly",
          "Automated saddle-stitch or PUR glue binding"
        ],
        descriptionVi: [
          "Bìa C300 cán màng mờ bảo vệ chống quăn mép và sờn góc khi lật mở nhiều lần",
          "Ruột C150 láng mịn không bị thấu sáng sang trang sau",
          "Gia công đóng kim giữa hoặc dán keo gáy chắc chắn"
        ],
        descriptionTraits: ["smooth-base", "thick-weight", "digital-precision"],
        bestFor: ["Manufacturing machinery catalogues, real estate projects, interior design collections"],
        bestForVi: ["Catalogue thiết bị máy móc, hồ sơ năng lực dự án, nội thất xây dựng"],
        pureImage: "/images/category/catalogue-camnang.webp",
      },
    ],
  },

  // ==========================================
  // 7. OFFICE: Danh thiếp - Namecards
  // ==========================================
  {
    id: "danh-thiep",
    categoryId: "office",
    titleVi: "Danh thiếp - Namecards",
    titleEn: "Business Cards - Namecards",
    titleZh: "名片 - Namecards",
    titleJa: "名刺 - Namecards",
    titleKo: "명함 - Namecards",
    descriptionVi: "Ấn phẩm nhận diện thương hiệu cá nhân và doanh nghiệp, tạo ấn tượng chuyên nghiệp đầu tiên trong các cuộc gặp gỡ đối tác.",
    descriptionEn: "Essential personal and corporate branding touchpoint, making an immediate professional impression in client meetings.",
    coverImage: "/images/category/danhthiep.webp",
    shapes: [
      {
        id: "bo-goc-chuan",
        nameVi: "Danh Thiếp Bo Góc Chuẩn",
        nameEn: "Standard Rounded Corner Cards",
        nameZh: "标准圆角名片",
        nameJa: "角丸加工名刺",
        nameKo: "귀도리 라운딩 명함",
        descriptionVi: "Quy cách bo tròn 4 góc tinh tế, giúp tấm thẻ mềm mại, không bị tưa góc khi cất trong ví.",
        descriptionEn: "Smooth 4-corner die-cut rounding prevents frayed edges when stored in pockets and wallets.",
        image: "/images/category/card-bogocchuan.webp",
        badgeVi: "Bo 4 góc",
        badgeEn: "Rounded",
      },
      {
        id: "highlight",
        nameVi: "Danh Thiếp Highlight",
        nameEn: "Spot UV Highlight Cards",
        nameZh: "局部UV高光名片",
        nameJa: "部分光沢UV名刺",
        nameKo: "부분 코팅 하이라이트 명함",
        descriptionVi: "Kỹ thuật phủ bóng UV cục bộ lên logo hoặc hoa văn, tạo độ bóng gồ nổi bắt mắt trên nền mờ.",
        descriptionEn: "Selective gloss UV coating applied over logos and patterns, creating high-contrast tactile shine.",
        image: "/images/category/card-highlight.webp",
        badgeVi: "Phủ bóng UV",
        badgeEn: "Spot UV",
      },
      {
        id: "vuong-bo-goc",
        nameVi: "Danh Thiếp Vuông Bo Góc",
        nameEn: "Square Rounded Corner Cards",
        nameZh: "方形圆角名片",
        nameJa: "正方形角丸名刺",
        nameKo: "정사각 라운딩 명함",
        descriptionVi: "Kích thước vuông 5.4 x 5.4 cm bo tròn 4 góc, phong cách hiện đại cho ngành sáng tạo, nhiếp ảnh.",
        descriptionEn: "Trendy 5.4 x 5.4 cm square card with rounded corners, perfect for photography, fashion, and art studios.",
        image: "/images/category/card-vuongbogoc.webp",
        badgeVi: "Vuông bo tròn",
        badgeEn: "Square Round",
      },
      {
        id: "vuong",
        nameVi: "Danh Thiếp Vuông",
        nameEn: "Square Business Cards",
        nameZh: "正方形个性名片",
        nameJa: "スクエア名刺",
        nameKo: "정사각 명함",
        descriptionVi: "Kích thước vuông vức độc đáo, phá vỡ tỷ lệ truyền thống để tạo dấu ấn cá nhân khác biệt.",
        descriptionEn: "Distinctive square form factor breaking traditional proportions to create unforgettable personal presence.",
        image: "/images/category/card-vuong.webp",
        badgeVi: "Vuông cá tính",
        badgeEn: "Square Cut",
      },
      {
        id: "gap-doi",
        nameVi: "Danh Thiếp Gấp Đôi",
        nameEn: "Folded Business Cards",
        nameZh: "折叠双面名片",
        nameJa: "二つ折り名刺",
        nameKo: "접이식 명함",
        descriptionVi: "Gấp 1 nếp cấn đôi mở ra 4 mặt, tăng gấp đôi không gian chứa menu thu nhỏ, lịch hẹn, sơ đồ địa chỉ.",
        descriptionEn: "Bi-fold card opening into 4 printable panels, doubling space for appointment tables, mini menus, and maps.",
        image: "/images/category/card-gapdoi.webp",
        badgeVi: "4 mặt thông tin",
        badgeEn: "Bi-Fold",
      },
      {
        id: "dap-noi-chim",
        nameVi: "Danh Thiếp Dập Nổi/ Chìm",
        nameEn: "Embossed / Debossed Cards",
        nameZh: "起凸/击凹名片",
        nameJa: "型押し・エンボス名刺",
        nameKo: "엠보싱/형압 명함",
        descriptionVi: "Kỹ thuật dập khuôn vật lý tạo độ nổi 3D hoặc chìm sâu ấn tượng cho biểu tượng thương hiệu.",
        descriptionEn: "Precision die-stamping creating raised 3D emboss or deep deboss relief for high-end emblems.",
        image: "/images/category/card-dapnoichim.webp",
        badgeVi: "Khắc nổi 3D",
        badgeEn: "Embossed",
      },
      {
        id: "ky-thuat-so",
        nameVi: "Danh Thiếp Kỹ Thuật Số",
        nameEn: "Digital Express Business Cards",
        nameZh: "数码快印名片",
        nameJa: "オンデマンド名刺",
        nameKo: "디지털 인쇄 명함",
        descriptionVi: "In laser kỹ thuật số lấy ngay trong ngày, nhận in số lượng linh hoạt từ 1 - 2 hộp.",
        descriptionEn: "Same-day high-precision laser output, flexible short-run ordering starting from just 1-2 boxes.",
        image: "/images/category/card-kithuatso.webp",
        badgeVi: "Lấy ngay",
        badgeEn: "Express",
      },
      {
        id: "thong-minh",
        nameVi: "Danh Thiếp Thông Minh",
        nameEn: "Smart NFC Business Cards",
        nameZh: "智能电子名片",
        nameJa: "スマート名刺",
        nameKo: "스마트 NFC 명함",
        descriptionVi: "Tích hợp chip không dây NFC, chỉ cần chạm vào điện thoại để truyền toàn bộ danh bạ và website.",
        descriptionEn: "Embedded contactless NFC chip, instantly transfers full contact info, social links, and portfolio with 1 tap.",
        image: "/images/category/card-thongminh.webp",
        badgeVi: "Chạm NFC",
        badgeEn: "Smart NFC",
      },
    ],
    materials: [
      {
        icon: "Palette",
        name: "Luxury Art Paper",
        nameVi: "Danh thiếp Giấy mỹ thuật",
        basePrice: 180000,
        doubleSidedPrice: 40000,
        foilPrice: 50000,
        foil2SidesPrice: 90000,
        unitVi: "Hộp",
        unitEn: "Boxes",
        tagline: "Fine-textured imported European art paper conveying artisan luxury",
        taglineVi: "Giấy mỹ thuật châu Âu vân nhám tự nhiên sang trọng, mang đậm chất nghệ thuật khi trao tay",
        description: [
          "Distinct tactile paper grain creates warmth and artisan prestige",
          "Excellent ink absorption with deep, rich matte coloration",
          "Perfect companion for minimalist typography and metallic foil accents"
        ],
        descriptionVi: [
          "Vân giấy sần tinh tế tạo cảm giác chạm êm ái sang trọng",
          "Khả năng thấm mực sâu cho sắc màu trầm ấm, cổ điển",
          "Kết hợp hoàn hảo với chi tiết ép kim vàng/bạc tinh xảo"
        ],
        descriptionTraits: ["textured-art", "natural-grain", "foil-accent"],
        bestFor: ["Creative directors, architects, boutique hotel executives, lawyers"],
        bestForVi: ["Giám đốc sáng tạo, kiến trúc sư, luật sư, chủ thương hiệu cao cấp"],
        pureImage: "/images/product/art.webp",
      },
      {
        icon: "Layers",
        name: "Standard Couche 300 Paper",
        nameVi: "Danh thiếp chuẩn",
        basePrice: 100000,
        doubleSidedPrice: 20000,
        foilPrice: 40000,
        foil2SidesPrice: 70000,
        unitVi: "Hộp",
        unitEn: "Boxes",
        tagline: "Industry-standard C300 paper with dual-sided protective matte lamination",
        taglineVi: "Chất liệu phổ biến và cân bằng nhất: giấy C300 dày dặn cán màng mờ bảo vệ chống ẩm",
        description: [
          "Sturdy 300gsm paper weight with smooth surface and crisp rigidity",
          "Matte lamination resists moisture, fingerprint marks, and edge wear",
          "Most cost-effective solution for mass corporate teams and sales executives"
        ],
        descriptionVi: [
          "Định lượng C300 dày dặn, cứng cáp vừa vặn khi cầm trên tay",
          "Cán màng mờ 2 mặt chống nước nhẹ, không bám vân tay và chống sờn góc",
          "Chi phí tối ưu nhất cho toàn bộ đội ngũ nhân sự và phòng kinh doanh"
        ],
        descriptionTraits: ["smooth-base", "glossy-coat", "thick-weight"],
        bestFor: ["Corporate sales teams, staff business cards, customer appointment cards"],
        bestForVi: ["Nhân viên kinh doanh, danh thiếp công ty, thẻ tích điểm"],
        pureImage: "/images/product/c300.webp",
      },
      {
        icon: "ShieldCheck",
        name: "Synthetic Waterproof Plastic Paper",
        nameVi: "Danh Thiếp Giấy Nhựa",
        basePrice: 350000,
        doubleSidedPrice: 60000,
        foilPrice: 60000,
        foil2SidesPrice: 100000,
        unitVi: "Hộp",
        unitEn: "Boxes",
        tagline: "Indestructible tear-proof, 100% waterproof synthetic film",
        taglineVi: "Chất liệu nhựa tổng hợp siêu bền xé không rách, chống thấm nước tuyệt đối",
        description: [
          "100% waterproof synthetic base resists water, oil, and harsh humidity",
          "Never wrinkles, cracks, or loses shape after years of wallet storage",
          "Modern high-tech feel with optional frosted translucent effects"
        ],
        descriptionVi: [
          "Không thấm nước, chống ẩm mốc và dầu mỡ tuyệt đối 100%",
          "Cực kỳ dẻo dai, xé không rách, không bị gãy gập sau nhiều năm",
          "Bề mặt hiện đại mang lại cảm giác công nghệ cao khác biệt"
        ],
        descriptionTraits: ["waterproof-durability", "smooth-base"],
        bestFor: ["Hospitality, marine, pool clubs, field engineers, VIP membership cards"],
        bestForVi: ["Nhà hàng, quán bar, kỹ sư công trình, thẻ bảo hành VIP"],
        pureImage: "/images/product/thenhuapvc.webp",
      },
    ],
  },

  // ==========================================
  // 8. OFFICE: Bao thư - Envelopes
  // ==========================================
  {
    id: "bao-thu",
    categoryId: "office",
    titleVi: "Bao thư - Envelopes",
    titleEn: "Envelopes",
    titleZh: "信封 - Envelopes",
    titleJa: "封筒 - Envelopes",
    titleKo: "봉투 - Envelopes",
    descriptionVi: "Bao thư văn phòng gửi hợp đồng, báo giá và thư ngỏ đối tác với nắp dán keo chờ tiện lợi, nâng tầm uy tín doanh nghiệp.",
    descriptionEn: "Professional corporate correspondence envelopes for contracts, invoices, and formal greetings.",
    coverImage: "/images/category/baothu.webp",
    shapes: [
      {
        id: "bao-thu-lay-ngay",
        nameVi: "Bao thư lấy ngay",
        nameEn: "Express Fast Envelopes",
        nameZh: "急件速印信封",
        nameJa: "即日仕上げ封筒",
        nameKo: "당일 급행 봉투",
        descriptionVi: "In nhanh kỹ thuật số số lượng ít lấy ngay trong ngày, sẵn sàng phục vụ sự kiện gấp.",
        descriptionEn: "Digital express printing in short runs delivered within the day for urgent meetings.",
        image: "/images/category/baothulayngay.webp",
        badgeVi: "Lấy ngay",
        badgeEn: "Express",
      },
      {
        id: "bao-thu-nho",
        nameVi: "Bao thư nhỏ",
        nameEn: "Small Envelopes (12x22cm)",
        nameZh: "小号信封 (12x22cm)",
        nameJa: "小サイズ封筒 (長3)",
        nameKo: "소봉투 (12x22cm)",
        descriptionVi: "Kích thước tiêu chuẩn 12x22cm (nắp 3cm), nắp có keo chờ bóc dán, phù hợp gửi thư tay, thiệp chúc mừng, thư ngỏ và phiếu voucher.",
        descriptionEn: "Standard 12x22cm (3cm flap) envelope with peel-and-seal adhesive, perfect for formal letters, greeting cards, and vouchers.",
        image: "/images/category/baothunho.webp",
        badgeVi: "12x22cm",
        badgeEn: "Small 12x22cm",
      },
      {
        id: "bao-thu-trung",
        nameVi: "Bao thư trung",
        nameEn: "Medium Envelopes (16x23cm)",
        nameZh: "中号信封 (16x23cm)",
        nameJa: "中サイズ封筒 (角3)",
        nameKo: "중봉투 (16x23cm)",
        descriptionVi: "Kích thước 16x23cm (A5), nắp dán keo sẵn tiện lợi, đựng vừa vặn tờ rơi A5, cuốn catalogue mini hoặc chứng từ gấp đôi.",
        descriptionEn: "Medium 16x23cm (A5) envelope with adhesive strip, sized for A5 flyers, mini booklets, and folded statements.",
        image: "/images/category/baothutrung.webp",
        badgeVi: "16x23cm",
        badgeEn: "Medium A5",
      },
      {
        id: "bao-thu-lon",
        nameVi: "Bao thư lớn",
        nameEn: "Large Envelopes (25x35cm)",
        nameZh: "大号信封 (25x35cm)",
        nameJa: "大サイズ封筒 (角2)",
        nameKo: "대봉투 (25x35cm)",
        descriptionVi: "Kích thước chuẩn 25x35cm đựng trọn vẹn tài liệu A4 không cần gấp, hồ sơ năng lực, hợp đồng kinh tế và catalogue dày dặn.",
        descriptionEn: "Large 25x35cm A4 envelope holding unfolded contracts, company profiles, and thick catalogues securely.",
        image: "/images/category/baothulon.webp",
        badgeVi: "25x35cm A4",
        badgeEn: "Large A4",
      },
      {
        id: "bao-thu-cua-so",
        nameVi: "Bao thư cửa sổ kính",
        nameEn: "Clear Window Envelopes",
        nameZh: "透明开窗信封",
        nameJa: "窓付き封筒",
        nameKo: "창문 투명 봉투",
        descriptionVi: "Khoét cửa sổ dán màng kính trong suốt lộ tên người nhận và địa chỉ in sẵn trên tài liệu.",
        descriptionEn: "Die-cut clear film window revealing recipient address printed on inner invoice documents.",
        image: "/images/category/baothucuasokinh.webp",
        badgeVi: "Cửa sổ kính",
        badgeEn: "Window Film",
      },
    ],
    materials: [
      {
        icon: "Mail",
        name: "Fort & Kraft Paper Envelopes",
        nameVi: "Bao thư Fort & Kraft (Nhỏ / Trung / Lớn)",
        basePrice: 1200,
        doubleSidedPrice: 300,
        unitVi: "Cái",
        unitEn: "Pcs",
        tagline: "Standard white uncoated Fort or vintage brown Kraft with peel-and-seal adhesive",
        taglineVi: "Giấy Fort trắng bám mực tốt hoặc giấy Kraft vintage dán sẵn keo nắp bóc dán",
        description: [
          "Available in Small (12x22cm), Medium (16x23cm), and Large A4 (25x35cm)",
          "Pre-applied peel-and-seal adhesive strip saves packing time",
          "Smooth uncoated finish ready for desktop laser addressing"
        ],
        descriptionVi: [
          "Đầy đủ kích thước Bao thư Nhỏ (12x22cm), Trung (16x23cm) và Lớn A4 (25x35cm)",
          "Gia công dán sẵn keo chờ ở nắp, chỉ cần bóc dán nhanh chóng",
          "Chất giấy Fort trắng mịn hoặc Kraft mộc mạc chuyên nghiệp"
        ],
        descriptionTraits: ["smooth-base", "eco-friendly"],
        bestFor: ["Corporate billing, formal invitations, contract delivery"],
        bestForVi: ["Gửi hóa đơn, hợp đồng pháp lý, thư ngỏ đối tác"],
        pureImage: "/images/product/vd-item-envelope.jpeg",
      },
    ],
  },

  // ==========================================
  // 9. OFFICE: Áo thun đồng phục
  // ==========================================
  {
    id: "ao-thun",
    categoryId: "office",
    titleVi: "Áo thun đồng phục",
    titleEn: "Uniform T-Shirts",
    titleZh: "企业制服T恤",
    titleJa: "ユニフォームTシャツ",
    titleKo: "단체 유니폼 티셔츠",
    descriptionVi: "Đồng phục doanh nghiệp, sự kiện và team building tạo sự gắn kết tập thể, thêu hoặc in logo sắc sảo bền màu.",
    descriptionEn: "Custom corporate polo and crewneck shirts creating team cohesion with sharp embroidery and screen prints.",
    coverImage: "/images/category/aothundongphuc.webp",
    shapes: [
      {
        id: "ao-thun-co-tru",
        nameVi: "Áo thun đồng phục cổ trụ",
        nameEn: "Polo Collar Uniform Shirts",
        nameZh: "翻领POLO工装",
        nameJa: "ポロシャツユニフォーム",
        nameKo: "카라 폴로 단체 티셔츠",
        descriptionVi: "Cổ bẻ bo dệt thanh lịch, lịch sự trong giao tiếp văn phòng và gặp gỡ khách hàng.",
        descriptionEn: "Smart rib-knit collar polo shirt, offering professional presentation in sales and office work.",
        image: "/images/category/aothundongphuccotru.webp",
        badgeVi: "Cổ Polo",
        badgeEn: "Polo",
      },
      {
        id: "ao-thun-co-tron",
        nameVi: "Áo thun đồng phục cổ tròn",
        nameEn: "Round Neck Uniform T-Shirts",
        nameZh: "圆领纯棉T恤",
        nameJa: "クルーネックTシャツ",
        nameKo: "라운드넥 단체 티셔츠",
        descriptionVi: "Kiểu dáng cổ tròn năng động, thoải mái vận động cho các hoạt động ngoại khóa, team building.",
        descriptionEn: "Comfortable crewneck design allowing active movement for sports events and outdoor team building.",
        image: "/images/category/aothundongphuccotron.webp",
        badgeVi: "Cổ tròn",
        badgeEn: "Crewneck",
      },
    ],
    materials: [
      {
        icon: "Shirt",
        name: "Poly Thai Crocodile & 100% Cotton",
        nameVi: "Vải Cá Sấu Poly Thái & Cotton 100%",
        basePrice: 95000,
        doubleSidedPrice: 20000,
        unitVi: "Áo",
        unitEn: "Shirts",
        tagline: "Breathable 4-way stretch fabrics that resist wrinkles and keep crisp colors",
        taglineVi: "Vải dệt mắt cá sấu sang trọng hoặc cotton 4 chiều mềm mát, không xù lông",
        description: [
          "Moisture-wicking yarn keeps staff cool all day",
          "High color-fastness holds shape and shade through 50+ wash cycles",
          "Supports precise digital direct-to-film (DTF) transfer or fine embroidery"
        ],
        descriptionVi: [
          "Khả năng thấm hút mồ hôi và thoáng khí tối đa",
          "Độ bền màu cao, không bai dão và không xù lông sau nhiều lần giặt",
          "In DTF chuyển nhiệt sắc nét hoặc thêu vi tính logo sắc sảo"
        ],
        descriptionTraits: ["soft-light", "eco-friendly"],
        bestFor: ["Corporate staff uniforms, exhibition crews, athletic sports events"],
        bestForVi: ["Đồng phục nhân viên công ty, nhân sự sự kiện, hội thao"],
        pureImage: "/images/product/aopolo2.webp",
        pureImages: [
          "/images/product/aopolo2.webp",
          "/images/product/aopolo3.webp",
          "/images/product/aothunnonsukien.webp"
        ],
      },
    ],
  },

  // ==========================================
  // 10. OFFICE: Giấy ghi chú - Block notes
  // ==========================================
  {
    id: "giay-ghi-chu",
    categoryId: "office",
    titleVi: "Giấy ghi chú - Block notes",
    titleEn: "Block Notes & Memo Pads",
    titleZh: "便签本 - Block notes",
    titleJa: "メモ帳 - Block notes",
    titleKo: "메모지 - Block notes",
    descriptionVi: "Sổ tay ghi chú, memo pad đặt bàn văn phòng tiện dụng, đồng hành trong mọi buổi họp và làm quà tặng nội bộ.",
    descriptionEn: "Custom desktop memo pads and block notes for quick daily ideas and client meeting gifts.",
    coverImage: "/images/category/giayghichu.webp",
    shapes: [
      {
        id: "giay-ghi-chu-block",
        nameVi: "Giấy ghi chú (Block notes)",
        nameEn: "Desk Memo Block Notes",
        nameZh: "办公便签纸",
        nameJa: "デスク用ブロックメモ",
        nameKo: "사무용 떡메모지",
        descriptionVi: "Đóng block keo gáy xé từng tờ tiện lợi, in logo và đường kẻ mờ trang nhã trên từng trang giấy.",
        descriptionEn: "Padded glue-top tear-off memo block with branded watermark and light rule lines on each sheet.",
        image: "/images/category/blocknote.webp",
        badgeVi: "Keo gáy xé",
        badgeEn: "Tear-off Pad",
      },
    ],
    materials: [
      {
        icon: "FileText",
        name: "Fort 80gsm Uncoated Paper",
        nameVi: "Giấy Fort 80gsm Bám Mực Tốt",
        basePrice: 8000,
        doubleSidedPrice: 0,
        unitVi: "Cuốn",
        unitEn: "Pads",
        tagline: "Natural white paper texture offering smooth handwriting with any pen",
        taglineVi: "Giấy trắng tự nhiên không lóa mắt, viết bút bi bút máy êm ru không lem mực",
        description: [
          "Uncoated woodfree paper absorbs fountain pen and ballpoint ink cleanly",
          "Glued top edge allows clean peel-off without paper residue",
          "50 or 100 sheets per block with sturdy grey backing board"
        ],
        descriptionVi: [
          "Bề mặt giấy xốp mịn bắt mực nhanh, không lem sang mặt sau",
          "Keo gáy dẻo xé từng tờ nhẹ nhàng không để lại vệt xơ rách",
          "Quy cách 50 hoặc 100 tờ có bìa lưng carton cứng đỡ tay khi viết"
        ],
        descriptionTraits: ["smooth-base", "eco-friendly"],
        bestFor: ["Corporate meeting pads, executive desk notes, training seminars"],
        bestForVi: ["Sổ tay hội thảo, ghi chép bàn làm việc, quà tặng học viên"],
        pureImage: "/images/product/vd-item-notepad.jpeg",
      },
    ],
  },

  // ==========================================
  // 11. OFFICE: Giấy tiêu đề - Letterheads
  // ==========================================
  {
    id: "giay-tieu-de",
    categoryId: "office",
    titleVi: "Giấy tiêu đề - Letterheads",
    titleEn: "Letterheads",
    titleZh: "信纸便笺 - Letterheads",
    titleJa: "レターヘッド - Letterheads",
    titleKo: "레터헤드 - Letterheads",
    descriptionVi: "Giấy in tiêu đề thư trang trọng dành cho hợp đồng, báo giá và công văn chính thức, chuẩn hóa nhận diện doanh nghiệp.",
    descriptionEn: "Official corporate letterhead stationery formatted for laser and inkjet office contract printing.",
    coverImage: "/images/category/giaytieude.webp",
    shapes: [
      {
        id: "giay-tieu-de-it",
        nameVi: "Giấy tiêu đề số lượng ít",
        nameEn: "Short-run Digital Letterheads",
        nameZh: "少量数码信笺",
        nameJa: "小ロットレターヘッド",
        nameKo: "소량 레터헤드",
        descriptionVi: "In nhanh kỹ thuật số từ 100 - 500 tờ cho văn phòng đại diện hoặc startup.",
        descriptionEn: "Short-run digital print starting from 100 sheets for boutique consultancies and startups.",
        image: "/images/category/giaytieudesoluongit.webp",
        badgeVi: "Số lượng ít",
        badgeEn: "Short Run",
      },
      {
        id: "giay-tieu-de-lon",
        nameVi: "Giấy tiêu đề số lượng lớn",
        nameEn: "Bulk Offset Letterheads",
        nameZh: "批量胶印高品质信笺",
        nameJa: "大ロットオフセット便箋",
        nameKo: "대량 오프셋 레터헤드",
        descriptionVi: "In offset sắc nét số lượng từ 1.000 - 10.000 tờ, chi phí cực kỳ tiết kiệm cho tập đoàn lớn.",
        descriptionEn: "High-volume offset printing with precise Pantone brand color matching for corporate headquarters.",
        image: "/images/category/giaytieudesoluonglon.webp",
        badgeVi: "Offset số lượng lớn",
        badgeEn: "Bulk Offset",
      },
    ],
    materials: [
      {
        icon: "FileText",
        name: "Fort 100gsm - 120gsm Paper",
        nameVi: "Giấy Fort 100gsm - 120gsm",
        basePrice: 450,
        doubleSidedPrice: 150,
        unitVi: "Tờ",
        unitEn: "Sheets",
        tagline: "Laser-printer compatible smooth stock that never jams in office machines",
        taglineVi: "Giấy Fort trắng tinh dày dặn, tương thích hoàn hảo mọi máy in laser văn phòng không lo kẹt giấy",
        description: [
          "Specially conditioned against heat curling inside office copiers",
          "High brightness delivers sharp corporate typography and logo colors",
          "Standard A4 size (210 x 297 mm)"
        ],
        descriptionVi: [
          "Độ ẩm giấy được sấy chuẩn, không bị cong vênh khi qua sấy nhiệt máy in laser",
          "Độ trắng cao tôn lên logo thương hiệu và văn bản ký tên sắc nét",
          "Kích thước chuẩn khổ A4 (21 x 29.7 cm)"
        ],
        descriptionTraits: ["smooth-base", "digital-precision"],
        bestFor: ["Corporate contracts, official quotes, legal notices"],
        bestForVi: ["Báo giá chính thức, hợp đồng pháp lý, công văn thông báo"],
        pureImage: "/images/product/vd-item-form.jpg",
      },
    ],
  },

  // ==========================================
  // 12. OFFICE: Bìa đựng hồ sơ - Folders
  // ==========================================
  {
    id: "bia-dung-ho-so",
    categoryId: "office",
    titleVi: "Bìa đựng hồ sơ - Folders",
    titleEn: "Folders & Presentation Folders",
    titleZh: "文件夹封套 - Folders",
    titleJa: "フォルダ - Folders",
    titleKo: "서류 홀더 - Folders",
    descriptionVi: "Kẹp tài liệu, kẹp profile chào thầu chuyên nghiệp, giữ hồ sơ đối tác gọn gàng cùng khe cắm danh thiếp tinh tế.",
    descriptionEn: "High-end presentation folders holding bids, contracts, and proposals with integrated business card slots.",
    coverImage: "/images/product/vd-item-folder.jpeg",
    shapes: [
      {
        id: "bia-ho-so-cao-cap",
        nameVi: "Bìa đựng hồ sơ cao cấp",
        nameEn: "Premium Luxury Folders",
        nameZh: "烫金UV奢华封套",
        nameJa: "高級特アート紙フォルダ",
        nameKo: "최고급 특수가공 홀더",
        descriptionVi: "Gia công ép kim logo vàng/bạc trên nền giấy mỹ thuật sần hoặc bìa cứng bồi carton 2mm sang trọng.",
        descriptionEn: "Metallic foil stamping and selective spot UV on imported artboard or rigid 2mm board for VIP pitches.",
        image: "/images/category/biadunghosocaocap.webp",
        badgeVi: "Ép kim VIP",
        badgeEn: "Luxury Foil",
      },
      {
        id: "bia-ho-so-1-tay-gap",
        nameVi: "Bìa đựng hồ sơ 1 tay gấp",
        nameEn: "1-Pocket Presentation Folders",
        nameZh: "单口袋文件夹",
        nameJa: "1ポケットホルダー",
        nameKo: "1단 접이식 서류 홀더",
        descriptionVi: "Quy cách 1 tai gấp bên phải có khe cài namecard, kẹp tài liệu dày từ 10 - 20 tờ A4 phẳng phiu.",
        descriptionEn: "Single right pocket with die-cut business card slot, holding 10-20 sheets of A4 paper cleanly.",
        image: "/images/category/biadunghoso1taygap.webp",
        badgeVi: "1 tay gấp",
        badgeEn: "1 Pocket",
      },
      {
        id: "bia-ho-so-2-tay-gap",
        nameVi: "Bìa đựng hồ sơ 2 tay gấp",
        nameEn: "2-Pocket Presentation Folders",
        nameZh: "双口袋厚款文件夹",
        nameJa: "2ポケットホルダー",
        nameKo: "2단 접이식 서류 홀더",
        descriptionVi: "Thiết kế 2 tai gấp đối xứng hai bên, chứa được lượng tài liệu lớn và hợp đồng hai bên ký kết.",
        descriptionEn: "Dual symmetrical pockets with expansive spine gusset holding up to 50 sheets and multi-part contracts.",
        image: "/images/category/biadunghoso2taygap.webp",
        badgeVi: "2 tay gấp",
        badgeEn: "2 Pockets",
      },
    ],
    materials: [
      {
        icon: "Folder",
        name: "Couche 300gsm & Bristol 350gsm",
        nameVi: "Giấy C300 & Bristol 350gsm Cán Màng Mờ",
        basePrice: 7500,
        doubleSidedPrice: 2000,
        foilPrice: 40000,
        unitVi: "Cái",
        unitEn: "Pcs",
        tagline: "Sturdy cardstock with protective matte lamination and precision die-cut pockets",
        taglineVi: "Giấy định lượng dày dặn 300 - 350gsm, cán màng mờ bảo vệ chống ẩm và tưa rách mép",
        description: [
          "Heavy board maintains sharp corners and rigid spine",
          "Matte lamination repels fingerprints and moisture",
          "Die-cut business card slits pre-cut into pocket flap"
        ],
        descriptionVi: [
          "Độ dày 300gsm - 350gsm cứng cáp, dựng đứng không bị mềm yếu",
          "Màng mờ phủ 2 mặt chống nước mưa nhẹ và chống sờn gãy nếp cấn",
          "Có sẵn đường khe bế cài danh thiếp của nhân viên kinh doanh"
        ],
        descriptionTraits: ["thick-weight", "smooth-base", "glossy-coat"],
        bestFor: ["Tender bids, corporate sales folders, architectural project packages"],
        bestForVi: ["Hồ sơ đấu thầu, kẹp hợp đồng kinh doanh, tài liệu dự án bất động sản"],
        pureImage: "/images/product/vd-item-folder.jpeg",
      },
    ],
  },

  // ==========================================
  // 13. PACKAGING: Nhãn Dán - Decal Label
  // ==========================================
  {
    id: "nhan-dan",
    categoryId: "packaging",
    titleVi: "Nhãn Dán - Decal Label",
    titleEn: "Decal Labels & Stickers",
    titleZh: "不干胶标签 - Decal Label",
    titleJa: "ラベル・シール - Decal Label",
    titleKo: "라벨 스티커 - Decal Label",
    descriptionVi: "Tem nhãn dán bao bì sản phẩm, tem niêm phong và sticker quảng cáo bế demi mọi hình dáng, bám dính chắc chắn.",
    descriptionEn: "Custom product packaging labels, tamper seals, and branded stickers kiss-cut to any shape.",
    coverImage: "/images/category/nhandan.webp",
    shapes: [
      {
        id: "sticker-sheets",
        nameVi: "Nhãn Sticker dạng Tờ",
        nameEn: "Kiss-cut Sticker Sheets",
        nameZh: "拼版多图贴纸套装",
        nameJa: "シートタイプステッカー",
        nameKo: "시트형 멀티 스티커 팩",
        descriptionVi: "Dàn nhiều hình bế demi trên 1 tờ A4 / A3, dễ dàng bóc dán từng chiếc tiện lợi.",
        descriptionEn: "Multiple kiss-cut shapes nested on one convenient A4/A3 sheet for easy peeling and retail packaging.",
        image: "/images/category/nhanstickerdangto.webp",
        badgeVi: "Dạng tờ A4",
        badgeEn: "Sticker Sheet",
      },
      {
        id: "decal-uv-dtf",
        nameVi: "Nhãn Decal UV nổi - UV DTF",
        nameEn: "3D Raised UV DTF Decals",
        nameZh: "水晶标立体UV转印贴",
        nameJa: "立体UV転写シール (UV DTF)",
        nameKo: "입체 UV 전사 스티커 (UV DTF)",
        descriptionVi: "Công nghệ in UV nổi không cần màng keo nền, dán chuyển chữ nổi 3D sang ly sứ, nón bảo hiểm, kim loại.",
        descriptionEn: "Direct-to-film 3D raised UV transfers adhering seamlessly to glass, metal, hard plastic without clear background film.",
        image: "/images/category/nhandecaluvnoi.webp",
        badgeVi: "Chữ nổi 3D",
        badgeEn: "3D UV DTF",
      },
      {
        id: "decal-tem-be",
        nameVi: "Nhãn Decal Tem Bể/ Tem Vỡ",
        nameEn: "Destructible Tamper / Warranty Seals",
        nameZh: "易碎防伪质保封条",
        nameJa: "改ざん防止・脆性質保シール",
        nameKo: "파손형 봉인 / 정품인증 씰",
        descriptionVi: "Chất liệu decal giòn tự vỡ vụn khi bóc tách, chống mở hộp tráo đổi linh kiện và bảo hành sản phẩm.",
        descriptionEn: "Ultra-destructible eggshell vinyl that fragments instantly upon any removal attempt for warranty protection.",
        image: "/images/category/temvo.webp",
        badgeVi: "Bảo hành",
        badgeEn: "Warranty",
      },
    ],
    materials: [
      {
        icon: "Tag",
        name: "Paper, Plastic PVC & Kraft Decal",
        nameVi: "Decal Giấy, Nhựa Trong/Sữa, Kraft, Xi Bạc",
        basePrice: 400,
        doubleSidedPrice: 0,
        unitVi: "Tem",
        unitEn: "Stickers",
        tagline: "Waterproof synthetic, transparent film, or vintage kraft with permanent adhesive",
        taglineVi: "Đa dạng chất liệu decal giấy tiết kiệm, decal nhựa chống nước, decal xi bạc chịu nhiệt",
        description: [
          "Super-strong acrylic permanent adhesive sticks to glass, plastic, and cardboard",
          "Waterproof PVC vinyl resists refrigerator condensation and oil spills",
          "Precision computer laser die-cutting to any outline contour"
        ],
        descriptionVi: [
          "Keo dán acrylic bám dính chắc chắn trên bề mặt chai thủy tinh, hộp nhựa và túi giấy",
          "Chất liệu decal nhựa kháng nước 100%, chịu lạnh trong tủ mát không bong tróc",
          "Bế đứt demi theo đúng viền thiết kế tròn, vuông, elip hoặc hình dáng tự do"
        ],
        descriptionTraits: ["waterproof-durability", "digital-precision"],
        bestFor: ["Beverage bottle labels, cosmetic jars, bakery seals, shipping boxes"],
        bestForVi: ["Tem dán chai trà sữa, hũ mỹ phẩm, hộp thức ăn, niêm phong kiện hàng"],
        pureImage: "/images/product/vd-item-decal.jpeg",
      },
    ],
  },

  // ==========================================
  // 14. PACKAGING: Túi giấy - Paper bags
  // ==========================================
  {
    id: "tui-giay",
    categoryId: "packaging",
    titleVi: "Túi giấy - Paper bags",
    titleEn: "Paper Bags",
    titleZh: "纸质手提袋 - Paper bags",
    titleJa: "紙袋・ショッパー - Paper bags",
    titleKo: "종이 쇼핑백 - Paper bags",
    descriptionVi: "Bao bì túi giấy sang trọng nâng tầm giá trị sản phẩm, lan tỏa nhận diện thương hiệu trên mọi nẻo đường.",
    descriptionEn: "Premium custom retail shopping bags elevating product value and displaying your brand identity everywhere.",
    coverImage: "/images/category/tuigiay.webp",
    shapes: [
      {
        id: "tui-giay-chuan",
        nameVi: "Túi giấy chuẩn",
        nameEn: "Standard Paper Shopping Bags",
        nameZh: "标准手提袋",
        nameJa: "標準ショッパー",
        nameKo: "표준 쇼핑백",
        descriptionVi: "Quy cách túi xỏ dây dù hoặc ruy băng có đệm đáy cứng chịu lực, thông dụng cho thời trang và mỹ phẩm.",
        descriptionEn: "Classic cord-handled bag with bottom reinforcement board, versatile for boutiques and cosmetics.",
        image: "/images/category/tuigiaychuan.webp",
        badgeVi: "Xỏ dây",
        badgeEn: "Cord Handle",
      },
      {
        id: "tui-giay-quai-hot-xoai",
        nameVi: "Túi giấy quai hột xoài",
        nameEn: "Die-cut Handle Bags",
        nameZh: "冲孔提手袋",
        nameJa: "小判抜き紙袋",
        nameKo: "타공 손잡이 종이백",
        descriptionVi: "Đục lỗ tay xách hạt xoài trực tiếp trên thân miệng túi, tạo form gọn nhẹ và hiện đại.",
        descriptionEn: "Integrated die-cut oval handle on the bag top, offering a sleek, lightweight profile for gifts and lightweight retail.",
        image: "/images/category/tuigiayquaihopxoai.webp",
        badgeVi: "Quai đục lỗ",
        badgeEn: "Die-Cut",
      },
      {
        id: "tui-giay-co-nap",
        nameVi: "Túi giấy có nắp/ nắp gập",
        nameEn: "Flap-closure Paper Bags",
        nameZh: "折叠盖式礼品纸袋",
        nameJa: "フタ付きギフトバッグ",
        nameKo: "덮개형 기프트 종이백",
        descriptionVi: "Thiết kế nắp gập che kín miệng túi thắt nơ sang trọng, bảo vệ quà tặng kín đáo và đẳng cấp.",
        descriptionEn: "Fold-over flap closure with ribbon tie, concealing contents and creating a luxury unboxing feel.",
        image: "/images/category/tuigiayconap.webp",
        badgeVi: "Nắp gập VIP",
        badgeEn: "Flap Closure",
      },
      {
        id: "tui-giay-ep-kim",
        nameVi: "Túi giấy ép kim",
        nameEn: "Foil Stamped Luxury Bags",
        nameZh: "烫金高档精品袋",
        nameJa: "箔押し紙袋",
        nameKo: "박가공 쇼핑백",
        descriptionVi: "Gia công ép kim nhũ vàng hoặc bạc nổi bật logo, tạo điểm nhấn kim loại sang trọng dưới ánh đèn.",
        descriptionEn: "Metallic foil logo stamping in gold, silver, or rose gold for premium jewelry and fashion brands.",
        image: "/images/category/tuigiayepkim.webp",
        badgeVi: "Ép kim nhũ",
        badgeEn: "Foil Accent",
      },
      {
        id: "tui-giay-banh-mi",
        nameVi: "Túi giấy bánh mì",
        nameEn: "Bread & Bakery Bags",
        nameZh: "烘焙面包纸袋",
        nameJa: "ベーカリー袋",
        nameKo: "베이커리 빵봉투",
        descriptionVi: "Quy cách đáy đứng hoặc đáy dẹp không quai, chuyên dụng cho bánh mì, cà phê hạt và thức ăn nhanh.",
        descriptionEn: "Pinch-bottom or stand-up gusseted bags without handles, food-grade safe for bakeries and coffee beans.",
        image: "/images/category/tuigiaybanhmi.webp",
        badgeVi: "Thực phẩm",
        badgeEn: "Food Safe",
      },
      {
        id: "tui-giay-co-san",
        nameVi: "Túi Giấy Có Sẵn",
        nameEn: "In-Stock Ready-made Bags",
        nameZh: "现货空白袋",
        nameJa: "既製品即納バッグ",
        nameKo: "기성 완제품 쇼핑백",
        descriptionVi: "Túi sản xuất sẵn nhiều kích thước, hỗ trợ in nhanh logo số lượng ít lấy ngay trong ngày.",
        descriptionEn: "Pre-assembled blank stock in popular dimensions, ready for fast overprinting in low MOQs.",
        image: "/images/category/tuigiaycosan.webp",
        badgeVi: "Lấy ngay",
        badgeEn: "In Stock",
      },
    ],
    materials: [
      {
        icon: "ShieldCheck",
        name: "Natural Eco Kraft Paper",
        nameVi: "Túi giấy kraft",
        basePrice: 3500,
        doubleSidedPrice: 1000,
        unitVi: "Cái",
        unitEn: "Bags",
        tagline: "Eco-friendly recyclable brown kraft paper with authentic vintage organic grain",
        taglineVi: "Giấy xi măng nâu tự nhiên tái chế 100%, dẻo dai và thân thiện môi trường",
        description: [
          "Biodegradable natural unbleached long-fiber kraft paper",
          "High tensile strength and tear resistance carrying heavy jars and clothes",
          "Creates an authentic handmade, organic, and eco-friendly brand identity"
        ],
        descriptionVi: [
          "Chất liệu giấy tự nhiên tự phân hủy, không tẩy trắng hóa chất độc hại",
          "Độ dai và chịu tải tốt, xách được quần áo, hũ hạt dinh dưỡng và mỹ phẩm",
          "Tạo nét thẩm mỹ mộc mạc, gần gũi với thiên nhiên được khách hàng trẻ ưa chuộng"
        ],
        descriptionTraits: ["eco-friendly", "natural-grain", "thick-weight"],
        bestFor: ["Eco-friendly fashion brands, craft bakeries, organic skincare, coffee roasters"],
        bestForVi: ["Cửa hàng thực phẩm sạch, tiệm bánh, thời trang vintage, quán cafe"],
        pureImage: "/images/product/bag-kraft1.webp",
      },
      {
        icon: "Layers",
        name: "Premium Couche / Ivory Paper",
        nameVi: "Giấy Couche / Ivory",
        basePrice: 5500,
        doubleSidedPrice: 1500,
        unitVi: "Cái",
        unitEn: "Bags",
        tagline: "Crisp white coated paperboard with matte lamination for vivid full-bleed graphics",
        taglineVi: "Giấy trắng cứng cáp cán màng mờ, in màu sắc tràn viền rực rỡ và sang trọng",
        description: [
          "Pure white background allows full-color CMYK photo printing and sharp brand colors",
          "Coated with protective water-resistant matte lamination",
          "Reinforced top turn-in and bottom card for maximum load capacity up to 5kg"
        ],
        descriptionVi: [
          "Bề mặt trắng mịn cho màu in chuẩn xác, sắc nét đến từng dải màu thương hiệu",
          "Cán màng mờ chống trầy xước và hạn chế nước mưa ngấm vào",
          "Gia cố bìa cứng ở miệng túi và đáy túi giúp chịu lực xách đến 5kg"
        ],
        descriptionTraits: ["smooth-base", "glossy-coat", "thick-weight"],
        bestFor: ["Fashion boutiques, cosmetics, luxury jewelry, event corporate gifts"],
        bestForVi: ["Shop quần áo, showroom mỹ phẩm, quà tặng sự kiện doanh nghiệp"],
        pureImage: "/images/product/bag-couche1.webp",
      },
    ],
  },

  // ==========================================
  // 15. PACKAGING: Hộp Giấy - Paper box
  // ==========================================
  {
    id: "hop-giay",
    categoryId: "packaging",
    titleVi: "Hộp Giấy - Paper box",
    titleEn: "Paper Boxes & Packaging",
    titleZh: "纸盒包装 - Paper box",
    titleJa: "化粧箱・ペーパーボックス",
    titleKo: "종이 상자 / 패키지 박스",
    descriptionVi: "Hộp đựng sản phẩm tinh tế, bảo vệ an toàn hàng hóa khi vận chuyển và tạo trải nghiệm mở hộp (unboxing) ấn tượng.",
    descriptionEn: "Rigid luxury and folding carton packaging designed for protection and delighting unboxing experiences.",
    coverImage: "/images/category/hopgiay.webp",
    shapes: [
      {
        id: "hop-giay-thong-dung",
        nameVi: "Hộp Giấy Thông Dụng",
        nameEn: "Standard Folding Cartons",
        nameZh: "通用折叠彩盒",
        nameJa: "汎用折りたたみ化粧箱",
        nameKo: "일반 접이식 단상자",
        descriptionVi: "Quy cách nắp gài đáy gài hoặc đáy khóa tiện lợi, tối ưu chi phí cho mỹ phẩm, dược phẩm và thực phẩm.",
        descriptionEn: "Convenient tuck-end and snap-lock bottom folding carton for cosmetics, pharmaceuticals, and retail retail goods.",
        image: "/images/category/hopgiaythongdung.webp",
        badgeVi: "Nắp gài",
        badgeEn: "Tuck-End",
      },
    ],
    materials: [
      {
        icon: "Package",
        name: "Ivory, Kraft & Corrugated Board",
        nameVi: "Giấy Ivory, Kraft & Carton Sóng E/B",
        basePrice: 4500,
        doubleSidedPrice: 1500,
        unitVi: "Hộp",
        unitEn: "Boxes",
        tagline: "Sturdy structural paperboards certified safe for product storage and shipping",
        taglineVi: "Chất liệu Ivory cứng cáp, Kraft mộc mạc hoặc carton sóng chịu lực va đập tuyệt vời",
        description: [
          "High structural rigidity protects delicate bottles and glass jars",
          "Optional matte lamination and foil stamping on the exterior",
          "Available with custom die-cut foam or paperboard inserts"
        ],
        descriptionVi: [
          "Độ nén và độ bục cao giúp bảo vệ an toàn chai lọ thủy tinh bên trong",
          "Cán màng mờ bảo vệ chống ẩm và hỗ trợ ép kim nổi bật",
          "Gia công khay định hình mút xốp hoặc carton khít theo sản phẩm"
        ],
        descriptionTraits: ["thick-weight", "smooth-base", "eco-friendly"],
        bestFor: ["Perfume boxes, skincare jars, premium tea, electronic gadgets"],
        bestForVi: ["Hộp nước hoa, mỹ phẩm, trà hảo hạng, phụ kiện công nghệ"],
        pureImage: "/images/product/vd-item-box.jpg",
      },
    ],
  },

  // ==========================================
  // 16. PACKAGING: Mác sản phẩm - Product Tags
  // ==========================================
  {
    id: "mac-san-pham",
    categoryId: "packaging",
    titleVi: "Mác sản phẩm - Product Tags",
    titleEn: "Product Tags & Hangtags",
    titleZh: "商品吊牌 - Product Tags",
    titleJa: "下げ札・タグ - Product Tags",
    titleKo: "의류 행택 / 태그 - Product Tags",
    descriptionVi: "Thẻ bài, mác treo quần áo, phụ kiện thời trang và trang sức khẳng định thương hiệu và cung cấp thông tin giá cả, xuất xứ.",
    descriptionEn: "Custom apparel hangtags and jewelry price cards highlighting brand quality and care instructions.",
    coverImage: "/images/category/macsanpham.webp",
    shapes: [
      {
        id: "mac-pho-thong",
        nameVi: "Mác sản phẩm phổ thông",
        nameEn: "Standard Hangtags",
        nameZh: "常规商品价格吊牌",
        nameJa: "スタンダード下げ札",
        nameKo: "일반 상품 행택",
        descriptionVi: "Quy cách in chuẩn cán màng mờ hoặc bóng, đục lỗ xỏ dây tròn hoặc cấn đường xé giá tiện lợi.",
        descriptionEn: "Standard hangtags with matte or gloss lamination, round drill hole or tear-off perforated price stub.",
        image: "/images/category/macsanphamphothong.webp",
        badgeVi: "Phổ thông",
        badgeEn: "Standard",
      },
      {
        id: "mac-cao-cap",
        nameVi: "Mác Sản Phẩm Cao Cấp",
        nameEn: "Premium Luxury Hangtags",
        nameZh: "加厚特种纸高档吊牌",
        nameJa: "高級特殊紙下げ札",
        nameKo: "고급 프리미엄 브랜드 택",
        descriptionVi: "Chất liệu giấy bồi dày 2-3 lớp, ép kim nhũ vàng và dập mắt gà kim loại xỏ dây dù sang trọng.",
        descriptionEn: "Multi-ply laminated heavy stock with gold foil accents and brass eyelet grommet for luxury apparel.",
        image: "/images/category/macsanphamcaocap.webp",
        badgeVi: "Ép kim mắt gà",
        badgeEn: "Eyelet Grommet",
      },
      {
        id: "tag-thoi-trang",
        nameVi: "Tag thời trang",
        nameEn: "Fashion Apparel Tags",
        nameZh: "服装服饰专属标签",
        nameJa: "アパレル・ファッションタグ",
        nameKo: "패션 브랜드 의류 태그",
        descriptionVi: "Quy cách bế bo góc hoặc hình dáng chuông, cấn đục lỗ xỏ dây tiêu chuẩn ngành may mặc.",
        descriptionEn: "Classic rectangular or shaped hangtags with punch hole ready for garment cord attachment.",
        image: "/images/category/tagthoitrang.webp",
        badgeVi: "May mặc",
        badgeEn: "Apparel",
      },
      {
        id: "tag-trang-suc",
        nameVi: "Tag trang sức",
        nameEn: "Jewelry & Accessory Tags",
        nameZh: "精美首饰珠宝小标签",
        nameJa: "ジュエリー・アクセサリータグ",
        nameKo: "주얼리 / 액세서리 미니 택",
        descriptionVi: "Kích thước mini nhỏ gọn, đục lỗ xỏ khuyên tai, nhẫn và vòng tay tinh xảo.",
        descriptionEn: "Miniature die-cut cards engineered for earrings, necklaces, and delicate accessories.",
        image: "/images/category/tagtrangsuc.webp",
        badgeVi: "Mini trang sức",
        badgeEn: "Jewelry",
      },
      {
        id: "tag-cam-on",
        nameVi: "Tag cảm ơn",
        nameEn: "Thank You Gift Tags",
        nameZh: "精美感恩感谢卡吊牌",
        nameJa: "サンキュー・感謝タグ",
        nameKo: "감사 땡큐 기프트 택",
        descriptionVi: "Thiết kế xinh xắn gửi lời tri ân ngọt ngào đến khách hàng kèm trong mỗi gói hàng đơn mua.",
        descriptionEn: "Heartfelt mini appreciation thank-you cards slipped into e-commerce packaging parcels.",
        image: "/images/category/tagcamon.webp",
        badgeVi: "Tri ân",
        badgeEn: "Thank You",
      },
    ],
    materials: [
      {
        icon: "Tag",
        name: "Couche 300, Kraft & Art Paper",
        nameVi: "Giấy C300, Giấy Kraft & Giấy Mỹ Thuật",
        basePrice: 450,
        doubleSidedPrice: 150,
        unitVi: "Mác",
        unitEn: "Tags",
        tagline: "Rigid heavy paper stock with pre-punched string hole",
        taglineVi: "Giấy dày dặn bấm sẵn lỗ xỏ dây, cán màng mờ hoặc giữ vân mộc tự nhiên",
        description: [
          "Pre-drilled 3mm or 5mm string hole ready for tag pins or wax cords",
          "Smooth matte lamination protects against ink rubbing onto clothing fabrics",
          "Rich color fidelity for barcode and care instruction icons"
        ],
        descriptionVi: [
          "Bấm sẵn lỗ xỏ dây 3mm hoặc 5mm tiện luồn dây dù gắn cúc áo",
          "Cán màng mờ bảo vệ chống lem mực sang vải quần áo",
          "Màu in chuẩn xác rõ ràng mã vạch và ký hiệu hướng dẫn giặt ủi"
        ],
        descriptionTraits: ["thick-weight", "smooth-base", "eco-friendly"],
        bestFor: ["Clothing brands, leather bags, handmade jewelry, cosmetic gift bundles"],
        bestForVi: ["Thương hiệu thời trang, túi xách đồ da, trang sức thủ công"],
        pureImage: "/images/product/vd-item-tag.jpeg",
      },
    ],
  },

  // ==========================================
  // 17. TET: Lịch Để Bàn - Calendars
  // ==========================================
  {
    id: "lich-tet",
    categoryId: "tet",
    titleVi: "Lịch Để Bàn - Calendars",
    titleEn: "Desk Calendars",
    titleZh: "台历桌历 - Calendars",
    titleJa: "卓上カレンダー - Calendars",
    titleKo: "탁상 달력 - Calendars",
    descriptionVi: "Ấn phẩm quà tặng năm mới ý nghĩa, hiện diện 365 ngày trên bàn làm việc của đối tác và khách hàng thân thiết.",
    descriptionEn: "Meaningful corporate New Year gifts that keep your brand visible on client desks for all 365 days.",
    coverImage: "/images/category/lichdeban.webp",
    shapes: [
      {
        id: "lich-de-ban",
        nameVi: "Lịch để bàn",
        nameEn: "Desk Calendars",
        nameZh: "企业定制台历",
        nameJa: "スタンダード卓上カレンダー",
        nameKo: "기업 맞춤 탁상 달력",
        descriptionVi: "Quy cách lịch chữ A hoặc chữ M 13 tờ đóng gáy lò xo đôi, đế bồi simili cứng cáp đứng vững chãi trên bàn làm việc.",
        descriptionEn: "Classic 13-sheet A-frame or M-frame desk calendar with wire-o spiral binding on rigid standing simili base.",
        image: "/images/category/lichdebancon.webp",
        badgeVi: "Lịch chữ A",
        badgeEn: "A-Frame",
      },
      {
        id: "lich-ban-2026",
        nameVi: "Lịch để bàn 2026",
        nameEn: "Desk Calendars 2026",
        nameZh: "2026新春台历",
        nameJa: "2026年 卓上カレンダー",
        nameKo: "2026 신년 탁상 달력",
        descriptionVi: "Bộ sưu tập 13 tờ lò xo chữ A đón xuân Bính Ngọ 2026, thiết kế phong thủy tài lộc.",
        descriptionEn: "13-sheet wire-o bound A-frame calendar collection celebrating 2026 with joyful festive artworks.",
        image: "/images/category/lichdeban2026.webp",
        badgeVi: "Xuân 2026",
        badgeEn: "New 2026",
      },
      {
        id: "lich-nam-cham",
        nameVi: "Lịch ảnh nam châm dẻo",
        nameEn: "Flexible Magnetic Photo Calendars",
        nameZh: "冰箱贴软磁日历",
        nameJa: "マグネットフォトカレンダー",
        nameKo: "자석 포토 캘린더",
        descriptionVi: "Tấm lịch nam châm dẻo hít tủ lạnh hoặc bề mặt kim loại, nhỏ gọn và tiện lợi xem ngày.",
        descriptionEn: "Flexible magnetic calendar sheet adhering to refrigerators and metal cabinets for daily viewing.",
        image: "/images/category/lichanhnamchamdeo.webp",
        badgeVi: "Nam châm dẻo",
        badgeEn: "Magnetic",
      },
    ],
    materials: [
      {
        icon: "Calendar",
        name: "Couche 250gsm & Rigid Simili Base",
        nameVi: "Giấy Couche 250gsm & Đế Bồi Simili / Linen",
        basePrice: 28000,
        doubleSidedPrice: 0,
        unitVi: "Cuốn",
        unitEn: "Calendars",
        tagline: "Vivid 13-sheet full-color printing with sturdy stand-up cardboard frame",
        taglineVi: "In 13 tờ 2 mặt màu sắc rực rỡ, đế bồi simili cứng cáp đứng vững vàng trên bàn",
        description: [
          "250gsm heavyweight coated sheets with smooth page turning",
          "Double-wire metal spiral binding in gold, silver, or classic black",
          "Rigid 2mm cardboard stand wrapped in luxury linen or buckram simili"
        ],
        descriptionVi: [
          "Giấy ruột C250 dày dặn lật mở êm ái, màu in sắc sảo cả 13 tờ",
          "Lò xo xoắn kép kim loại vàng ánh kim, bạc hoặc đen trang nhã",
          "Khung đế carton dày 2mm bồi simili hoặc vải linen đứng vững chãi"
        ],
        descriptionTraits: ["thick-weight", "smooth-base", "foil-accent"],
        bestFor: ["Corporate New Year VIP gifts, bank client appreciation, office staff desks"],
        bestForVi: ["Quà tặng Tết tri ân đối tác ngân hàng, doanh nghiệp, nhân viên công ty"],
        pureImage: "/images/product/vd-item-lichtet.jpg",
      },
    ],
  },

  // ==========================================
  // 18. TET: Bao Lì Xì
  // ==========================================
  {
    id: "bao-li-xi",
    categoryId: "tet",
    titleVi: "Bao Lì Xì",
    titleEn: "Red Envelopes - Lucky Money",
    titleZh: "新年红包 - Red Envelopes",
    titleJa: "お年玉袋・ポチ袋",
    titleKo: "새해 복돈 봉투",
    descriptionVi: "Ấn phẩm may mắn đầu năm mới trao gửi tài lộc, bình an và dấu ấn thương hiệu gắn kết cùng khách hàng.",
    descriptionEn: "Traditional Lunar New Year lucky money packets sharing blessings, prosperity, and brand recognition.",
    coverImage: "/images/category/baolixi.webp",
    shapes: [
      {
        id: "bao-li-xi-chuan",
        nameVi: "Bao Lì Xì",
        nameEn: "Standard Red Envelopes",
        nameZh: "标准全开式红包",
        nameJa: "標準お年玉袋",
        nameKo: "표준 새해 복돈 봉투",
        descriptionVi: "Kích thước chuẩn 8 x 16 cm để thẳng tờ tiền polymer may mắn không cần gấp, nắp gài thanh lịch.",
        descriptionEn: "Standard 8 x 16 cm size fitting polymer banknotes flat without folding, with easy tuck-in tab closure.",
        image: "/images/category/baolixi.webp",
        badgeVi: "Chuẩn 8x16",
        badgeEn: "Standard",
      },
      {
        id: "bao-li-xi-2026",
        nameVi: "Bao lì xì 2026",
        nameEn: "Year of the Horse 2026 Packets",
        nameZh: "2026生肖贺岁红包",
        nameJa: "2026年干支ポチ袋",
        nameKo: "2026 신년 캐릭터 봉투",
        descriptionVi: "Bộ sưu tập mẫu thiết kế chủ đề xuân Bính Ngọ 2026 độc quyền, họa tiết vui tươi, ấn tượng.",
        descriptionEn: "Exclusive 2026 zodiac Lunar New Year artistic design collection with lively joyful festival artwork.",
        image: "/images/category/baolixi2026.webp",
        badgeVi: "Xuân 2026",
        badgeEn: "New 2026",
      },
      {
        id: "bao-li-xi-ep-kim",
        nameVi: "Bao lì xì ép kim cao cấp",
        nameEn: "Foil Stamped Luxury Packets",
        nameZh: "烫金高档贺岁红包",
        nameJa: "高級金箔押しお年玉袋",
        nameKo: "프리미엄 금박 복돈 봉투",
        descriptionVi: "Gia công ép kim vàng 3D lấp lánh câu chúc may mắn trên nền giấy đỏ nhung hoặc giấy mỹ thuật.",
        descriptionEn: "Radiant 3D metallic gold foil stamping on premium red velvet or artistic paper, reflecting prestige.",
        image: "/images/category/baolixiepkimcaocap.webp",
        badgeVi: "Ép kim nhũ",
        badgeEn: "Gold Foil",
      },
    ],
    materials: [
      {
        icon: "Sparkles",
        name: "Artistic Textured Red Paper",
        nameVi: "Giấy Mỹ Thuật Đỏ Ánh Nhũ",
        basePrice: 1500,
        doubleSidedPrice: 500,
        unitVi: "Cái",
        unitEn: "Packets",
        tagline: "Luxurious textured red stock with subtle metallic glitter that catches ambient light",
        taglineVi: "Giấy mỹ thuật đỏ thắm có ánh kim tuyến lấp lánh nhẹ nhàng, đẳng cấp trang trọng cho Tết",
        description: [
          "Vibrant ceremonial red paper texture with sparkling metallic sheen",
          "Heavy paper stock resists creases and holds banknotes securely",
          "Specially formulated for crisp 3D gold foil stamping"
        ],
        descriptionVi: [
          "Màu đỏ lễ hội tươi tắn kết hợp bột nhũ kim tuyến phản chiếu ánh sáng",
          "Chất giấy đầm tay, giữ form phẳng phiu không bị nhăn gãy",
          "Bám dính nhũ vàng cực tốt khi ép kim chữ Phúc - Lộc - Thọ"
        ],
        descriptionTraits: ["metallic-shine", "textured-art", "foil-accent"],
        bestFor: ["Corporate VIP Tet gifts, banking red packets, luxury brands"],
        bestForVi: ["Quà tặng tri ân khách hàng VIP ngân hàng, doanh nghiệp lớn"],
        pureImage: "/images/product/vd-item-lixi.jpeg",
      },
      {
        icon: "ShieldCheck",
        name: "Vintage Kraft Paper",
        nameVi: "Giấy Kraft Vintage",
        basePrice: 800,
        doubleSidedPrice: 300,
        unitVi: "Cái",
        unitEn: "Packets",
        tagline: "Nostalgic retro brown kraft paper creating an authentic traditional folk aesthetic",
        taglineVi: "Giấy kraft nâu mộc mạc gợi nhắc không khí Tết xưa truyền thống, ấm áp",
        description: [
          "100% eco-friendly recycled brown kraft paper",
          "Pairs wonderfully with nostalgic calligraphy and folk art illustrations",
          "Popular choice for young consumers, coffee shops, and creative studios"
        ],
        descriptionVi: [
          "Giấy xi măng nâu tái chế thân thiện môi trường",
          "Tôn vinh nét đẹp thư pháp và tranh vẽ dân gian ngày Tết",
          "Phong cách hoài niệm được giới trẻ và các chuỗi cafe cực kỳ yêu thích"
        ],
        descriptionTraits: ["natural-grain", "eco-friendly"],
        bestFor: ["Youth brands, coffee shops, artisan bakeries, cultural events"],
        bestForVi: ["Thương hiệu thời trang trẻ, quán cafe, studio nghệ thuật"],
        pureImage: "/images/product/bag-kraft1.webp",
      },
    ],
  },

  // ==========================================
  // 19. TET: Thiệp Mời - Invitation Cards
  // ==========================================
  {
    id: "thiep-tet",
    categoryId: "tet",
    titleVi: "Thiệp Mời - Invitation Cards",
    titleEn: "Invitation Cards",
    titleZh: "邀请函请柬 - Invitation Cards",
    titleJa: "招待状 - Invitation Cards",
    titleKo: "초대장 - Invitation Cards",
    descriptionVi: "Thiệp chúc Tết và thiệp mời tiệc Tất niên gala dinner gửi trao tình cảm tri ân trân quý đến nhân viên và đối tác.",
    descriptionEn: "Corporate Lunar New Year greeting cards and year-end gala dinner invitations expressing gratitude.",
    coverImage: "/images/category/thiepmoi.webp",
    shapes: [
      {
        id: "thiep-su-kien",
        nameVi: "Thiệp sự kiện",
        nameEn: "Event & Gala Invitations",
        nameZh: "企业年会晚宴请柬",
        nameJa: "イベント・パーティー招待状",
        nameKo: "행사 및 송년회 초대장",
        descriptionVi: "Thiệp mời tiệc tất niên Year End Party sang trọng, ép kim nhũ vàng câu chúc tân xuân.",
        descriptionEn: "Year End Party gala invitation cards with gold foil borders and matching red envelopes.",
        image: "/images/category/thiepsukien.webp",
        badgeVi: "Year End Party",
        badgeEn: "Gala Dinner",
      },
    ],
    materials: [
      {
        icon: "Mail",
        name: "Fine Art Shimmer Cardstock",
        nameVi: "Giấy Mỹ Thuật Ánh Kim & Bao Thư Đỏ",
        basePrice: 4500,
        doubleSidedPrice: 1500,
        foilPrice: 40000,
        unitVi: "Bộ",
        unitEn: "Sets",
        tagline: "Fine-textured cardstock paired with custom ceremonial envelope",
        taglineVi: "Giấy mỹ thuật ánh kim lấp lánh đi kèm bao thư đỏ trang trọng",
        description: [
          "Smooth heavy paper stock with radiant pearl or gold shimmer",
          "Accompanied by matching custom envelope with gold foil sticker",
          "Crisp interior text for handwritten or printed greetings"
        ],
        descriptionVi: [
          "Chất giấy dày dặn phủ ánh xà cừ hoặc nhũ vàng lấp lánh",
          "Kèm theo bao thư đỏ nắp tam giác ép kim đồng bộ",
          "Mặt trong giấy dễ viết bút mực không lem hoặc in sẵn lời chúc"
        ],
        descriptionTraits: ["textured-art", "metallic-shine", "foil-accent"],
        bestFor: ["Corporate Lunar New Year greetings, Year End Party invitations"],
        bestForVi: ["Thiệp chúc mừng năm mới doanh nghiệp, thiệp mời tiệc tất niên"],
        pureImage: "/images/product/vd-item-thieptet.jpg",
      },
    ],
  },

  // ==========================================
  // 20. TET: Mác sản phẩm - Product Tags
  // ==========================================
  {
    id: "mac-san-pham",
    categoryId: "tet",
    titleVi: "Mác sản phẩm - Product Tags",
    titleEn: "Product Tags & Hangtags",
    titleZh: "商品吊牌 - Product Tags",
    titleJa: "下げ札・タグ - Product Tags",
    titleKo: "상품 행택 - Product Tags",
    descriptionVi: "Thẻ treo quà Tết, tag cảm ơn đính kèm hộp quà, giỏ quà xuân sang trọng và khẳng định dấu ấn thương hiệu.",
    descriptionEn: "Festive Tet product hangtags and thank-you cards for holiday gift hampers and luxury packaging.",
    coverImage: "/images/category/macsanpham.webp",
    shapes: [
      {
        id: "tag-san-pham",
        nameVi: "Tag sản phẩm",
        nameEn: "Product Tags",
        nameZh: "年货商品专属吊牌",
        nameJa: "商品ブランドタグ",
        nameKo: "설 선물 상품 태그",
        descriptionVi: "Mác treo hộp quà Tết, đục lỗ xỏ dây dù hoặc nơ đỏ may mắn, cấn xé giá tiện lợi.",
        descriptionEn: "Branded hangtags for New Year gift hampers with pre-punched string hole and festive accents.",
        image: "/images/product/vd-item-tag.jpeg",
      },
      {
        id: "tag-cam-on",
        nameVi: "Tag cảm ơn",
        nameEn: "Thank You Gift Tags",
        nameZh: "新年感谢感恩吊牌",
        nameJa: "サンキュー・感謝タグ",
        nameKo: "새해 감사 카드 택",
        descriptionVi: "Thiết kế thiệp mini gửi lời tri ân ngọt ngào và lời chúc tân xuân an khang đến khách hàng.",
        descriptionEn: "Charming mini thank-you cards conveying warm holiday wishes in every Tet parcel.",
        image: "/images/category/tagcamon.webp",
      },
    ],
    materials: [
      {
        icon: "Tag",
        name: "Couche 300gsm Matte Laminated",
        nameVi: "Giấy Couche 300gsm Cán Màng Mờ",
        basePrice: 450,
        doubleSidedPrice: 150,
        unitVi: "Mác",
        unitEn: "Tags",
        tagline: "Rigid heavy paper stock with pre-punched string hole for festive gift boxes",
        taglineVi: "Định lượng C300 tiêu chuẩn cán màng mờ, màu sắc rực rỡ đục lỗ xỏ nơ đỏ may mắn",
        description: [
          "Pre-drilled 3mm or 5mm string hole ready for tag pins or wax cords",
          "Smooth matte lamination protects against ink rubbing onto gifts",
          "Rich color fidelity for festive greetings and barcodes"
        ],
        descriptionVi: [
          "Bấm sẵn lỗ xỏ dây 3mm hoặc 5mm tiện luồn dây dù, nơ ruy băng đỏ may mắn",
          "Cán màng mờ bảo vệ bề mặt chống trầy xước, không lem nhòe màu",
          "Màu in chuẩn sắc nét lời chúc xuân an khang và thông tin thương hiệu"
        ],
        descriptionTraits: ["thick-weight", "smooth-base"],
        bestFor: ["Tet gift boxes, confectionery hampers, corporate gift tags"],
        bestForVi: ["Hộp quà Tết, giỏ quà bánh mứt doanh nghiệp, phụ kiện thời trang xuân"],
        pureImage: "/images/product/vd-item-tag.jpeg",
        pureImages: [
          "/images/product/vd-item-tag.jpeg",
          "/images/category/macsanphamphothong.webp",
          "/images/category/tagcamon.webp",
        ],
      },
      {
        icon: "ShieldCheck",
        name: "Natural Kraft Paper 300gsm",
        nameVi: "Giấy Kraft Nâu Vintage 300gsm",
        basePrice: 500,
        doubleSidedPrice: 150,
        unitVi: "Mác",
        unitEn: "Tags",
        tagline: "Eco-friendly rustic brown kraft paper with authentic vintage New Year charm",
        taglineVi: "Giấy xi măng nâu mộc mạc dày dặn, đậm chất Tết xưa truyền thống và ấm cúng",
        description: [
          "100% biodegradable recycled long-fiber brown kraft stock",
          "Pairs beautifully with red cords and nostalgic calligraphy",
          "Sturdy 300gsm thickness keeps hangtags flat and durable"
        ],
        descriptionVi: [
          "Chất giấy kraft tự nhiên tái chế thân thiện môi trường",
          "Tôn vinh nét đẹp thư pháp mộc mạc và tranh vẽ dân gian ngày Tết",
          "Độ dày 300gsm cứng cáp không bị cong vênh khi treo giỏ quà"
        ],
        descriptionTraits: ["natural-grain", "eco-friendly", "thick-weight"],
        bestFor: ["Artisan tea hampers, organic dried fruits, vintage Tet gift sets"],
        bestForVi: ["Giỏ quà đặc sản quê, hộp trà hạt mộc, quà tặng Tết handmade organic"],
        pureImage: "/images/product/bag-kraft1.webp",
        pureImages: [
          "/images/product/bag-kraft1.webp",
          "/images/product/bag-kraft3.webp",
          "/images/category/tagcamon.webp",
        ],
      },
      {
        icon: "Sparkles",
        name: "Premium Art Red Foil Stamped",
        nameVi: "Giấy Mỹ Thuật Đỏ Ánh Kim Ép Kim",
        basePrice: 1200,
        doubleSidedPrice: 350,
        foilPrice: 30000,
        unitVi: "Mác",
        unitEn: "Tags",
        tagline: "Luxurious red pearl cardstock with radiant metallic gold foil stamping",
        taglineVi: "Giấy mỹ thuật đỏ ánh xà cừ cao cấp, ép kim vàng nổi bật logo và lời chúc năm mới",
        description: [
          "Heavy premium cardstock with shimmering metallic texture",
          "Precision metallic gold or silver foil stamping highlights",
          "Elevates luxury hampers and corporate Year-End gifts"
        ],
        descriptionVi: [
          "Chất giấy mỹ thuật nhập khẩu đỏ tươi rực rỡ phủ ánh kim sa lấp lánh",
          "Gia công ép kim nhũ vàng 3D sắc nét logo thương hiệu và câu đối tân xuân",
          "Nâng tầm đẳng cấp giỏ quà Tết VIP trao gửi đối tác quan trọng"
        ],
        descriptionTraits: ["metallic-shine", "textured-art", "foil-accent"],
        bestFor: ["Luxury wine bottles, VIP Tet hampers, bird's nest and ginseng gift sets"],
        bestForVi: ["Hộp quà Tết VIP, chai rượu vang nhập khẩu, yến sào đông trùng hạ thảo"],
        pureImage: "/images/category/macsanphamcaocap.webp",
        pureImages: [
          "/images/category/macsanphamcaocap.webp",
          "/images/product/vd-item-tag.jpeg",
          "/images/product/art-foil.webp",
        ],
      },
    ],
  },

  // ==========================================
  // 21. TET: Phiếu Quà Tặng - Gift Vouchers
  // ==========================================
  {
    id: "vouchers",
    categoryId: "tet",
    titleVi: "Phiếu Quà Tặng - Gift Vouchers",
    titleEn: "Gift Vouchers",
    titleZh: "新年礼品券 - Gift Vouchers",
    titleJa: "ギフト券・引換券",
    titleKo: "설 선물 상품권 / 바우처",
    descriptionVi: "Thẻ quà tặng tri ân khách hàng, kích cầu mua sắm và gửi trọn lời chúc may mắn đầu năm mới.",
    descriptionEn: "Festive vouchers and promotional discount cards driving holiday retail shopping excitement.",
    coverImage: "/images/category/phieuquatang.webp",
    shapes: [
      {
        id: "phieu-qua-tang-pho-thong",
        nameVi: "Phiếu quà tặng phổ thông",
        nameEn: "Standard Gift Vouchers",
        nameZh: "通用春节代金券",
        nameJa: "スタンダード商品券",
        nameKo: "일반 명절 상품권 바우처",
        descriptionVi: "Kích thước tiêu chuẩn 7x15cm hoặc 10x20cm, in giấy C300 cán màng mờ, phát tặng dịp lễ Tết.",
        descriptionEn: "Standard 7x15cm or 10x20cm festive gift vouchers on 300gsm Couche with matte finish.",
        image: "/images/category/phieuquatangphothong.webp",
      },
    ],
    materials: [
      {
        icon: "Palette",
        name: "Couche 300 & Luxury Art Stock",
        nameVi: "Giấy Couche 300 & Giấy Mỹ Thuật",
        basePrice: 1100,
        doubleSidedPrice: 350,
        foilPrice: 40000,
        unitVi: "Phiếu",
        unitEn: "Vouchers",
        tagline: "Prestige stock elevating your brand gift value in customers' eyes",
        taglineVi: "Chất liệu giấy dày dặn nâng tầm giá trị món quà thương hiệu trao gửi",
        description: [
          "Heavy cardstock provides a crisp tactile gift experience",
          "Supports scratch-off silver coating or metallic foil highlights",
          "Silky matte lamination protects against finger oils"
        ],
        descriptionVi: [
          "Định lượng dày dặn cầm chắc tay như tấm thẻ ngân hàng",
          "Hỗ trợ phủ nhũ cào bí mật hoặc ép kim lấp lánh",
          "Cán màng mờ bảo vệ chống lem nhòe mực"
        ],
        descriptionTraits: ["thick-weight", "smooth-base", "foil-accent"],
        bestFor: ["Fashion retail vouchers, spa discounts, dining gift certificates"],
        bestForVi: ["Voucher thời trang, phiếu giảm giá spa làm đẹp, voucher ẩm thực"],
        pureImage: "/images/product/c3002.webp",
        pureImages: [
          "/images/product/c3002.webp",
          "/images/product/art-foil3.webp",
          "/images/product/c300.webp"
        ],
      },
    ],
  },

  // ==========================================
  // 22. TET: Nhãn Dán - Decal Label
  // ==========================================
  {
    id: "nhan-dan",
    categoryId: "tet",
    titleVi: "Nhãn Dán - Decal Label",
    titleEn: "Decal Labels & Stickers",
    titleZh: "新年贴纸 - Decal Label",
    titleJa: "ラベル・シール - Decal Label",
    titleKo: "라벨 스티커 - Decal Label",
    descriptionVi: "Tem nhãn dán giỏ quà Tết, hộp bánh mứt, chai rượu vang và sticker trang trí không khí xuân rực rỡ.",
    descriptionEn: "Custom product packaging labels and decorative stickers for Tet gift baskets, wine bottles, and confectionery.",
    coverImage: "/images/category/nhandan.webp",
    shapes: [],
    materials: [
      {
        icon: "Tag",
        name: "Paper Decal Gloss / Matte Laminated",
        nameVi: "Decal Giấy Cán Màng Bóng / Mờ",
        basePrice: 350,
        doubleSidedPrice: 0,
        unitVi: "Tem",
        unitEn: "Stickers",
        tagline: "Economical paper decal with gloss or matte finish for festive confectionery and gift hampers",
        taglineVi: "Decal giấy bám dính tốt, cán màng chống trầy dán hộp bánh mứt, giỏ quà Tết tiết kiệm",
        description: [
          "Strong permanent acrylic adhesive adheres firmly to cardboard and plastic lids",
          "Protective gloss or matte lamination resists light moisture and scratches",
          "Computer die-cut kiss-cut sheets for effortless quick peeling"
        ],
        descriptionVi: [
          "Lớp keo dán acrylic bám dính chắc chắn trên bề mặt hộp bánh mứt, hộp trà và nắp hũ nhựa",
          "Cán màng mờ sang trọng hoặc màng bóng tươi sáng chống bám bụi và trầy xước",
          "Bế đứt demi chính xác theo viền tròn, vuông, elip dễ dàng bóc dán nhanh chóng"
        ],
        descriptionTraits: ["smooth-base", "digital-precision"],
        bestFor: ["Tet confectionery boxes, pastry tubs, gift ham packaging"],
        bestForVi: ["Hộp bánh mứt Tết, hũ hạt điều, niêm phong nắp hộp quà, phong bao lì xì"],
        pureImage: "/images/product/lable-couche1.webp",
        pureImages: [
          "/images/product/lable-couche1.webp",
          "/images/product/vd-item-decal.jpeg",
          "/images/category/nhanstickerdangto.webp",
        ],
      },
      {
        icon: "Shield",
        name: "Waterproof Plastic PVC Decal",
        nameVi: "Decal Nhựa PVC / Sữa Chống Nước",
        basePrice: 550,
        doubleSidedPrice: 0,
        unitVi: "Tem",
        unitEn: "Stickers",
        tagline: "100% waterproof synthetic vinyl labels for wine bottles and chilled festive foods",
        taglineVi: "Decal nhựa PVC chống thấm nước 100%, dán chai rượu Tết, hũ thực phẩm ngâm lạnh không bong tróc",
        description: [
          "100% waterproof synthetic tear-proof vinyl substrate",
          "Withstands refrigeration, ice buckets, and condensation without bubbling",
          "Rich, high-density UV ink printing with deep vibrant contrast"
        ],
        descriptionVi: [
          "Chất liệu nhựa PVC dẻo dai chống thấm nước 100%, không bị rách hay xé rách",
          "Chịu được môi trường tủ mát, ngâm xô đá lạnh không bị bong tróc hay bay màu",
          "Mực in UV sắc nét, màu sắc tươi tắn tôn vinh vẻ đẹp chai rượu và hũ thực phẩm"
        ],
        descriptionTraits: ["waterproof-durability", "digital-precision"],
        bestFor: ["Tet wine bottles, chilled pickles, festive cold beverages"],
        bestForVi: ["Chai rượu vang, hũ kiệu ngâm, hộp bánh lạnh, nước giải khát mùa Tết"],
        pureImage: "/images/product/lable-PVC1.webp",
        pureImages: [
          "/images/product/lable-PVC1.webp",
          "/images/product/vd-item-decal.jpeg",
          "/images/category/nhanstickerdangto.webp",
        ],
      },
      {
        icon: "ShieldCheck",
        name: "Vintage Kraft Paper Decal",
        nameVi: "Decal Giấy Kraft Nâu Vintage",
        basePrice: 450,
        doubleSidedPrice: 0,
        unitVi: "Tem",
        unitEn: "Stickers",
        tagline: "Rustic unbleached brown kraft sticker bringing nostalgic traditional Tet warmth",
        taglineVi: "Decal kraft xi măng nâu mộc mạc, mang phong vị Tết xưa truyền thống và thân thiện môi trường",
        description: [
          "Natural unbleached recycled kraft paper with warm organic texture",
          "Pairs charmingly with artisanal calligraphic designs and handmade gifts",
          "Strong permanent adhesive sticks securely to paper bags and glass jars"
        ],
        descriptionVi: [
          "Chất giấy kraft nâu tự nhiên mộc mạc, đậm chất văn hóa ngày xuân truyền thống",
          "Hợp với thiết kế tranh dân gian Đông Hồ, chữ thư pháp và hình ảnh hoa mai đào",
          "Độ bám dính cao trên hũ thủy tinh, hộp giấy kraft và túi giấy đựng quà"
        ],
        descriptionTraits: ["natural-grain", "eco-friendly"],
        bestFor: ["Artisanal Tet jams, herbal teas, dried fruit jars, organic snacks"],
        bestForVi: ["Hũ mứt gừng, hộp trà sen, hạt dinh dưỡng organic, đặc sản Tết quê"],
        pureImage: "/images/product/bag-kraft1.webp",
        pureImages: [
          "/images/product/bag-kraft1.webp",
          "/images/product/bag-kraft3.webp",
          "/images/product/vd-item-decal.jpeg",
        ],
      },
      {
        icon: "Sparkles",
        name: "Silver Foil & Gold Stamped Decal",
        nameVi: "Decal Xi Bạc & Ép Kim Nhũ Vàng",
        basePrice: 1200,
        doubleSidedPrice: 0,
        foilPrice: 30000,
        unitVi: "Tem",
        unitEn: "Stickers",
        tagline: "Metallic silver polyester with sparkling gold foil accents for luxury VIP gift packaging",
        taglineVi: "Decal ánh kim loại sang trọng, ép kim logo sáng bóng khẳng định đẳng cấp quà tặng Tết doanh nghiệp",
        description: [
          "Reflective metallic silver base with mirror or brushed chrome finish",
          "Precision hot foil stamping in brilliant festive gold or red",
          "High-end security and prestige appearance for luxury hampers"
        ],
        descriptionVi: [
          "Lớp đế xi bạc phản chiếu ánh kim loại sang trọng, bắt sáng rực rỡ dưới ánh đèn",
          "Ép kim nhũ vàng câu chúc Tân Niên Vạn Phúc và biểu trưng thương hiệu tinh xảo",
          "Tem niêm phong bảo chứng chất lượng thượng hạng cho các giỏ quà Tết VIP"
        ],
        descriptionTraits: ["metallic-shine", "foil-accent"],
        bestFor: ["Premium gift boxes, imported spirits, bird's nest and high-end hampers"],
        bestForVi: ["Hộp quà Tết VIP, chai rượu ngoại nhập khẩu, yến sào thượng hạng, đông trùng hạ thảo"],
        pureImage: "/images/product/art-foil.webp",
        pureImages: [
          "/images/product/art-foil.webp",
          "/images/product/vd-item-decal.jpeg",
          "/images/category/nhandecaluvnoi.webp",
        ],
      },
    ],
  },

  // ==========================================
  // 23. TET: Tờ rơi - Flyers
  // ==========================================
  {
    id: "to-roi",
    categoryId: "tet",
    titleVi: "Tờ rơi - Flyers",
    titleEn: "Flyers & Certificates",
    titleZh: "宣传单/证书 - Flyers",
    titleJa: "チラシ・表彰状 - Flyers",
    titleKo: "전단지 / 상장 - Flyers",
    descriptionVi: "Tờ rơi thông báo lịch nghỉ Tết, chương trình khuyến mãi xuân, bằng khen vinh danh và vòng tay sự kiện tất niên.",
    descriptionEn: "Holiday promotional flyers, Year-End employee merit certificates, and event wristbands for gala celebrations.",
    coverImage: "/images/category/toroi.webp",
    shapes: [
      {
        id: "to-roi-so-luong-it",
        nameVi: "Tờ rơi số lượng ít",
        nameEn: "Short-run Digital Flyers",
        nameZh: "少量数码快印传单",
        nameJa: "小ロットオンデマンドチラシ",
        nameKo: "소량 디지털 전단지",
        descriptionVi: "In kỹ thuật số lấy nhanh trong ngày từ 50 - 200 tờ thông báo lịch nghỉ Tết, khuyến mãi hội chợ xuân.",
        descriptionEn: "Same-day fast digital printing from 50-200 sheets for holiday schedule notices and seasonal promos.",
        image: "/images/category/toroisoluongit.webp",
      },
      {
        id: "bang-khen",
        nameVi: "Bằng khen",
        nameEn: "Certificates of Merit & Awards",
        nameZh: "企业年终荣誉证书/奖状",
        nameJa: "表彰状・感謝状・ディプロマ",
        nameKo: "연말 표창장 / 상장",
        descriptionVi: "Giấy khen, chứng nhận vinh danh nhân viên và đối tác xuất sắc tại tiệc tổng kết cuối năm Year End Party.",
        descriptionEn: "Prestige certificates and awards honoring employees and partners at Year-End Gala parties.",
        image: "/images/product/art-foil.webp",
      },
      {
        id: "vong-tay-su-kien",
        nameVi: "Vòng tay sự kiện",
        nameEn: "Event Wristbands",
        nameZh: "年会活动防水手环",
        nameJa: "イベント用リストバンド",
        nameKo: "행사용 방수 손목 밴드",
        descriptionVi: "Vòng tay giấy Tyvek hoặc nhựa không thấm nước có số nhảy kiểm soát ra vào tiệc tất niên, Countdown đón năm mới.",
        descriptionEn: "Waterproof numbered event wristbands for Year-End parties and New Year Countdown galas.",
        image: "/images/category/vongtaysukien.webp",
      },
    ],
    materials: [
      {
        icon: "Layers",
        name: "Couche 150gsm Fast-Print",
        nameVi: "Giấy Couche 150gsm (Lấy Nhanh)",
        basePrice: 850,
        doubleSidedPrice: 300,
        unitVi: "Tờ",
        unitEn: "Sheets",
        tagline: "Same-day fast digital printing on glossy Couche for holiday notices and spring sale campaigns",
        taglineVi: "Định lượng bóng láng in kỹ thuật số lấy ngay trong ngày, thông báo lịch nghỉ Tết và ưu đãi mùa xuân",
        description: [
          "Smooth semi-gloss surface ensures crisp typography and festive vibrant color",
          "Moderate thickness easy to fold, insert into orders, or distribute hand-to-hand",
          "Most economical choice for rapid turnarounds before the holiday closure"
        ],
        descriptionVi: [
          "Bề mặt giấy láng bóng mịn màng, thể hiện màu đỏ may mắn và hình ảnh hoa xuân sắc nét",
          "Độ dày vừa vặn dễ gấp gọn, kẹp vào túi hàng giao Tết hoặc phát tay sự kiện",
          "Tốc độ in lấy ngay trong ngày, giải pháp hoàn hảo cho thông báo nghỉ Tết cấp tốc"
        ],
        descriptionTraits: ["smooth-base", "digital-precision"],
        bestFor: ["Holiday schedule notices, Spring sale circulars, festive menus"],
        bestForVi: ["Thông báo lịch nghỉ Tết, khuyến mãi hội chợ xuân, tờ rơi thực đơn tiệc tất niên"],
        pureImage: "/images/category/toroisoluongit.webp",
        pureImages: [
          "/images/category/toroisoluongit.webp",
          "/images/category/toroi.webp",
          "/images/category/toroigiare.webp",
        ],
      },
      {
        icon: "ShieldCheck",
        name: "Couche 300gsm Matte Laminated",
        nameVi: "Giấy Couche 300gsm Cán Màng Mờ",
        basePrice: 1800,
        doubleSidedPrice: 500,
        unitVi: "Tờ",
        unitEn: "Sheets",
        tagline: "Sturdy heavyweight artboard with silky matte finish for prestigious New Year open letters",
        taglineVi: "Chất giấy dày dặn đầm tay cán màng mờ 2 mặt sang trọng, thư ngỏ tân xuân và giới thiệu chương trình cuối năm",
        description: [
          "Heavy 300gsm cardstock feel equivalent to premium postcards",
          "Silky double-sided matte lamination resists smudges and finger oils",
          "Supports gold foil accents and custom die-cut rounded corners"
        ],
        descriptionVi: [
          "Định lượng C300 dày dặn cứng cáp như tấm thiệp chúc mừng năm mới",
          "Cán màng mờ 2 mặt chống trầy xước, êm ái khi chạm tay và không chói lóa",
          "Thích hợp làm thư ngỏ tri ân gửi tặng kèm quà Tết cho đối tác khách hàng thân thiết"
        ],
        descriptionTraits: ["thick-weight", "smooth-base"],
        bestFor: ["New Year corporate greeting cards, luxury brand open letters, gala flyers"],
        bestForVi: ["Thư ngỏ tri ân tân xuân, thư mời Year End Party, giới thiệu dự án đầu năm"],
        pureImage: "/images/category/toroicaocap.webp",
        pureImages: [
          "/images/category/toroicaocap.webp",
          "/images/category/toroi.webp",
          "/images/product/art-foil.webp",
        ],
      },
      {
        icon: "Sparkles",
        name: "Fine Art Paper with Gold Foil",
        nameVi: "Giấy Mỹ Thuật Cao Cấp Ép Kim",
        basePrice: 3500,
        doubleSidedPrice: 1000,
        foilPrice: 35000,
        unitVi: "Tờ",
        unitEn: "Sheets",
        tagline: "Textured art paper accented with 3D metallic gold foil for Year-End certificates of merit",
        taglineVi: "Giấy mỹ thuật dày cao cấp vân nhám, ép kim vàng câu chúc vinh danh bằng khen và giấy chứng nhận cuối năm",
        description: [
          "Heavy European fine art paper with distinct elegant organic surface texture",
          "Radiant 3D gold or bronze metallic foil highlights for prestigious awards",
          "Archival-grade longevity preserving commemorative honours for years"
        ],
        descriptionVi: [
          "Chất giấy mỹ thuật nhập khẩu cao cấp bề mặt sần nhẹ vân mộc mạc đẳng cấp",
          "Gia công ép kim nhũ vàng viền hoa văn cổ điển và chữ vinh danh xuất sắc",
          "Độ bền lưu trữ vĩnh cửu, trang trọng lồng khung kính trao tặng tại tiệc tất niên"
        ],
        descriptionTraits: ["textured-art", "foil-accent", "thick-weight"],
        bestFor: ["Year-End merit certificates, gala awards, honorary acknowledgments"],
        bestForVi: ["Bằng khen vinh danh nhân viên xuất sắc, giấy chứng nhận đối tác vàng, tiệc Gala Tân Niên"],
        pureImage: "/images/product/art-foil.webp",
        pureImages: [
          "/images/product/art-foil.webp",
          "/images/category/toroisoluongit.webp",
          "/images/category/toroi.webp",
        ],
      },
    ],
  },

  // ==========================================
  // 24. TET: Poster - Băng rôn - Standee
  // ==========================================
  {
    id: "poster-bangron-standee",
    categoryId: "tet",
    titleVi: "Poster - Băng rôn - Standee",
    titleEn: "Posters - Banners - Standees",
    titleZh: "海报 - 横幅 - 展架",
    titleJa: "ポスター・横断幕・看板",
    titleKo: "포스터 - 현수막 - 배너거치대",
    descriptionVi: "Băng rôn chúc mừng năm mới khổ lớn, standee tiệc tất niên và hashtag chụp hình check-in lưu giữ kỷ niệm xuân.",
    descriptionEn: "Large Lunar New Year street banners, Year-End Party standees, and festive photo prop hashtags.",
    coverImage: "/images/category/poster-bangron-standee.webp",
    shapes: [
      {
        id: "bang-ron-hiflex",
        nameVi: "Băng rôn Hiflex",
        nameEn: "Hiflex Spring Festival Banners",
        nameZh: "新春大红Hiflex横幅",
        nameJa: "新春ターポリン横断幕",
        nameKo: "새해 맞이 하이플렉스 현수막",
        descriptionVi: "Bạt Hiflex khổ lớn chúc mừng năm mới treo ngang đường phố, cổng chào rực rỡ đón xuân tài lộc.",
        descriptionEn: "Heavy-duty outdoor PVC banners welcoming the Lunar New Year across streets and gates.",
        image: "/images/category/poster-bangron-standee.webp",
      },
      {
        id: "hashtag-cam-tay",
        nameVi: "Hashtag cầm tay",
        nameEn: "Handheld Photo Hashtags",
        nameZh: "新年拍照手牌Hashtag",
        nameJa: "手持ちフォトプロップス",
        nameKo: "신년 촬영 해시태그 피켓",
        descriptionVi: "Biển chụp hình check-in tiệc tất niên Year End Party, Gala mừng xuân bế theo hình linh vật, câu chúc Tết.",
        descriptionEn: "Custom-cut handheld photo props for corporate Year-End Galas and festive photo booths.",
        image: "/images/category/hashtagcamtay.webp",
      },
      {
        id: "hashtag-tay-cam-roi",
        nameVi: "Hashtag tay cầm rời",
        nameEn: "Detachable Handle Hashtags",
        nameZh: "可拆卸手柄新年手牌",
        nameJa: "持ち手分離型フォトプロップス",
        nameKo: "분리형 손잡이 해시태그 피켓",
        descriptionVi: "Quy cách cán rời gắn khớp tiện xếp gọn mang đi sự kiện xa, đóng thùng vận chuyển không lo gãy hỏng.",
        descriptionEn: "Flat-pack detachable handle photo props easy to transport to distant event venues.",
        image: "/images/category/hashtagtaycamroi.webp",
      },
    ],
    materials: [
      {
        icon: "Layers",
        name: "PP Film (Polypropylene)",
        nameVi: "Poster chất liệu PP",
        basePrice: 65000,
        doubleSidedPrice: 20000,
        unitVi: "m²",
        unitEn: "sqm",
        tagline: "High-resolution PP synthetic paper for indoor posters and roll-up banners",
        taglineVi: "Giấy nhựa PP tổng hợp láng mịn, in độ phân giải cao cho poster trong nhà và standee cuộn",
        description: [
          "Super-smooth synthetic paper base with zero visible paper fibers",
          "Rich, high-density color reproduction for photo-realistic graphics",
          "Coated with protective matte or glossy lamination against scratches"
        ],
        descriptionVi: [
          "Bề mặt giấy nhựa tổng hợp siêu mịn, không lộ xơ giấy",
          "Tái tạo màu sắc chân thực chuẩn sắc nét đến từng chi tiết ảnh",
          "Cán màng mờ hoặc màng bóng bảo vệ bề mặt chống trầy xước nước nhẹ"
        ],
        descriptionTraits: ["smooth-base", "digital-precision", "glossy-coat"],
        bestFor: ["Indoor event roll-up banners, cinema posters, showroom displays"],
        bestForVi: ["Standee cuộn sự kiện, poster rạp chiếu phim, biển quảng cáo showroom"],
        pureImage: "/images/category/poster-bangron-standee.webp",
        pureImages: [
          "/images/category/poster-bangron-standee.webp",
          "/images/hero/mayinngoaitroi.webp",
          "/images/hero/slide-1.jpg"
        ],
      },
      {
        icon: "Shield",
        name: "Hiflex PVC Banner",
        nameVi: "Băng rôn Hiflex",
        basePrice: 35000,
        doubleSidedPrice: 15000,
        unitVi: "m²",
        unitEn: "sqm",
        tagline: "Durable waterproof PVC vinyl for large outdoor banners and hoardings",
        taglineVi: "Bạt PVC dẻo dai chống thấm nước 100%, chịu mưa nắng chuyên cho băng rôn ngoài trời",
        description: [
          "Reinforced PVC fabric withstands heavy rain, direct sunlight, and wind",
          "Most economical solution for large-scale outdoor visibility",
          "Finished with reinforced hemmed edges and brass eyelets for easy hanging"
        ],
        descriptionVi: [
          "Chất liệu bạt PVC cốt sợi chịu lực tốt trước nắng gắt và mưa bão",
          "Giải pháp tiết kiệm ngân sách nhất cho quảng cáo diện rộng ngoài trời",
          "Hoàn thiện gấp mép dán gia cường và đóng khoen nhôm tiện xỏ dây treo"
        ],
        descriptionTraits: ["waterproof-durability", "thick-weight"],
        bestFor: ["Street banners, construction fences, grand opening announcements"],
        bestForVi: ["Băng rôn ngang đường, hàng rào công trình, banner khai trương cửa hàng"],
        pureImage: "/images/category/poster-bangron-standee.webp",
        pureImages: [
          "/images/hero/mayinngoaitroi.webp",
          "/images/category/poster-bangron-standee.webp",
          "/images/hero/mayinoffset.webp"
        ],
      },
      {
        icon: "Sparkles",
        name: "PP Mounted on 5mm Foam Board",
        nameVi: "PP Bồi Formex 5mm (Hashtag & Standee)",
        basePrice: 110000,
        doubleSidedPrice: 30000,
        unitVi: "m²",
        unitEn: "sqm",
        tagline: "Rigid lightweight foam board with high-res laminated PP graphics for event photo props",
        taglineVi: "Tấm format dày 5mm cứng cáp bồi decal PP sắc nét, chuyên dụng cho hashtag check-in tiệc tất niên và mô hình chào xuân",
        description: [
          "Rigid 5mm density PVC foam board holds its shape flat without bending",
          "Laminated with anti-glare matte film perfect for smartphone flash photography",
          "Precision CNC laser contour cutting to any cartoon mascot or slogan shape"
        ],
        descriptionVi: [
          "Tấm format dày 5mm siêu nhẹ nhưng cứng cáp, cầm chắc tay không lo gãy gập",
          "Cán màng mờ chống lóa đèn flash máy ảnh, lên hình chụp check-in rực rỡ và rõ nét",
          "Cắt CNC bế bo theo đúng viền hình linh vật xuân, biểu tượng Tết và chữ cách điệu"
        ],
        descriptionTraits: ["thick-weight", "digital-precision", "smooth-base"],
        bestFor: ["Handheld photo hashtags, Year-End Party photo booths, mascot cutouts"],
        bestForVi: ["Hashtag chụp ảnh check-in sự kiện, standee hình linh vật Tết, biển chào đón xuân"],
        pureImage: "/images/category/hashtagcamtay.webp",
        pureImages: [
          "/images/category/hashtagcamtay.webp",
          "/images/category/hashtagtaycamroi.webp",
          "/images/category/ppboiformat.webp",
        ],
      },
    ],
  },
];

// Mapping aliases so old links or alternate slugs route seamlessly
const SUBGROUP_ALIASES: Record<string, string> = {
  "posters-standee": "poster-bangron-standee",
  "poster-bang-ron-standee": "poster-bangron-standee",
  "flyers": "to-roi",
  "leaflets-brochures": "to-gap",
  "tickets": "ve-tickets",
  "vouchers": "vouchers",
  "namecards": "danh-thiep",
  "card": "danh-thiep",
  "envelopes": "bao-thu",
  "envelope": "bao-thu",
  "tshirts": "ao-thun",
  "notes": "giay-ghi-chu",
  "notepad": "giay-ghi-chu",
  "letterheads": "giay-tieu-de",
  "letterhead": "giay-tieu-de",
  "folders": "bia-dung-ho-so",
  "folder": "bia-dung-ho-so",
  "labels": "nhan-dan",
  "decal": "nhan-dan",
  "bags": "tui-giay",
  "paper-bag": "tui-giay",
  "boxes": "hop-giay",
  "paper-box": "hop-giay",
  "tags": "mac-san-pham",
  "tag": "mac-san-pham",
  "calendars": "lich-tet",
  "calendar": "lich-tet",
  "lixi": "bao-li-xi",
  "li-xi": "bao-li-xi",
  "invitations": "thiep-tet",
  "thiep-moi": "thiep-tet",
  "catalogue": "catalogues",
  "catalogue-camnang": "catalogues",
  "thiep-chuc-mung": "thiep-tet",
};

const SUBGROUP_ORIGINAL_PRODUCTS: Record<string, string[]> = {
  "poster-bangron-standee": ["decal", "tranh-canvas"],
  "to-roi": ["flyer"],
  "to-gap": ["brochure"],
  "catalogues": ["catalogue"],
  "danh-thiep": ["card"],
  "bao-thu": ["envelope"],
  "giay-ghi-chu": ["notepad"],
  "giay-tieu-de": ["form"],
  "bia-dung-ho-so": ["folder"],
  "nhan-dan": ["decal", "stamp", "label"],
  "tui-giay": ["paper-bag"],
  "hop-giay": ["paper-box"],
  "mac-san-pham": ["tag"],
  "lich-tet": ["lich-tet"],
  "bao-li-xi": ["li-xi"],
  "thiep-tet": ["thiep-tet"],
};

function enrichSubgroupMaterials(subgroup: SubgroupCategory): SubgroupCategory {
  if (subgroup.categoryId === "tet") {
    // For Tet category, use the dedicated Tet materials defined directly on the subgroup
    return subgroup;
  }
  const originalProductIds = SUBGROUP_ORIGINAL_PRODUCTS[subgroup.id] || [];
  const originalOpts = getOriginalOptions(...originalProductIds);
  const priority = subgroup.id === "poster-bangron-standee" ? "submenu-first" : "original-first";
  const merged = mergeMaterials(originalOpts, subgroup.materials, priority);
  return {
    ...subgroup,
    materials: merged,
  };
}

export function getSubgroupById(id: string, categoryId?: string): SubgroupCategory | undefined {
  if (categoryId) {
    const directCat = SUBGROUPS_CATALOG.find((s) => s.id === id && s.categoryId === categoryId);
    if (directCat) return enrichSubgroupMaterials(directCat);
    const aliasTarget = SUBGROUP_ALIASES[id];
    if (aliasTarget) {
      const matchedCat = SUBGROUPS_CATALOG.find((s) => s.id === aliasTarget && s.categoryId === categoryId);
      if (matchedCat) return enrichSubgroupMaterials(matchedCat);
    }
  }
  const direct = SUBGROUPS_CATALOG.find((s) => s.id === id);
  if (direct) return enrichSubgroupMaterials(direct);
  const aliasTarget = SUBGROUP_ALIASES[id];
  if (aliasTarget) {
    const matched = SUBGROUPS_CATALOG.find((s) => s.id === aliasTarget);
    if (matched) return enrichSubgroupMaterials(matched);
  }
  return undefined;
}

export function getSubgroupsByCategory(catId: string): SubgroupCategory[] {
  return SUBGROUPS_CATALOG.filter((s) => s.categoryId === catId).map(enrichSubgroupMaterials);
}
