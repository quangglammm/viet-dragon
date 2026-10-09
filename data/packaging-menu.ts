// data/packaging-menu.ts
// Structured submenu data for "Bao bì" (Packaging) megamenu

export interface PackagingSubmenuItem {
  id: string;
  nameVi: string;
  nameEn: string;
  nameZh?: string;
  nameJa?: string;
  nameKo?: string;
  href: string;
  image: string;
  isFast?: boolean;
  kind?: "shape" | "material"; // Category ẩn: "shape" (Hình thức) hoặc "material" (Chất liệu)
}

export interface PackagingSubmenuGroup {
  id: string;
  titleVi: string;
  titleEn: string;
  titleZh?: string;
  titleJa?: string;
  titleKo?: string;
  href: string;
  image: string;
  items: PackagingSubmenuItem[];
}

export const PACKAGING_SUBMENU_COLUMNS: {
  id: string;
  groups: PackagingSubmenuGroup[];
}[] = [
  // Column 1: Nhãn Dán - Decal Label
  {
    id: "col-labels",
    groups: [
      {
        id: "labels",
        titleVi: "Nhãn Dán - Decal Label",
        titleEn: "Decal Labels & Stickers",
        titleZh: "不干胶标签 - Decal Label",
        titleJa: "ラベル・シール - Decal Label",
        titleKo: "라벨 스티커 - Decal Label",
        href: "/products/packaging/nhan-dan",
        image: "/images/product/vd-item-decal.jpeg",
        items: [
          {
            id: "label-paper",
            nameVi: "Nhãn decal giấy",
            nameEn: "Paper Decal Labels",
            nameZh: "铜版纸不干胶贴纸",
            nameJa: "上質紙・アート紙シール",
            nameKo: "아트지 종이 라벨 스티커",
            kind: "material",
            href: "/products/packaging/nhan-dan#nhan-decal-giay",
            image: "/images/product/lable-couche1.webp",
            isFast: true,
          },
          {
            id: "label-plastic",
            nameVi: "Nhãn decal nhựa",
            nameEn: "Plastic / PVC Decal Labels",
            nameZh: "防水PVC塑料标签",
            nameJa: "ユポ・PVC耐水プラシール",
            nameKo: "방수 플라스틱 데칼 라벨",
            kind: "material",
            href: "/products/packaging/nhan-dan#nhan-decal-nhua",
            image: "/images/product/lable-PVC1.webp",
            isFast: true,
          },
          {
            id: "label-kraft",
            nameVi: "Nhãn decal giấy Kraft",
            nameEn: "Kraft Paper Decal Labels",
            nameZh: "复古牛皮纸不干胶",
            nameJa: "クラフト紙シール",
            nameKo: "크라프트지 데칼 라벨",
            kind: "material",
            href: "/products/packaging/nhan-dan#nhan-decal-giay-kraft",
            image: "/images/product/bag-kraft1.webp",
            isFast: true,
          },
          {
            id: "label-uv-dtf",
            nameVi: "Nhãn Decal UV nổi - UV DTF",
            nameEn: "3D Raised UV DTF Decals",
            nameZh: "水晶标立体UV转印贴",
            nameJa: "立体UV転写シール (UV DTF)",
            nameKo: "입체 UV 전사 스티커 (UV DTF)",
            kind: "shape",
            href: "/products/packaging/nhan-dan#decal-uv-dtf",
            image: "/images/category/nhandecaluvnoi.webp",
          },
          {
            id: "label-sticker-sheets",
            nameVi: "Nhãn Sticker dạng Tờ - Sticker Sheets",
            nameEn: "Kiss-cut Sticker Sheets",
            nameZh: "拼版多图贴纸套装",
            nameJa: "シートタイプステッカー",
            nameKo: "시트형 멀티 스티커 팩",
            kind: "shape",
            href: "/products/packaging/nhan-dan#sticker-sheets",
            image: "/images/category/nhanstickerdangto.webp",
          },
          {
            id: "label-art-paper",
            nameVi: "Nhãn decal giấy mỹ thuật",
            nameEn: "Art Paper Decal Labels",
            nameZh: "特种艺术纸质感标签",
            nameJa: "高級アート紙ラベル",
            nameKo: "고급 수입지 감성 라벨",
            kind: "material",
            href: "/products/packaging/nhan-dan#nhan-decal-giay-my-thuat",
            image: "/images/product/art.webp",
          },
          {
            id: "label-silver-gold",
            nameVi: "Nhãn decal xi bạc/vàng",
            nameEn: "Metallic Silver / Gold Decals",
            nameZh: "拉丝金/哑银耐磨标签",
            nameJa: "金・銀ホイル耐熱ラベル",
            nameKo: "은데드롱 / 금광 데칼 라벨",
            kind: "material",
            href: "/products/packaging/nhan-dan#nhan-decal-xi-bac",
            image: "/images/product/art-foil.webp",
          },
          {
            id: "label-warranty-tamper",
            nameVi: "Nhãn Decal Tem Bể/ Tem Vỡ",
            nameEn: "Destructible Tamper / Warranty Seals",
            nameZh: "易碎防伪质保封条",
            nameJa: "改ざん防止・脆性質保シール",
            nameKo: "파손형 봉인 / 정품인증 씰",
            kind: "shape",
            href: "/products/packaging/nhan-dan#decal-tem-be",
            image: "/images/category/temvo.webp",
          },
        ],
      },
    ],
  },

  // Column 2: Túi giấy & Hộp Giấy
  {
    id: "col-bags-boxes",
    groups: [
      {
        id: "bags",
        titleVi: "Túi giấy - Paper bags",
        titleEn: "Paper Bags",
        titleZh: "纸质手提袋 - Paper bags",
        titleJa: "紙袋・ショッパー - Paper bags",
        titleKo: "종이 쇼핑백 - Paper bags",
        href: "/products/packaging/tui-giay",
        image: "/images/category/tuigiay.webp",
        items: [
          {
            id: "bag-standard",
            nameVi: "Túi giấy chuẩn",
            nameEn: "Standard Paper Shopping Bags",
            nameZh: "标准铜版纸手提袋",
            nameJa: "標準コート紙ショッパー",
            nameKo: "표준 쇼핑백",
            kind: "shape",
            href: "/products/packaging/tui-giay#tui-giay-chuan",
            image: "/images/category/tuigiaychuan.webp",
          },
          {
            id: "bag-kraft",
            nameVi: "Túi giấy kraft",
            nameEn: "Eco Kraft Paper Bags",
            nameZh: "环保牛皮纸袋",
            nameJa: "クラフト紙袋",
            nameKo: "친환경 크라프트 쇼핑백",
            kind: "material",
            href: "/products/packaging/tui-giay#tui-giay-kraft",
            image: "/images/product/bag-kraft1.webp",
          },
          {
            id: "bag-flap",
            nameVi: "Túi giấy có nắp/ nắp gập",
            nameEn: "Flap-closure Paper Bags",
            nameZh: "折叠盖式礼品纸袋",
            nameJa: "フタ付きギフトバッグ",
            nameKo: "덮개형 기프트 종이백",
            kind: "shape",
            href: "/products/packaging/tui-giay#tui-giay-co-nap",
            image: "/images/category/tuigiayconap.webp",
          },
          {
            id: "bag-foil",
            nameVi: "Túi giấy ép kim",
            nameEn: "Foil Stamped Luxury Bags",
            nameZh: "烫金高档精品纸袋",
            nameJa: "箔押しプレミアム紙袋",
            nameKo: "박가공 럭셔리 쇼핑백",
            kind: "shape",
            href: "/products/packaging/tui-giay#tui-giay-ep-kim",
            image: "/images/category/tuigiayepkim.webp",
          },
          {
            id: "bag-diecut-handle",
            nameVi: "Túi giấy quai hột xoài",
            nameEn: "Die-cut Handle Bags",
            nameZh: "冲孔提手便利纸袋",
            nameJa: "小判抜き・くり手紙袋",
            nameKo: "타공 손잡이 종이백",
            kind: "shape",
            href: "/products/packaging/tui-giay#tui-giay-quai-hot-xoai",
            image: "/images/category/tuigiayquaihopxoai.webp",
          },
          {
            id: "bag-in-stock",
            nameVi: "Túi Giấy Có Sẵn",
            nameEn: "In-Stock Ready-made Bags",
            nameZh: "现货空白即印纸袋",
            nameJa: "既製品即納バッグ",
            nameKo: "기성 완제품 쇼핑백",
            kind: "shape",
            href: "/products/packaging/tui-giay#tui-giay-co-san",
            image: "/images/category/tuigiaycosan.webp",
          },
          {
            id: "bag-bread",
            nameVi: "Túi giấy bánh mì",
            nameEn: "Bread & Bakery Bags",
            nameZh: "防油烘焙面包纸袋",
            nameJa: "ベーカリー・パン用紙袋",
            nameKo: "베이커리 빵 종이봉투",
            kind: "shape",
            href: "/products/packaging/tui-giay#tui-giay-banh-mi",
            image: "/images/category/tuigiaybanhmi.webp",
          },
        ],
      },
      {
        id: "boxes",
        titleVi: "Hộp Giấy - Paper box",
        titleEn: "Paper Boxes & Packaging",
        titleZh: "纸盒包装 - Paper box",
        titleJa: "化粧箱・ペーパーボックス",
        titleKo: "종이 상자 / 패키지 박스",
        href: "/products/packaging/hop-giay",
        image: "/images/category/hopgiay.webp",
        items: [
          {
            id: "box-common",
            nameVi: "Hộp Giấy Thông Dụng",
            nameEn: "Standard Folding Cartons",
            nameZh: "通用折叠彩盒",
            nameJa: "汎用折りたたみ化粧箱",
            nameKo: "일반 접이式 단상자",
            kind: "shape",
            href: "/products/packaging/hop-giay#hop-giay-thong-dung",
            image: "/images/category/hopgiaythongdung.webp",
          },
          {
            id: "box-kraft",
            nameVi: "Hộp giấy kraft",
            nameEn: "Kraft Paper Boxes",
            nameZh: "复古牛皮纸盒",
            nameJa: "クラフトペーパーボックス",
            nameKo: "크라프트 종이 상자",
            kind: "material",
            href: "/products/packaging/hop-giay#hop-giay-kraft",
            image: "/images/product/box-kraft1.webp",
          },
          {
            id: "box-carton",
            nameVi: "Hộp giấy carton",
            nameEn: "Corrugated Shipping Cartons",
            nameZh: "瓦楞纸运输飞机盒",
            nameJa: "段ボール配送ボックス",
            nameKo: "골판지 택배 박스",
            kind: "shape",
            href: "/products/packaging/hop-giay#hop-giay-carton",
            image: "/images/product/box-board1.webp",
          },
        ],
      },
    ],
  },

  // Column 3: Mác sản phẩm - Product Tags
  {
    id: "col-tags",
    groups: [
      {
        id: "tags",
        titleVi: "Mác sản phẩm - Product Tags",
        titleEn: "Product Tags & Hangtags",
        titleZh: "商品吊牌 - Product Tags",
        titleJa: "下げ札・タグ - Product Tags",
        titleKo: "의류 행택 / 태그 - Product Tags",
        href: "/products/packaging/mac-san-pham",
        image: "/images/category/macsanpham.webp",
        items: [
          {
            id: "tag-common",
            nameVi: "Mác sản phẩm phổ thông",
            nameEn: "Standard Hangtags",
            nameZh: "常规商品价格吊牌",
            nameJa: "スタンダード下げ札",
            nameKo: "일반 상품 행택",
            kind: "shape",
            href: "/products/packaging/mac-san-pham#mac-pho-thong",
            image: "/images/category/macsanphamphothong.webp",
          },
          {
            id: "tag-premium",
            nameVi: "Mác Sản Phẩm Cao Cấp",
            nameEn: "Premium Luxury Hangtags",
            nameZh: "加厚特种纸高档吊牌",
            nameJa: "高級特殊紙下げ札",
            nameKo: "고급 프리미엄 브랜드 택",
            kind: "shape",
            href: "/products/packaging/mac-san-pham#mac-cao-cap",
            image: "/images/category/macsanphamcaocap.webp",
          },
          {
            id: "tag-kraft",
            nameVi: "Mác Sản Phẩm Giấy Kraft",
            nameEn: "Kraft Paper Hangtags",
            nameZh: "复古环保牛皮纸吊牌",
            nameJa: "クラフト紙下げ札",
            nameKo: "크라프트지 의류 행택",
            kind: "material",
            href: "/products/packaging/mac-san-pham#mac-giay-kraft",
            image: "/images/product/bag-kraft3.webp",
          },
          {
            id: "tag-fashion",
            nameVi: "Tag thời trang",
            nameEn: "Fashion Apparel Tags",
            nameZh: "服装服饰专属标签",
            nameJa: "アパレル・ファッションタグ",
            nameKo: "패션 브랜드 의류 태그",
            kind: "shape",
            href: "/products/packaging/mac-san-pham#tag-thoi-trang",
            image: "/images/category/tagthoitrang.webp",
          },
          {
            id: "tag-jewelry",
            nameVi: "Tag trang sức",
            nameEn: "Jewelry & Accessory Tags",
            nameZh: "精美首饰珠宝小标签",
            nameJa: "ジュエリー・アクセサリータグ",
            nameKo: "주얼리 / 액세서리 미니 택",
            kind: "shape",
            href: "/products/packaging/mac-san-pham#tag-trang-suc",
            image: "/images/category/tagtrangsuc.webp",
          },
          {
            id: "tag-thank-you",
            nameVi: "Tag cảm ơn",
            nameEn: "Thank You Gift Tags",
            nameZh: "精美感恩感谢卡吊牌",
            nameJa: "サンキュー・感謝タグ",
            nameKo: "감사 땡큐 기프트 택",
            kind: "shape",
            href: "/products/packaging/mac-san-pham#tag-cam-on",
            image: "/images/category/tagcamon.webp",
          },
        ],
      },
    ],
  },
];
