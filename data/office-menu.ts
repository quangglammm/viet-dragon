// data/office-menu.ts
// Structured submenu data for "Văn phòng" (Office) megamenu

export interface OfficeSubmenuItem {
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

export interface OfficeSubmenuGroup {
  id: string;
  titleVi: string;
  titleEn: string;
  titleZh?: string;
  titleJa?: string;
  titleKo?: string;
  href: string;
  image: string;
  items: OfficeSubmenuItem[];
}

export const OFFICE_SUBMENU_COLUMNS: {
  id: string;
  groups: OfficeSubmenuGroup[];
}[] = [
  // Column 1: Danh thiếp - Namecards
  {
    id: "col-namecards",
    groups: [
      {
        id: "namecards",
        titleVi: "Danh thiếp - Namecards",
        titleEn: "Namecards - Business Cards",
        titleZh: "名片 - Namecards",
        titleJa: "名刺 - Namecards",
        titleKo: "명함 - Namecards",
        href: "/products/office/danh-thiep",
        image: "/images/category/danhthiep.webp",
        items: [
          {
            id: "card-art-paper",
            nameVi: "Danh thiếp Giấy mỹ thuật",
            nameEn: "Art Paper Business Cards",
            nameZh: "特种艺术纸名片",
            nameJa: "高級アート紙名刺",
            nameKo: "고급 수입지 명함",
            kind: "material",
            href: "/products/office/danh-thiep#giay-my-thuat",
            image: "/images/product/art.webp",
            isFast: true,
          },
          {
            id: "card-standard",
            nameVi: "Danh thiếp chuẩn",
            nameEn: "Standard Business Cards",
            nameZh: "标准商务名片",
            nameJa: "標準ビジネス名刺",
            nameKo: "표준 비즈니스 명함",
            kind: "shape",
            href: "/products/office/danh-thiep#danh-thiep-chuan",
            image: "/images/category/danhthiep.webp",
          },
          {
            id: "card-digital",
            nameVi: "Danh Thiếp Kỹ Thuật Số",
            nameEn: "Digital Express Business Cards",
            nameZh: "数码快印名片",
            nameJa: "オンデマンド名刺",
            nameKo: "디지털 인쇄 명함",
            kind: "shape",
            href: "/products/office/danh-thiep#ky-thuat-so",
            image: "/images/category/card-kithuatso.webp",
            isFast: true,
          },
          {
            id: "card-smart",
            nameVi: "Danh Thiếp Thông Minh",
            nameEn: "Smart NFC Business Cards",
            nameZh: "智能电子名片",
            nameJa: "スマート名刺",
            nameKo: "스마트 NFC 명함",
            kind: "shape",
            href: "/products/office/danh-thiep#thong-minh",
            image: "/images/category/card-thongminh.webp",
          },
          {
            id: "card-embossed",
            nameVi: "Danh Thiếp Dập Nổi/ Chìm",
            nameEn: "Embossed / Debossed Cards",
            nameZh: "起凸/击凹名片",
            nameJa: "型押し・エンボス名刺",
            nameKo: "엠보싱/형압 명함",
            kind: "shape",
            href: "/products/office/danh-thiep#dap-noi-chim",
            image: "/images/category/card-dapnoichim.webp",
          },
          {
            id: "card-plastic",
            nameVi: "Danh Thiếp Giấy Nhựa",
            nameEn: "Synthetic Plastic Cards",
            nameZh: "撕不烂防水塑料名片",
            nameJa: "耐水合成紙名刺",
            nameKo: "방수 찢어지지 않는 플라스틱 명함",
            kind: "material",
            href: "/products/office/danh-thiep#the-nhua-pvc",
            image: "/images/product/thenhuapvc.webp",
          },
          {
            id: "card-rounded",
            nameVi: "Danh Thiếp Bo Góc Chuẩn",
            nameEn: "Standard Rounded Corner Cards",
            nameZh: "标准圆角名片",
            nameJa: "角丸加工名刺",
            nameKo: "귀도리 라운딩 명함",
            kind: "shape",
            href: "/products/office/danh-thiep#bo-goc-chuan",
            image: "/images/category/card-bogocchuan.webp",
          },
          {
            id: "card-highlight",
            nameVi: "Danh Thiếp Highlight",
            nameEn: "Spot UV Highlight Cards",
            nameZh: "局部UV高光名片",
            nameJa: "部分光沢UV名刺",
            nameKo: "부분 코팅 하이라이트 명함",
            kind: "shape",
            href: "/products/office/danh-thiep#highlight",
            image: "/images/category/card-highlight.webp",
          },
          {
            id: "card-square-rounded",
            nameVi: "Danh Thiếp Vuông Bo Góc",
            nameEn: "Square Rounded Corner Cards",
            nameZh: "方形圆角名片",
            nameJa: "正方形角丸名刺",
            nameKo: "정사각 라운딩 명함",
            kind: "shape",
            href: "/products/office/danh-thiep#vuong-bo-goc",
            image: "/images/category/card-vuongbogoc.webp",
          },
          {
            id: "card-square",
            nameVi: "Danh Thiếp Vuông",
            nameEn: "Square Business Cards",
            nameZh: "正方形个性名片",
            nameJa: "スクエア名刺",
            nameKo: "정사각 명함",
            kind: "shape",
            href: "/products/office/danh-thiep#vuong",
            image: "/images/category/card-vuong.webp",
          },
          {
            id: "card-folded",
            nameVi: "Danh Thiếp Gấp Đôi",
            nameEn: "Folded Business Cards",
            nameZh: "折叠双面名片",
            nameJa: "二つ折り名刺",
            nameKo: "접이식 명함",
            kind: "shape",
            href: "/products/office/danh-thiep#gap-doi",
            image: "/images/category/card-gapdoi.webp",
          },
        ],
      },
    ],
  },

  // Column 2: Bao thư - Envelopes & Áo thun đồng phục
  {
    id: "col-envelopes-tshirts",
    groups: [
      {
        id: "envelopes",
        titleVi: "Bao thư - Envelopes",
        titleEn: "Envelopes",
        titleZh: "信封 - Envelopes",
        titleJa: "封筒 - Envelopes",
        titleKo: "봉투 - Envelopes",
        href: "/products/office/bao-thu",
        image: "/images/category/baothu.webp",
        items: [
          {
            id: "envelope-express",
            nameVi: "Bao thư lấy ngay",
            nameEn: "Express Envelopes",
            nameZh: "加急速印信封",
            nameJa: "即日仕上げ封筒",
            nameKo: "당일 급행 봉투",
            kind: "shape",
            href: "/products/office/bao-thu#bao-thu-lay-ngay",
            image: "/images/category/baothulayngay.webp",
            isFast: true,
          },
          {
            id: "envelope-small",
            nameVi: "Bao thư nhỏ",
            nameEn: "Small Envelopes (12x22cm)",
            nameZh: "小号信封 (12x22cm)",
            nameJa: "小サイズ封筒 (長3)",
            nameKo: "소봉투 (12x22cm)",
            kind: "shape",
            href: "/products/office/bao-thu#bao-thu-nho",
            image: "/images/category/baothunho.webp",
          },
          {
            id: "envelope-medium",
            nameVi: "Bao thư trung",
            nameEn: "Medium Envelopes (16x23cm)",
            nameZh: "中号信封 (16x23cm)",
            nameJa: "中サイズ封筒 (角3)",
            nameKo: "중봉투 (16x23cm)",
            kind: "shape",
            href: "/products/office/bao-thu#bao-thu-trung",
            image: "/images/category/baothutrung.webp",
          },
          {
            id: "envelope-large",
            nameVi: "Bao thư lớn",
            nameEn: "Large Envelopes (25x35cm)",
            nameZh: "大号信封 (25x35cm)",
            nameJa: "大サイズ封筒 (角2)",
            nameKo: "대봉투 (25x35cm)",
            kind: "shape",
            href: "/products/office/bao-thu#bao-thu-lon",
            image: "/images/category/baothulon.webp",
          },
          {
            id: "envelope-kraft",
            nameVi: "Bao thư giấy Kraft",
            nameEn: "Kraft Paper Envelopes",
            nameZh: "复古牛皮纸信封",
            nameJa: "クラフト紙封筒",
            nameKo: "크라프트지 봉투",
            kind: "material",
            href: "/products/office/bao-thu#bao-thu-kraft",
            image: "/images/product/bag-kraft1.webp",
          },
          {
            id: "envelope-window",
            nameVi: "Bao thư cửa sổ kính",
            nameEn: "Window Envelopes",
            nameZh: "开窗透视信封",
            nameJa: "窓付き封筒",
            nameKo: "창문 투명 봉투",
            kind: "shape",
            href: "/products/office/bao-thu#bao-thu-cua-so",
            image: "/images/category/baothucuasokinh.webp",
          },
        ],
      },
      {
        id: "tshirts",
        titleVi: "Áo thun đồng phục",
        titleEn: "Uniform T-Shirts",
        titleZh: "企业制服T恤",
        titleJa: "ユニフォームTシャツ",
        titleKo: "단체 유니폼 티셔츠",
        href: "/products/office/ao-thun",
        image: "/images/category/aothundongphuc.webp",
        items: [
          {
            id: "tshirt-polo",
            nameVi: "Áo thun đồng phục cổ trụ",
            nameEn: "Polo Collar Uniform T-Shirts",
            nameZh: "翻领POLO企业工装",
            nameJa: "ポロシャツユニフォーム",
            nameKo: "카라 폴로 단체 티셔츠",
            kind: "shape",
            href: "/products/office/ao-thun#ao-thun-co-tru",
            image: "/images/category/aothundongphuccotru.webp",
          },
          {
            id: "tshirt-round-neck",
            nameVi: "Áo thun đồng phục cổ tròn",
            nameEn: "Round Neck Uniform T-Shirts",
            nameZh: "圆领纯棉企业工服",
            nameJa: "クルーネックTシャツ",
            nameKo: "라운드넥 단체 티셔츠",
            kind: "shape",
            href: "/products/office/ao-thun#ao-thun-co-tron",
            image: "/images/category/aothundongphuccotron.webp",
          },
        ],
      },
    ],
  },

  // Column 3: Giấy ghi chú, Giấy tiêu đề & Bìa đựng hồ sơ
  {
    id: "col-notes-letterheads-folders",
    groups: [
      {
        id: "notes",
        titleVi: "Giấy ghi chú - Block notes",
        titleEn: "Block Notes & Memo Pads",
        titleZh: "便签本 - Block notes",
        titleJa: "メモ帳 - Block notes",
        titleKo: "메모지 - Block notes",
        href: "/products/office/giay-ghi-chu",
        image: "/images/category/giayghichu.webp",
        items: [
          {
            id: "note-block",
            nameVi: "Giấy ghi chú",
            nameEn: "Block Notes / Memo Pads",
            nameZh: "定制办公便签纸",
            nameJa: "デスク用ブロックメモ",
            nameKo: "사무용 떡메모지",
            kind: "shape",
            href: "/products/office/giay-ghi-chu#giay-ghi-chu-block",
            image: "/images/category/blocknote.webp",
          },
        ],
      },
      {
        id: "letterheads",
        titleVi: "Giấy tiêu đề - Letterheads",
        titleEn: "Letterheads",
        titleZh: "信纸便笺 - Letterheads",
        titleJa: "レターヘッド - Letterheads",
        titleKo: "레터헤드 - Letterheads",
        href: "/products/office/giay-tieu-de",
        image: "/images/category/giaytieude.webp",
        items: [
          {
            id: "letterhead-short-run",
            nameVi: "Giấy tiêu đề số lượng ít",
            nameEn: "Short-run Letterheads",
            nameZh: "少量数码信笺",
            nameJa: "小ロットレターヘッド",
            nameKo: "소량 레터헤드",
            kind: "shape",
            href: "/products/office/giay-tieu-de#giay-tieu-de-it",
            image: "/images/category/giaytieudesoluongit.webp",
            isFast: true,
          },
          {
            id: "letterhead-bulk",
            nameVi: "Giấy tiêu đề số lượng lớn",
            nameEn: "Bulk Offset Letterheads",
            nameZh: "批量胶印高品质信笺",
            nameJa: "大ロットオフセット便箋",
            nameKo: "대량 오프셋 레터헤드",
            kind: "shape",
            href: "/products/office/giay-tieu-de#giay-tieu-de-lon",
            image: "/images/category/giaytieudesoluonglon.webp",
          },
        ],
      },
      {
        id: "folders",
        titleVi: "Bìa đựng hồ sơ - Folders",
        titleEn: "Folders & Presentation Folders",
        titleZh: "文件夹封套 - Folders",
        titleJa: "フォルダ - Folders",
        titleKo: "서류 홀더 - Folders",
        href: "/products/office/bia-dung-ho-so",
        image: "/images/product/vd-item-folder.jpeg",
        items: [
          {
            id: "folder-1-pocket",
            nameVi: "Bìa đựng hồ sơ 1 tay gấp",
            nameEn: "1-Pocket Presentation Folders",
            nameZh: "单口袋商务文件夹",
            nameJa: "1ポケットホルダー",
            nameKo: "1단 접이식 서류 홀더",
            kind: "shape",
            href: "/products/office/bia-dung-ho-so#bia-ho-so-1-tay-gap",
            image: "/images/category/biadunghoso1taygap.webp",
          },
          {
            id: "folder-2-pocket",
            nameVi: "Bìa đựng hồ sơ 2 tay gấp",
            nameEn: "2-Pocket Presentation Folders",
            nameZh: "双口袋厚款文件夹",
            nameJa: "2ポケットホルダー",
            nameKo: "2단 접이식 서류 홀더",
            kind: "shape",
            href: "/products/office/bia-dung-ho-so#bia-ho-so-2-tay-gap",
            image: "/images/category/biadunghoso2taygap.webp",
          },
          {
            id: "folder-premium",
            nameVi: "Bìa đựng hồ sơ cao cấp",
            nameEn: "Premium Luxury Folders",
            nameZh: "烫金UV奢华封套",
            nameJa: "高級特アート紙フォルダ",
            nameKo: "최고급 특수가공 홀더",
            kind: "shape",
            href: "/products/office/bia-dung-ho-so#bia-ho-so-cao-cap",
            image: "/images/category/biadunghosocaocap.webp",
          },
        ],
      },
    ],
  },
];
