// data/subgroups-catalog.ts
// Structured catalog for Subgroups (Menu con) containing:
// - Shapes (Hình thức) -> rendered as cards on /products/[categoryId]/[subgroupId]
// - Materials (Chất liệu) -> rendered as flashcards on /products/[categoryId]/[subgroupId]/[shapeId]

import type { ProductOption } from "@/data/categories";

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
  materials?: ProductOption[];
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

export interface ProductCategoryDef {
  id: "marketing" | "office" | "packaging" | "tet";
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  description: string;
  icon: string;
  coverImage: string;
}

export const MAIN_CATEGORIES: ProductCategoryDef[] = [
  {
    id: "marketing",
    nameVi: "Tiếp thị",
    nameEn: "Marketing",
    descriptionVi: "Ấn phẩm quảng bá thương hiệu, tiếp cận khách hàng và hỗ trợ bán hàng hiệu quả.",
    descriptionEn: "Print materials to showcase your brand, engage customers, and drive sales.",
    description: "Print materials to showcase your brand, engage customers, and drive sales.",
    icon: "Briefcase",
    coverImage: "/images/category/vd-cat-marketing.jpg",
  },
  {
    id: "office",
    nameVi: "Văn phòng",
    nameEn: "Office",
    descriptionVi: "Ấn phẩm phục vụ công việc hàng ngày và nhận diện thương hiệu doanh nghiệp chuyên nghiệp.",
    descriptionEn: "Essential prints for daily operations and a cohesive corporate brand identity.",
    description: "Essential prints for daily operations and a cohesive corporate brand identity.",
    icon: "Layers",
    coverImage: "/images/category/vd-cat-office.jpg",
  },
  {
    id: "packaging",
    nameVi: "Bao bì",
    nameEn: "Packaging",
    descriptionVi: "Hộp giấy, túi giấy và bao bì chất lượng cao, nâng tầm giá trị sản phẩm khi trao tay.",
    descriptionEn: "Quality boxes, bags, and packaging that elevate your product's unboxing experience.",
    description: "Quality boxes, bags, and packaging that elevate your product's unboxing experience.",
    icon: "Package",
    coverImage: "/images/category/vd-cat-packaging.jpg",
  },
  {
    id: "tet",
    nameVi: "Ấn phẩm Tết",
    nameEn: "Tet Publications",
    descriptionVi: "Lịch Tết, bao lì xì, hộp quà Tết truyền thống và hiện đại cho doanh nghiệp và gia đình.",
    descriptionEn: "Calendars, red envelopes, and festive gift boxes celebrating the Lunar New Year.",
    description: "Calendars, red envelopes, and festive gift boxes celebrating the Lunar New Year.",
    icon: "Gift",
    coverImage: "/images/category/vd-cat-tet.jpg",
  },
];

export const productCategories = MAIN_CATEGORIES;

export function getOriginalOptions(...productIds: string[]): ProductOption[] {
  void productIds;
  return [];
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
  return result;
}

export const WRISTBAND_MATERIALS: ProductOption[] = [
  {
    icon: "Shield",
    name: "Tyvek Synthetic Plastic",
    nameVi: "Nhựa dai",
    nameZh: "杜邦纸/耐撕合成塑胶 (Tyvek)",
    nameJa: "タイベック・高耐久合成樹脂",
    nameKo: "타이벡 / 합성 찢김 방지 수지",
    tagline: "Need 100% waterproof, tear-proof wristbands with tamper-evident adhesive closures for secure crowd control?",
    taglineVi: "Bạn cần vòng tay chống thấm nước 100%, siêu bền không thể xé rách và dùng khóa keo niêm phong 1 lần?",
    taglineZh: "需要100%完全防水、抗拉防撕裂且带一次性防伪自粘胶扣的活动手环吗？",
    taglineJa: "完全防水で破れず、一度剥がすと再利用できないセキュリティ粘着テープ付きリストバンドですか？",
    taglineKo: "100% 완전 방수, 강력한 찢김 방지 및 1회용 봉인 스티커가 적용된 보안 손목 밴드인가요?",
    description: [
      "High-density synthetic fiber film (Tyvek/Synthetic Plastic) that is featherlight, ultra-flexible, and completely waterproof",
      "Tamper-evident adhesive tab with security die-cut slit patterns prevents transfer or reuse between attendees",
      "Sharp high-resolution printing for full-color event branding, QR entry codes, barcodes, and sequential numbering"
    ],
    descriptionVi: [
      "Chất liệu màng sợi tổng hợp mật độ cao (Tyvek/Synthetic Plastic) siêu nhẹ, dẻo dai và hoàn toàn không thấm nước",
      "Phần đầu dán sử dụng keo dán bảo mật chuyên dụng với các đường cắt bế răng cưa chống bóc gỡ tái sử dụng",
      "In ấn sắc nét logo thương hiệu, mã vạch (Barcode), mã QR Code và dãy số nhảy serial kiểm soát an ninh tự động"
    ],
    descriptionZh: [
      "高密度合成纤维膜（杜邦纸/合成塑胶），轻盈无负重感，柔韧耐折且100%耐水防潮",
      "专用安全防伪自粘封口，带有防转移锯齿防撕模切，一旦撕开即损毁，杜绝二次使用",
      "支持高精全彩印制品牌LOGO、入场核销二维码、条形码及可变激光流水号"
    ],
    descriptionJa: [
      "高密度ポリエチレン繊維不織布（タイベック/高耐久合成樹脂）を採用、超軽量かつ100%完全防水",
      "改ざん防止セキュリティ粘着タブを採用。不正な取り外しや使い回しを防ぐ特殊スリット加工",
      "高精細フルカラー印刷に対応し、イベントロゴ、入場QRコード、バーコード、可変連番を鮮明に再現"
    ],
    descriptionKo: [
      "초경량 고밀도 합성 섬유(타이벡/합성수지) 소재로 착용감이 우수하며 100% 방수 및 찢어짐 방지",
      "보안 절취선이 적용된 강력 1회용 접착 탭으로 재사용 및 타인 양도를 완벽히 차단",
      "고해상도 풀컬러 인쇄로 행사 로고, 입장용 QR코드, 바코드 및 연속 시리얼 넘버링 완벽 지원"
    ],
    descriptionTraits: [
      "waterproof-durability",
      "digital-precision",
      "thick-weight"
    ],
    bestFor: [
      "Music festivals, outdoor EDM concerts, water festivals, and countdown galas",
      "Amusement parks, water parks, swimming pools, campgrounds, and holiday resorts",
      "Conferences, trade exhibitions, marathons, and sporting events"
    ],
    bestForVi: [
      "Đại nhạc hội, lễ hội âm nhạc ngoài trời (EDM), concert và lễ hội nước",
      "Khu vui chơi giải trí, công viên nước, bể bơi, khu cắm trại và resort",
      "Hội nghị, triển lãm thương mại, sự kiện marathon và giải chạy phong trào"
    ],
    bestForZh: [
      "大型户外音乐节、电音节（EDM）、演唱会及泼水节活动",
      "水上乐园、主题游乐场、度假村酒店及游泳馆入场凭证",
      "行业展会、学术论坛、马拉松越野跑及大型体育赛事"
    ],
    bestForJa: [
      "野外音楽フェス、ロックフェス、EDMライブ、ウォーターイベント",
      "ウォーターパーク、テーマパーク、キャンプ場、スパリゾート",
      "展示会、ビジネスカンファレンス、マラソン大会、スポーツイベント"
    ],
    bestForKo: [
      "야외 뮤직 페스티벌, 콘서트, EDM 파티, 워터밤 축제",
      "워터파크, 놀이공원, 수영장, 글램핑장 및 패밀리 리조트",
      "국제 컨퍼런스, 비즈니스 박람회, 마라톤 대회 및 스포츠 행사"
    ],
    pureImage: "/images/product/vongtay-nhuadai1.webp",
    pureImages: [
      "/images/product/vongtay-nhuadai1.webp",
      "/images/product/vongtay-nhuadai22.webp",
      "/images/product/vongtay-nhuadai33.webp"
    ],
    hideFoilCheckbox: true,
    hideDoubleSidedCheckbox: true
  },
  {
    icon: "Sparkles",
    name: "Woven / Satin Fabric",
    nameVi: "Vải",
    nameZh: "织锦织唛/色丁布 (Woven / Satin)",
    nameJa: "織り布・サテンファブリック",
    nameKo: "직조 패브릭 / 고급 새틴 천",
    tagline: "Looking for a luxury woven or satin fabric wristband with soft wrist comfort that doubles as a memorable souvenir?",
    taglineVi: "Bạn tìm kiếm vòng tay vải sang trọng, êm ái trên cổ tay và có thể lưu giữ như món quà kỷ niệm sau sự kiện?",
    taglineZh: "寻找触感丝滑亲肤、支持多色提花编织，兼具活动纪念收藏价值的高端布手环吗？",
    taglineJa: "肌触りが優しく高級感があり、イベント終了後も記念品として大切に残せる布製リストバンドですか？",
    taglineKo: "부드러운 착용감과 고급스러운 텍스처로 행사 후에도 소장 가치가 높은 프리미엄 패브릭 밴드인가요?",
    description: [
      "Intricate woven jacquard fabric or silky smooth premium satin ribbon, soft and skin-friendly for multi-day wear",
      "Fitted with a tamper-resistant one-way sliding barrel lock with internal teeth or a luxury metal ring clasp",
      "Fade-resistant dye sublimation or yarn embroidery that withstands water, sweat, and washing for lasting keepsakes"
    ],
    descriptionVi: [
      "Dải vải dệt thổ cẩm (Woven jacquard) tinh xảo hoặc lụa Satin bóng mịn cao cấp, mềm mại và không gây kích ứng da",
      "Trang bị nút khóa trượt 1 chiều (One-way sliding barrel lock) bằng nhựa cứng có răng ngạnh hoặc khóa kim loại sang trọng",
      "Độ bền màu tuyệt đối, không phai khi gặp nước, mồ hôi hay hóa chất hồ bơi, lưu giữ kỷ niệm nhiều năm"
    ],
    descriptionZh: [
      "精细提花织唛或高密丝滑色丁缎带，亲肤透气，多日佩戴无异物感",
      "标配单向倒刺防盗塑料滑扣或金属锁扣，拉紧后无法倒退，防止私下转让",
      "采用环保热升华或色织工艺，耐水洗不褪色，活动结束后是极佳的纪念收藏品"
    ],
    descriptionJa: [
      "繊細なジャカード織りまたは光沢のある上質サテン生地を採用し、数日間の着用でも快適な肌触り",
      "内側に逆止歯を備えたワンウェイ（一方向）スライドバレルプラスチックロックで不正転売を防止",
      "水や汗に強い昇華転写＆先染め糸を採用。色あせにくく、イベントのプレミアムな記念品に最適"
    ],
    descriptionKo: [
      "정교한 자카드 직조 또는 실크처럼 매끄러운 고급 새틴 소재로 장시간 착용에도 편안한 착용감",
      "역주행 방지 내부 돌기가 내장된 원웨이 슬라이딩 배럴 플라스틱 락 또는 메탈 링 버클 적용",
      "땀과 물에 강한 승화전사 및 염색 공정으로 색바램이 없으며 행사 후 소장용 굿즈로 우수"
    ],
    descriptionTraits: [
      "textured-art",
      "waterproof-durability",
      "soft-light"
    ],
    bestFor: [
      "Multi-day music festivals, camping tours, and international artist concerts",
      "VIP lounge hospitality, special guest passes, and all-access backstage credentials",
      "eSports tournaments, private membership clubs, and anniversary alumni gatherings"
    ],
    bestForVi: [
      "Đại nhạc hội nhiều ngày (Multi-day music festivals), tour diễn nghệ sĩ quốc tế",
      "Vé VIP khu vực lounge, khách mời đặc biệt, thẻ ra vào hậu trường (Backstage pass)",
      "Sự kiện thể thao eSports, câu lạc bộ thành viên cao cấp, hội khóa kỷ niệm"
    ],
    bestForZh: [
      "为期数天的大型跨年音乐节、巡回演唱会及草莓音乐节",
      "VIP贵宾专区、特邀赞助商通道、工作后台通行证（Backstage Pass）",
      "电竞巡回大赛、高端私享会员俱乐部、名校校友周年聚会"
    ],
    bestForJa: [
      "数日間にわたる野外フェスティバル、オールナイト音楽イベント、ワールドツアー",
      "VIPラウンジ入場パス、特待ゲスト専用パス、バックステージパス",
      "eスポーツ大会、プレミアム会員クラブ、卒業周年記念同窓会"
    ],
    bestForKo: [
      "다일간 진행되는 대형 뮤직 페스티벌, 글로벌 아티스트 투어 콘서트",
      "VIP 라운지 입장권, 스페셜 게스트 패스, 백스테이지 출입증",
      "e스포츠 토너먼트 대회, 프라이빗 멤버십 클럽, 동문회 기념행사"
    ],
    pureImage: "/images/product/vongtay-vai1.webp",
    pureImages: [
      "/images/product/vongtay-vai1.webp",
      "/images/product/vongtay-vai22.webp",
      "/images/product/vongtay-vai33.webp"
    ],
    hideFoilCheckbox: true,
    hideDoubleSidedCheckbox: true
  },
  {
    icon: "Layers",
    name: "Silicone Rubber",
    nameVi: "Silicone",
    nameZh: "环保硅胶 (Silicone)",
    nameJa: "シリコンラバー",
    nameKo: "실리콘 고무",
    tagline: "Need stretchable, permanently waterproof 100% silicone wristbands with embossed slogans for viral charity and brand campaigns?",
    taglineVi: "Bạn cần vòng đeo tay cao su dẻo dai, chống nước vĩnh viễn, dập nổi thông điệp thương hiệu để lan tỏa chiến dịch?",
    taglineZh: "需要永久防水、高弹性不易老化且支持浮雕LOGO的环保品牌宣传硅胶手环吗？",
    taglineJa: "優れた伸縮性と耐久性を誇り、ロゴやスローガンを立体刻印できる定番シリコンバンドですか？",
    taglineKo: "영구 방수와 탄력성을 갖추고 슬로건과 로고를 입체 각인하여 캠페인 홍보에 최적화된 실리콘 밴드인가요?",
    description: [
      "100% medical-grade eco-friendly silicone, exceptionally elastic, non-toxic, and comfortable for all wrist sizes",
      "Versatile finishing techniques: High-contrast silk screen print, precision debossed, color-filled debossed, or 3D raised embossed",
      "Permanent waterproof durability: Resists saltwater, chlorine, UV exposure, and wear-and-tear for ongoing brand loyalty"
    ],
    descriptionVi: [
      "100% cao su Silicone nguyên sinh y tế mềm dẻo, co giãn đàn hồi cao, không gây mùi và an toàn tuyệt đối cho da",
      "Đa dạng quy cách tạo hình: In lụa màu sắc nét, dập chìm (Debossed), dập chìm đổ màu hoặc dập nổi 3D (Embossed)",
      "Độ bền bỉ vĩnh cửu: Chống nước biển, nước clo bể bơi, chống tia UV ngoài trời và có thể tái sử dụng lâu dài"
    ],
    descriptionZh: [
      "100%环保食品级原生硅胶，高回弹柔韧，无异味无毒，对敏感皮肤友好",
      "多样化工艺：高清丝印图文、凹刻填色（Debossed）、3D立体浮雕（Embossed）及夜光变色",
      "经久耐用：抗紫外线老化、耐氯水与海水腐蚀，可长期佩戴重复使用"
    ],
    descriptionJa: [
      "人体に安全な100%高品質シリコン素材を使用。ソフトな弾力性で手首に心地よくフィット",
      "豊富な加工方法：鮮やかなシルク印刷、立体感のある凸文字（エンボス）、インク流し込み凹文字（デボス）",
      "高い耐久性：汗や水濡れ、紫外線に強く、日常的に長期間使用可能でPR効果抜群"
    ],
    descriptionKo: [
      "100% 무독성 프리미엄 친환경 실리콘으로 제작되어 우수한 신축성과 부드러운 착용감 제공",
      "다양한 맞춤 가공: 선명한 실크스크린 인쇄, 깊이감 있는 음각 채색(Debossed), 입체 양각(Embossed)",
      "완전 방수 및 뛰어난 내구성으로 땀, 수영장 염소수, 야외 자외선에도 변형 없이 반영구 사용 가능"
    ],
    descriptionTraits: [
      "embossed-depth",
      "waterproof-durability",
      "smooth-base"
    ],
    bestFor: [
      "Charity fundraisers, awareness causes, non-profit initiatives, and social movements",
      "Student club souvenirs, fitness gyms, CrossFit centers, yoga studios, and sports teams",
      "Corporate roadshows, tech expo swag, staff teambuilding, and brand merchandise"
    ],
    bestForVi: [
      "Chiến dịch gây quỹ từ thiện, chiến dịch nâng cao nhận thức cộng đồng, phong trào xã hội",
      "Quà tặng lưu niệm học sinh - sinh viên, câu lạc bộ thể thao, gym, fitness và yoga",
      "Nhận diện thương hiệu tại hội chợ, roadshow, hội thảo công nghệ và sự kiện teambuilding"
    ],
    bestForZh: [
      "公益慈善募捐活动、社会环保倡议、非营利组织宣传",
      "校园社团文创周边、健身房/CrossFit/瑜伽馆会员伴手礼、体育俱乐部",
      "品牌展会伴手礼、地推Roadshow派发、公司团建Teambuilding"
    ],
    bestForJa: [
      "チャリティ募金キャンペーン、社会啓発活動、非营利団体（NPO）のイベント",
      "学校・大学のサークル記念品、フィットネスジム、スポーツチーム、マラソン応援",
      "展示会ノベルティ、新商品プロモーション、社内チームビルディング記念品"
    ],
    bestForKo: [
      "자선 모금 행사, 사회적 인식 개선 캠페인, 비영리 단체 후원 굿즈",
      "대학 동아리 기념품, 피트니스 센터, 크로스핏 및 요가 스튜디오 회원 증정용",
      "기업 로드쇼 판촉물, IT 테크 박람회 기념품, 사내 워크숍 팀빌딩"
    ],
    pureImage: "/images/product/vongtay-silicone1.webp",
    pureImages: [
      "/images/product/vongtay-silicone1.webp",
      "/images/product/vongtay-silicone22.webp",
      "/images/product/vongtay-silicone33.webp"
    ],
    hideFoilCheckbox: true,
    hideDoubleSidedCheckbox: true
  }
];

export const VOUCHER_MATERIALS: ProductOption[] = [
  {
    icon: "Layers",
    name: "Type C Paper",
    nameVi: "Giấy loại C",
    nameZh: "铜版纸 C300（双面覆膜）",
    nameJa: "コート紙（C紙 300gsm・両面PP加工）",
    nameKo: "스노우지/아트지 C지 (300gsm 무광코팅)",
    tagline: "Looking for standard promotional vouchers with vivid color reproduction, sturdy 300gsm weight, and great value?",
    taglineVi: "Bạn cần voucher quà tặng tiêu chuẩn sắc nét, màu sắc tươi sáng, định lượng dày dặn và chi phí hợp lý?",
    taglineZh: "需要色彩鲜艳饱和、300克厚实挺括且性价比极高的标准促销礼品券吗？",
    taglineJa: "鮮やかなフルカラー発色と300gsmのしっかりとした厚みを両立した、最も選ばれている定番ギフト券ですか？",
    taglineKo: "선명하고 화사한 컬러 표현, 탄탄한 300gsm 두께감과 뛰어난 가성비를 갖춘 표준 상품권인가요?",
    description: [
      "Sturdy 300gsm Couche cardstock with smooth double-sided coating for radiant graphics and sharp text",
      "Protective velvety matte or vibrant gloss lamination safeguards against scuffs and fingerprints",
      "Supports perforated tear-off stubs, sequential serial numbering, and scratch-off security foil"
    ],
    descriptionVi: [
      "Giấy Couche 300gsm dày dặn, láng mịn hai mặt, hiển thị hình ảnh và logo thương hiệu rực rỡ",
      "Cán màng mờ sang trọng hoặc màng bóng bắt mắt, chống trầy xước và hạn chế bám bẩn vân tay",
      "Hỗ trợ cấn răng cưa xé cuống, đóng số nhảy serial quản lý và phủ nhũ cào trúng thưởng bí mật"
    ],
    descriptionZh: [
      "300克加厚双面微涂布铜版卡纸，表面平滑细腻，印刷色彩绚丽夺目",
      "表面覆哑膜（高级触感）或光膜（高亮吸睛），有效防刮防指纹",
      "支持虚线撕券副券、激光流水号防伪以及刮刮乐涂层定制"
    ],
    descriptionJa: [
      "発色が美しい300gsmの厚手両面コート紙を採用し、ビジュアルを鮮明に再現",
      "上品なマットPPまたは艶やかなグロスPP加工で、擦れや指紋汚れを防止",
      "ミシン目加工（もぎり半券）、通し連番印字、スクラッチくじ銀層加工に対応"
    ],
    descriptionKo: [
      "도톰하고 탄탄한 300gsm 양면 코팅 스노우지로 생생한 컬러감과 정밀한 그래픽 구현",
      "고급스러운 무광 코팅 또는 화사한 유광 코팅으로 스크래치와 지문 오염 방지",
      "절취용 미싱선(도련), 관리용 연속 시리얼 번호 넘버링 및 보안 스크래치 인쇄 지원"
    ],
    descriptionTraits: [
      "smooth-base",
      "glossy-coat",
      "digital-precision"
    ],
    bestFor: [
      "Fashion boutiques, cosmetics stores, supermarkets, and retail chains",
      "Cafes, bakeries, fast-casual restaurants, and dining loyalty promotions",
      "Scratch-off sweepstakes, seasonal promotions, and mass customer appreciation vouchers"
    ],
    bestForVi: [
      "Phiếu giảm giá cửa hàng thời trang, mỹ phẩm, siêu thị và chuỗi bán lẻ",
      "Voucher khuyến mãi quán cà phê, nhà hàng F&B, tiệm bánh và trà sữa",
      "Thẻ cào bốc thăm trúng thưởng, chương trình quà tặng tri ân khách hàng đại trà"
    ],
    bestForZh: [
      "服装连锁、美妆专柜、大型商超及零售便利代金券",
      "咖啡轻食、烘焙茶饮、餐饮连锁促销优惠券",
      "有奖刮刮乐、商场开业拓客礼券、大规模会员回馈活动"
    ],
    bestForJa: [
      "アパレルショップ、コスメカウンター、スーパー・小売店の割引券",
      "カフェ、ベーカリー、レストラン、飲食チェーンのプロモーションクーポン",
      "スクラッチ抽選券、オープン記念クーポン、大規模顧客還元キャンペーン"
    ],
    bestForKo: [
      "패션 의류 매장, 뷰티 코스메틱 샵, 대형 마트 및 리테일 할인 쿠폰",
      "카페, 베이커리, 디저트 펍, F&B 프랜차이즈 식사권 및 음료 교환권",
      "스크래치 이벤트 복권, 매장 오픈 프로모션, 대규모 고객 감사 쿠폰"
    ],
    pureImage: "/images/product/phieuquatang-giayloaic.webp",
    pureImages: [
      "/images/product/phieuquatang-giayloaic.webp",
      "/images/product/phieuquatang-giayloaic2.webp",
      "/images/product/phieuquatang-giayloaic3.webp"
    ],
  },
  {
    icon: "Square",
    name: "Type I Paper",
    nameVi: "Giấy loại I",
    nameZh: "白卡纸 Ivory（白芯硬挺·单面覆膜）",
    nameJa: "アイボリー紙（I紙 300-350gsm・高剛性）",
    nameKo: "아이보리 보드지 I지 (300-350gsm 고강도 백색지)",
    tagline: "Looking for a rigid, upscale voucher with a glossy coated face and an uncoated back perfect for pen notes and signatures?",
    taglineVi: "Bạn tìm kiếm voucher cao cấp có độ đanh cứng vượt trội, một mặt láng mịn sang trọng và một mặt nhám dễ viết ghi chú?",
    taglineZh: "想要硬挺平整、正面覆膜显高档且背面原生质感极易手写签名的白卡礼品券吗？",
    taglineJa: "抜群のコシと硬さがあり、表面は高級印刷、裏面はボールペンで書き込みや署名がしやすいアイボリーカードですか？",
    taglineKo: "뛰어난 탄성과 단단한 두께감을 자랑하며, 앞면은 매끄럽고 뒷면은 볼펜 서명과 메모가 쉬운 고급 아이보리지인가요?",
    description: [
      "Premium 300-350gsm Ivory cardstock with rigid density that resists bending and edge wear",
      "Smooth semi-gloss coated front for rich colors, paired with an uncoated reverse ideal for handwriting and ink stamps",
      "Ideal for hot foil stamping, embossing, debossing, and rounded corner die-cutting"
    ],
    descriptionVi: [
      "Giấy Ivory cao cấp 300gsm - 350gsm đanh chắc, thớ giấy nén chặt tạo cảm giác đầm tay và đứng dáng",
      "Mặt trước phủ bóng mịn in màu rực rỡ, mặt sau màu trắng ngà tự nhiên thấm mực tốt, ký tên và đóng dấu không bị lem",
      "Đặc biệt thích hợp gia công ép kim vàng/bạc logo, dập nổi họa tiết hoặc bo tròn 4 góc thẩm mỹ"
    ],
    descriptionZh: [
      "选用300至350克高级白卡纸，纸芯紧实挺拔，抗弯折不易变形",
      "正面平滑覆膜展现品牌奢华质感，反面微粗糙吸墨性好，盖章签名不晕染",
      "极佳搭配烫金、凹凸压纹及圆角模切工艺，尽显专业商务品质"
    ],
    descriptionJa: [
      "300〜350gsmの超高密度高級アイボリー紙を採用。折れ曲がりにくく重厚な手触り",
      "表面は滑らかなPPコートで美麗印刷、裏面は非塗工面で日付やサイン・スタンプがにじまず綺麗に押印可能",
      "箔押し、エンボス加工、角丸加工との相性が抜群で、フォーマルなギフト券に最適"
    ],
    descriptionKo: [
      "300~350gsm 고평량 프리미엄 백색 보드지로 구김 없이 꼿꼿한 형태 유지력 제공",
      "앞면은 코팅 가공으로 선명한 디자인 연출, 뒷면은 비도공면으로 볼펜 메모 및 스탬프 날인 시 번짐 없음",
      "금박/은박 후가공, 형압 엠보싱, 모서리 라운딩(귀돌이)과 결합 시 완성도 극대화"
    ],
    descriptionTraits: [
      "thick-weight",
      "smooth-base",
      "foil-accent"
    ],
    bestFor: [
      "Aesthetic clinics, dermatology centers, luxury dental practices, and private hospitals",
      "Automotive showrooms, fine jewelry stores, luxury watch boutiques, and designer furniture",
      "4-5 star hotels, seaside resorts, golf clubs, and fine dining gift certificates"
    ],
    bestForVi: [
      "Thẻ quà tặng thẩm mỹ viện, viện chăm sóc da, nha khoa cao cấp và bệnh viện quốc tế",
      "Voucher showroom ô tô, trang sức kim hoàn, đồng hồ chính hãng và nội thất",
      "Phiếu dịch vụ khách sạn 4-5 sao, khu nghỉ dưỡng resort và nhà hàng fine dining"
    ],
    bestForZh: [
      "医美微整门诊、高端月子中心、齿科诊所及私人医院尊享卡",
      "豪车4S店、珠宝首饰定制、瑞士名表专卖及进口家具礼券",
      "五星级度假酒店房券、游艇俱乐部、高尔夫球场及黑珍珠餐厅充值卡"
    ],
    bestForJa: [
      "美容皮膚科、エステサロン、高級審美歯科、会員制クリニック",
      "高級車ディーラー、宝飾・ジュエリーサロン、時計店、インテリアショップ",
      "5つ星ホテル宿泊券、リゾートスパ、ゴルフクラブ、高級フレンチ・料亭のお食事券"
    ],
    bestForKo: [
      "프리미엄 피부과, 성형외과, VIP 건강검진센터 및 고급 치과 클리닉",
      "수입차 전시장, 하이엔드 주얼리 부티크, 명품 시계 및 디자이너 가구 매장",
      "특급 호텔 숙박권, 럭셔리 리조트 스파, 골프 클럽 및 파인 다이닝 식사권"
    ],
    pureImage: "/images/product/phieuquatang-giayloaii.webp",
    pureImages: [
      "/images/product/phieuquatang-giayloaii.webp",
      "/images/product/phieuquatang-giayloaii2.webp",
      "/images/product/phieuquatang-giayloaii3.webp"
    ]
  },
  {
    icon: "Sparkles",
    name: "Fine Art Paper",
    nameVi: "Giấy mỹ thuật",
    nameZh: "特种艺术纸（纹理质感·轻奢典雅）",
    nameJa: "高級ファインペーパー（特殊紙・風合い重視）",
    nameKo: "최고급 수입 명품지 (자연스러운 엠보 텍스처)",
    tagline: "Desire an artisanal gift certificate that feels like fine stationery with distinctive paper texture and bespoke elegance?",
    taglineVi: "Bạn mong muốn chiếc voucher như tác phẩm nghệ thuật, bề mặt gân sần tinh tế và cảm xúc chạm đẳng cấp khó quên?",
    taglineZh: "想要触感温润、带有自然微纹理或低调珠光，赋予品牌独特格调的艺术品级礼券吗？",
    taglineJa: "手にした瞬間に伝わる特別な紙の質感と、他にはない唯一無二の気品を漂わせる高級ギフト券ですか？",
    taglineKo: "손끝에서 느껴지는 고급스러운 종이 결의 질감과 특별한 브랜드 가치를 전하는 명품 상품권인가요?",
    description: [
      "Imported luxury fine art stock featuring subtle tactile textures, pearlescent shimmer, or organic fibers",
      "Warm, tactile hand-feel that transforms a standard discount coupon into a cherished bespoke gift",
      "Harmonizes impeccably with rose gold/yellow gold foil stamping, letterpress, and blind debossing"
    ],
    descriptionVi: [
      "Giấy mỹ thuật nhập khẩu cao cấp với bề mặt gân sần nhẹ, ánh nhũ kim sa hoặc vân gỗ tự nhiên",
      "Chất giấy xốp đanh, thấm hút mực dịu mắt, toát lên vẻ đẹp mộc mạc mà xa xỉ",
      "Kết hợp hoàn hảo với kỹ thuật ép kim vàng hồng/vàng gold, dập chìm không màu tạo điểm nhấn nhận diện"
    ],
    descriptionZh: [
      "欧洲进口特种艺术纸（如白水彩、珠光星采、细布纹等），纹理自然独特",
      "纸张柔和温润，吸墨雅致不反光，自带艺术纸张独有的厚重温度",
      "完美配合玫瑰金/亮金烫印、无色深压印（Deboss）及火漆封蜡工艺"
    ],
    descriptionJa: [
      "厳選されたヨーロッパ直輸入のファインペーパー。織り目風、フェザー風、微細パールなど多彩な風合い",
      "手に触れた瞬間に伝わる温かみと上質感。ギフトを受け取る方に感動を与える仕立て",
      "金箔押し・空押し（デボス加工）・箔押し封筒との組み合わせで最高峰の気品を演出"
    ],
    descriptionKo: [
      "유럽 직수입 최고급 특수지(은은한 린넨 엠보, 수채화지 텍스처, 펄 섀도우)로 독보적인 감성 연출",
      "자연스러운 촉감과 빛 반사 없는 우아한 잉크 발색으로 소장하고 싶은 기프트 카드 완성",
      "로즈골드/샴페인골드 박가공 및 입체 형압, 실링 왁스 봉투와 결합 시 럭셔리함의 정점"
    ],
    descriptionTraits: [
      "textured-art",
      "natural-grain",
      "foil-accent"
    ],
    bestFor: [
      "Haute couture fashion houses, designer boutique apparel, and fine jewelry",
      "Organic luxury spas, wellness retreats, wedding bridal studios, and fine portraiture",
      "VIP private gala invitations, executive corporate client gifts, and holiday diplomacy vouchers"
    ],
    bestForVi: [
      "Voucher quà tặng thương hiệu thời trang thiết kế haute couture, boutique cao cấp",
      "Phiếu chăm sóc sắc đẹp spa trị liệu thảo mộc, studio áo cưới, ảnh viện nghệ thuật",
      "Thư mời tri ân khách hàng thân thiết VIP, quà tặng đối tác doanh nghiệp ngoại giao"
    ],
    bestForZh: [
      "高级定制服装、设计师买手店、私人高定时装沙龙",
      "有机芳疗SPA、隐世温泉度假村、高端婚纱摄影工作室",
      "企业核心VIP客户年终礼券、私银高净值客户答谢邀请券"
    ],
    bestForJa: [
      "オートクチュールメゾン、デザイナーズブティック、高級ジュエリー",
      "オーガニックスパ、高級リラクゼーション、ウェディングサロン、フォトスタジオ",
      "エグゼクティブ向けVIP顧客招待券、お中元・お歳暮の特製ギフト券"
    ],
    bestForKo: [
      "디자이너 브랜드 쇼룸, 하이엔드 명품 셀렉트 샵, 맞춤 테일러 샵",
      "에스테틱 테라피 스파, 웰니스 힐링 리조트, 프리미엄 웨딩 스튜디오",
      "기업 주요 VIP 임원 선물권, 프라이빗 뱅킹 고객 초청 감사 바우처"
    ],
    pureImage: "/images/product/phieuquatang-giaymythuat.webp",
    pureImages: [
      "/images/product/phieuquatang-giaymythuat.webp",
      "/images/product/phieuquatang-giaymythuat2.webp",
      "/images/product/phieuquatang-giaymythuat3.webp"
    ]
  },
  {
    icon: "Layers",
    name: "Kraft Paper",
    nameVi: "Giấy Kraft",
    nameZh: "环保牛皮纸 Kraft（复古原生态）",
    nameJa: "クラフト紙（ヴィンテージ・エコナチュラル）",
    nameKo: "친환경 크라프트지 (빈티지 내추럴 감성)",
    tagline: "Aiming for a warm, rustic vintage aesthetic with authentic eco-friendly sustainable appeal?",
    taglineVi: "Bạn theo đuổi phong cách mộc mạc, vintage ấm áp và thông điệp sống xanh thân thiện môi trường?",
    taglineZh: "崇尚质朴自然、手作温度与低碳环保理念的绿色创意礼品券吗？",
    taglineJa: "素朴で温もりのあるクラフト感と、環境配慮（サステナブル）なブランド姿勢を表現したいですか？",
    taglineKo: "자연 친화적이고 아날로그한 빈티지 무드로 감성을 전달하는 친환경 인쇄물인가요?",
    description: [
      "Natural unbleached 250-300gsm virgin wood pulp paper with high tensile tear strength and flexibility",
      "Distinctive warm golden-brown earthy tone radiating authentic rustic, handmade vintage charm",
      "100% biodegradable and recyclable, looks striking with opaque white ink, minimalist black, or tied with rustic twine"
    ],
    descriptionVi: [
      "Giấy Kraft nâu mộc tự nhiên 250gsm - 300gsm từ sợi gỗ nguyên sinh, dẻo dai và chịu lực tốt",
      "Tông màu nâu vàng ấm áp đặc trưng, mang đậm chất cổ điển (vintage & retro) rất được giới trẻ yêu thích",
      "Tái chế 100%, dễ dàng kết hợp in mực trắng (White ink), mực đen tối giản hoặc thắt dây thừng gai vintage"
    ],
    descriptionZh: [
      "选用250至300克天然未漂白木浆牛皮纸，纤维强韧，抗拉耐磨",
      "标志性大地暖棕色调，洋溢浓郁手作质感与美式复古（Vintage）气息",
      "100%绿色环保可降解，非常适合搭配特殊白墨印刷、黑白线描或麻绳装订"
    ],
    descriptionJa: [
      "無漂白の天然木材パルプで作られた250〜300gsmの丈夫なクラフト紙。破れにくく素朴な風合い",
      "温かみのあるブラウンカラーが、ハンドメイド感・レトロ・ヴィンテージな世界観を構築",
      "100%リサイクル可能なエコ素材。白インク印刷や麻紐リボンとの相性も抜群"
    ],
    descriptionKo: [
      "무표백 천연 펄프로 제작된 250~300gsm 질기고 튼튼한 자연주의 크라프트 카드지",
      "특유의 따스한 브라운 톤이 전해주는 아날로그 빈티지 감성과 친환경 브랜드 이미지 구축",
      "100% 생분해 및 재활용 가능하며, 화이트 잉크 인쇄 및 마끈 리본 패키징과 완벽한 조화"
    ],
    descriptionTraits: [
      "natural-grain",
      "soft-light",
      "eco-friendly"
    ],
    bestFor: [
      "Specialty coffee shops, artisan bakeries, tea rooms, and handmade ceramic studios",
      "Vintage clothing brands, handcrafted leather goods, and clean vegan cosmetics",
      "Organic farm markets, eco-tourism lodges, zero-waste stores, and creative craft workshops"
    ],
    bestForVi: [
      "Voucher quán cà phê specialty, tiệm bánh handmade, quán trà mộc và tiệm gốm thủ công",
      "Phiếu mua hàng thương hiệu thời trang vintage, đồ da thủ công, mỹ phẩm thuần chay (vegan)",
      "Chương trình khuyến mãi các dự án sống xanh, nông trại hữu cơ (organic farm) và workshop nghệ thuật"
    ],
    bestForZh: [
      "精品独立咖啡馆、手作烘焙坊、禅意茶室及手作陶艺体验馆",
      "复古古着服装店、手工皮具工坊、纯素零残忍美妆品牌",
      "有机农场采摘体验、生态度假营地、环保零废弃文创概念店"
    ],
    bestForJa: [
      "スペシャルティコーヒー、手作りベーカリー、日本茶カフェ、陶芸工房",
      "古着・ヴィンテージファッション、ハンドメイド革製品、オーガニックコスメ",
      "観光農園、エコビレッジ、サステナブルライフスタイルショップ"
    ],
    bestForKo: [
      "스페셜티 로스터리 카페, 수제 베이커리 공방, 전통 찻집 및 도자기 공방",
      "빈티지 패션 편집샵, 수제 가죽 공방, 클린 비건 화장품 브랜드",
      "유기농 파밍 마켓, 친환경 글램핑장, 제로웨이스트 라이프스타일 샵"
    ],
    pureImage: "/images/product/phieuquatang-giaykraft.webp",
    pureImages: [
      "/images/product/phieuquatang-giaykraft.webp",
      "/images/product/phieuquatang-giaykraft2.webp",
      "/images/product/phieuquatang-giaykraft3.webp"
    ]
  },
  {
    icon: "Shield",
    name: "Rigid PVC Plastic",
    nameVi: "Nhựa cứng PVC",
    nameZh: "PVC硬质塑胶卡（防水耐磨·VIP贵宾卡）",
    nameJa: "硬質PVCプラスチック（完全防水・超高耐久VIPカード）",
    nameKo: "고내구성 경질 PVC 플라스틱 (100% 방수 VIP 카드)",
    tagline: "Need a premium rigid credit-card style gift card that is 100% waterproof, unbreakable, and signifies prestigious VIP status?",
    taglineVi: "Bạn cần voucher dạng thẻ nhựa cứng cáp như thẻ ATM, chống nước tuyệt đối, không gãy gập và khẳng định đẳng cấp VIP dài lâu?",
    taglineZh: "需要像银行卡一样坚固厚实、100%防水防折断且能长期珍藏使用的尊贵VIP礼品卡吗？",
    taglineJa: "クレジットカードと同じ厚みと強度を誇り、完全防水・折れ防止で長期間使用できる最高級VIPプラスチックギフトカードですか？",
    taglineKo: "신용카드와 동일한 0.76mm 규격으로 100% 완전 방수, 구김 없는 영구 내구성과 VIP의 품격을 담은 경질 카드인가요?",
    description: [
      "100% solid virgin PVC at standard 0.76mm credit card thickness, rigid, fully waterproof, and virtually indestructible",
      "High-gloss or scratch-resistant matte finish with thermal offset printing that guarantees 5-10 years of color brilliance",
      "Supports magnetic stripes, signature strips, barcodes, QR codes, RFID contact/contactless chips, and embossed metallic foil names"
    ],
    descriptionVi: [
      "Nhựa PVC nguyên sinh 100% dày 0.76mm (chuẩn phôi thẻ ATM quốc tế), cứng cáp, chống nước tuyệt đối và không thể xé rách",
      "Bề mặt phủ bóng gương hoặc phủ mờ chống xước, công nghệ in nhiệt offset sắc sảo, bền màu trên 5 - 10 năm",
      "Tích hợp dải từ, mã vạch barcode, mã QR tĩnh/động, chip cảm ứng RFID hoặc ép kim dập nổi tên khách hàng VIP"
    ],
    descriptionZh: [
      "100%原生硬质PVC材料，0.76mm国际标准银行卡厚度，坚固耐压，绝对防水不褪色",
      "表面经过UV防刮或光面高透处理，色彩历久弥新，正常使用寿命达5-10年以上",
      "支持磁条、条形码、二维码、RFID/NFC感应芯片及烫金立体凸字卡号定制"
    ],
    descriptionJa: [
      "国際規格（JIS/ISO）準拠の厚さ0.76mm硬質PVCを採用。プラスチックならではの重厚感と完全防水性能",
      "傷がつきにくい高耐摩耗マット加工または光沢グロス仕上げ。5〜10年色あせない鮮明印刷",
      "磁気ストライプ、バーコード、QRコード、サインパネル、非接触ICチップ、エンボス凸文字（金銀箔）に対応"
    ],
    descriptionKo: [
      "국제 표준 규격(ISO)의 0.76mm 프리미엄 고경질 PVC 원단으로 제작되어 100% 완전 방수 및 반영구적 내구성",
      "스크래치 방지 무광 또는 선명한 하이글로시 코팅 처리로 5~10년 이상 선명한 컬러 유지",
      "마그네틱 스트라이프, 바코드, QR코드, 서명란, RFID/NFC 칩 및 양각 엠보싱 금박 넘버링 완벽 지원"
    ],
    descriptionTraits: [
      "waterproof-durability",
      "thick-weight",
      "metallic-shine"
    ],
    bestFor: [
      "VIP membership gift cards, preloaded department store gift cards, and luxury resort credits",
      "Gyms, CrossFit boxes, yoga studios, aquatic centers, and golf country clubs (wet environments)",
      "Electronic loyalty reward cards and high-tier patron gift vouchers for fine dining and aesthetic clinics"
    ],
    bestForVi: [
      "Thẻ VIP hội viên, thẻ gift card nạp tiền sẵn của trung tâm thương mại, resort nghỉ dưỡng",
      "Thẻ tập gym, fitness, yoga, hồ bơi và câu lạc bộ golf cao cấp (dùng lâu dài trong môi trường ẩm ướt)",
      "Thẻ tích điểm điện tử kết hợp voucher tri ân khách hàng thân thiết cho chuỗi spa và nhà hàng sang trọng"
    ],
    bestForZh: [
      "商场预付充值礼品卡、五星级酒店行政酒廊VIP卡、游艇俱乐部会籍卡",
      "健身房年卡、游泳馆次卡、瑜伽普拉提馆及高尔夫俱乐部（潮湿环境无忧）",
      "高端连锁医美中心储值卡、米其林星级餐厅VIP礼品卡"
    ],
    bestForJa: [
      "百貨店・商業施設のチャージ式ギフトカード、リゾートホテルVIP会員証",
      "フィットネスジム、スイミングクラブ、ヨガスタジオ、ゴルフクラブ（水濡れ環境に最適）",
      "高級エステサロンのプリペイドカード、料亭・高級レストランのVIPギフトカード"
    ],
    bestForKo: [
      "백화점 선불 충전식 기프트 카드, 특급 호텔 VIP 멤버십 바우처, 리조트 이용권",
      "피트니스 센터 회원권, 수영장 및 실내 골프 연습장 패스 (습기 많은 환경에 최적)",
      "고급 에스테틱 샵 정액권, 파인다이닝 식사권 및 VIP 충전식 고객 리워드 카드"
    ],
    pureImage: "/images/product/phieuquatang-nhuapvc.webp",
    pureImages: [
      "/images/product/phieuquatang-nhuapvc.webp",
      "/images/product/phieuquatang-nhuapvc2.webp",
      "/images/product/phieuquatang-nhuapvc3.webp"
    ],
    hideFoilCheckbox: true,
    hideDoubleSidedCheckbox: true
  }
];

export const CATALOGUE_MATERIALS: ProductOption[] = [
  {
    icon: "Layers",
    name: "Type C Paper",
    nameVi: "Giấy loại C",
    nameZh: "铜版纸 C类",
    nameJa: "コート紙（Cタイプ）",
    nameKo: "스노우/아트지 C타입",
    tagline: "Looking for a vibrant, professional catalogue with sharp photography and optimal value?",
    taglineVi: "Bạn cần cuốn catalogue / cẩm nang sắc nét, hình ảnh nổi bật và chi phí tối ưu?",
    taglineZh: "需要色彩鲜艳、图像细腻且性价比极高的企业画册与产品手册？",
    taglineJa: "鮮やかなカラー発色と優れたコストパフォーマンスを両立した定番カタログですか？",
    taglineKo: "선명한 컬러 표현, 돋보이는 제품 사진과 뛰어난 가성비를 갖춘 표준 카탈로그인가요?",
    description: [
      "Smooth double-sided coated Couche paper (150-300gsm) for radiant color reproduction and sharp text",
      "Protective matte or gloss lamination protects the cover against fingerprints and scuffing",
      "Ideal for high-volume offset printing or fast on-demand digital runs"
    ],
    descriptionVi: [
      "Giấy Couche bóng hoặc mờ 150gsm - 300gsm, bề mặt láng mịn hiển thị màu sắc và chi tiết rực rỡ",
      "Cán màng mờ sang trọng hoặc cán màng bóng bảo vệ bìa ngoài chống trầy xước và bám bẩn",
      "Phù hợp in offset số lượng lớn hoặc in nhanh kỹ thuật số chất lượng cao lấy ngay"
    ],
    descriptionZh: [
      "150-300克双面微涂布铜版纸，表面平滑细腻，印刷色彩绚丽夺目",
      "封面可选哑膜（高级触感）或光膜（高亮吸睛），有效防刮防指纹",
      "适合大批量胶印或小批量高清数码快印"
    ],
    descriptionJa: [
      "150〜300gsmの高品質コート紙を採用し、ビジュアルを鮮明に再現",
      "表紙のマットPPまたはグロスPP加工で、擦れや汚れを防止",
      "大部数のオフセット印刷からオンデマンド短納期印刷まで柔軟に対応"
    ],
    descriptionKo: [
      "150~300gsm 고급 양면 코팅 스노우/아트지로 생생한 컬러감과 정밀한 그래픽 구현",
      "고급스러운 무광 또는 화사한 유광 코팅으로 표지 스크래치와 오염 방지",
      "대량 옵셋 인쇄 및 소량 디지털 급행 인쇄 모두 최적화"
    ],
    descriptionTraits: [
      "smooth-base",
      "glossy-coat",
      "digital-precision"
    ],
    bestFor: [
      "Retail product catalogues, fashion lookbooks, and furniture collections",
      "Tourism guides, real estate development brochures, and showroom booklets",
      "Trade show hand-outs and grand opening marketing materials"
    ],
    bestForVi: [
      "Catalogue giới thiệu sản phẩm bán lẻ, thời trang, nội thất và gia dụng",
      "Cuốn cẩm nang du lịch, brochure giới thiệu dự án bất động sản và showroom",
      "Tài liệu quảng bá tại hội chợ triển lãm, sự kiện ra mắt sản phẩm mới"
    ],
    bestForZh: [
      "零售产品目录、时尚服饰Lookbook及家居建材画册",
      "文旅景区指南、房地产楼盘宣传册及展厅导览手册",
      "展会推广资料、招商推介会及新品发布会手册"
    ],
    bestForJa: [
      "商品カタログ、ファッションルックブック、家具・インテリアカタログ",
      "観光ガイドブック、不動産プロジェクトパンフレット、ショールーム案内",
      "展示会配布資料、新製品発表会プロモーション冊子"
    ],
    bestForKo: [
      "소매 제품 카탈로그, 패션 룩북, 가구 및 인테리어 제품집",
      "관광 가이드북, 부동산 분양 브로슈어 및 쇼룸 안내 책자",
      "박람회 배포용 홍보물, 사업설명회 및 신제품 런칭 자료"
    ],
    pureImage: "/images/product/catalogue-giayloaic.webp",
    pureImages: [
      "/images/product/catalogue-giayloaic.webp",
      "/images/product/catalogue-giayloaic2.webp",
      "/images/product/catalogue-giayloaic3.webp"
    ],
    hideFoilCheckbox: true,
    hideDoubleSidedCheckbox: true
  },
  {
    icon: "Square",
    name: "Type I Paper",
    nameVi: "Giấy loại I",
    nameZh: "白卡纸 I类",
    nameJa: "アイボリー紙（Iタイプ）",
    nameKo: "아이보리 I타입",
    tagline: "Desire an upscale catalogue with rigid density, sturdy cover structure, and executive feel?",
    taglineVi: "Bạn muốn catalogue cao cấp với bìa đanh cứng vượt trội, giữ dáng vuông vức và sang trọng?",
    taglineZh: "想要挺括硬实、封面质感厚重且能长期翻阅保存的白卡高档画册吗？",
    taglineJa: "抜群のコシと硬さがあり、しっかりとした重厚感を誇る高級アイボリーカタログですか？",
    taglineKo: "탄탄한 두께감과 뛰어난 내구성으로 고급스러운 형태를 유지하는 프리미엄 아이보리 카탈로그인가요?",
    description: [
      "Heavyweight 250-350gsm Ivory cardstock with compressed fiber density resisting edge curl",
      "Glossy coated front for rich imagery paired with natural uncoated interior feel",
      "Pairs impeccably with metallic foil stamping, embossing, and spot UV accents"
    ],
    descriptionVi: [
      "Giấy Ivory 250gsm - 350gsm cứng cáp, thớ giấy nén chặt cho cảm giác đầm tay và đứng dáng",
      "Mặt trước phủ bóng mịn in màu rực rỡ, mặt sau trắng ngà tự nhiên thấm mực tốt",
      "Đặc biệt thích hợp gia công ép kim logo, dập nổi họa tiết hoặc phủ UV định hình bìa ngoài"
    ],
    descriptionZh: [
      "选用250至350克高级白卡纸，纸芯紧实挺拔，抗折不易变形",
      "正面平滑覆膜展现品牌奢华质感，反面微粗糙吸墨性好",
      "极佳搭配烫金、凹凸压纹及局部UV工艺，尽显专业商务品质"
    ],
    descriptionJa: [
      "250〜350gsmの超高密度高級アイボリー紙を採用。折れ曲がりにくく重厚な手触り",
      "表面は美しい印刷、裏面は自然な風合いで上品な佇まい",
      "箔押し、エンボス加工、部分UVニス加工との相性が抜群"
    ],
    descriptionKo: [
      "250~350gsm 고평량 프리미엄 백색 보드지로 구김 없이 꼿꼿한 형태 유지력 제공",
      "앞면은 선명한 컬러 연출, 뒷면은 고급스러운 백색 톤으로 우아함 극대화",
      "금박/은박 후가공, 형압 엠보싱, 에폭시 부분 UV 가공과 결합 시 완성도 극대화"
    ],
    descriptionTraits: [
      "thick-weight",
      "smooth-base",
      "foil-accent"
    ],
    bestFor: [
      "Luxury real estate developments, 5-star resort portfolios, and corporate profiles",
      "Annual reports, institutional credentials, and high-end automotive lookbooks",
      "Fine jewelry catalogues, luxury watch collections, and architectural monographs"
    ],
    bestForVi: [
      "Catalogue dự án bất động sản cao cấp, resort nghỉ dưỡng và khách sạn 5 sao",
      "Hồ sơ năng lực công ty (Company Profile), kỷ yếu doanh nghiệp và báo cáo thường niên",
      "Sách giới thiệu bộ sưu tập trang sức, ô tô và thương hiệu cao cấp"
    ],
    bestForZh: [
      "高端地产楼盘精装画册、五星级度假酒店形象册及集团资质报告",
      "企业年度财报、招投标商务实力书及豪车名表典藏册",
      "珠宝首饰画册、高定时装专刊及建筑设计作品集"
    ],
    bestForJa: [
      "高級不動産、リゾートホテル、総合企業案内パンフレット",
      "年次アニュアルレポート、入札・プレゼン用会社案内、高級車カタログ",
      "ジュエリー、高級時計、建築デザイン作品集"
    ],
    bestForKo: [
      "하이엔드 주거 분양 카탈로그, 특급 리조트 안내 책자, 기업 지명원",
      "애뉴얼 리포트(연차보고서), 입찰 제안서 및 프리미엄 수입차 브로슈어",
      "파인 주얼리 컬렉션북, 명품 시계 도록, 건축 설계 포트폴리오"
    ],
    pureImage: "/images/product/catalogue-giayloaii.webp",
    pureImages: [
      "/images/product/catalogue-giayloaii.webp",
      "/images/product/catalogue-giayloaii2.webp",
      "/images/product/catalogue-giayloaii3.webp"
    ],
    hideFoilCheckbox: true,
    hideDoubleSidedCheckbox: true
  },
  {
    icon: "Sparkles",
    name: "Fine Art Paper",
    nameVi: "Giấy mỹ thuật",
    nameZh: "特种艺术纸",
    nameJa: "高級ファインペーパー",
    nameKo: "최고급 수입 명품지",
    tagline: "Desire an artisanal bespoke catalogue with rich tactile textures and luxury elegance?",
    taglineVi: "Bạn tìm kiếm cuốn catalogue nghệ thuật mang đẳng cấp xa xỉ với cảm xúc chạm gân sần độc bản?",
    taglineZh: "想要触感温润、带有自然微纹理或低调珠光，赋予品牌独特格调的艺术品级画册吗？",
    taglineJa: "手にした瞬間に伝わる特別な紙の質感と、他にはない唯一無二の気品を漂わせる高級画集・カタログですか？",
    taglineKo: "손끝에서 느껴지는 고급스러운 종이 결의 질감과 특별한 브랜드 가치를 전하는 명품 카탈로그인가요?",
    description: [
      "Imported luxury fine art stock featuring subtle tactile textures, pearlescent shimmer, or organic fibers",
      "Warm, tactile hand-feel that elevates corporate storytelling into a keepsake publication",
      "Harmonizes impeccably with rose gold/yellow gold foil stamping, letterpress, and blind debossing"
    ],
    descriptionVi: [
      "Giấy mỹ thuật nhập khẩu cao cấp với bề mặt gân sần tinh tế, ánh nhũ kim sa hoặc vân gỗ tự nhiên",
      "Chất giấy xốp đanh, thấm hút mực dịu mắt, toát lên vẻ đẹp mộc mạc mà xa xỉ",
      "Kết hợp hoàn hảo với kỹ thuật ép kim vàng/bạc, dập chìm không màu tạo điểm nhấn nhận diện"
    ],
    descriptionZh: [
      "欧洲进口特种艺术纸，纹理自然独特，纸张柔和温润",
      "吸墨雅致不反光，自带艺术纸张独有的厚重温度与收藏价值",
      "完美配合亮金/玫瑰金烫印、深压印及火漆封口等精致工艺"
    ],
    descriptionJa: [
      "厳選されたヨーロッパ直輸入のファインペーパー。織り目風や微細パールなど多彩な風合い",
      "手に触れた瞬間に伝わる温かみと上質感。ブランドの美意識を伝える最高峰の仕立て",
      "金箔押し・空押し（デボス加工）との組み合わせで圧倒的な気品を演出"
    ],
    descriptionKo: [
      "유럽 직수입 최고급 특수지로 독보적인 감성과 품격 있는 질감 연출",
      "자연스러운 촉감과 빛 반사 없는 우아한 발색으로 소장 가치 높은 책자 완성",
      "로즈골드/샴페인골드 박가공 및 입체 형압과 결합 시 럭셔리함의 정점"
    ],
    descriptionTraits: [
      "textured-art",
      "natural-grain",
      "foil-accent"
    ],
    bestFor: [
      "Haute couture fashion lookbooks, artisan jewelry, and interior design monographs",
      "Art gallery exhibition catalogues, museum archives, and cultural publications",
      "Diplomatic partner gifts, VIP annual keepsakes, and private collector portfolios"
    ],
    bestForVi: [
      "Lookbook thương hiệu thời trang cao cấp, trang sức thủ công và kiến trúc nội thất",
      "Catalogue phòng tranh nghệ thuật, bảo tàng và dự án văn hóa sáng tạo",
      "Ấn phẩm quà tặng đối tác ngoại giao, khách hàng VIP và sự kiện tri ấn cao cấp"
    ],
    bestForZh: [
      "高级定制服装、独立设计师珠宝及高端室内设计作品年鉴",
      "美术馆艺术展览图录、博物馆典藏图册及文化创意出版物",
      "核心战略合作伙伴答谢礼册、私人高端藏家专享资料"
    ],
    bestForJa: [
      "オートクチュール、高級ジュエリー、インテリアデザイン作品集",
      "アートギャラリー展覧会図録、美術館コレクションブック、学術記念誌",
      "VIP顧客向け限定ブックレット、記念式典特製ギフト出版物"
    ],
    bestForKo: [
      "디자이너 패션 룩북, 하이엔드 주얼리 도록, 고급 인테리어 사진집",
      "아트 갤러리 전시 도록, 박물관 소장품 도록 및 문화 예술 도서",
      "VIP 고객 헌정 도록, 기업 창립 특별 기념 책자"
    ],
    pureImage: "/images/product/catalogue-giaymythuat.webp",
    pureImages: [
      "/images/product/catalogue-giaymythuat.webp",
      "/images/product/catalogue-giaymythuat2.webp",
      "/images/product/catalogue-giaymythuat3.webp"
    ],
    hideFoilCheckbox: true,
    hideDoubleSidedCheckbox: true
  },
  {
    icon: "Feather",
    name: "Type F Paper",
    nameVi: "Giấy loại F",
    nameZh: "道林纸 F类",
    nameJa: "上質紙（Fタイプ）",
    nameKo: "모조지 F타입",
    tagline: "Want a natural uncoated catalogue with soft light diffusion, easy reading, and handwriting support?",
    taglineVi: "Bạn muốn catalogue ruột giấy mộc tự nhiên, thân thiện mắt đọc và dễ dàng viết ghi chú?",
    taglineZh: "需要温润无反光、文字阅读舒适且方便签字做笔记的道林纸手册？",
    taglineJa: "反射が少なく目に優しい、筆記性に優れた上質紙の冊子・マニュアルですか？",
    taglineKo: "눈부심 없는 자연스러운 질감으로 장시간 열람이 편하고 메모 작성이 쉬운 책자인가요?",
    description: [
      "Natural uncoated matte Ford paper (120-250gsm) offering soft light diffusion without harsh glare",
      "Optimal for text-heavy reading, technical documentation, and long-form reference materials",
      "High ink absorbency allows effortless handwriting, note-taking, stamping, and signatures"
    ],
    descriptionVi: [
      "Giấy Ford trắng hoặc kem tự nhiên 120gsm - 250gsm, khuếch tán ánh sáng dịu nhẹ",
      "Hoàn toàn không phản quang chói mắt dưới ánh đèn hay ánh nắng mặt trời",
      "Bề mặt thấm mực mượt mà, dễ dàng viết ghi chú, ký tên hoặc đóng dấu mộc"
    ],
    descriptionZh: [
      "120-250克天然高白/米黄道林纸，柔和漫反射光线，长时间阅读不疲劳",
      "无涂布纯质纸浆，特别适合文字密度大、规格参数多的技术参考手册",
      "墨水吸附力强，圆珠笔、钢笔均可流畅书写，盖印章不晕染"
    ],
    descriptionJa: [
      "120〜250gsmの非塗工上質紙。光を優しく拡散し長時間の閲覧でも目が疲れにくい",
      "テキスト量の多い仕様書、技術マニュアル、研修資料に最適",
      "優れたインク吸収性で、ボールペンや万年筆での書き込み・押印がスムーズ"
    ],
    descriptionKo: [
      "120~250gsm 무도공 모조지로 빛을 부드럽게 분산시켜 장시간 열람에도 눈의 피로 최소화",
      "텍스트와 도표 비중이 높은 기술 설명서, 매뉴얼, 교육 자료에 최적",
      "뛰어난 잉크 흡수력으로 볼펜 메모, 서명 날인 시 번짐 없이 깔끔함 유지"
    ],
    descriptionTraits: [
      "natural-grain",
      "soft-light",
      "eco-friendly"
    ],
    bestFor: [
      "Corporate training handbooks, operational manuals, and product spec sheets",
      "Academic conference proceedings, educational workbooks, and medical guidelines",
      "Eco-conscious and minimalist brands prioritizing authentic, glare-free reading"
    ],
    bestForVi: [
      "Cẩm nang đào tạo nội bộ, giáo trình đào tạo, sổ tay hướng dẫn kỹ thuật",
      "Catalogue tài liệu học thuật, sách hướng dẫn hội thảo và ấn phẩm y khoa",
      "Thương hiệu theo phong cách tối giản, vintage hoặc thân thiện môi trường"
    ],
    bestForZh: [
      "员工培训手册、操作规程指南、技术参数白皮书",
      "学术研讨会论文集、课程教育教材及医疗健康指南",
      "崇尚环保自然、极简质朴风格的品牌企业刊物"
    ],
    bestForJa: [
      "社員研修マニュアル、製品取扱説明書、技術仕様書",
      "学会資料集、セミナーワークブック、医療ガイドライン",
      "サステナブル・エコ志向のナチュラルブランド冊子"
    ],
    bestForKo: [
      "임직원 교육 매뉴얼, 작업 표준서, 기술 규격 자료집",
      "학술 세미나 자료집, 교육 교재, 의료 임상 가이드",
      "친환경 에코 브랜드 및 미니멀 내추럴 감성의 브랜드 가이드북"
    ],
    pureImage: "/images/product/catalogue-giayloaif.webp",
    pureImages: [
      "/images/product/catalogue-giayloaif.webp",
      "/images/product/catalogue-giayloaif2.webp",
      "/images/product/catalogue-giayloaif3.webp"
    ],
    hideFoilCheckbox: true,
    hideDoubleSidedCheckbox: true
  }
];

export const LABEL_MATERIALS: ProductOption[] = [
  {
    "icon": "Layers",
    "name": "Paper Decal Labels",
    "nameVi": "Nhãn decal giấy",
    "nameZh": "铜版纸不干胶贴纸",
    "nameJa": "上質紙・アート紙シール",
    "nameKo": "아트지 종이 데칼 라벨",
    "tagline": "Cost-effective self-adhesive label solution with sharp color fidelity and strong adhesion for dry packaging and boxes.",
    "taglineVi": "Giải pháp in tem nhãn dán tiết kiệm, bám dính chắc chắn và lên màu sắc nét cho bao bì hộp, chai lọ khô ráo.",
    "taglineZh": "经济实惠的自粘标签解决方案，色彩鲜艳，附着力强，适用于干燥包装盒与各类瓶罐。",
    "taglineJa": "コストパフォーマンスに優れ、鮮やかな発色と強力な粘着力で乾燥した商品パッケージや箱に最適な紙製シール。",
    "taglineKo": "선명한 인쇄 발색과 강력한 접착력을 자랑하는 경제적인 종이 스티커로 건조한 패키지 박스 및 용기에 이상적입니다.",
    "description": [
      "High-grade coated Couche or woodfree adhesive paper stock with strong, uniform pressure-sensitive glue backing",
      "Optional glossy or matte lamination overlay protects print against scratches and enhances visual contrast",
      "Precision die-cut or kiss-cut on sheets/rolls in any custom contour: circles, ovals, rectangles, or intricate shapes"
    ],
    "descriptionVi": [
      "Chất liệu decal giấy Couche hoặc Ford tráng phủ cao cấp, có sẵn lớp keo dán bám chắc mọi bề mặt phẳng",
      "Gia công cán màng bóng hoặc màng mờ bảo vệ mực in chống trầy xước và tăng tính thẩm mỹ",
      "Hỗ trợ bế đứt từng con hoặc bế demi theo mọi hình tròn, oval, vuông, elip và biên dạng theo yêu cầu"
    ],
    "descriptionZh": [
      "精选高白度铜版或道林不干胶材料，背胶强力均匀，贴合牢固不易脱落",
      "可覆光膜或哑膜保护层，有效防刮擦磨损，大幅提升产品视觉质感",
      "支持模切单张或半穿排版，圆形、方形、椭圆及异形轮廓均可高精度精密成型"
    ],
    "descriptionJa": [
      "高白色コート紙・上質紙タック紙を使用。強力で均一な粘着層があらゆる平滑面にしっかり密着",
      "グロス（光沢）またはマット（艶消し）PPラミネート加工により、耐擦過性と高級感を向上",
      "丸型、楕円、四角形、自由形状の型抜き（ハーフカット／全抜き）に高精度で対応"
    ],
    "descriptionKo": [
      "고품질 아트지 또는 모조지 스티커 원단으로 뒷면 점착력이 강력하고 균일하여 부착력이 우수합니다",
      "유광 또는 무광 라미네이팅 코팅을 적용하여 인쇄면 스크래치를 방지하고 시각적 완성도를 높입니다",
      "원형, 사각형, 타원형 및 자유로운 캐릭터 모양까지 정밀한 반칼(키스컷) 또는 완칼 도무송 지원"
    ],
    "descriptionTraits": [
      "smooth-base",
      "glossy-coat",
      "digital-precision"
    ],
    "bestFor": [
      "Labels for dry food packaging, confectionery, tea, coffee boxes, and pharmaceuticals",
      "Imported product supplementary labels, logistics barcodes, and QR code tracking stickers",
      "Gift box sealing stickers, paper cup logos, and branded takeout bags"
    ],
    "bestForVi": [
      "Tem nhãn dán bao bì thực phẩm khô, hộp bánh kẹo, trà, cà phê, dược phẩm",
      "Nhãn phụ hàng nhập khẩu, tem mã vạch barcode, QR code truy xuất nguồn gốc",
      "Sticker niêm phong hộp quà, logo dán ly giấy, túi giấy kraft thương hiệu"
    ],
    "bestForZh": [
      "干货食品包装、糕点糖果盒、茶叶咖啡罐及日常医药保健品标签",
      "进口商品中文背标、物流条形码、防伪追溯二维码贴纸",
      "礼品封口贴、纸杯及牛皮纸外卖袋品牌宣传标识贴"
    ],
    "bestForJa": [
      "乾燥食品パッケージ、製菓箱、紅茶・コーヒー豆キャニスター、医薬品ラベル",
      "輸入商品の日本語表示ラベル、商品管理バーコード、QRコード追跡シール",
      "ギフトボックス封かんシール、テイクアウト用ペーパーカップ＆紙袋ロゴシール"
    ],
    "bestForKo": [
      "건조 식품 패키지, 제과제빵 박스, 원두·티 패키지 및 의약외품 라벨",
      "수입 상품 한글 표기 스티커, 물류 바코드 및 QR코드 이력 추적 라벨",
      "선물 포장 봉인 스티커, 종이컵 및 배달 테이크아웃 쇼핑백 브랜드 스티커"
    ],
    "pureImage": "/images/product/decalgiay.webp",
    "pureImages": [
      "/images/product/decalgiay.webp",
      "/images/product/decalgiay2.webp",
      "/images/product/decalgiay3.webp"
    ]
  },
  {
    "icon": "Shield",
    "name": "Plastic / PVC Decal Labels",
    "nameVi": "Nhãn decal nhựa",
    "nameZh": "防水塑料不干胶标签",
    "nameJa": "ユポ・PVC耐水プラシール",
    "nameKo": "방수 플라스틱 데칼 라벨",
    "tagline": "100% waterproof and tear-proof synthetic film labels engineered for refrigerated, freezer, and cosmetic environments.",
    "taglineVi": "Kháng nước 100%, không rách, chịu môi trường tủ đông, ẩm ướt và hóa mỹ phẩm cao cấp.",
    "taglineZh": "100%防水抗撕裂塑料薄膜标签，专为冷藏冷冻、高湿及日化美妆环境定制。",
    "taglineJa": "100%完全防水・耐破断性を誇る合成樹脂ラベル。冷凍冷蔵、多湿環境や化粧品・日用品に最適。",
    "taglineKo": "100% 완전 방수 및 찢어짐 없는 플라스틱 필름 라벨로 냉장·냉동 보관 및 코스메틱 용기에 탁월합니다.",
    "description": [
      "Tear-proof synthetic PP, PVC, or clear/opaque film with permanent waterproof adhesive that never dissolves in moisture",
      "Withstands freezer temperatures down to -20°C and resists friction, oils, and chemical cosmetics",
      "Available in clear ultra-transparent film for seamless 'no-label' look or solid milky-white film for rich contrast"
    ],
    "descriptionVi": [
      "Chất liệu nhựa PP, PVC hoặc Decal sữa/trong suốt dẻo dai, chống thấm nước tuyệt đối và không bị rách rách khi xé",
      "Chịu được nhiệt độ lạnh sâu của tủ đông (-20°C) và môi trường cọ xát của chai lọ dầu gội, mỹ phẩm, nước ngọt",
      "Lựa chọn decal nhựa trong suốt nhìn thấu sản phẩm hoặc decal nhựa sữa hiển thị màu in trung thực rực rỡ"
    ],
    "descriptionZh": [
      "采用强韧PP、PVC或白墨透明合成膜，抗拉扯耐撕裂，遇水不褪色不脱胶",
      "耐受-20°C超低温冷冻及潮湿水浸，有效抵御洗护用品油脂及日化溶剂侵蚀",
      "提供通透无痕的超透膜或色泽饱满纯正的乳白膜，完美融入瓶身设计"
    ],
    "descriptionJa": [
      "耐水性・引き裂き強度に優れたPP・PVC・白PET・透明フィルムを採用。水濡れでも剥がれずふやけない",
      "-20℃の冷凍庫環境や結露、バスルームのシャンプー・コスメ油分にもしっかり耐える高性能",
      "中身が透けて見える高透明クリアフィルムと、発色が鮮やかな乳白フィルムから選択可能"
    ],
    "descriptionKo": [
      "질기고 견고한 PP·PVC 및 유포지·투명 필름 원단으로 수분에 젖거나 찢어지지 않는 완벽한 내구성",
      "영하 20°C 냉동실 및 결로 환경, 샴푸·화장품의 오일과 화학 성분에도 끄떡없는 강력 방수 점착",
      "용기 본연의 디자인을 살리는 고투명 원단 또는 쨍하고 선명한 발색의 백색 유포지 중 선택 가능"
    ],
    "descriptionTraits": [
      "waterproof-durability",
      "smooth-base",
      "glossy-coat"
    ],
    "bestFor": [
      "Chilled beverage bottles, beer, cold tea drinks, and frozen food packaging",
      "Shampoo, shower gel, skincare bottles, and bathroom cosmetic items",
      "Outdoor equipment, machinery compliance labels, and detergent containers"
    ],
    "bestForVi": [
      "Tem dán chai lọ nước ngọt, bia, trà sữa ướp lạnh, thực phẩm đông lạnh",
      "Nhãn dầu gội, sữa tắm, kem dưỡng da, mỹ phẩm tiếp xúc môi trường phòng tắm",
      "Tem ngoài trời, máy móc thiết bị chịu mưa nắng, hóa chất tẩy rửa"
    ],
    "bestForZh": [
      "冷藏饮品、冰镇啤酒、冷泡茶及速冻生鲜食品包装标签",
      "沐浴露、洗发水、护肤品及潮湿卫浴环境下的个人护理产品",
      "户外机械设备标贴、防水指示标签及日化清洁洗涤剂瓶身"
    ],
    "bestForJa": [
      "清涼飲料水ボトル、ビール、冷蔵チルドスイーツ、冷凍食品パッケージ",
      "シャンプー、ボディソープ、スキンケアコスメなど水回り用品ラベル",
      "屋外機器・精密機械の定格銘板、耐候性ステッカー、洗剤ボトル"
    ],
    "bestForKo": [
      "냉장 음료 페트병, 캔맥주, 콜드브루 커피 및 냉동 수산·정육 식품 라벨",
      "욕실에서 사용하는 샴푸, 바디워시, 기초 스킨케어 및 코스메틱 용기",
      "야외 노출 산업용 기기 라벨, 방수 주의 경고 스티커, 세제 용기"
    ],
    "pureImage": "/images/product/decalnhua.webp",
    "pureImages": [
      "/images/product/decalnhua.webp",
      "/images/product/decalnhua2.webp",
      "/images/product/decalnhua3.webp"
    ]
  },
  {
    "icon": "Leaf",
    "name": "Kraft Paper Decal Labels",
    "nameVi": "Nhãn decal giấy Kraft",
    "nameZh": "复古牛皮纸不干胶标签",
    "nameJa": "クラフト紙シール",
    "nameKo": "크라프트지 데칼 라벨",
    "tagline": "Rustic vintage brown paper with natural eco-friendly vibes, ideal for organic, handmade, and artisanal brands.",
    "taglineVi": "Chất giấy nâu mộc mạc cổ điển, thân thiện môi trường, tôn vinh thương hiệu handmade và organic.",
    "taglineZh": "质朴复古的自然棕褐色牛皮纸，天然环保质感，专为手作农品与有机有机品牌定制。",
    "taglineJa": "温かみのある素朴なブラウンクラフト地。環境配慮とヴィンテージ感を醸し出すオーガニック＆ハンドメイド向けシール。",
    "taglineKo": "따뜻하고 내추럴한 브라운 질감으로 친환경 감성과 오가닉·수제 핸드메이드 브랜드의 가치를 높여줍니다.",
    "description": [
      "Natural brown virgin kraft stock with authentic fibrous grain and strong permanent self-adhesive glue layer",
      "Distinctive vintage earthy tone communicates organic authenticity, zero-waste consciousness, and artisanal charm",
      "Exceptional print result with bold black or muted vintage colors, easily kiss-cut into circles, scalloped borders, or crests"
    ],
    "descriptionVi": [
      "Giấy Kraft nâu tự nhiên mộc mạc, độ dẻo dai tốt cùng lớp keo acrylic bám dính chắc chắn trên bề mặt giấy, thủy tinh, nhôm",
      "Màu sắc nâu hoài cổ đặc trưng tạo cảm giác thân thiện môi trường, an lành và giàu tính thủ công cao cấp",
      "In mực đen tối giản hoặc in màu sắc vintage sắc nét, hỗ trợ bế theo mọi khuôn dáng viền tròn, răng cưa độc đáo"
    ],
    "descriptionZh": [
      "原色木浆牛皮纸基材，纸纹自然质朴，配备高粘度压敏胶，牢固贴合纸盒、玻璃瓶与金属罐",
      "经典复古大地色系，传递天然、健康、环保与纯手工精心制作的品牌温度",
      "纯黑极简印刷或复古复色印刷表现出众，支持齿轮边、圆形、波浪边等各类个性化异形模切"
    ],
    "descriptionJa": [
      "未漂白の天然パルプを使用したクラフトタック紙。ガラス瓶、紙箱、アルミ缶に強く密着する高性能接着剤",
      "素材感あふれるナチュラルな茶色地が、サステナブル＆クラフトマンシップの温もりを演出",
      "モノクロ単色印刷やアースカラー印刷と好相性。波型やスカラップなどこだわりの抜き型にも柔軟対応"
    ],
    "descriptionKo": [
      "천연 펄프의 거친 결이 살아있는 브라운 크라프트 원단에 유리·종이·캔에 잘 붙는 강력 점착제 적용",
      "내추럴한 어반 빈티지 브라운 톤이 에코 프렌들리, 오가닉 푸드, 수제 명품의 진정성을 전달",
      "블랙 1도 미니멀 인쇄 및 빈티지 컬러 인쇄에 최적화되어 있으며 원형·물결 테두리 등 자유로운 톰슨 가공 가능"
    ],
    "descriptionTraits": [
      "natural-grain",
      "eco-friendly",
      "soft-light"
    ],
    "bestFor": [
      "Artisanal honey jars, organic nuts, aromatherapy candles, essential oils, and handmade soaps",
      "Specialty roasted coffee bags, dried herbal tea tins, and farm-fresh organic produce",
      "Kraft stand-up pouches, recycled gift packaging, and retro vintage craft products"
    ],
    "bestForVi": [
      "Nhãn dán hũ hạt dinh dưỡng, mật ong, tinh dầu, nến thơm handmade, xà bông thủ công",
      "Bao bì cà phê mộc rang xay, trà hoa thảo mộc, nông sản sạch organic",
      "Tem dán túi zip giấy kraft, hộp quà tặng tái chế và phong cách mộc mạc vintage"
    ],
    "bestForZh": [
      "手作蜂蜜罐、坚果零食瓶、香薰精油蜡烛、冷制手工皂标签",
      "精品单品手冲咖啡豆袋、花草草本茶罐、生态有机绿色农产品",
      "牛皮纸自立拉链袋、环保瓦楞礼品盒及复古文艺文创产品包装"
    ],
    "bestForJa": [
      "オーガニック蜂蜜、ナッツ・ドライフルーツ瓶、アロマキャンドル、手作り無添加石鹸",
      "自家焙煎スペシャルティコーヒー袋、ハーブティー缶、産直有機農産物",
      "クラフトジップスタンド袋、再生段ボールギフト箱、ヴィンテージ風雑貨"
    ],
    "bestForKo": [
      "수제 꿀병, 견과류 보틀, 아로마 캔들, 에센셜 오일, 천연 수제 비누",
      "스페셜티 로스팅 원두 파우치, 수제 허브차 틴케이스, 유기농 친환경 농산물",
      "크라프트 지퍼백, 재생지 선물 패키지 및 빈티지 레트로 감성 굿즈"
    ],
    "pureImage": "/images/product/decalgiaykraft.webp",
    "pureImages": [
      "/images/product/decalgiaykraft.webp",
      "/images/product/decalgiaykraft2.webp",
      "/images/product/decalgiaykraft3.webp"
    ]
  },
  {
    "icon": "Palette",
    "name": "Fine Art Paper Decal Labels",
    "nameVi": "Nhãn decal giấy mỹ thuật",
    "nameZh": "特种艺术纸质感标签",
    "nameJa": "高級アート紙ラベル",
    "nameKo": "고급 수입지 감성 라벨",
    "tagline": "Luxurious tactile textured paper with refined ink absorption, dedicated to fine wines, spirits, and luxury gifts.",
    "taglineVi": "Bề mặt vân sần sang trọng, thấm mực sâu tinh tế, đẳng cấp dành riêng cho rượu vang và quà tặng thượng hạng.",
    "taglineZh": "奢华细腻的艺术纹理纸面，吸墨温润雅致，专为高档红酒、烈酒及名贵礼品打造。",
    "taglineJa": "優雅なテクスチャーと風合い豊かな手触り。高級ワインやスピリッツ、極上ギフトに捧げる特抄アートラベル。",
    "taglineKo": "우아한 엠보 질감과 깊이 있는 잉크 발색으로 프리미엄 와인과 최고급 선물 패키지의 품격을 완성합니다.",
    "description": [
      "Imported luxury fine art labelstock featuring delicate felt markings, tactile laid textures, or pearlescent sheen",
      "Treated with barrier technology to withstand ice bucket immersion without wrinkling or detachment",
      "Flawlessly pairs with metallic hot foil stamping and 3D blind embossing for an unmistakable tactile prestige"
    ],
    "descriptionVi": [
      "Dòng giấy mỹ thuật nhập khẩu cao cấp có sẵn keo, bề mặt vân gân sần nhẹ hoặc ánh nhũ ngọc trai quý phái",
      "Được xử lý công nghệ chống hút ẩm chuyên dụng, giữ trọn vẻ đẹp trên vỏ chai ngay cả khi ướp đá trong xô lạnh",
      "Dễ dàng kết hợp kỹ thuật ép kim foil vàng/bạc, dập nổi 3D logo tạo điểm chạm xúc giác đẳng cấp thượng lưu"
    ],
    "descriptionZh": [
      "精选进口特种艺术纹理胶纸，表面具有独特布纹、云石纹或典雅珠光微闪",
      "特别加入抗湿防透处理，即便置于冰桶浸泡也能持久平整不脱层不泛白",
      "可与高精度烫金、击凸浮雕及局部微压纹工艺完美交融，尽显至臻奢华品味"
    ],
    "descriptionJa": [
      "輸入高級美術紙タックを採用。フェルトマークや繊細な凹凸テクスチャー、上品なパール感を備えた極上の風合い",
      "耐氷性・防湿処理が施され、ワインクーラーの氷水に浸しても浮きや剥がれを防ぐワイン専用仕様",
      "箔押し（ゴールド・シルバー）やエンボス（浮き出し）加工と美しく融合し、極上の触感美を実現"
    ],
    "descriptionKo": [
      "수입 프리미엄 특수 감성 라벨지로 섬세한 펠트 질감과 우아한 텍스처, 은은한 펄감의 고급스러운 외관",
      "특수 방습 발수 코팅 처리로 아이스 버킷 얼음물 속에서도 들뜸이나 변형 없이 원형 유지",
      "골드·실버 포일 박 인쇄 및 3D 엠보싱 형압 가공과 결합하여 압도적인 럭셔리 터치감 선사"
    ],
    "descriptionTraits": [
      "textured-art",
      "embossed-depth",
      "soft-light"
    ],
    "bestFor": [
      "Fine wines, champagne, single malt whisky, and premium tonic / herbal liquor bottles",
      "Boutique organic skincare, niche luxury perfumes, and high-end beauty serums",
      "Prestige Tet gift boxes, VIP sealed invitations, and ultra-premium loose-leaf tea canisters"
    ],
    "bestForVi": [
      "Nhãn chai rượu vang, rượu vang nổ sâm-panh, rượu mạnh whisky, rượu đông trùng hạ thảo",
      "Mỹ phẩm organic boutique, nước hoa niche cao cấp, tinh chất dưỡng da cao cấp",
      "Hộp quà tết thượng hạng, thiệp niêm phong thư tay VIP, trà thượng phẩm xuất khẩu"
    ],
    "bestForZh": [
      "名庄红酒、起泡香槟、单一麦芽威士忌及高端养生酒瓶身正背标",
      "小众有机精品护肤品、沙龙香水及高端院线精油包装",
      "奢华新年尊享礼盒、VIP封蜡印章请柬及特级私房茶叶礼罐"
    ],
    "bestForJa": [
      "高級ワイン、シャンパン、シングルモルトウイスキー、薬膳・薬用酒のメインラベル",
      "ブティックオーガニック化粧品、ニッチフレグランス香水、高機能美容液ボトル",
      "プレミアムお年賀・旧正月ギフトボックス、VIP招待状の封かん、特選高級茶筒"
    ],
    "bestForKo": [
      "프리미엄 와인, 샴페인, 싱글몰트 위스키 및 전통 증류주·담금주 라벨",
      "부티크 오가닉 스킨케어, 니치 향수 보틀, 최고급 앰플 에센스 라벨",
      "최고급 명절 VIP 선물세트, 프라이빗 초청장 봉인 씰, 프리미엄 잎차 패키지"
    ],
    "pureImage": "/images/product/decalgiaymythuat.webp",
    "pureImages": [
      "/images/product/decalgiaymythuat.webp",
      "/images/product/decalgiaymythuat2.webp",
      "/images/product/decalgiaymythuat3.webp"
    ]
  },
  {
    "icon": "Sparkles",
    "name": "Metallic Silver / Gold Decals",
    "nameVi": "Nhãn decal xi bạc/vàng",
    "nameZh": "拉丝金/哑银耐磨金属标签",
    "nameJa": "金・銀ホイル耐熱ラベル",
    "nameKo": "은데드롱 / 금광 데칼 라벨",
    "tagline": "Metallic mirror or brushed finish with high heat resistance, scratch protection, and rugged industrial durability.",
    "taglineVi": "Bề mặt ánh kim loại sang trọng, siêu bền chịu nhiệt, chống trầy xước và bám dính cực tốt trên máy móc, linh kiện.",
    "taglineZh": "奢华金属光泽，耐高温耐腐蚀抗刮擦，对电子电器与机械设备表面附着力极佳。",
    "taglineJa": "メタリックな輝きとヘアライン質感。耐熱・耐油・耐摩耗性に優れ、工業機器や銘板に最適な高耐久シール。",
    "taglineKo": "빛나는 메탈릭 질감과 뛰어난 내열성·내스크래치성으로 산업 기기 및 전자 부품에 강력 밀착되는 메탈 데칼.",
    "description": [
      "Premium metallized polyester film (matte silver, brushed silver, or lustrous gold) with industrial-strength adhesive",
      "Outstanding heat resistance up to 120°C, resistant to oils, chemicals, and weathering without corrosion",
      "High-definition UV printing ensures crisp micro-text, barcodes, and logos that never fade or rub off"
    ],
    "descriptionVi": [
      "Chất liệu decal xi bạc (bạc mờ/bạc bóng) hoặc xi vàng ánh kim tuyến sang trọng, đế phủ kim loại bền bỉ",
      "Khả năng chịu nhiệt độ cao lên tới 120°C, kháng dầu mỡ, hóa chất công nghiệp và không bị oxy hóa rỉ sét",
      "Bề mặt in phủ UV sắc sảo, chống trôi mực, chống bay màu tuyệt đối qua nhiều năm sử dụng"
    ],
    "descriptionZh": [
      "优质金属化PET聚酯材料（哑银、拉丝银或镜面金色），工业级背胶极强粘合",
      "耐温高达120°C，耐机油、耐溶剂、耐摩擦刮擦，抗氧化永不生锈",
      "UV精细印刷，微型铭牌参数、条形码及企业Logo清晰坚固，历久弥新"
    ],
    "descriptionJa": [
      "シルバー（消し銀／銀ツヤ）およびゴールドの金属蒸着PETフィルム。強力な工業用粘着剤で金属・樹脂に固着",
      "最高120℃の耐熱性を持ち、油分、薬品、経年劣化に強く、長期間屋外でも錆びや劣化を防止",
      "UVインクによる高精細印刷で、微小文字やバーコードもかすれず半永久的な耐摩耗性を保持"
    ],
    "descriptionKo": [
      "은무광(은데드롱) 및 금광 메탈릭 PET 필름으로 공업용 초강력 점착제가 도포되어 금속·플라스틱에 영구 밀착",
      "최대 120°C의 고온 내열성과 내유성·내화학성을 갖추어 부식이나 변색 없이 오랜 기간 원형 보존",
      "선명한 고화질 UV 인쇄로 미세 텍스트 규격표, 바코드, 인증 마크가 지워지지 않고 영구 지속"
    ],
    "descriptionTraits": [
      "metallic-shine",
      "foil-accent",
      "waterproof-durability"
    ],
    "bestFor": [
      "Technical specification plates, serial number rating labels for electronics, laptops, and machinery",
      "Warranty tamper inspection seals, factory QC passed stickers, and export compliance labels",
      "Luxury emblem stickers for high-end gift boxes, cosmetics, and imported liquor caps"
    ],
    "bestForVi": [
      "Tem thông số kỹ thuật, tem model máy móc, thiết bị điện tử, laptop, camera",
      "Nhãn niêm phong bảo hành máy móc, tem kiểm định chất lượng xuất khẩu",
      "Nhãn logo dán nắp hộp quà cao cấp, mỹ phẩm xa xỉ, chai rượu ngoại nhập khẩu"
    ],
    "bestForZh": [
      "电子数码、家用电器、机械设备及笔记本电脑的规格参数与序列号铭牌",
      "出厂检验合格证、防拆保修封口贴及出口合规检验认证标签",
      "高端礼品盒金属车标贴、奢华化妆品瓶盖及高端洋酒防伪标签"
    ],
    "bestForJa": [
      "家電製品、電子機器、ノートPC、産業機械の仕様プレート・シリアル番号銘板ラベル",
      "品質検査合格証、機器メンテナンス点検シール、輸出用安全基準マーク",
      "高級化粧品キャップ、プレミアムギフト箱のメタリックロゴ、輸入酒ボトル"
    ],
    "bestForKo": [
      "전자기기, 가전제품, 노트북, 산업용 모터의 규격 사양판 및 시리얼 번호 명판 라벨",
      "공장 QC 검사 필증, A/S 보증 봉인 라벨, 해외 수출 규격 인증 마크",
      "프리미엄 기프트 박스 메탈 엠블럼, 럭셔리 코스메틱 캡 및 고급 양주 씰"
    ],
    "pureImage": "/images/product/decalxibac.webp",
    "pureImages": [
      "/images/product/decalxibac.webp",
      "/images/product/decalxibac2.webp",
      "/images/product/decalxibac3.webp"
    ]
  }
];

export const SUBGROUPS_CATALOG: SubgroupCategory[] = [
  {
      "id": "poster-bangron-standee",
      "categoryId": "marketing",
      "titleVi": "Poster - Băng rôn - Standee",
      "titleEn": "Posters - Banners - Standees",
      "titleZh": "海报 - 横幅 - 展架",
      "titleJa": "ポスター・横断幕・スタンド看板",
      "titleKo": "포스터 - 현수막 - 배너거치대",
      "descriptionVi": "Giải pháp in ấn quảng cáo khổ lớn, sự kiện, showroom và truyền thông trực quan ngoài trời lẫn trong nhà.",
      "descriptionEn": "Large-format advertising prints, event displays, showroom decor, and indoor/outdoor visual signage.",
      "coverImage": "/images/category/poster-bangron-standee.webp",
      "shapes": [
          {
              "id": "decal-kho-lon",
              "nameVi": "Decal Khổ Lớn",
              "nameEn": "Large Format Vinyl Decals",
              "nameZh": "大幅面车贴/背胶",
              "nameJa": "大判インクジェットステッカー",
              "nameKo": "대형 실사출력 데칼 시트지",
              "descriptionVi": "In decal khổ lớn dán kính mặt tiền, tường showroom, xe tải và vách ngăn sự kiện.",
              "descriptionEn": "Large-format adhesive vinyl graphics for glass storefronts, vehicle wraps, and event backdrops.",
              "image": "/images/category/decalkholon.webp",
              "badgeVi": "Khổ lớn",
              "badgeEn": "Large Format"
          },
          {
              "id": "pp-boi-format",
              "nameVi": "PP bồi Format",
              "nameEn": "PP Mounted on Foam Board",
              "nameZh": "PP背胶裱雪弗板",
              "nameJa": "PPスチレンボード貼り",
              "nameKo": "폼보드 합지 PP 실사출력",
              "descriptionVi": "In PP sắc nét cán bồi tấm formex cứng cáp 3mm - 5mm làm Standee đứng, bảng thông báo, bảng trao giải.",
              "descriptionEn": "High-res PP print laminated onto rigid 3mm-5mm foam board for standees, promo signs, and presentation checks.",
              "image": "/images/category/ppboiformat.webp",
              "badgeVi": "Standee cứng",
              "badgeEn": "Rigid Standee"
          },
          {
              "id": "hashtag-cam-tay",
              "nameVi": "Hashtag cầm tay",
              "nameEn": "Handheld Event Hashtags",
              "nameZh": "手持拍照手牌",
              "nameJa": "手持ちフォトプロップス",
              "nameKo": "핸드헬드 촬영 해시태그 피켓",
              "descriptionVi": "Biển chụp hình check-in sự kiện, tiệc cưới, sinh nhật, hội thảo bế theo hình dáng thiết kế.",
              "descriptionEn": "Custom-shaped photo props for corporate galas, weddings, product launches, and birthdays.",
              "image": "/images/category/hashtagcamtay.webp",
              "badgeVi": "Check-in",
              "badgeEn": "Photo Prop"
          },
          {
              "id": "hashtag-tay-cam-roi",
              "nameVi": "Hashtag tay cầm rời",
              "nameEn": "Detachable Handle Hashtags",
              "nameZh": "可拆卸手柄手牌",
              "nameJa": "持ち手分離型フォトプロップス",
              "nameKo": "분리형 손잡이 해시태그 피켓",
              "descriptionVi": "Quy cách cán rời gắn khớp tiện tháo lắp, đóng gói gọn gàng vận chuyển đường dài không lo gãy.",
              "descriptionEn": "Hashtag signs with snap-on detachable handles, easy to pack flat and ship nationwide without breakage.",
              "image": "/images/category/hashtagtaycamroi.webp",
              "badgeVi": "Tiện đóng gói",
              "badgeEn": "Flat-Pack"
          },
          {
              "id": "bang-treo",
              "nameVi": "Bảng treo",
              "nameEn": "Hanging Boards & Wobblers",
              "nameZh": "超市促销吊牌/吊旗",
              "nameJa": "POP吊り下げボード",
              "nameKo": "매장 천장 행잉 배너 / 보드",
              "descriptionVi": "Bảng treo trần siêu thị, hanger quảng cáo tại quầy kệ thu hút ánh nhìn khách hàng từ xa.",
              "descriptionEn": "Eye-catching overhead hanging signs and point-of-sale wobblers for retail aisles and supermarket displays.",
              "image": "/images/category/bangtreo.webp",
              "badgeVi": "POSM",
              "badgeEn": "Point of Sale"
          },
          {
              "id": "tranh-canvas",
              "nameVi": "Tranh Canvas chất lượng cao",
              "nameEn": "High-Quality Canvas Prints",
              "nameZh": "高端油画微喷Canvas",
              "nameJa": "高精細キャンバスプリント",
              "nameKo": "최고급 캔버스 아트 액자",
              "descriptionVi": "In tranh canvas vải bố dệt nghệ thuật bồi căng khung gỗ hoặc khung composite sang trọng cho không gian sống và showroom.",
              "descriptionEn": "High-resolution fine art canvas prints stretched on wooden stretcher bars or floating frames for home and office gallery displays.",
              "image": "/images/product/canvascotton.webp",
              "badgeVi": "Nghệ thuật",
              "badgeEn": "Fine Art",
              "materials": [
                  {
                      "icon": "Palette",
                      "name": "Korean Art Canvas (Wooden Frame)",
                      "nameVi": "Canvas Hàn Quốc (Khung Gỗ)",
                      "tagline": "Gallery-quality wall canvas to elevate living spaces",
                      "taglineVi": "Tranh canvas chất lượng phòng tranh làm đẹp không gian sống",
                      "description": [
                          "Imported Korean cotton canvas with natural woven texture",
                          "UV eco-solvent inks offer vibrant color and 10+ year fade resistance",
                          "Stretched over solid kiln-dried pine wood frame ready to hang"
                      ],
                      "descriptionVi": [
                          "Vải canvas cotton Hàn Quốc có vân dệt vải tự nhiên",
                          "Mực in UV sắc nét, kháng nước, bền màu trên 10 năm",
                          "Căng khung gỗ thông tự nhiên đã qua sấy chống mối mọt"
                      ],
                      "descriptionTraits": [
                          "textured-art",
                          "waterproof-durability",
                          "soft-light"
                      ],
                      "bestFor": [
                          "Family portraits and wedding wall photos",
                          "Living room, bedroom and home office decoration",
                          "Housewarming and anniversary gifts"
                      ],
                      "bestForVi": [
                          "Ảnh gia đình, ảnh cưới phóng lớn trang trí phòng khách",
                          "Tranh trang trí phòng ngủ, góc làm việc cá nhân",
                          "Quà tặng tân gia, sinh nhật, kỷ niệm đầy ý nghĩa"
                      ],
                      "nameZh": "韩国精编油画布（实木内框）",
                      "nameJa": "韓国製アートキャンバス（天然木枠）",
                      "nameKo": "한국산 고급 캔버스 (원목 프레임)",
                      "taglineZh": "需要一幅微喷色彩准确、画布紧绷且长年不褪色的艺术挂画？",
                      "taglineJa": "発色が美しく、耐久性に優れた本格的なキャンバスアートをお探しですか？",
                      "taglineKo": "오랜 시간 변색 없이 갤러리 수준의 감동을 전할 캔버스 액자인가요?",
                      "descriptionZh": [
                          "高密度特制艺术油画布，搭配烘干防虫防蛀实木内框",
                          "高精度12色艺术微喷，耐紫外线室内长年不褪色",
                          "四周包边立体装裱，免外框直接悬挂，现代极简立体感"
                      ],
                      "descriptionJa": [
                          "高密度な韓国製アートキャンバスと、防湿・防虫処理済みの天然木枠",
                          "12色高精細ジークレープリントで、紫外線に強く色褪せない耐久性",
                          "側面まで印刷を巻き込むギャラリーラップ仕様で、額縁なしでそのまま飾れる"
                      ],
                      "descriptionKo": [
                          "한국산 프리미엄 고밀도 캔버스 원단과 건조 원목 내장 프레임",
                          "12색 초정밀 지클리 피그먼트 출력으로 실내 영구 보존 및 자외선 변색 방지",
                          "옆면까지 입체감 있게 감싸는 갤러리 랩 마감으로 프레임 없이 바로 거치"
                      ],
                      "bestForZh": [
                          "现代家居客厅、卧室背景墙艺术装饰挂画",
                          "精品酒店客房、高级餐厅与咖啡馆空间氛围营造",
                          "婚纱照、家庭写真大片与个人艺术肖像陈列"
                      ],
                      "bestForJa": [
                          "モダンリビング、ベッドルーム、オフィスのインテリアアート",
                          "ホテル客室、カフェ、高級サロンの空間演出",
                          "ウェディング写真、家族写真、アート写真のディスプレイ"
                      ],
                      "bestForKo": [
                          "모던 거실, 침실 침대 헤드 벽면 인테리어 액자",
                          "호텔 객실, 카페, 프라이빗 뷰티 살롱 벽면 데코",
                          "대형 웨딩 본식 사진, 가족 기념사진 및 아티스틱 프로필 캔버스"
                      ],
                      "hideFoilCheckbox": true,
                      "hideDoubleSidedCheckbox": true,
                      "pureImage": "/images/product/canvascotton.webp",
                      "pureImages": [
                          "/images/product/canvascotton.webp",
                          "/images/product/canvascotton2.webp",
                          "/images/product/canvascotton3.webp"
                      ]
                  },
                  {
                      "icon": "Sparkles",
                      "name": "Glitter Shimmer Canvas",
                      "nameVi": "Canvas Ánh Kim Tuyến",
                      "tagline": "Subtle shimmering canvas for dazzling art pieces",
                      "taglineVi": "Vải canvas phủ kim tuyến lấp lánh nhẹ nhàng dưới ánh đèn",
                      "description": [
                          "Fine glitter particles woven into canvas surface catch ambient light",
                          "High-definition 1200 DPI printing for crisp facial and landscape details",
                          "Complete with composite floating frame in gold, black, or natural wood"
                      ],
                      "descriptionVi": [
                          "Bề mặt phủ lớp kim tuyến mịn bắt sáng lấp lánh khi có ánh đèn",
                          "Độ phân giải in 1200 DPI tái tạo chân thực từng chi tiết ảnh",
                          "Kèm khung viền composite cao cấp (màu vàng đồng, đen hoặc vân gỗ)"
                      ],
                      "descriptionTraits": [
                          "metallic-shine",
                          "textured-art",
                          "waterproof-durability"
                      ],
                      "bestFor": [
                          "Glamour wedding and personal portrait prints",
                          "Modern interior statement art pieces",
                          "Luxury commemorative gifts"
                      ],
                      "bestForVi": [
                          "Ảnh cưới nghệ thuật và ảnh chân dung cá nhân phong cách sang trọng",
                          "Tranh nghệ thuật trang trí căn hộ cao cấp",
                          "Quà tặng lưu niệm đẳng cấp cho bạn bè và người thân"
                      ],
                      "nameZh": "璀璨金葱闪粉艺术油画布",
                      "nameJa": "ラメ入りキラキラキャンバス",
                      "nameKo": "글리터 펄 캔버스 아트",
                      "taglineZh": "画面在灯光照射下散发若隐若现的微光星尘效果？",
                      "taglineJa": "光を受けるとキラキラと上品に輝く特別なキャンバスですか？",
                      "taglineKo": "빛을 받으면 캔버스 표면에서 은은한 반짝임이 살아나는 액자극인가요?",
                      "descriptionZh": [
                          "画布织物表层嵌入细腻闪粉微粒，灯光照射下波光粼粼",
                          "赋予夜景、星空、婚纱与珠宝画面神秘梦幻的立体微光",
                          "防水抗污涂层保护，即使潮湿天气依然亮丽生辉"
                      ],
                      "descriptionJa": [
                          "キャンバス生地に繊細なラメ粒子を織り込み、光を受けると上品に輝く",
                          "夜景、星空、ウェディングドレス、宝石の煌めきをドラマチックに演出",
                          "防汚・防湿コーティングで、美しい輝きを長期間キープ"
                      ],
                      "descriptionKo": [
                          "캔버스 직물 표면에 미세한 글리터 펄 입자가 분사되어 빛에 따라 반짝임",
                          "야경, 은하수, 순백의 웨딩드레스 사진에 신비롭고 몽환적인 감성 극대화",
                          "방수 방습 코팅 처리로 습한 날씨에도 펄과 색감이 영구 보존"
                      ],
                      "bestForZh": [
                          "璀璨夜景摄影、银河星空与唯美婚纱摄影作品",
                          "高端美妆SPA、珠宝展厅及奢华会所空间艺术陈设",
                          "追求与众不同梦幻光影效果的艺术爱好者"
                      ],
                      "bestForJa": [
                          "夜景写真、天体写真、華やかなウェディングフォト",
                          "ジュエリーサロン、エステサロン、ラグジュアリーラウンジ",
                          "個性的な輝きと幻想的な空間を演出したいインテリア"
                      ],
                      "bestForKo": [
                          "도시 야경 사진, 환상적인 별자리 및 은하수 풍경 사진",
                          "웨딩 화보의 반짝이는 베일과 드레스 디테일 강조 액자",
                          "주얼리 쇼룸, 프리미엄 뷰티 샵의 감각적인 오브제"
                      ],
                      "hideFoilCheckbox": true,
                      "hideDoubleSidedCheckbox": true,
                      "pureImage": "/images/product/vaikimtuyen.webp",
                      "pureImages": [
                          "/images/product/vaikimtuyen.webp",
                          "/images/product/canvaskimtuyen2.webp",
                          "/images/product/canvaskimtuyen3.webp"
                      ]
                  },
                  {
                      "icon": "Palette",
                      "name": "Artistic Canvas Fabric",
                      "nameVi": "Vải Canvas Cotton nghệ thuật",
                      "tagline": "Woven cotton-poly canvas for fine art wall décor and premium displays",
                      "taglineVi": "Vải bố dệt nghệ thuật sần nổi cao cấp chuyên in tranh trang trí không gian",
                      "description": [
                          "Authentic canvas weave creates an elegant artistic oil-painting texture",
                          "Vibrant UV-cured pigment inks resist fading for over 5 years indoors",
                          "Mounted seamlessly on composite floating frames or solid wood stretcher bars"
                      ],
                      "descriptionVi": [
                          "Vân vải dệt mộc sần tạo chiều sâu nghệ thuật như tranh sơn dầu",
                          "Mực in UV sắc nét bền màu hơn 5 năm trong không gian nội thất",
                          "Căng khung composite hoặc khung gỗ thông tự nhiên sang trọng"
                      ],
                      "descriptionTraits": [
                          "textured-art",
                          "soft-light",
                          "eco-friendly"
                      ],
                      "bestFor": [
                          "Living room art, hotel suites, wedding portrait canvases, cafe décor"
                      ],
                      "bestForVi": [
                          "Tranh treo phòng khách, khách sạn, tranh cưới canvas, quán cafe"
                      ],
                      "pureImage": "/images/product/anhtreotuong.webp",
                      "pureImages": [
                          "/images/product/canvascotton.webp",
                          "/images/product/canvascotton2.webp",
                          "/images/product/canvascotton3.webp"
                      ],
                      "nameZh": "高档艺术油画布 (Cotton)",
                      "nameJa": "高品質アートキャンバス布",
                      "nameKo": "고급 아티스틱 캔버스 패브릭",
                      "taglineZh": "寻找富有天然织物凹凸肌理感、微喷质感如同古典油画的高端艺术画布吗？",
                      "taglineJa": "本物の油絵のような織り目と凹凸感を持ち、インテリアを格上げする本格キャンバス生地ですか？",
                      "taglineKo": "실제 유화 캔버스처럼 입체적인 직물 질감으로 공간의 품격을 높여주는 아트 패브릭인가요?",
                      "descriptionZh": [
                          "纯正原织棉麻混纺肌理，粗粝自然的凹凸织纹营造油画般深邃艺术层次",
                          "采用环保UV颜料微喷，色彩沉稳饱满，室内抗紫外线褪色持久长达5年以上",
                          "可紧密绷装于实木内框或无缝嵌入金属/PS复合悬浮外框中，立体典雅"
                      ],
                      "descriptionJa": [
                          "自然なコットン織り目の凹凸感が、まるで本物の油絵画のような深みと陰影を生み出す",
                          "高精細UVピグメントインクを使用し、退色に強く屋内で5年以上の鮮やかな発色を維持",
                          "乾燥天然木枠へのタイトなキャンバス張りや、フロートフレーム額装に美しく対応"
                      ],
                      "descriptionKo": [
                          "천연 코튼 혼방 고유의 도톰한 직조 결이 살아있어 유화 작품처럼 깊이 있는 예술적 질감",
                          "친환경 프리미엄 UV 피그먼트 출력으로 실내 5년 이상 변색 없는 뛰어난 보존성",
                          "원목 스트레쳐 바에 단단하게 당겨 씌우거나 모던 알루미늄 플로팅 프레임과 완벽 결합"
                      ],
                      "bestForZh": [
                          "客厅卧室背景墙装饰画、高端星级酒店客房挂画、艺术婚纱写真及咖啡馆陈列"
                      ],
                      "bestForJa": [
                          "リビング・寝室のアートパネル、ホテル客室の壁掛け写真、ブライダル記念額装、カフェの壁面装飾"
                      ],
                      "bestForKo": [
                          "거실 및 침실 인테리어 아트 액자, 고급 호텔 객실 갤러리 랩, 웨딩 본식 액자, 카페 감성 벽면"
                      ]
                  }
              ]
          }
      ],
      "materials": [
          {
              "icon": "Layers",
              "name": "PP Film (Polypropylene)",
              "nameVi": "Poster chất liệu PP",
              "tagline": "High-resolution PP synthetic paper for indoor posters and roll-up banners",
              "taglineVi": "Giấy nhựa PP tổng hợp láng mịn, in độ phân giải cao cho poster trong nhà và standee cuộn",
              "description": [
                  "Super-smooth synthetic paper base with zero visible paper fibers",
                  "Rich, high-density color reproduction for photo-realistic graphics",
                  "Coated with protective matte or glossy lamination against scratches"
              ],
              "descriptionVi": [
                  "Bề mặt giấy nhựa tổng hợp siêu mịn, không lộ xơ giấy",
                  "Tái tạo màu sắc chân thực chuẩn sắc nét đến từng chi tiết ảnh",
                  "Cán màng mờ hoặc màng bóng bảo vệ bề mặt chống trầy xước nước nhẹ"
              ],
              "descriptionTraits": [
                  "smooth-base",
                  "digital-precision",
                  "glossy-coat"
              ],
              "bestFor": [
                  "Indoor event roll-up banners, cinema posters, showroom displays"
              ],
              "bestForVi": [
                  "Standee cuộn sự kiện, poster rạp chiếu phim, biển quảng cáo showroom"
              ],
              "pureImage": "/images/product/posterchatlieupp.webp",
              "pureImages": [
                  "/images/product/posterchatlieupp.webp",
                  "/images/product/posterchatlieupp2.webp",
                  "/images/product/posterchatlieupp3.webp"
              ],
              "nameZh": "PP合成纸海报 (Polypropylene)",
              "nameJa": "PP合成紙ポスター（ポリプロピレン）",
              "nameKo": "PP 합성지 포스터 (롤업 배너용)",
              "taglineZh": "需要平滑细腻、微喷色彩饱和且适用于室内易拉宝与海报的优质PP纸吗？",
              "taglineJa": "紙の繊維がなく高精細、屋内のロールアップバナーやポスターに最適なPP合成紙をお探しですか？",
              "taglineKo": "종이 결 없이 매끄럽고 발색이 선명하여 실내 롤업 배너 및 포스터에 최적인 PP 합성지인가요?",
              "descriptionZh": [
                  "超平滑高分子聚丙烯基材，纸面细腻无任何可见纸张纤维",
                  "高密度12色微喷写真输出，真实还原照片级细腻画质与艳丽色彩",
                  "表面覆盖高透明哑膜或光膜，防刮擦防轻微泼水，卷曲不易变形"
              ],
              "descriptionJa": [
                  "超平滑なポリプロピレン基材で、紙の繊維感がなく極めて滑らかな表面",
                  "高密度・高精細カラー出力により、写真のような忠実な色彩再現性を実現",
                  "マットまたは光沢PPラミネート加工で表面を保護し、擦れや水滴を防ぐ"
              ],
              "descriptionKo": [
                  "초평활 합성 수지 원단으로 종이 섬유 결 없이 매끄러운 프리미엄 표면",
                  "고밀도 컬러 출력으로 사진 수준의 선명하고 깊이 있는 색감 완벽 구현",
                  "표면 무광/유광 코팅으로 스크래치와 생활 방수를 방지하며 컬링 현상 억제"
              ],
              "bestForZh": [
                  "室内活动易拉宝、商场促销海报、影院立牌及高端展厅背景陈列"
              ],
              "bestForJa": [
                  "屋内イベント用ロールアップバナー、映画館ポスター、ショールーム展示看板"
              ],
              "bestForKo": [
                  "실내 행사 롤업 배너, 영화관 포스터, 쇼룸 홍보 디스플레이 및 백드롭"
              ]
          },
          {
              "icon": "Shield",
              "name": "Hiflex PVC Banner",
              "nameVi": "Băng rôn Hiflex",
              "tagline": "Durable waterproof PVC vinyl for large outdoor banners and hoardings",
              "taglineVi": "Bạt PVC dẻo dai chống thấm nước 100%, chịu mưa nắng chuyên cho băng rôn ngoài trời",
              "description": [
                  "Reinforced PVC fabric withstands heavy rain, direct sunlight, and wind",
                  "Most economical solution for large-scale outdoor visibility",
                  "Finished with reinforced hemmed edges and brass eyelets for easy hanging"
              ],
              "descriptionVi": [
                  "Chất liệu bạt PVC cốt sợi chịu lực tốt trước nắng gắt và mưa bão",
                  "Giải pháp tiết kiệm ngân sách nhất cho quảng cáo diện rộng ngoài trời",
                  "Hoàn thiện gấp mép dán gia cường và đóng khoen nhôm tiện xỏ dây treo"
              ],
              "descriptionTraits": [
                  "waterproof-durability",
                  "thick-weight"
              ],
              "bestFor": [
                  "Street banners, construction fences, grand opening announcements"
              ],
              "bestForVi": [
                  "Băng rôn ngang đường, hàng rào công trình, banner khai trương cửa hàng"
              ],
              "pureImage": "/images/product/bangronhiflex.webp",
              "pureImages": [
                  "/images/product/bangronhiflex.webp",
                  "/images/product/bangronhiflex2.webp",
                  "/images/product/bangronhiflex3.webp"
              ],
              "nameZh": "Hiflex户外防雨防晒喷绘布 (PVC Banner)",
              "nameJa": "ターポリン・ハイフレックス屋外横断幕 (PVC)",
              "nameKo": "하이플렉스 대형 옥외 현수막 (방수 PVC)",
              "taglineZh": "需要坚韧耐撕裂、100%防水防风、适合大面积户外广告的高性价比喷绘布吗？",
              "taglineJa": "強風や雨天にも耐え、100%完全防水で長期の屋外掲示に耐える高コスパ幕をお探しですか？",
              "taglineKo": "비바람과 자외선에 강하고 100% 완전 방수로 장기간 옥외 홍보에 최적인 실속형 현수막인가요?",
              "descriptionZh": [
                  "内夹高强聚酯纤维网层，抗拉力极强，抵御户外强风、暴雨与烈日暴晒",
                  "大面积户外品牌宣传最具成本效益的解决方案，视认距离远",
                  "四周热合加厚折边工艺，压铆高强度金属打孔扣眼，方便拉绳悬挂"
              ],
              "descriptionJa": [
                  "ポリエステル繊維補強のPVC素材で、強風・豪雨・直射日光に耐える高耐久仕様",
                  "広範囲の屋外広告において最もコストパフォーマンスに優れた実力派",
                  "周囲を折り返して補強溶着し、ハトメ（真鍮穴）加工済みで簡単にロープ結束可能"
              ],
              "descriptionKo": [
                  "폴리에스터 메쉬 보강 PVC 원단으로 거센 바람과 폭우, 자외선에도 끄떡없는 내구성",
                  "대형 옥외 광고 및 거리 홍보물 중 가장 경제적이고 확실한 시인성 제공",
                  "사방 미싱/열접착 보강 및 아일렛(금속 구멍) 펀칭으로 로프 결속 용이"
              ],
              "bestForZh": [
                  "过街横幅、建筑工地安全围挡广告、开业庆典及展会户外巨幅宣传"
              ],
              "bestForJa": [
                  "道路横断幕、工事現場の仮囲いシート、店舗オープニング垂れ幕、屋外イベント"
              ],
              "bestForKo": [
                  "거리 현수막, 공사 현장 펜스 배너, 매장 오픈 축하 대형 현수막, 옥외 홍보"
              ]
          },
          {
              "icon": "Eye",
              "name": "One-Way Perforated Vinyl",
              "nameVi": "Decal Lưới",
              "tagline": "Micro-perforated one-way window film for exterior advertising with internal see-through",
              "taglineVi": "Decal đục lỗ li ti nhìn 1 chiều dán kính showroom (bên trong nhìn ra thấy, bên ngoài thấy tranh)",
              "description": [
                  "Micro-holes allow 40% light transmittance without blocking outdoor view from inside",
                  "Displays full-color vibrant branding to passersby outside the window",
                  "Blocks harsh sunlight and reduces interior heat"
              ],
              "descriptionVi": [
                  "Các lỗ li ti cho phép ánh sáng tự nhiên lọt qua, người bên trong nhìn ra rõ ràng",
                  "Người bên ngoài nhìn vào chỉ thấy hình ảnh quảng cáo sắc nét toàn phần",
                  "Hỗ trợ giảm bớt chói nắng và nhiệt độ cho không gian bên trong showroom"
              ],
              "descriptionTraits": [
                  "waterproof-durability",
                  "digital-precision"
              ],
              "bestFor": [
                  "Automotive rear glass, glass showroom facades, street-facing office windows"
              ],
              "bestForVi": [
                  "Dán kính ô tô xe buýt, kính mặt tiền showroom, cửa kính văn phòng"
              ],
              "pureImage": "/images/product/decalluoi.webp",
              "pureImages": [
                  "/images/product/decalluoi.webp",
                  "/images/product/decalluoi2.webp",
                  "/images/product/decalluoi3.webp"
              ],
              "nameZh": "单向透视网格车贴 (One-Way Vision)",
              "nameJa": "ワンウェイビジョン・メッシュシート（片面透視）",
              "nameKo": "원웨이 타공 메쉬 시트지 (단방향 투과 데칼)",
              "taglineZh": "既要玻璃橱窗展现大幅全彩广告，又不遮挡室内向外观看视线与自然光线？",
              "taglineJa": "外からは鮮やかなグラフィックが見え、室内からは外がクリアに見える特殊ガラスフィルムですか？",
              "taglineKo": "외부에서는 선명한 광고 그래픽이 보이고, 실내에서는 바깥이 시원하게 투과되는 기능성 시트지인가요?",
              "descriptionZh": [
                  "微孔均匀分布（穿孔率约40%），在室内向外看通透自如，完全不阻碍视线",
                  "面向室外的一面全彩高清印刷，呈现完整艳丽的品牌大幅形象视觉",
                  "有效隔绝外部强光刺眼，降低室内直射热量，兼具防晒遮阳与隐私保护"
              ],
              "descriptionJa": [
                  "微細なドット穴が約40%の光を透過させ、室内側からの視界を遮らずクリアに確保",
                  "屋外側にはフルカラー広告が高精細に浮かび上がり、通行人に強くアピール",
                  "強い直射日光を和らげて室内の温度上昇を抑え、遮熱とプライバシー保護を両立"
              ],
              "descriptionKo": [
                  "균일한 미세 타공(약 40% 개구율)으로 실내에서는 밖이 답답함 없이 선명하게 투과",
                  "외부 시선에서는 빈틈없는 고해상도 풀컬러 실사출력으로 완벽한 브랜드 비주얼 노출",
                  "강한 직사광선을 부드럽게 분산시켜 실내 눈부심 완화 및 자외선 차단 효과"
              ],
              "bestForZh": [
                  "公交车身车窗玻璃广告、品牌展厅临街全景玻璃幕墙、商铺落地窗"
              ],
              "bestForJa": [
                  "バス・営業車のリアウィンドウ、ショールームのガラスファサード、路面店舗の窓ガラス広告"
              ],
              "bestForKo": [
                  "버스 및 업무용 차량 윈도우 랩핑, 쇼룸 통유리 파사드, 로드샵 매장 유리창 광고"
              ]
          },
          {
              "icon": "SunMedium",
              "name": "Backlit Lightbox Film",
              "nameVi": "Backlit Film",
              "tagline": "Ultra-clear polyester translucent film engineered for backlit LED lightboxes",
              "taglineVi": "Phim nhựa polyester xuyên sáng cao cấp chuyên dụng cho hộp đèn LED siêu mỏng",
              "description": [
                  "Even light dispersion creates brilliant luminous glow under LED illumination",
                  "Ultra-high resolution output with deep, rich contrast that never looks washed out",
                  "Available in adhesive or non-adhesive film for snap-frame lightboxes"
              ],
              "descriptionVi": [
                  "Khả năng tán xạ ánh sáng đều giúp hình ảnh bừng sáng rực rỡ khi bật đèn LED",
                  "Độ tương phản và độ đen cực sâu, hình ảnh sắc sảo không bị nhợt nhạt",
                  "Tùy chọn phim có keo hoặc không keo lắp đặt dễ dàng trong hộp đèn nắp bật"
              ],
              "descriptionTraits": [
                  "smooth-base",
                  "digital-precision",
                  "glossy-coat"
              ],
              "bestFor": [
                  "Airport advertising lightboxes, fast-food menu boards, luxury mall displays"
              ],
              "bestForVi": [
                  "Hộp đèn menu quầy trà sữa, biển hộp đèn trung tâm thương mại, sân bay"
              ],
              "pureImage": "/images/product/backlitfilm.webp",
              "pureImages": [
                  "/images/product/backlitfilm.webp",
                  "/images/product/backlitfilm2.webp",
                  "/images/product/backlitfilm3.webp"
              ],
              "nameZh": "超清灯箱背喷片 (Backlit Film)",
              "nameJa": "電飾用バックライトフィルム（バックリット）",
              "nameKo": "백릿 와이드컬러 필름 (조명용 백라이트)",
              "taglineZh": "专为超薄LED导光板灯箱设计，通电后画面色彩如霓虹般通透鲜艳且黑度深邃吗？",
              "taglineJa": "LED照明を通すと色彩が劇的に鮮やかに発光する、超高精細な電飾看板用フィルムですか？",
              "taglineKo": "LED 조명을 투과시켰을 때 색감이 드라마틱하게 살아나는 초고해상도 라이트박스 필름인가요?",
              "descriptionZh": [
                  "光学级半透明聚酯PET材质，导光扩散均匀，开灯时光线柔和通透无暗区",
                  "超高解析度双向微喷技术，色彩饱和度与黑度极深，关灯清晰开灯惊艳",
                  "支持无胶夹片式（适用于铝合金卡布/磁吸灯箱）与背胶粘贴式规格"
              ],
              "descriptionJa": [
                  "半透明の光学PETフィルムが光を均一に拡散し、LED点灯時にムラなく発光",
                  "超高解像度出力による高いコントラストと深みのある黒で、褪せない視覚効果",
                  "開閉式フレーム用のノングルー仕様と、ガラス直貼り用接着剤付き仕様に対応"
              ],
              "descriptionKo": [
                  "광학급 반투명 PET 원단으로 빛을 균일하게 확산시켜 조명 켜짐 시 핫스팟 없이 화사한 발광",
                  "초고해상도 피그먼트 인쇄로 블랙 깊이와 컬러 채도가 탁월하여 어두운 조명에서도 압도적 시인성",
                  "스냅 프레임용 비점착 타입과 아크릴 라이트박스용 점착 타입 완벽 지원"
              ],
              "bestForZh": [
                  "机场高铁超清灯箱、奶茶快餐连锁发光点餐单、大型购物中心奢品橱窗"
              ],
              "bestForJa": [
                  "空港・駅の大型電飾サイン、飲食チェーンの光るメニューボード、商業施設のブランド看板"
              ],
              "bestForKo": [
                  "공항 및 지하철 와이드컬러 조명 광고, 프랜차이즈 카페 조명 메뉴판, 백화점 럭셔리 라이트박스"
              ]
          },
      ]
  },

  {
    "id": "to-roi",
    "categoryId": "marketing",
    "titleVi": "Tờ rơi - Flyers",
    "titleEn": "Flyers & Leaflets",
    "titleZh": "宣传单 - Flyers",
    "titleJa": "チラシ・フライヤー",
    "titleKo": "전단지 - Flyers",
    "descriptionVi": "Công cụ tiếp thị trực tiếp hiệu quả, phân phát nhanh chóng thông tin sản phẩm và chương trình khuyến mãi đến khách hàng mục tiêu.",
    "descriptionEn": "High-impact direct marketing flyers for product launches, seasonal promotions, and neighborhood distributions.",
    "coverImage": "/images/category/toroi.webp",
    "shapes": [
      {
        "id": "to-roi-gia-re",
        "nameVi": "Tờ rơi giá rẻ",
        "nameEn": "Budget Promotion Flyers",
        "nameZh": "特惠促销传单",
        "nameJa": "格安チラシ印刷",
        "nameKo": "실속형 가성비 전단지",
        "descriptionVi": "In offset số lượng lớn định lượng C100 - C150 tiết kiệm tối đa ngân sách phân phát đại trà.",
        "descriptionEn": "Economical offset volume printing on 100-150gsm Couche, best for mass hand-to-hand distribution.",
        "image": "/images/category/toroigiare.webp",
        "badgeVi": "Tiết kiệm",
        "badgeEn": "Budget"
      },
      {
        "id": "to-roi-so-luong-it",
        "nameVi": "Tờ rơi số lượng ít",
        "nameEn": "Short-run Digital Flyers",
        "nameZh": "少量数码快印传单",
        "nameJa": "小ロットオンデマンドチラシ",
        "nameKo": "소량 디지털 전단지",
        "descriptionVi": "In kỹ thuật số số lượng từ 50 - 200 tờ lấy ngay trong ngày, thích hợp cho sự kiện khai trương, hội chợ gấp.",
        "descriptionEn": "Same-day digital printing from 50-200 copies, ideal for store openings, pop-up events, and urgent promos.",
        "image": "/images/category/toroisoluongit.webp",
        "badgeVi": "Lấy nhanh",
        "badgeEn": "Fast Print"
      },
      {
        "id": "to-roi-so-luong-lon",
        "nameVi": "Tờ rơi số lượng lớn",
        "nameEn": "Bulk Offset Flyers",
        "nameZh": "批量胶印高品质传单",
        "nameJa": "大ロットオフセットチラシ",
        "nameKo": "대량 오프셋 인쇄 전단지",
        "descriptionVi": "In offset công nghiệp từ 1.000 - 100.000 tờ, màu sắc đồng đều chuẩn nét với giá thành trên mỗi tờ thấp nhất.",
        "descriptionEn": "Industrial offset runs from 1,000 to 100,000+ copies with uniform color fidelity and maximum volume savings.",
        "image": "/images/category/toroisoluonglon.webp",
        "badgeVi": "Giá sỉ",
        "badgeEn": "Bulk Offset"
      },
      {
        "id": "to-roi-cao-cap",
        "nameVi": "Tờ rơi cao cấp",
        "nameEn": "Premium Luxury Flyers",
        "nameZh": "高端覆膜精装传单",
        "nameJa": "プレミアム高級チラシ",
        "nameKo": "고급 코팅 프리미엄 전단지",
        "descriptionVi": "Chất liệu giấy dày C250 - C300 cán màng mờ 2 mặt sang trọng, ép kim logo đẳng cấp.",
        "descriptionEn": "Heavyweight 250-300gsm artboard with double-sided matte lamination and optional metallic foil stamping.",
        "image": "/images/category/toroicaocap.webp",
        "badgeVi": "Cao cấp",
        "badgeEn": "Premium"
      }
    ],
    "materials": [
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "tagline": "Need the industry-standard glossy flyer for mass distribution and events?",
        "taglineVi": "Bạn cần tờ rơi tiêu chuẩn láng mịn, chuẩn màu cho chiến dịch phát quảng cáo?",
        "description": [
          "Smooth coated C150 paper balancing stiffness with economical distribution weight",
          "Vibrant full-bleed CMYK color reproduction that grabs immediate attention",
          "Most popular choice for street marketing, store openings, and mailboxes"
        ],
        "descriptionVi": [
          "Láng mịn, cân bằng hoàn hảo giữa độ dày và chi phí",
          "In màu CMYK rực rỡ tràn viền, thu hút sự chú ý của khách hàng ngay lập tức",
          "Lựa chọn phổ biến nhất cho phát tờ rơi đường phố, khai trương và showroom"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Grand openings, promotional sales events, and supermarket flyers",
          "Real estate project launches and educational course recruitments",
          "Restaurant takeaway menus and food delivery promotional inserts"
        ],
        "bestForVi": [
          "Khai trương cửa hàng, sự kiện khuyến mãi lớn và tờ rơi siêu thị",
          "Mở bán dự án bất động sản và tuyển sinh các khóa học trung tâm",
          "Menu gọi món mang đi của nhà hàng và tờ quảng cáo kẹp trong hộp hàng"
        ],
        "nameZh": "铜版纸 150gsm（大批量宣传传单）",
        "nameJa": "コート紙 150gsm（大量ポスティングチラシ）",
        "nameKo": "스노우지 150gsm (대량 배포용 표준 전단지)",
        "taglineZh": "新店开业、促销活动需要在街头商圈大批量派发的宣传单？",
        "taglineJa": "新規オープンやイベント告知で、街頭配布や新聞折込に使うチラシですか？",
        "taglineKo": "신규 매장 오픈이나 프로모션 시 거리 대량 배포용 가성비 전단지인가요?",
        "descriptionZh": [
          "150gsm高性价比铜版纸，双面全彩高清印刷",
          "光泽度佳，色彩还原饱满鲜艳，吸睛效果极强",
          "纸张轻薄适中，极其便于折叠、装箱与现场大批量派发"
        ],
        "descriptionJa": [
          "150gsmのコストパフォーマンスに優れたコート紙、両面フルカラー印刷",
          "ほどよい光沢感があり、写真やイラストが鮮やかに発色",
          "軽くてかさばらず、街頭での手渡しやポスティングに最適"
        ],
        "descriptionKo": [
          "150gsm 가성비 뛰어난 스노우지로 양면 고해상도 풀컬러 인쇄",
          "화사한 발색과 매끄러운 표면으로 한눈에 시선을 사로잡는 주목도",
          "적당한 두께감으로 접거나 대량 휴대 및 거리 배포에 최적화"
        ],
        "bestForZh": [
          "新店开业大酬宾、商场周末促销打折宣传单",
          "街头商圈地推海量派发、周边社区信箱入户投递",
          "追求高覆盖率与低单页成本的主力广告传单"
        ],
        "bestForJa": [
          "新規オープン、セール告知、キャンペーンチラシ",
          "駅前や街頭での手配り、新聞折込、ポスティング",
          "低コストで広範囲に大量告知したいプロモーション"
        ],
        "bestForKo": [
          "신규 오픈 이벤트, 주말 특가 세일, 프로모션 전단지",
          "역세권 거리 배포, 아파트 우편함 대량 투입 배포용",
          "최소의 비용으로 최대의 홍보 효과를 내는 필수 전단지"
        ],
        "hideFoilCheckbox": false,
        "pureImage": "/images/product/flyer-giayloaic.webp",
        "pureImages": [
          "/images/product/flyer-giayloaic.webp",
          "/images/product/flyer-giayloaic2.webp",
          "/images/product/flyer-giayloaic3.webp"
        ]
      },
      {
        "icon": "Feather",
        "name": "Type F Paper",
        "nameVi": "Giấy loại F",
        "tagline": "Want a natural uncoated flyer that clients can read without glare or write on?",
        "taglineVi": "Bạn muốn tờ rơi giấy mộc tự nhiên, không chói mắt và khách có thể điền thông tin?",
        "description": [
          "Natural uncoated matte Ford paper with soft light diffusion",
          "Zero glare under sunlight or bright store lighting",
          "Allows customers to write notes, fill questionnaires, or clip coupons easily"
        ],
        "descriptionVi": [
          "Không tráng phủ nhám mịn tự nhiên, khuếch tán ánh sáng dịu nhẹ",
          "Hoàn toàn không chói lóa dưới ánh nắng mặt trời hay đèn showroom",
          "Khách hàng có thể viết ghi chú, điền phiếu khảo sát hoặc cắt coupon khuyến mãi"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Medical clinic handouts, educational questionnaires, and training sheets",
          "Minimalist brands favoring an organic, non-glossy communication style",
          "Direct mail coupon inserts and customer survey forms"
        ],
        "bestForVi": [
          "Tờ rơi thông tin y tế bệnh viện, phiếu khảo sát học sinh và đào tạo",
          "Thương hiệu tối giản ưa chuộng phong cách giao tiếp mộc mạc, tự nhiên",
          "Tờ rơi kẹp coupon giảm giá và phiếu thăm dò ý kiến khách hàng"
        ],
        "nameZh": "道林纸 100-120gsm（哑光易书写单页）",
        "nameJa": "上質紙 100-120gsm（書き込み用チラシ）",
        "nameKo": "모조지 100-120gsm (필기형 매트 전단지)",
        "taglineZh": "宣传单附带客户问卷调查或需要现场手写优惠券？",
        "taglineJa": "アンケートや申込記入欄が付いた、ペンで書き込みやすいチラシですか？",
        "taglineKo": "고객 설문조사나 신청서 양식이 포함되어 직접 수기 작성이 필요한 전단지인가요?",
        "descriptionZh": [
          "100-120gsm进口道林纸，纸面微糙无眩光",
          "吸墨均匀迅速，圆珠笔、签字笔书写流利不透墨",
          "适合附带客户登记表、调查问卷或现场手写优惠券"
        ],
        "descriptionJa": [
          "100〜120gsmの上質紙、目に優しく反射のない落ち着いた紙面",
          "ボールペンや鉛筆で書き込みやすく、インクが裏抜けしない",
          "アンケート、申込書、記入式クーポンを兼ねたチラシに最適"
        ],
        "descriptionKo": [
          "100-120gsm 모조지로 조명 아래에서도 눈부심 없는 차분한 질감",
          "잉크 흡수가 빨라 볼펜, 연필로 고객이 직접 작성하기 편리함",
          "고객 상담 카드, 설문조사, 현장 할인 쿠폰 겸용 전단지로 최적"
        ],
        "bestForZh": [
          "课外培训机构报名表、健身房体验课意向登记表",
          "医疗体检套餐说明书附带身体健康问卷",
          "各类带有互动填写与签字确认环节的推广单页"
        ],
        "bestForJa": [
          "学習塾・スクールの入会案内、フィットネスクラブの体験申込書",
          "クリニックの問診票付きパンフレット、健康診断案内",
          "顧客が記入して提出するインタラクティブなチラシ"
        ],
        "bestForKo": [
          "학원 수강 신청서, 피트니스 클럽 무료 체험 상담 카드",
          "건강검진 프로그램 안내문 및 사전 문진표",
          "고객이 현장에서 직접 작성하여 회수하는 참여형 전단지"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/flyer-giayloaif.webp",
        "pureImages": [
          "/images/product/flyer-giayloaif.webp",
          "/images/product/flyer-giayloaif2.webp",
          "/images/product/flyer-giayloaif3.webp"
        ]
      },
      {
        "icon": "Leaf",
        "name": "Kraft Paper (Vintage & Eco-friendly)",
        "nameVi": "Giấy Kraft (Cổ Điển & Thân Thiện)",
        "tagline": "Want an eco-friendly, rustic flyer to highlight organic or sustainable products?",
        "taglineVi": "Bạn muốn tờ rơi mộc mạc, thân thiện môi trường để quảng bá sản phẩm xanh?",
        "description": [
          "100% recycled brown Kraft paper with a distinct vintage, organic texture",
          "Excellent for single-color (black/brown) printing or minimalist designs",
          "Stands out from standard glossy flyers with a unique tactile feel"
        ],
        "descriptionVi": [
          "Màu nâu tái chế 100% mang lại kết cấu mộc mạc, tự nhiên và cổ điển",
          "Phù hợp nhất với thiết kế tối giản hoặc in đơn sắc (đen/nâu đậm)",
          "Tạo sự khác biệt hoàn toàn so với tờ rơi bóng bẩy thông thường"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Organic food stores, vegan restaurants, and eco-friendly campaigns",
          "Vintage clothing boutiques and artisan craft workshops",
          "Sustainable brand awareness drives and local community events"
        ],
        "bestForVi": [
          "Cửa hàng thực phẩm sạch, nhà hàng chay và chiến dịch sống xanh",
          "Shop thời trang vintage và xưởng thủ công mỹ nghệ",
          "Truyền thông nhận diện thương hiệu bền vững và sự kiện cộng đồng"
        ],
        "nameZh": "复古环保牛皮纸特色宣传页",
        "nameJa": "クラフト紙レトロフライヤー（環境配慮型）",
        "nameKo": "크라프트지 빈티지 친환경 홍보물",
        "taglineZh": "烘焙咖啡、环保理念、自然风格店铺的特色宣传单？",
        "taglineJa": "カフェやヴィンテージショップに似合う、環境に配慮したチラシですか？",
        "taglineKo": "베이커리, 카페, 자연주의 브랜드의 철학을 전달할 빈티지 홍보물인가요?",
        "descriptionZh": [
          "纯天然无漂白牛皮纸，散发浓厚复古情调与手作温度",
          "纸质柔韧耐磨，即使揉皱也别具一种自然粗狂之美",
          "绿色环保可回收，完美契合可持续发展品牌理念"
        ],
        "descriptionJa": [
          "無漂白の未晒クラフト紙、どこか懐かしいヴィンテージ感",
          "破れにくくしなやかで、環境意識の高さをアピール可能",
          "エコでナチュラルな生活を提案するショップにベストマッチ"
        ],
        "descriptionKo": [
          "화학 표백을 거치지 않은 천연 크라프트지로 빈티지한 아날로그 감성",
          "질기고 유연하여 자연스러운 멋과 친환경적인 메시지 전달",
          "100% 재활용 가능한 용지로 브랜드의 지속가능성 가치 강조"
        ],
        "bestForZh": [
          "精品手冲咖啡馆、现烤欧包烘焙店、精酿小酒馆",
          "文创集市、复古古着店、环保公益活动宣传页",
          "追求与众不同文艺腔调与自然质感的特色店铺"
        ],
        "bestForJa": [
          "カフェ、ベーカリー、クラフトビアバー、自然派食品店",
          "フリーマーケット、古着屋、環境フェスティバルのフライヤー",
          "オーガニックやハンドメイドの魅力を伝えたい店舗"
        ],
        "bestForKo": [
          "스페셜티 카페, 천연 발효 베이커리, 수제 맥주 펍 안내장",
          "플리마켓, 빈티지 편집숍, 친환경 생태 캠페인 리플렛",
          "개성 있는 아날로그 감성으로 마니아층을 사로잡는 감성 매장"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/flyer-giayloaik.webp",
        "pureImages": [
          "/images/product/flyer-giayloaik.webp",
          "/images/product/flyer-giayloaik2.webp",
          "/images/product/flyer-giayloaik3.webp"
        ]
      },
      {
        "icon": "Sparkles",
        "name": "Art Paper (Premium & Textured)",
        "nameVi": "Giấy Mỹ Thuật (Sang Trọng & Đẳng Cấp)",
        "tagline": "Need a high-end, textured flyer that feels like a luxury invitation?",
        "taglineVi": "Bạn cần tờ rơi cao cấp, có gân giấy sang trọng như một tấm thiệp mời?",
        "description": [
          "Premium imported art paper with elegant textures (linen, felt, or metallic)",
          "Delivers an immediate sense of luxury, prestige, and exclusivity",
          "Pairs perfectly with foil stamping or embossed logos for maximum impact"
        ],
        "descriptionVi": [
          "Đa dạng vân giấy (gân ngang, nhám, ánh kim)",
          "Mang lại cảm giác sang trọng, đẳng cấp và độc quyền ngay khi chạm vào",
          "Kết hợp hoàn hảo với ép kim nhũ hoặc dập nổi logo để tạo ấn tượng mạnh"
        ],
        "descriptionTraits": [
          "textured-art",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "Luxury real estate launches, high-end jewelry, and automotive showrooms",
          "VIP event invitations disguised as promotional flyers",
          "Exclusive wellness retreats, aesthetic clinics, and 5-star hotels"
        ],
        "bestForVi": [
          "Lễ mở bán bất động sản hạng sang, trang sức cao cấp và showroom ô tô",
          "Tờ rơi dạng thiệp mời gửi đến khách hàng VIP tham dự sự kiện",
          "Viện thẩm mỹ, resort 5 sao và các dịch vụ chăm sóc sức khỏe thượng lưu"
        ],
        "nameZh": "高端特种纸艺术宣传单",
        "nameJa": "高級特殊紙プレミアムリーフレット",
        "nameKo": "고급 수입지 프리미엄 리플렛",
        "taglineZh": "艺术展讯、高级沙龙需要向高端客群精准递送的品味之选？",
        "taglineJa": "高級サロンや個展の案内など、厳選された顧客へ届けるフライヤーですか？",
        "taglineKo": "프리미엄 살롱, 갤러리 초대 등 타깃 고객에게 전달할 고급 리플렛인가요?",
        "descriptionZh": [
          "精选高档粗纹艺术纸，具有如水彩画纸般的触感张力",
          "纸张挺括厚实，吸墨温润深邃，赋予设计浓厚艺术气质",
          "彻底告别廉价传单感，成为值得长期留存的微型艺术品"
        ],
        "descriptionJa": [
          "画用紙のような風合いを持つ最高級特殊紙、圧倒的な存在感",
          "深みのある落ち着いた発色で、デザインをアートの領域へ昇華",
          "捨てられにくく、手元に長く残るプレミアムなフライヤー"
        ],
        "descriptionKo": [
          "수채화지처럼 고급스러운 결이 살아있는 최고급 수입 예술지",
          "도톰하고 탄탄하여 쥐었을 때 전해지는 묵직한 프리미엄 감도",
          "쉽게 버려지지 않고 서재나 냉장고에 붙여두고 소장하는 미니 아트 포스터"
        ],
        "bestForZh": [
          "画廊艺术展览门票式单页、博物馆大师特展邀请单",
          "高级定制西服、名表珠宝私享品鉴会高端宣传单",
          "高端楼盘奢华发布会、高端私人会所专享宣传品"
        ],
        "bestForJa": [
          "アートギャラリーの個展案内、美術館の特別展フライヤー",
          "高級時計・宝飾品の内覧会、ラグジュアリーサロンの案内状",
          "デザインと紙質にこだわり抜いた最高峰のプロモーション"
        ],
        "bestForKo": [
          "갤러리 개인전 도록형 리플렛, 미술관 기획전 초청 브로슈어",
          "명품 시계·주얼리 프라이빗 VIP 살롱 인비테이션",
          "디자인과 종이의 퀄리티를 최우선으로 여기는 프리미엄 프로젝트"
        ],
        "hideFoilCheckbox": false,
        "pureImage": "/images/product/flyer-giaymythuat.webp",
        "pureImages": [
          "/images/product/flyer-giaymythuat.webp",
          "/images/product/flyer-giaymythuat2.webp",
          "/images/product/flyer-giaymythuat3.webp"
        ]
      },
      {
        "icon": "Droplets",
        "name": "Waterproof Plastic (Tear-Resistant)",
        "nameVi": "Nhựa Chống Nước (Siêu Bền & Không Rách)",
        "tagline": "Need an indestructible, waterproof flyer for outdoor events or wet environments?",
        "taglineVi": "Bạn cần tờ rơi siêu bền, chống nước tuyệt đối cho sự kiện ngoài trời hay môi trường ẩm ướt?",
        "description": [
          "Synthetic plastic material (PVC/PET) that is completely waterproof and tear-proof",
          "Maintains vibrant colors and structural integrity even when submerged in water",
          "Ideal for long-term reusable menus or outdoor heavy-duty promotions"
        ],
        "descriptionVi": [
          "Tổng hợp dẻo dai, hoàn toàn không thấm nước và xé không rách",
          "Giữ nguyên màu sắc rực rỡ và độ bền cấu trúc ngay cả khi ngâm trong nước",
          "Hoàn hảo cho menu dùng nhiều lần hoặc tờ rơi quảng cáo môi trường khắc nghiệt"
        ],
        "descriptionTraits": [
          "waterproof-durability",
          "smooth-base",
          "glossy-coat"
        ],
        "bestFor": [
          "Poolside bar menus, seafood restaurants, and outdoor food festivals",
          "Theme parks, water sports rentals, and beach club promotions",
          "Industrial product sheets used in wet or oily manufacturing floors"
        ],
        "bestForVi": [
          "Menu quán bar hồ bơi, nhà hàng hải sản và lễ hội ẩm thực ngoài trời",
          "Công viên giải trí, dịch vụ thể thao dưới nước và câu lạc bộ bãi biển",
          "Tờ hướng dẫn sản phẩm công nghiệp dùng trong nhà máy ẩm ướt hoặc dầu mỡ"
        ],
        "nameZh": "撕不烂完全防水塑料宣传单",
        "nameJa": "完全防水合成樹脂フライヤー（破れ知らず）",
        "nameKo": "완벽 방수 합성 플라스틱 홍보물 (파손 방지)",
        "taglineZh": "户外暴晒、雨淋或水上乐园环境依然完好无损的宣传页？",
        "taglineJa": "雨風にさらされる屋外や、水回りの施設でも破れないタフなチラシですか？",
        "taglineKo": "야외 페스티벌이나 워터파크처럼 물에 노출되어도 절대 젖지 않는 홍보물인가요?",
        "descriptionZh": [
          "特种撕不烂合成塑料材质，100%全防水耐油污抗撕拽",
          "即使放入水中浸泡数天，字迹与画面依然崭新不化墨",
          "抗紫外线暴晒，耐候性能极强，户外严苛环境首选"
        ],
        "descriptionJa": [
          "破れ知らずの合成樹脂素材、100%完全防水・耐油仕様",
          "水に浸けてもインクが滲まず、汚れもサッと拭き取れる",
          "紫外線や風雨に強く、屋外の過酷な環境でも劣化しない"
        ],
        "descriptionKo": [
          "손으로 찢을 수 없는 강력 합성 플라스틱 소재로 100% 완전 방수",
          "물속에 담가도 잉크 번짐이나 종이 부풀림이 전혀 발생하지 않음",
          "자외선과 비바람에 강한 내후성으로 야외 가혹한 환경에서도 완벽 유지"
        ],
        "bestForZh": [
          "水上乐园、海滨浴场、潜水俱乐部与游艇会活动单",
          "汽车越野拉力赛、户外徒步露营路线指南单",
          "餐饮火锅厨房湿滑油污环境中的点餐宣传页"
        ],
        "bestForJa": [
          "ウォーターパーク、ダイビングスクール、マリーナの案内",
          "野外フェス、キャンプ場マップ、トレッキングルート案内",
          "プールサイドや雨天の野外イベントでの配布チラシ"
        ],
        "bestForKo": [
          "워터파크, 서핑 스쿨, 스쿠버 다이빙 클럽 야외 안내문",
          "야외 락 페스티벌, 오토캠핑장 지도, 트레킹 코스 가이드",
          "비가 오는 날씨나 물기 가득한 야외 축제 현장 배포용"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/flyer-nhuachongnuoc.webp",
        "pureImages": [
          "/images/product/flyer-nhuachongnuoc.webp",
          "/images/product/flyer-nhuachongnuoc2.webp",
          "/images/product/flyer-nhuachongnuoc3.webp"
        ]
      },
      // {
      //   "icon": "Layers",
      //   "name": "Couche 150gsm Paper",
      //   "nameVi": "Giấy Couche 150gsm",
      //   "tagline": "Balanced glossy art paper ideal for vivid color reproduction in commercial flyers",
      //   "taglineVi": "Định lượng tiêu chuẩn bóng láng, bắt sáng tốt, thể hiện hình ảnh và câu chữ sắc nét",
      //   "description": [
      //     "Smooth semi-gloss surface ensures crisp text and vibrant graphic reproduction",
      //     "Moderate thickness easy to fold and distribute hand-to-hand",
      //     "Most cost-effective choice for medium to large distribution runs"
      //   ],
      //   "descriptionVi": [
      //     "Bề mặt láng bóng vừa phải, hiển thị hình ảnh món ăn, sản phẩm cực kỳ bắt mắt",
      //     "Độ dày vừa vặn dễ cầm nắm, phát tay hoặc bỏ hộp thư",
      //     "Chi phí cực kỳ tối ưu cho các đợt phát tờ rơi diện rộng"
      //   ],
      //   "descriptionTraits": [
      //     "smooth-base",
      //     "digital-precision"
      //   ],
      //   "bestFor": [
      //     "Restaurant menus, retail sale circulars, real estate property listings"
      //   ],
      //   "bestForVi": [
      //     "Tờ rơi quán ăn, khai trương cửa hàng, tờ rơi bất động sản"
      //   ],
      //   "pureImage": "/images/category/toroi.webp",
      //   "pureImages": [
      //     "/images/category/toroi.webp",
      //     "/images/category/toroi.webp",
      //     "/images/category/toroi.webp"
      //   ]
      // },
      // {
      //   "icon": "ShieldCheck",
      //   "name": "Couche 300gsm Matte Laminated",
      //   "nameVi": "Giấy Couche 300gsm cán màng mờ",
      //   "tagline": "Rigid heavy paperboard with protective matte lamination for lasting prestige",
      //   "taglineVi": "Giấy C300 dày dặn cán màng mờ 2 mặt chống nước nhẹ và chống trầy xước",
      //   "description": [
      //     "Heavy cardstock feel similar to a postcard or voucher",
      //     "Matte lamination repels moisture and gives a silky non-glare touch",
      //     "Supports premium enhancements like foil stamping and spot UV"
      //   ],
      //   "descriptionVi": [
      //     "Độ cứng như thiệp quà tặng, tạo cảm giác sang trọng khi trao tay",
      //     "Màng mờ mịn màng sang trọng, chống bám vân tay và chống thấm nước nhẹ",
      //     "Dễ dàng kết hợp ép kim logo thương hiệu nổi bật"
      //   ],
      //   "descriptionTraits": [
      //     "thick-weight",
      //     "glossy-coat",
      //     "foil-accent"
      //   ],
      //   "bestFor": [
      //     "Luxury spa vouchers, aesthetic clinics, high-end automotive brochures"
      //   ],
      //   "bestForVi": [
      //     "Thẩm mỹ viện, spa cao cấp, showroom ô tô, trang sức"
      //   ],
      //   "pureImage": "/images/product/c300-foil.webp",
      //   "pureImages": [
      //     "/images/product/c300-foil.webp",
      //     "/images/product/c300-foil.webp",
      //     "/images/product/c300-foil.webp"
      //   ]
      // }
    ]
  },
  {
    "id": "to-gap",
    "categoryId": "marketing",
    "titleVi": "Tờ gấp - Leaflets, Brochures",
    "titleEn": "Leaflets & Brochures",
    "titleZh": "折页手册 - Brochures",
    "titleJa": "折りパンフレット",
    "titleKo": "접지 리플렛 - Brochures",
    "descriptionVi": "Ấn phẩm gấp nhiều nếp cấn mở ra nhiều mặt thông tin mạch lạc, giới thiệu trọn vẹn dịch vụ công ty.",
    "descriptionEn": "Multi-fold leaflets and brochures presenting clear, structured corporate and product narratives.",
    "coverImage": "/images/category/togap.webp",
    "shapes": [
      {
        "id": "to-gap-so-luong-it",
        "nameVi": "Tờ gấp số lượng ít",
        "nameEn": "Short-run Folded Brochures",
        "nameZh": "少量数码折页",
        "nameJa": "小ロット折りパンフレット",
        "nameKo": "소량 디지털 접지 리플렛",
        "descriptionVi": "In kỹ thuật số lấy nhanh từ 10 - 50 tờ, cấn gấp hoàn thiện chuẩn xác, giải pháp tối ưu cho hội thảo và sự kiện gấp.",
        "descriptionEn": "Digital on-demand printing from 10-50 copies with precision creasing, ideal for seminars, trade shows, and urgent events.",
        "image": "/images/category/togapsoluongit.webp",
        "badgeVi": "Lấy nhanh",
        "badgeEn": "Fast Print"
      },
      {
        "id": "to-gap-ba",
        "nameVi": "Tờ gấp ba (Tri-fold)",
        "nameEn": "Tri-fold Brochures",
        "nameZh": "三折页",
        "nameJa": "巻き三つ折り",
        "nameKo": "3단 접지 리플렛",
        "descriptionVi": "Quy cách cấn 2 đường gấp 3 chia thành 6 trang thông tin gọn gàng, kích thước mở ra A4.",
        "descriptionEn": "Two crease lines creating 6 organized panels, the timeless format for company presentations.",
        "image": "/images/category/togap3.webp",
        "badgeVi": "6 trang",
        "badgeEn": "6 Panels"
      },
      {
        "id": "to-gap-doi-a4",
        "nameVi": "Tờ gấp đôi A4",
        "nameEn": "Bi-fold A4 Leaflets",
        "nameZh": "A4对折页",
        "nameJa": "A4二つ折り",
        "nameKo": "A4 반접지 리플렛",
        "descriptionVi": "Khổ trải A3 cấn 1 nếp gấp đôi thành A4 4 trang rộng rãi, thoải mái trình bày biểu đồ và bảng giá.",
        "descriptionEn": "A3 flat sheet folded down to A4 4 spacious pages, perfect for product specs and pricing tables.",
        "image": "/images/category/togapdoi.webp",
        "badgeVi": "Khổ A4",
        "badgeEn": "Bi-Fold A4"
      },
      {
        "id": "to-gap-cao-cap",
        "nameVi": "Tờ gấp cao cấp",
        "nameEn": "Premium Luxury Brochures",
        "nameZh": "烫金UV高档折页",
        "nameJa": "高級折りパンフレット",
        "nameKo": "프리미엄 가공 리플렛",
        "descriptionVi": "Giấy mỹ thuật cao cấp hoặc C300 ép kim, phủ UV định hình tạo dấu ấn đẳng cấp vượt trội.",
        "descriptionEn": "Imported art stock or C300 with selective spot UV and metallic foil stamping for VIP pitches.",
        "image": "/images/category/togapcaocap.webp",
        "badgeVi": "Ép kim / UV",
        "badgeEn": "Luxury Finish"
      }
    ],
    "materials": [
          {
                "icon": "Layers",
                "name": "Type C Paper",
                "nameVi": "Giấy loại C",
                "nameZh": "铜版纸 C150 - C300（双面覆膜）",
                "nameJa": "コート紙（C紙 150-300gsm・両面PP加工）",
                "nameKo": "스노우지/아트지 C지 (150-300gsm 무광코팅)",
                "tagline": "Need sharp vibrant colors, smooth glossy/matte finish and crack-free folding lines?",
                "taglineVi": "Bạn cần tờ gấp màu sắc chuẩn nét, bề mặt láng mịn và cán màng bảo vệ gân gấp?",
                "taglineZh": "需要色彩还原精准、折痕处不开裂的双面覆膜折页吗？",
                "taglineJa": "折り目のインク割れを防ぎ、写真が鮮やかに映える標準折りパンフレットですか？",
                "taglineKo": "접지선의 터짐을 방지하고 선명한 색감과 코팅으로 완성하는 표준 리플렛인가요?",
                "description": [
                      "Ultra-smooth coated surface delivering vibrant, high-contrast imagery and crisp typography",
                      "Protective matte or gloss lamination prevents scuffs, water damage, and spine cracking",
                      "Precision machine scoring ensures crisp, clean fold lines without ink fracturing"
                ],
                "descriptionVi": [
                      "Bề mặt tráng phủ láng mịn, tái tạo hình ảnh sắc nét và độ tương phản cao",
                      "Được cán màng mờ hoặc bóng bảo vệ, chống thấm nước nhẹ và chống rách mép gấp",
                      "Hệ thống cấn nếp tự động đảm bảo gân gấp thẳng tắp, không bị bể mực"
                ],
                "descriptionZh": [
                      "光滑平整的涂布纸面，图片色彩饱和艳丽，文字锐利清晰",
                      "表面覆亚膜或亮膜，有效抗磨损、防轻度水渍并保护折痕",
                      "全自动高精压痕工艺，折叠平整服帖，杜绝爆色断墨"
                ],
                "descriptionJa": [
                      "写真や図面が高コントラストで鮮明に仕上がる滑らかなコート紙",
                      "マット・グロスPP加工により、耐水・耐摩耗性を高め折り目を保護",
                      "高精度自動スジ入れ加工で、折り目のインク割れを防ぎ美しい仕上がり"
                ],
                "descriptionKo": [
                      "인쇄 색상 재현력이 탁월하고 이미지와 텍스트가 선명한 매끄러운 코팅지",
                      "무광/유광 라미네이팅 코팅으로 생활 방수 및 접지면 터짐 방지",
                      "정밀 기계 오시 가공으로 접었을 때 종이 찢어짐이나 터짐 없는 깔끔한 마감"
                ],
                "descriptionTraits": [
                      "smooth-base",
                      "glossy-coat",
                      "foil-accent"
                ],
                "bestFor": [
                      "Corporate brochures, capability profiles, and promotional tri-fold pamphlets",
                      "Spa menus, clinic service guides, and educational course catalogues",
                      "Event programs, tourist pocket guides, and product spec sheets"
                ],
                "bestForVi": [
                      "Brochure giới thiệu công ty, hồ sơ năng lực, tờ gấp quảng bá sản phẩm",
                      "Menu gấp nhà hàng, dịch vụ spa, phòng khám và trung tâm đào tạo",
                      "Tờ gấp hướng dẫn sử dụng, cẩm nang du lịch và sự kiện ra mắt"
                ],
                "bestForZh": [
                      "企业形象宣传册、公司简介、产品营销三折页",
                      "餐厅折页菜单、医美门诊、教育机构课程手册",
                      "展会宣传手册、旅游攻略指南、新品发布会折页"
                ],
                "bestForJa": [
                      "会社案内パンフレット、事業紹介、製品カタログ三つ折り",
                      "飲食店メニュー、サロン案内、クリニック案内、学校案内",
                      "展示会配布資料、観光マップ、製品マニュアル"
                ],
                "bestForKo": [
                      "기업 소개 브로슈어, 회사 프로필, 3단 홍보 리플렛",
                      "병원 및 클리닉 가이드, 뷰티 살롱 메뉴판, 학원 소개서",
                      "전시회 배포용 리플렛, 관광 가이드 맵, 신제품 설명서"
                ],
                "image": "/images/product/togap3canmang.webp",
                "images": [
                      "/images/product/togap3canmang.webp",
                      "/images/product/togap3canmang2.webp",
                      "/images/product/togap3canmang3.webp"
                ],
                // "image": "/images/product/item-brochure-standard-foil1.webp",
                // "images": [
                //       "/images/product/item-brochure-standard-foil1.webp",
                //       "/images/product/item-brochure-standard-foil2.webp",
                //       "/images/product/item-brochure-standard-foil3.webp"
                // ]
          },
          {
                "icon": "Sparkles",
                "name": "Art Paper (Premium & Textured)",
                "nameVi": "Giấy Mỹ Thuật",
                "nameZh": "高级艺术纸（原生纹理·沉稳典雅）",
                "nameJa": "高級ファインペーパー（特殊紙・風合い重視）",
                "nameKo": "최고급 수입 명품지 (자연스러운 엠보 질감)",
                "tagline": "Want an artisanal brochure with organic texture, warmth, and an unmistakably upscale feel?",
                "taglineVi": "Bạn muốn tờ gấp mang dấu ấn nghệ thuật, vân giấy tự nhiên và cảm giác chạm cao cấp?",
                "taglineZh": "想要触感温润、纸张纹理细腻独特的艺术品级品牌折页？",
                "taglineJa": "手にした瞬間に伝わる上質な紙の質感と、知的な高級感を演出したいですか？",
                "taglineKo": "손끝에서 전해지는 은은한 종이 결의 촉감과 프리미엄 브랜드의 격조를 원하시나요?",
                "description": [
                      "Imported fine art paper with distinct subtle textures and natural organic fibers",
                      "Stiff, luxurious hand-feel that holds precision fold creases gracefully",
                      "Pairs exceptionally well with hot foil stamping and blind debossing"
                ],
                "descriptionVi": [
                      "Chất giấy mỹ thuật nhập khẩu cao cấp với bề mặt gân sần nhẹ hoặc ánh nhũ tự nhiên",
                      "Độ đanh chắc, giữ nếp gấp tinh tế, khả năng bám mực dịu mắt và thẩm mỹ cao",
                      "Rất thích hợp khi kết hợp cùng kỹ thuật ép kim vàng/bạc hoặc dập nổi logo"
                ],
                "descriptionZh": [
                      "欧洲进口高档特种艺术纸，自带独特微纹理或低调珠光",
                      "纸张韧度高，折叠自然立体，吸墨柔和不刺眼，艺术感染力强",
                      "极佳契合烫金、烫银、凹凸浮雕工艺，尽显品牌高端调性"
                ],
                "descriptionJa": [
                      "独特の風合いと手触りを持つ厳選された輸入ファインペーパー",
                      "しっかりとしたコシがあり、品格のある自然な折り目をキープ",
                      "金箔押しや空押しエンボス加工と抜群の相性を誇る高級仕立て"
                ],
                "descriptionKo": [
                      "섬세한 텍스처와 은은한 펄감이 감도는 최고급 수입 특수 예술지",
                      "단단하고 탄력 있는 종이 질감으로 고급스러운 접지 핏 유지",
                      "금박/은박 후가공 및 형압 엠보싱과 결합 시 극대화되는 럭셔리함"
                ],
                "descriptionTraits": [
                      "textured-art",
                      "natural-grain",
                      "foil-accent"
                ],
                "bestFor": [
                      "Luxury real estate developments, high-end resorts, yachts, and 5-star hospitality",
                      "Fine jewelry boutiques, art exhibition guides, and VIP launch event invites",
                      "Flagship brochures designed to leave an unforgettable tactile impression"
                ],
                "bestForVi": [
                      "Tờ gấp giới thiệu bất động sản cao cấp, resort, du thuyền và khách sạn 5 sao",
                      "Brochure triển lãm nghệ thuật, thương hiệu trang sức, spa thẩm mỹ xa xỉ",
                      "Thư ngỏ VIP, thiệp gấp giới thiệu sự kiện và hội nghị thượng đỉnh"
                ],
                "bestForZh": [
                      "顶级豪宅地产、奢华度假村、游艇俱乐部项目介绍",
                      "高级珠宝钟表、艺术画廊展览、VIP私人品鉴会邀请折页",
                      "追求极度手感与艺术品鉴级别的品牌旗舰宣传册"
                ],
                "bestForJa": [
                      "高級リゾートホテル、高級マンション、プレミアム会員制クラブ案内",
                      "宝飾品・時計ブランド、アートギャラリー、VIP向け招待状兼パンフレット",
                      "感性に訴えかけるワンランク上のブランディング資料"
                ],
                "bestForKo": [
                      "하이엔드 럭셔리 레지던스, 5성급 리조트, 프리미엄 요트 클럽",
                      "파인 주얼리, 명품 갤러리 전시 리플렛, VIP 초청장 겸 브로슈어",
                      "최고의 감성적 만족감과 품격을 전달하는 플래그십 홍보물"
                ],
                "image": "/images/product/togapmythuat.webp",
                "images": [
                      "/images/product/togapmythuat.webp",
                      "/images/product/togapmythuat2.webp",
                      "/images/product/togapmythuat3.webp"
                ]
          },
          {
                "icon": "ShieldCheck",
                "name": "Type I Paper",
                "nameVi": "Giấy loại I",
                "nameZh": "白卡纸 Ivory 250 - 350gsm（挺括硬实）",
                "nameJa": "アイボリー紙（I紙 250-350gsm・高剛性）",
                "nameKo": "고탄성 아이보리지 I지 (250-350gsm 탄탄한 두께)",
                "tagline": "Need extra rigidity, high thickness, and structured durability for multi-fold brochures?",
                "taglineVi": "Bạn cần tờ gấp dày dặn, độ đanh cứng cao và đứng dáng như một ấn phẩm bìa cứng?",
                "taglineZh": "追求坚韧挺拔、纸身厚实如卡片般的高挺度高端折页吗？",
                "taglineJa": "手に持った時のしっかりとした厚みと、型崩れしないコシの強さが必要ですか？",
                "taglineKo": "두껍고 빳빳하여 구김 없이 반듯한 형태를 유지하는 탄탄한 리플렛인가요?",
                "description": [
                      "Crisp white coated exterior for vivid imagery with natural uncoated inner surface",
                      "Heavyweight 250-350gsm paper stock feels substantial and durable through repeated folds",
                      "Heavy-duty mechanical creasing ensures resilient joints without tearing"
                ],
                "descriptionVi": [
                      "Mặt ngoài trắng mịn tráng phủ bắt màu tươi sáng, mặt trong sần nhẹ tự nhiên",
                      "Định lượng dày từ 250gsm - 350gsm tạo cảm giác đầm tay, bền bỉ qua nhiều lần gấp mở",
                      "Cấn đường gập cơ học chịu lực tốt, không bị rạn nứt hay gãy nếp khi sử dụng lâu dài"
                ],
                "descriptionZh": [
                      "外表面洁白平滑，着墨饱满鲜丽；内层天然纯净，书写舒适",
                      "250至350克厚实克重，挺度极高，多次翻折依然坚挺不垮",
                      "加压深压痕工艺，耐反复折叠，抗疲劳度优秀"
                ],
                "descriptionJa": [
                      "表面は鮮やかな発色の高品質コート、裏面は書き込みやすい自然な白板紙",
                      "250〜350gsmのしっかりとした厚手仕様で、重厚感と高い耐久性を両立",
                      "強固なスジ入れ加工で、長期間繰り返し開閉しても折り目が破れない"
                ],
                "descriptionKo": [
                      "바깥면은 선명한 컬러 발색의 매끄러운 코팅, 안쪽 면은 자연스러운 무코팅 구조",
                      "250~350gsm의 묵직하고 단단한 두께감으로 고급스러운 그립감과 내구성 제공",
                      "정밀 강압 오시 처리로 수없이 접고 펼쳐도 찢어지지 않는 뛰어난 복원력"
                ],
                "descriptionTraits": [
                      "thick-weight",
                      "smooth-base",
                      "foil-accent"
                ],
                "bestFor": [
                      "Long-term sales presentations, medical equipment catalogues, automobile guides",
                      "Pocket-sized corporate profiles, heavy-duty machinery guides, and durable menus",
                      "Tabletop standing bi-folds and luxury multi-panel price sheets"
                ],
                "bestForVi": [
                      "Brochure bán hàng dài hạn, cẩm nang dịch vụ bệnh viện, showroom ô tô",
                      "Tờ gấp hồ sơ năng lực dạng bỏ túi, cẩm nang du lịch cầm tay bền bỉ",
                      "Menu gập để bàn, bảng giá dịch vụ cao cấp cần độ đứng dáng"
                ],
                "bestForZh": [
                      "汽车展厅产品手册、重型机械设备手册、长期销售介绍折页",
                      "高端医院体检手册、耐磨便携口袋企业指南",
                      "桌上立式折页菜单、高端服务价格表"
                ],
                "bestForJa": [
                      "自動車ショールーム、精密医療機器、長期間使用する製品カタログ",
                      "ポケットサイズの耐久型企業ガイド、持ち歩き用施設案内",
                      "卓上スタンド型メニュー、プレミアムサービス料金表"
                ],
                "bestForKo": [
                      "자동차 전시장 쇼룸 가이드, 의료 장비 브로슈어, 장기 영업용 리플렛",
                      "포켓용 회사 프로필, 튼튼한 휴대용 관광 안내서",
                      "탁상형 자립식 메뉴판, VIP 멤버십 서비스 가격표"
                ],
                "image": "/images/product/togapgiayloaii.webp",
                "images": [
                      "/images/product/togapgiayloaii.webp",
                      "/images/product/togapgiayloaii2.webp",
                      "/images/product/togapgiayloaii3.webp"
                ]
          },
          {
                "icon": "Layers",
                "name": "Kraft Paper (Vintage & Eco-friendly)",
                "nameVi": "Giấy Kraft",
                "nameZh": "环保牛皮纸 Kraft（复古原生态）",
                "nameJa": "クラフト紙（ヴィンテージ・エコナチュラル）",
                "nameKo": "친환경 크라프트지 (빈티지 내추럴 감성)",
                "tagline": "Aiming for an earthy, rustic vintage aesthetic with strong sustainability appeal?",
                "taglineVi": "Bạn yêu thích phong cách mộc mạc, vintage cổ điển và thông điệp xanh thân thiện môi trường?",
                "taglineZh": "喜欢原木质朴风情，传递环保可持续理念的创意品牌物料吗？",
                "taglineJa": "どこか懐かしく温かみのあるクラフト感と、環境への優しさをアピールしたいですか？",
                "taglineKo": "자연 친화적이고 아날로그한 빈티지 무드로 감성을 전달하는 친환경 인쇄물인가요?",
                "description": [
                      "Natural brown unbleached wood pulp paper with high tear strength and tensile flexibility",
                      "Warm golden-brown tone radiating authentic rustic, handmade vintage charm",
                      "100% recyclable, echoing organic sustainability for coffee, bakery, and lifestyle brands"
                ],
                "descriptionVi": [
                      "Chất giấy Kraft nâu mộc tự nhiên từ sợi gỗ nguyên sinh, dẻo dai và chịu lực tốt",
                      "Tông màu nâu vàng ấm áp đặc trưng, mang đậm chất cổ điển (vintage & retro)",
                      "Tạo ấn tượng thân thiện môi trường, tái chế 100%, rất được ưa chuộng trong ngành F&B, thời trang"
                ],
                "descriptionZh": [
                      "天然未漂白原生木浆牛皮纸，纤维韧性极高，抗拉耐撕裂",
                      "标志性温润大地色调，极具手工温度与美式复古（Vintage）格调",
                      "100%可降解可回收，完美契合咖啡轻食、有机农业及环保品牌"
                ],
                "descriptionJa": [
                      "無漂白の天然木材パルプから作られた、丈夫で破れにくいクラフト紙",
                      "温もりのあるアースカラーが、自然派・レトロ・ヴィンテージな世界観を構築",
                      "100%リサイクル可能なエコ素材で、環境配慮型ブランドの姿勢をアピール"
                ],
                "descriptionKo": [
                      "무표백 천연 펄프로 제작되어 질기고 찢어짐에 강한 자연주의 크라프트지",
                      "따스한 브라운 톤이 주는 아날로그 빈티지 감성과 핸드메이드 감각",
                      "100% 재활용 가능한 친환경 소재로 지속 가능한 가치를 추구하는 브랜드에 제격"
                ],
                "descriptionTraits": [
                      "natural-grain",
                      "soft-light",
                      "foil-accent"
                ],
                "bestFor": [
                      "Coffee shop and artisan bakery folded menus, craft breweries, organic farm brochures",
                      "Handmade leather goods, eco-conscious streetwear, sustainable lifestyle pamphlets",
                      "Eco-tourism itineraries, green community projects, and environmental initiatives"
                ],
                "bestForVi": [
                      "Menu gấp quán cà phê, tiệm bánh, nhà hàng món ăn hữu cơ (organic)",
                      "Tờ gấp thương hiệu thời trang vintage, xưởng thủ công mỹ nghệ, quà tặng xanh",
                      "Brochure các dự án bảo vệ môi trường, nông nghiệp sạch và du lịch sinh thái"
                ],
                "bestForZh": [
                      "独立咖啡馆、精品烘焙、有机农场、精酿啤酒折页菜单",
                      "手工皮具工坊、复古潮牌服饰、可持续生活方式指南",
                      "生态农旅项目宣传、绿色环保公益活动手册"
                ],
                "bestForJa": [
                      "カフェ、ベーカリー、クラフトビール、オーガニックレストランの折りメニュー",
                      "ハンドメイド革製品、エシカルファッション、ナチュラルコスメ案内",
                      "エコツアー案内、地域創生・環境保全プロジェクトのパンフレット"
                ],
                "bestForKo": [
                      "스페셜티 카페, 베이커리, 수제 맥주 펍, 유기농 레스토랑 접지 메뉴판",
                      "핸드메이드 가죽 공방, 빈티지 패션, 에코 뷰티 브랜드 소개서",
                      "친환경 생태 관광, 로컬 파밍 프로젝트 및 그린 이니셔티브 리플렛"
                ],
                "image": "/images/product/togap-giaykraft.webp",
                "images": [
                      "/images/product/togap-giaykraft.webp",
                      "/images/product/togap-giaykraft2.webp",
                      "/images/product/togap-giaykraft3.webp"
                ]
          }
    ]
  },
  {
    "id": "ve-tickets",
    "categoryId": "marketing",
    "titleVi": "Vé - Tickets",
    "titleEn": "Tickets & Event Passes",
    "titleZh": "门票/入场券 - Tickets",
    "titleJa": "チケット・入場券",
    "titleKo": "티켓 / 입장권",
    "descriptionVi": "Vé vào cổng, vé mời VIP và vòng tay sự kiện tích hợp số nhảy, mã QR và cấn răng cưa xé cuống tiện lợi.",
    "descriptionEn": "Admission tickets, VIP event invitations, and wristbands with serial numbers, QR codes, and tear-off stubs.",
    "coverImage": "/images/category/ve.webp",
    "shapes": [
      {
        "id": "ve-moi-su-kien",
        "nameVi": "Vé mời sự kiện",
        "nameEn": "Event Invitation Passes",
        "nameZh": "活动邀请门票",
        "nameJa": "イベント招待チケット",
        "nameKo": "행사 VIP 초청 티켓",
        "descriptionVi": "Quy cách vé giấy cứng cấn răng cưa xé cuống, đóng số nhảy kiểm soát an ninh sự kiện.",
        "descriptionEn": "Cardstock ticket with perforated tear-off stub, sequential numbering, and security barcode.",
        "image": "/images/category/vemoisukien.webp",
        "badgeVi": "Xé cuống",
        "badgeEn": "Perforated"
      },
      {
        "id": "vong-tay-su-kien",
        "nameVi": "Vòng tay sự kiện",
        "nameEn": "Event Wristbands",
        "nameZh": "活动防水手环",
        "nameJa": "イベント用リストバンド",
        "nameKo": "행사용 방수 손목 밴드",
        "descriptionVi": "Vòng tay giấy nhựa Tyvek dai không rách, keo dán dùng 1 lần chống giả mạo tại đại nhạc hội.",
        "descriptionEn": "Tear-proof waterproof Tyvek wristband with tamper-evident adhesive closure for concerts and waterparks.",
        "image": "/images/category/vongtaysukien.webp",
        "badgeVi": "Chống nước",
        "badgeEn": "Waterproof",
        "materials": WRISTBAND_MATERIALS
      }
    ],
    "materials": [
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "nameZh": "铜版纸 C200 - C300（双面覆膜）",
        "nameJa": "コート紙（C紙 200-300gsm・両面PP加工）",
        "nameKo": "스노우지/아트지 C지 (200-300gsm 무광코팅)",
        "tagline": "Need sharp, vivid event tickets with clean tear-off stubs, serial numbers, and barcodes?",
        "taglineVi": "Bạn cần in vé sự kiện sắc nét, màu sắc tươi sáng, có đường răng cưa xé cuống tiện lợi?",
        "taglineZh": "需要色彩艳丽、带有易撕虚线副券和防伪编号的标准门票吗？",
        "taglineJa": "発色が鮮やかで、ミシン目入り半券や連番印字に対応した標準イベントチケットですか？",
        "taglineKo": "선명한 컬러 인쇄와 절취선(미싱), 일련번호 및 바코드가 적용된 표준 티켓인가요?",
        "description": [
          "Sturdy 200-300gsm Couche cardstock delivering ultra-crisp photo reproduction and vivid graphics",
          "Protective matte or gloss lamination safeguards against edge curls and minor moisture",
          "Supports precision perforation for tear-off stubs, sequential serial numbers, and scannable QR security codes"
        ],
        "descriptionVi": [
          "Giấy Couche 200gsm - 300gsm dày dặn, bề mặt láng mịn, in ấn hình ảnh và biểu trưng sắc nét",
          "Cán màng mờ hoặc bóng bảo vệ, chống nhăn mép và hạn chế thấm nước nhẹ",
          "Hỗ trợ gia công cấn 1 hoặc 2 đường răng cưa xé cuống, đóng số nhảy (serial) và in mã QR code chống giả"
        ],
        "descriptionZh": [
          "选用200至300克厚实铜版纸，印刷细腻饱和，色彩夺目",
          "表面覆光膜或哑膜保护，耐折防潮，不易卷边",
          "支持单条或双条齿线打孔撕券、激光可变流水号及防伪二维码"
        ],
        "descriptionJa": [
          "写真やビジュアルが高精細に映える200〜300gsmの厚手コート紙",
          "マット・グロスPP加工でチケットの耐久性を高め、水濡れや折れを防止",
          "ミシン目加工（もぎり半券）、ナンバリング（可変連番）、QRコード印字に対応"
        ],
        "descriptionKo": [
          "사진과 그래픽이 선명하게 표현되는 200~300gsm 탄탄한 고급 코팅 스노우지",
          "무광/유광 코팅으로 티켓의 구김을 방지하고 생활 방수 기능 제공",
          "미싱 가공(절취선), 일련번호 넘버링, 위조 방지 QR코드 및 바코드 인쇄 완벽 지원"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "foil-accent"
        ],
        "bestFor": [
          "Music concerts, live events, sports matches, cinema, and theatre passes",
          "Theme parks, museum admissions, art exhibitions, and commercial expos",
          "VIP gala dinner invitations, corporate banquets, and award ceremony passes"
        ],
        "bestForVi": [
          "Vé ca nhạc, liveshow, sự kiện thể thao, hội thảo và rạp chiếu phim",
          "Vé vào cổng khu vui chơi, bảo tàng, triển lãm nghệ thuật và hội chợ thương mại",
          "Vé mời VIP dự tiệc tri ân, gala dinner và lễ trao giải"
        ],
        "bestForZh": [
          "音乐会、演唱会、体育赛事、电影院及戏剧演出门票",
          "主题乐园、博物馆门票、艺术展览及商贸博览会入场券",
          "VIP宴会邀请函、企业答谢晚宴及颁奖典礼入场券"
        ],
        "bestForJa": [
          "音楽フェス、コンサート、スポーツ観戦、映画館、演劇チケット",
          "テーマパーク、博物館、アート展示会、ビジネスEXPO入場券",
          "VIPガラディナー招待状、企業懇親会、表彰式パス"
        ],
        "bestForKo": [
          "콘서트, 라이브 공연, 스포츠 경기, 영화관 및 연극 티켓",
          "테마파크, 박물관, 미술 전시회, 박람회 입장권",
          "VIP 갈라 디너 초청장, 기업 감사의 밤, 시상식 입장권"
        ],
        "image": "/images/product/ve-giayloaic.webp",
        "images": [
          "/images/product/ve-giayloaic.webp",
          "/images/product/ve-giayloaic2.webp",
          "/images/product/ve-giayloaic3.webp"
        ]
      },
      {
        "icon": "Layers",
        "name": "Type F Paper (Uncoated Ford)",
        "nameVi": "Giấy loại F",
        "nameZh": "道林纸 Ford 100 - 200gsm（无涂布易书写）",
        "nameJa": "上質紙（F紙 100-200gsm・筆記性抜群）",
        "nameKo": "백색 모조지 F지 (100-200gsm 필기용 티켓)",
        "tagline": "Need tickets that can be easily signed, stamped, or written on with pens without smudging?",
        "taglineVi": "Bạn cần vé có thể dễ dàng ký tên, ghi thông tin bằng bút bi và đóng dấu mộc không lem mực?",
        "taglineZh": "需要方便现场手写信息、盖章不晕墨的质朴实用型票券吗？",
        "taglineJa": "ボールペンでの記入や社印・スタンプの捺印がにじまない実用的なチケットですか？",
        "taglineKo": "현장에서 볼펜으로 서명하거나 도장을 찍어도 번짐 없는 실용적인 발권용 티켓인가요?",
        "description": [
          "Natural uncoated wood-free texture absorbs ballpoint ink and company stamps instantly with zero smear",
          "Non-glare matte surface makes serial numbers and visitor details effortless to verify under any lighting",
          "Bound into handy booklets with perforated tear-off stubs and sequential numbering for audit control"
        ],
        "descriptionVi": [
          "Chất giấy Ford mộc tự nhiên không tráng phủ, bám mực bút bi và mực con dấu cực tốt, khô ngay lập tức",
          "Bề mặt không phản chiếu ánh sáng, dễ dàng đọc số seri và kiểm tra thông tin dưới mọi điều kiện ánh sáng",
          "Đóng thành cuốn có rãnh xé cuống lưu cùi vé và đóng số nhảy liên tục, tiện lợi cho việc đối soát doanh thu"
        ],
        "descriptionZh": [
          "无涂层纯木浆道林纸，圆珠笔书写顺畅，印泥印章即盖即干不脏手",
          "纸面亚光柔和零反光，便于工作人员快速核对票面编号与登记信息",
          "可装订成册（附带存根联），带连续流水编号，财务对账清晰"
        ],
        "descriptionJa": [
          "コーティングのない上質紙で、ペンでのサインや認印の捺印が速乾性に優れにじみません",
          "光の反射がなく、薄暗い会場や屋外でも連番や文字がしっかり視認可能",
          "半券控え付きの冊子（チケットブック）製本に対応し、売上管理もスムーズ"
        ],
        "descriptionKo": [
          "무코팅 천연 모조지로 볼펜 서명 및 고무 도장 날인 시 번짐 없이 즉시 건조",
          "빛 반사가 없는 매트한 표면으로 어두운 조명 아래서도 일련번호 식별 용이",
          "보관용 절취 부본이 포함된 북(Book) 형태로 제본 가능하여 정산 및 관리 편리"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "thick-weight"
        ],
        "bestFor": [
          "Parking tickets, ferry and passenger transport tickets, scenic spot passes",
          "Raffle draw tickets, lucky draw coupons, receipts with admission slip",
          "Food festival admissions, community sports meets, and charity fundraisers"
        ],
        "bestForVi": [
          "Vé xe, vé giữ xe ngày và đêm, vé phà, vé tham quan danh lam thắng cảnh",
          "Phiếu bốc thăm trúng thưởng, vé cào may mắn, phiếu thu kiêm vé sự kiện",
          "Vé vào cổng hội chợ ẩm thực, chợ phiên, sự kiện từ thiện và giải đấu phong trào"
        ],
        "bestForZh": [
          "停车场停车票、客运渡轮票、景区景点观光票",
          "幸运抽奖券、刮刮乐互动券、收款收据兼入场券",
          "美食节入场券、社区运动会、公益慈善义卖门票"
        ],
        "bestForJa": [
          "駐車場利用券、フェリー・交通機関乗車券、景勝地入場券",
          "抽選券、ラッフルチケット、領収証兼入場チケット",
          "フードフェスチケット、地域スポーツ大会、チャリティバザー"
        ],
        "bestForKo": [
          "주차권, 여객선 및 대중교통 탑승권, 관광지 입장권",
          "경품 추첨권, 럭키 드로우 쿠폰, 영수증 겸용 입장 티켓",
          "푸드 페스티벌 티켓, 지역 체육대회, 자선 바자회 입장권"
        ],
        "image": "/images/product/ve-giayloaif.webp",
        "images": [
          "/images/product/ve-giayloaif.webp",
          "/images/product/ve-giayloaif2.webp",
          "/images/product/ve-giayloaif3.webp"
        ]
      },
      {
        "icon": "ShieldCheck",
        "name": "PVC Plastic (Waterproof & Tear-proof)",
        "nameVi": "Nhựa PVC",
        "nameZh": "PVC防水塑料卡（抗撕裂·永久保存）",
        "nameJa": "PVCプラスチック（完全防水・高耐久VIPパス）",
        "nameKo": "고내구성 PVC 플라스틱 (100% 방수 및 찢김 방지)",
        "tagline": "Need a tear-proof, 100% waterproof VIP pass or multi-day pass with ultimate counterfeit protection?",
        "taglineVi": "Bạn cần vé VIP siêu bền, chống nước tuyệt đối, không rách và chống giả mạo cho sự kiện nhiều ngày?",
        "taglineZh": "多天大型音乐节或水上项目，急需绝对防水、抗撕防伪的顶级VIP通行证？",
        "taglineJa": "複数日開催のフェスや水上イベントに、破れず濡れても安心な最高級VIPパスをお求めですか？",
        "taglineKo": "다회용 시즌 패스나 워터파크 페스티벌을 위한 100% 방수, 무훼손 최고급 VIP 패스인가요?",
        "description": [
          "100% waterproof virgin PVC composite that remains completely intact through heavy rain or water splashes",
          "Available in 0.3mm flexible plastic or 0.76mm rigid ISO card gauge with rounded protective corners",
          "Supports hot foil accents, unique QR/barcodes, optional RFID/NFC chips, and lanyard slot punch"
        ],
        "descriptionVi": [
          "Chất liệu nhựa PVC nguyên sinh chống nước 100%, không bị nhàu nát hay xé rách dù ngâm nước",
          "Độ dày tùy chọn từ 0.3mm (nhựa dẻo) đến 0.76mm (nhựa cứng chuẩn ATM), gia công bo 4 góc an toàn",
          "Tích hợp dập nổi nhũ vàng/bạc, mã QR/Barcode bảo mật, chip NFC/RFID hoặc đục lỗ đeo dây chuyên nghiệp"
        ],
        "descriptionZh": [
          "100%全新防水PVC材质，耐水浸泡、防汗防雨，完全不可撕破",
          "厚度可选0.3mm轻便软胶或0.76mm标准ATM硬卡，四角精细圆角不划手",
          "可烫金烫银防伪、植入RFID/NFC感应芯片，并支持打孔佩戴挂绳"
        ],
        "descriptionJa": [
          "雨や汗にも完全無敵の100%防水バージンPVC素材、引き裂き絶対不可",
          "しなやかな0.3mmまたは銀行カード同等の0.76mm厚、安全な角丸加工済み",
          "金銀箔押し、セキュリティQR、RFID/NFCチップ内蔵やネックストラップ用穴あけに対応"
        ],
        "descriptionKo": [
          "폭우나 땀에도 끄떡없는 100% 완전 방수 버진 PVC 소재로 절대 찢어지지 않는 내구성",
          "유연한 0.3mm 플렉서블 또는 은행 카드 규격 0.76mm 하드 타입 선택 가능, 라운딩 마감",
          "금박/은박 후가공, 고유 QR코드, RFID/NFC 칩 탑재 및 목걸이 타공 가공 지원"
        ],
        "descriptionTraits": [
          "waterproof-durability",
          "thick-weight",
          "foil-accent"
        ],
        "bestFor": [
          "Multi-day music festivals, artist & staff laminates, VIP guest all-access credentials",
          "Season passes, gym & fitness club memberships, waterpark & swimming pool passes",
          "High-level international summits, summit conferences, and exclusive gala passes"
        ],
        "bestForVi": [
          "Thẻ đeo VIP Pass, ban tổ chức, thẻ khách mời đặc biệt tại đại nhạc hội nhiều ngày",
          "Vé mùa (Season Pass), vé tập gym/yoga, vé bơi và công viên nước",
          "Vé tham quan tour cao cấp, hội nghị thượng đỉnh quốc tế và thẻ triển lãm VIP"
        ],
        "bestForZh": [
          "大型多日音乐节VIP通行证、工作人员挂牌、特邀嘉宾全通证",
          "水上乐园通票、健身俱乐部年卡季卡、滑雪场季票",
          "国际峰会高端参会证、VIP私享沙龙特许入场凭证"
        ],
        "bestForJa": [
          "野外ロックフェスVIPパス、関係者・アーティスト首掛けパス",
          "ウォーターパークパス、フィットネスクラブ会員パス、シーズンパス",
          "国際サミットVIP入館証、限定シークレットイベントパス"
        ],
        "bestForKo": [
          "뮤직 페스티벌 VIP 올액세스 패스, 행사 스태프 및 아티스트 출입증",
          "워터파크 시즌권, 피트니스 및 요가 멤버십 패스",
          "국제 서밋 VIP 비표, 프리미엄 박람회 및 갈라 디너 입장 패스"
        ],
        "image": "/images/product/ve-nhuapvc.webp",
        "images": [
          "/images/product/ve-nhuapvc.webp",
          "/images/product/ve-nhuapvc2.webp",
          "/images/product/ve-nhuapvc3.webp"
        ]
      }
    ]
  },
  {
    "id": "vong-tay-su-kien",
    "categoryId": "marketing",
    "titleVi": "Vòng tay sự kiện",
    "titleEn": "Event Wristbands",
    "titleZh": "活动防水手环 - Wristbands",
    "titleJa": "イベント用リストバンド",
    "titleKo": "행사용 방수 손목 밴드",
    "descriptionVi": "Vòng tay sự kiện chống nước, chống xé rách, khóa bảo mật 1 lần dùng cho đại nhạc hội, khu vui chơi và hội nghị.",
    "descriptionEn": "Waterproof, tear-resistant event wristbands with tamper-evident security closures for concerts, waterparks, and conferences.",
    "coverImage": "/images/category/vongtaysukien.webp",
    "shapes": [],
    "materials": WRISTBAND_MATERIALS
  },
  {
    "id": "vouchers",
    "categoryId": "marketing",
    "titleVi": "Phiếu Quà Tặng - Gift Vouchers",
    "titleEn": "Gift Vouchers & Cards",
    "titleZh": "礼券卡券 - Gift Vouchers",
    "titleJa": "ギフト券・引換券",
    "titleKo": "기프트 상품권 / 바우처",
    "descriptionVi": "Thẻ quà tặng tri ân khách hàng, kích cầu mua sắm và gia tăng doanh thu với thiết kế sang trọng, chuyên nghiệp.",
    "descriptionEn": "Gift vouchers and loyalty cards driving customer retention and shopping excitement with luxury presentation.",
    "coverImage": "/images/category/phieuquatang.webp",
    "shapes": [
      {
        "id": "phieu-qua-tang-pho-thong",
        "nameVi": "Phiếu quà tặng phổ thông",
        "nameEn": "Standard Gift Vouchers",
        "nameZh": "标准代金券/礼品券",
        "nameJa": "スタンダード商品券",
        "nameKo": "일반 상품권 바우처",
        "descriptionVi": "Kích thước tiêu chuẩn 7x15cm hoặc 10x20cm, in giấy C300 cán màng mờ hoặc bóng, phù hợp cho cửa hàng, spa và nhà hàng.",
        "descriptionEn": "Standard 7x15cm or 10x20cm vouchers on 300gsm Couche with matte or gloss lamination for retail and dining.",
        "image": "/images/category/phieuquatangphothong.webp",
        "badgeVi": "Phổ thông",
        "badgeEn": "Standard"
      },
      {
        "id": "gift-vouchers",
        "nameVi": "Gift Vouchers",
        "nameEn": "Luxury Gift Vouchers",
        "nameZh": "精装定制Gift Vouchers",
        "nameJa": "高級ギフトバウチャー",
        "nameKo": "프리미엄 기프트 바우처",
        "descriptionVi": "Phiếu voucher cao cấp thiết kế kèm bao thư sang trọng, gia công ép kim vàng/bạc ấn tượng.",
        "descriptionEn": "Premium voucher packaged in matching custom envelope with gold foil logo accents.",
        "image": "/images/category/giftvouchers.webp",
        "badgeVi": "Kèm bao thư",
        "badgeEn": "With Envelope"
      },
      {
        "id": "the-tich-diem",
        "nameVi": "Thẻ Tích Điểm",
        "nameEn": "Loyalty / Stamp Cards",
        "nameZh": "会员积分/集点卡",
        "nameJa": "スタンプカード・ポイントカード",
        "nameKo": "스탬프 쿠폰 / 포인트 적립 카드",
        "descriptionVi": "Kích thước namecard nhỏ gọn, giấy Ford hoặc Kraft thấm mực tốt để đóng dấu, tích điểm đổi quà giữ chân khách hàng.",
        "descriptionEn": "Compact pocket-sized cards on uncoated Ford or Kraft paper for easy ink stamping and customer loyalty rewards.",
        "image": "/images/category/thetichdiem.webp",
        "badgeVi": "Tích điểm",
        "badgeEn": "Loyalty"
      },
      {
        "id": "the-cao-khuyen-mai",
        "nameVi": "Thẻ cào khuyến mãi",
        "nameEn": "Scratch-off Promo Cards",
        "nameZh": "刮刮乐抽奖卡",
        "nameJa": "スクラッチくじカード",
        "nameKo": "스크래치 복권 카드",
        "descriptionVi": "Phủ lớp nhũ bạc cào trúng thưởng bảo mật, khơi gợi hào hứng cho các chương trình bốc thăm may mắn.",
        "descriptionEn": "Security scratch-off latex coating concealing winning codes for interactive promotional campaigns.",
        "image": "/images/category/thecaokhuyenmai.webp",
        "badgeVi": "Nhũ cào",
        "badgeEn": "Scratch Off"
      }
    ],
    "materials": VOUCHER_MATERIALS
  },
  {
    "id": "catalogues",
    "categoryId": "marketing",
    "titleVi": "Catalogue - Cẩm Nang",
    "titleEn": "Catalogues & Booklets",
    "titleZh": "产品画册/手册 - Catalogue",
    "titleJa": "カタログ・小冊子",
    "titleKo": "카탈로그 / 핸드북",
    "descriptionVi": "Cuốn tài liệu bán hàng toàn diện, tập hợp toàn bộ danh mục sản phẩm, thông số kỹ thuật và hồ sơ năng lực doanh nghiệp.",
    "descriptionEn": "Comprehensive corporate catalogues and product guides showcasing your full portfolio and technical specs.",
    "coverImage": "/images/category/catalogue-camnang.webp",
    "shapes": [
      {
        "id": "catalogue-tieu-chuan",
        "nameVi": "Catalogue Tiêu Chuẩn",
        "nameEn": "Standard Product Catalogues",
        "nameZh": "标准企业产品画册",
        "nameJa": "標準製品カタログ",
        "nameKo": "표준 제품 카탈로그",
        "descriptionVi": "Quy cách đóng cuốn chuẩn khổ A4, bìa Couche 300 cán màng mờ sang trọng, ruột Couche 150 hiển thị hình ảnh chi tiết sắc nét.",
        "descriptionEn": "Standard A4 saddle-stitched or perfect-bound product catalogue with 300gsm laminated cover and 150gsm vibrant art paper inner pages.",
        "image": "/images/category/cataloguetieuchuan.webp",
        "badgeVi": "Tiêu chuẩn A4",
        "badgeEn": "Standard A4"
      },
      {
        "id": "catalogue-gia-re",
        "nameVi": "Catalogue Giá Rẻ",
        "nameEn": "Economy Budget Catalogues",
        "nameZh": "高性价比宣传画册",
        "nameJa": "格安カタログ製本",
        "nameKo": "실속형 가성비 카탈로그",
        "descriptionVi": "Quy cách đóng cuốn bấm kim giữa, bìa C250 ruột C120 tiết kiệm tối ưu chi phí phân phát hội chợ.",
        "descriptionEn": "Saddle-stitched booklet with 250gsm cover and 120gsm inner pages for cost-efficient trade show hand-outs.",
        "image": "/images/category/cataloguegiare.webp",
        "badgeVi": "Bấm kim",
        "badgeEn": "Saddle Stitched"
      },
      {
        "id": "catalogue-cao-cap",
        "nameVi": "Catalogue Cao Cấp",
        "nameEn": "Premium Luxury Catalogues",
        "nameZh": "精装锁线特种纸画册",
        "nameJa": "上製本・高級アートカタログ",
        "nameKo": "최고급 양장 하드커버 카탈로그",
        "descriptionVi": "Đóng gáy may chỉ keo nhiệt hoặc bìa cứng bồi carton, ép kim UV định hình bìa ngoài sang trọng.",
        "descriptionEn": "Section-sewn perfect bound or hardbound album with cover foil stamping for flagship presentations.",
        "image": "/images/category/cataloguecaocap.webp",
        "badgeVi": "May chỉ keo gáy",
        "badgeEn": "Hardcover / Bound"
      },
      {
        "id": "profile-company",
        "nameVi": "Hồ sơ năng lực",
        "nameEn": "Company Profile Booklets",
        "nameZh": "企业简介/资质实力画册",
        "nameJa": "会社案内・事業実績パンフレット",
        "nameKo": "기업 회사소개서 / 지명원",
        "descriptionVi": "Cuốn hồ sơ năng lực công ty (Company Profile) thể hiện tầm nhìn, năng lực thi công và dự án tiêu biểu phục vụ đấu thầu và gặp gỡ đối tác.",
        "descriptionEn": "Corporate profile and credentials booklet showcasing executive vision, completed projects, and competitive capabilities for bidding and pitches.",
        "image": "/images/category/hosonangluc.webp",
        "badgeVi": "Hồ sơ thầu",
        "badgeEn": "Profile"
      },
      {
        "id": "cam-nang-cam-tay",
        "nameVi": "Cẩm Nang Cầm Tay",
        "nameEn": "Pocket Handbooks & Guides",
        "nameZh": "便携口袋手册",
        "nameJa": "ポケットハンドブック",
        "nameKo": "포켓용 핸드북 / 가이드북",
        "descriptionVi": "Kích thước A5 / A6 nhỏ gọn tiện mang theo, phù hợp hướng dẫn sử dụng sản phẩm và cẩm nang du lịch.",
        "descriptionEn": "Compact A5/A6 booklet designed for user manuals, field guides, and tourist travel companions.",
        "image": "/images/category/camnangcamtay.webp",
        "badgeVi": "Bỏ túi A5/A6",
        "badgeEn": "Pocket Size"
      }
    ],
    "materials": CATALOGUE_MATERIALS
  },
  {
      "id": "danh-thiep",
      "categoryId": "office",
      "titleVi": "Danh thiếp - Namecards",
      "titleEn": "Business Cards - Namecards",
      "titleZh": "名片 - Namecards",
      "titleJa": "名刺 - Namecards",
      "titleKo": "명함 - Namecards",
      "descriptionVi": "Ấn phẩm nhận diện thương hiệu cá nhân và doanh nghiệp, tạo ấn tượng chuyên nghiệp đầu tiên trong các cuộc gặp gỡ đối tác.",
      "descriptionEn": "Essential personal and corporate branding touchpoint, making an immediate professional impression in client meetings.",
      "coverImage": "/images/category/danhthiep.webp",
      "shapes": [
          {
              "id": "danh-thiep-chuan",
              "nameVi": "Danh Thiếp Chuẩn",
              "nameEn": "Standard Business Cards",
              "nameZh": "标准直角名片",
              "nameJa": "標準ビジネス名刺",
              "nameKo": "표준 직각 명함",
              "descriptionVi": "Kích thước tiêu chuẩn 9 x 5.4 cm cắt vuông vức, quy cách phổ biến nhất cho doanh nghiệp và chuyên gia.",
              "descriptionEn": "Standard 9 x 5.4 cm rectangular cut business card, the most versatile format for corporate teams and executives.",
              "image": "/images/category/danhthiep.webp",
              "badgeVi": "Tiêu chuẩn 9x5.4cm",
              "badgeEn": "Standard 9x5.4cm"
          },
          {
              "id": "bo-goc-chuan",
              "nameVi": "Danh Thiếp Bo Góc Chuẩn",
              "nameEn": "Standard Rounded Corner Cards",
              "nameZh": "标准圆角名片",
              "nameJa": "角丸加工名刺",
              "nameKo": "귀도리 라운딩 명함",
              "descriptionVi": "Quy cách bo tròn 4 góc tinh tế, giúp tấm thẻ mềm mại, không bị tưa góc khi cất trong ví.",
              "descriptionEn": "Smooth 4-corner die-cut rounding prevents frayed edges when stored in pockets and wallets.",
              "image": "/images/category/card-bogocchuan.webp",
              "badgeVi": "Bo 4 góc",
              "badgeEn": "Rounded"
          },
          {
              "id": "highlight",
              "nameVi": "Danh Thiếp Highlight",
              "nameEn": "Spot UV Highlight Cards",
              "nameZh": "局部UV高光名片",
              "nameJa": "部分光沢UV名刺",
              "nameKo": "부분 코팅 하이라이트 명함",
              "descriptionVi": "Kỹ thuật phủ bóng UV cục bộ lên logo hoặc hoa văn, tạo độ bóng gồ nổi bắt mắt trên nền mờ.",
              "descriptionEn": "Selective gloss UV coating applied over logos and patterns, creating high-contrast tactile shine.",
              "image": "/images/category/card-highlight.webp",
              "badgeVi": "Phủ bóng UV",
              "badgeEn": "Spot UV"
          },
          {
              "id": "vuong-bo-goc",
              "nameVi": "Danh Thiếp Vuông Bo Góc",
              "nameEn": "Square Rounded Corner Cards",
              "nameZh": "方形圆角名片",
              "nameJa": "正方形角丸名刺",
              "nameKo": "정사각 라운딩 명함",
              "descriptionVi": "Kích thước vuông 5.4 x 5.4 cm bo tròn 4 góc, phong cách hiện đại cho ngành sáng tạo, nhiếp ảnh.",
              "descriptionEn": "Trendy 5.4 x 5.4 cm square card with rounded corners, perfect for photography, fashion, and art studios.",
              "image": "/images/category/card-vuongbogoc.webp",
              "badgeVi": "Vuông bo tròn",
              "badgeEn": "Square Round"
          },
          {
              "id": "vuong",
              "nameVi": "Danh Thiếp Vuông",
              "nameEn": "Square Business Cards",
              "nameZh": "正方形个性名片",
              "nameJa": "スクエア名刺",
              "nameKo": "정사각 명함",
              "descriptionVi": "Kích thước vuông vức độc đáo, phá vỡ tỷ lệ truyền thống để tạo dấu ấn cá nhân khác biệt.",
              "descriptionEn": "Distinctive square form factor breaking traditional proportions to create unforgettable personal presence.",
              "image": "/images/category/card-vuong.webp",
              "badgeVi": "Vuông cá tính",
              "badgeEn": "Square Cut"
          },
          {
              "id": "gap-doi",
              "nameVi": "Danh Thiếp Gấp Đôi",
              "nameEn": "Folded Business Cards",
              "nameZh": "折叠双面名片",
              "nameJa": "二つ折り名刺",
              "nameKo": "접이식 명함",
              "descriptionVi": "Gấp 1 nếp cấn đôi mở ra 4 mặt, tăng gấp đôi không gian chứa menu thu nhỏ, lịch hẹn, sơ đồ địa chỉ.",
              "descriptionEn": "Bi-fold card opening into 4 printable panels, doubling space for appointment tables, mini menus, and maps.",
              "image": "/images/category/card-gapdoi.webp",
              "badgeVi": "4 mặt thông tin",
              "badgeEn": "Bi-Fold"
          },
          {
              "id": "dap-noi-chim",
              "nameVi": "Danh Thiếp Dập Nổi/ Chìm",
              "nameEn": "Embossed / Debossed Cards",
              "nameZh": "起凸/击凹名片",
              "nameJa": "型押し・エンボス名刺",
              "nameKo": "엠보싱/형압 명함",
              "descriptionVi": "Kỹ thuật dập khuôn vật lý tạo độ nổi 3D hoặc chìm sâu ấn tượng cho biểu tượng thương hiệu.",
              "descriptionEn": "Precision die-stamping creating raised 3D emboss or deep deboss relief for high-end emblems.",
              "image": "/images/category/card-dapnoichim.webp",
              "badgeVi": "Khắc nổi 3D",
              "badgeEn": "Embossed"
          },
          {
              "id": "ky-thuat-so",
              "nameVi": "Danh Thiếp Kỹ Thuật Số",
              "nameEn": "Digital Express Business Cards",
              "nameZh": "数码快印名片",
              "nameJa": "オンデマンド名刺",
              "nameKo": "디지털 인쇄 명함",
              "descriptionVi": "In laser kỹ thuật số lấy ngay trong ngày, nhận in số lượng linh hoạt từ 1 - 2 hộp.",
              "descriptionEn": "Same-day high-precision laser output, flexible short-run ordering starting from just 1-2 boxes.",
              "image": "/images/category/card-kithuatso.webp",
              "badgeVi": "Lấy ngay",
              "badgeEn": "Express"
          },
          {
              "id": "thong-minh",
              "nameVi": "Danh Thiếp Thông Minh",
              "nameEn": "Smart NFC Business Cards",
              "nameZh": "智能电子名片",
              "nameJa": "スマート名刺",
              "nameKo": "스마트 NFC 명함",
              "descriptionVi": "Tích hợp chip không dây NFC, chỉ cần chạm vào điện thoại để truyền toàn bộ danh bạ và website.",
              "descriptionEn": "Embedded contactless NFC chip, instantly transfers full contact info, social links, and portfolio with 1 tap.",
              "image": "/images/category/card-thongminh.webp",
              "badgeVi": "Chạm NFC",
              "badgeEn": "Smart NFC"
          }
      ],
      "materials": [
          {
              "icon": "Layers",
              "name": "Type C Paper",
              "nameVi": "Giấy loại C",
              "tagline": "Need a business card that feels premium and stands out?",
              "taglineVi": "Bạn đang cần danh thiếp sang trọng, nổi bật?",
              "description": [
                  "Glossy coated surface with sharp, mirror-like light reflections",
                  "Smooth ivory-white base with no visible paper grain",
                  "Gold foil stamping sits crisp and bright against the glossy coat"
              ],
              "descriptionVi": [
                  "Bề mặt tráng phủ bóng, phản chiếu ánh sáng rõ nét",
                  "Nền trắng ngà mịn, không lộ vân giấy",
                  "Chi tiết ép kim vàng sắc nét, nổi bật trên nền bóng"
              ],
              "descriptionTraits": [
                  "glossy-coat",
                  "smooth-base",
                  "foil-accent"
              ],
              "bestFor": [
                  "Premium business cards and invitations built around a foil accent",
                  "Restaurant, hospitality, and luxury event branding",
                  "Logos or monograms meant to catch the light"
              ],
              "bestForVi": [
                  "Danh thiếp, thiệp mời cao cấp lấy chi tiết ép kim làm điểm nhấn",
                  "Thương hiệu nhà hàng, khách sạn, sự kiện sang trọng",
                  "Logo hoặc monogram cần bắt sáng, gây ấn tượng"
              ],
              "nameZh": "铜版纸 C300（标准款）",
              "nameJa": "コート紙 C300（標準）",
              "nameKo": "스노우지 C300 (표준형)",
              "taglineZh": "需要一张手感高级、令人过目不忘的商务名片吗？",
              "taglineJa": "高級感があり、印象に残るビジネス名刺をお求めですか？",
              "taglineKo": "고급스럽고 돋보이는 비즈니스 명함이 필요하신가요?",
              "descriptionZh": [
                  "高光覆膜表面，如镜面般清晰反射光线",
                  "细腻象牙白底纸，无明显纸纹",
                  "烫金细节清晰锐利，在高光背景下格外醒目"
              ],
              "descriptionJa": [
                  "鏡面のように鮮やかに光を反射するグロスコーティング表面",
                  "紙目のない滑らかなアイボリーホワイト地",
                  "光沢のある表面に金箔押しがシャープに映えます"
              ],
              "descriptionKo": [
                  "거울처럼 빛을 선명하게 반사하는 유광 코팅 표면",
                  "종이 결이 드러나지 않는 매끄러운 순백색 베이스",
                  "유광 배경 위로 금박 디테일이 또렷하고 선명하게 돋보임"
              ],
              "bestForZh": [
                  "以烫金点缀为核心的高端名片与邀请函",
                  "餐厅、高端酒店及奢华活动品牌识别",
                  "需要突出光泽质感与视觉冲击的品牌标志"
              ],
              "bestForJa": [
                  "箔押しをアクセントにした高級名刺や招待状",
                  "レストラン、ホテル、ラグジュアリーイベントのブランディング",
                  "光を受けて輝くロゴやモノグラムの表現"
              ],
              "bestForKo": [
                  "금박 가공 포인트를 살린 프리미엄 명함 및 초대장",
                  "호텔, 레스토랑, 럭셔리 이벤트 브랜드 아이덴티티",
                  "빛을 받아 시선을 사로잡는 로고 및 엠블럼"
              ],
              "pureImage": "/images/product/card-giayloaic1.webp",
              "pureImages": [
                  "/images/product/card-giayloaic1.webp",
                  "/images/product/card-giayloaic5.webp",
                  "/images/product/card-giayloaic6.webp"
              ]
          },
          {
              "icon": "Feather",
              "name": "Type F Paper",
              "nameVi": "Giấy loại F",
              "tagline": "Need a minimalist, refined card for everyday work?",
              "taglineVi": "Bạn đang cần danh thiếp tối giản, tinh tế cho công việc hằng ngày?",
              "description": [
                  "Natural matte surface with a fine, visible paper grain",
                  "Diffused light with no glare or reflection",
                  "Gold foil still stands out, but with a more understated, refined tone"
              ],
              "descriptionVi": [
                  "Bề mặt nhám tự nhiên, có vân giấy mịn",
                  "Ánh sáng khuếch tán đều, không chói, không phản quang",
                  "Chi tiết ép kim vàng vẫn nổi bật nhưng mang tông trầm, tinh tế hơn"
              ],
              "descriptionTraits": [
                  "natural-grain",
                  "soft-light",
                  "foil-accent"
              ],
              "bestFor": [
                  "Corporate and office cards with a minimalist feel",
                  "Premium brands that want an understated, non-flashy look",
                  "Designs pairing a subtle foil detail with a natural paper base"
              ],
              "bestForVi": [
                  "Danh thiếp doanh nghiệp, văn phòng theo phong cách tối giản",
                  "Thương hiệu cao cấp muốn vẻ ngoài tinh tế, không phô trương",
                  "Thiết kế kết hợp chi tiết ép kim tinh giản trên nền giấy tự nhiên"
              ],
              "nameZh": "道林纸 300gsm（亚光质感）",
              "nameJa": "上質紙 300gsm（非塗工マット）",
              "nameKo": "모조지 300gsm (무광 비코팅)",
              "taglineZh": "正在寻找一款简约雅致、适合日常书写的名片吗？",
              "taglineJa": "日常業務に適した、シンプルで洗練された名刺をお探しですか？",
              "taglineKo": "일상 업무에 적합한 미니멀하고 세련된 명함이 필요하신가요?",
              "descriptionZh": [
                  "表面自然微糙，便于钢笔与圆珠笔书写",
                  "吸墨均匀，色彩温润柔和无眩光",
                  "环保厚实纸张，手感朴实温润"
              ],
              "descriptionJa": [
                  "ペンで書き込みやすい自然なマットテクスチャ",
                  "インク吸収性が良く、反射のない落ち着いた発色",
                  "環境に配慮したしっかりとした厚みと素朴な風合い"
              ],
              "descriptionKo": [
                  "펜 글씨 작성이 용이한 자연스러운 무광 텍스처",
                  "잉크 흡수력이 우수하고 눈부심 없는 부드러운 발색",
                  "친환경적이고 도톰한 두께감으로 전해지는 따뜻한 촉감"
              ],
              "bestForZh": [
                  "诊所、工作室、需要现场手写备注的顾问名片",
                  "倡导环保简约理念的现代品牌",
                  "追求经典低调纸质触感的专业人士"
              ],
              "bestForJa": [
                  "手書きメモを追記するクリニックやコンサルタント名刺",
                  "環境配慮とシンプルさを重視するブランド",
                  "クラシックで落ち着いた紙の質感を好むビジネスパーソン"
              ],
              "bestForKo": [
                  "메모 기입이 필요한 병원, 스튜디오, 전문직 상담 명함",
                  "친환경 미니멀리즘을 지향하는 현대 브랜드",
                  "차분하고 클래식한 종이 감성을 선호하는 비즈니스맨"
              ],
              "pureImage": "/images/product/card-giayloaif.webp",
              "pureImages": [
                  "/images/product/card-giayloaif.webp",
                  "/images/product/card-giayloaif2.webp",
                  "/images/product/card-giayloaif3.webp"
              ],
          },
          {
              "icon": "Palette",
              "name": "Luxury Art Paper",
              "nameVi": "Giấy Mỹ Thuật",
              "tagline": "Need a tactile, artistic card that conveys craftsmanship?",
              "taglineVi": "Bạn muốn danh thiếp mang đậm chất nghệ thuật và cảm giác xúc giác đặc biệt?",
              "description": [
                  "Distinct textured surface with luxury European art paper feel",
                  "Rich ink absorption that gives colors a deep, matte aesthetic",
                  "Pairs beautifully with minimal typography and foil stamping"
              ],
              "descriptionVi": [
                  "Bề mặt có vân giấy đặc trưng, mang lại cảm giác sang trọng khi chạm",
                  "Độ thấm hút mực cao, giúp màu sắc hiển thị sâu và trầm ấm",
                  "Kết hợp tuyệt vời với thiết kế tối giản và ép kim điểm nhấn"
              ],
              "descriptionTraits": [
                  "textured-art",
                  "natural-grain",
                  "foil-accent"
              ],
              "bestFor": [
                  "Creative directors, architects, and luxury boutique brands",
                  "High-end corporate executives seeking a distinctive tactile card",
                  "Minimalist designs where the paper texture itself is the highlight"
              ],
              "bestForVi": [
                  "Giám đốc sáng tạo, kiến trúc sư và thương hiệu cao cấp",
                  "Lãnh đạo doanh nghiệp muốn danh thiếp tạo ấn tượng xúc giác khác biệt",
                  "Thiết kế tối giản lấy chính vân giấy làm điểm nhấn chủ đạo"
              ],
              "nameZh": "特种艺术纸（纹理典雅）",
              "nameJa": "高級ファインアート紙（風合い紙）",
              "nameKo": "고급 수입 예술지 (질감지)",
              "taglineZh": "想要一张富含艺术触感与匠人质感的尊贵名片吗？",
              "taglineJa": "職人技を感じさせる、風合い豊かなアーティスティック名刺をお望みですか？",
              "taglineKo": "장인정신과 특별한 촉감이 느껴지는 프리미엄 예술지 명함을 원하시나요?",
              "descriptionZh": [
                  "独特触感纸张纹理，每张名片都独具个性",
                  "高克重进口特种纸，挺括不易折损",
                  "完美契合烫金、击凸等立体加工工艺"
              ],
              "descriptionJa": [
                  "指先に伝わる独自のテクスチャで個性を演出",
                  "しっかりとしたコシのある高坪量輸入特殊紙",
                  "箔押しや空押し加工との相性が抜群"
              ],
              "descriptionKo": [
                  "손끝에 닿는 독특한 텍스처로 전해지는 고급스러운 개성",
                  "구겨짐 없는 탄탄한 고평량 수입 특수지",
                  "금박 및 형압 가공과 완벽한 조화를 이루는 프리미엄 용지"
              ],
              "bestForZh": [
                  "建筑师、室内设计师与创意艺术机构",
                  "轻奢品牌与私人定制会员卡",
                  "追求非凡品味与第一印象的商务精英"
              ],
              "bestForJa": [
                  "建築家、インテリアデザイナー、クリエイティブスタジオ",
                  "ハイエンドブランドやプライベートサロン会員証",
                  "特別な第一印象を大切にするビジネスエグゼクティブ"
              ],
              "bestForKo": [
                  "건축가, 디자이너, 크리에이티브 스튜디오",
                  "하이엔드 브랜드 및 프라이빗 클럽 VIP 카드",
                  "차별화된 첫인상을 남기고자 하는 비즈니스 리더"
              ],
              "pureImage": "/images/product/card-giaymythuat.webp",
              "pureImages": [
                  "/images/product/card-giaymythuat.webp",
                  "/images/product/card-giaymythuat2.webp",
                  "/images/product/card-giaymythuat3.webp"
              ],
          },
          {
              "icon": "ShieldCheck",
              "name": "Waterproof Synthetic Plastic Card",
              "nameVi": "Giấy Nhựa (Siêu Bền)",
              "tagline": "Need an indestructible card that won't tear, wrinkle, or absorb water?",
              "taglineVi": "Bạn cần danh thiếp chống nước 100%, không bao giờ rách hay phai màu?",
              "description": [
                  "100% waterproof synthetic PVC/PET film that never absorbs moisture",
                  "Ultra-durable and tear-resistant against bending and heavy wear",
                  "Crisp, modern surface with optional frosted or translucent finishes"
              ],
              "descriptionVi": [
                  "Tổng hợp chống thấm nước 100%",
                  "Độ bền vượt trội, không thể xé rách hay gấp nếp trong quá trình sử dụng",
                  "Bề mặt hiện đại, sắc nét với tùy chọn trong mờ hoặc trắng sứ"
              ],
              "descriptionTraits": [
                  "waterproof-durability",
                  "smooth-base",
                  "glossy-coat"
              ],
              "bestFor": [
                  "Hospitality, bars, poolside clubs, and marine industries",
                  "Long-lasting membership, VIP, or warranty cards",
                  "Professionals wanting a unique, conversation-starting material"
              ],
              "bestForVi": [
                  "Nhà hàng, quán bar, câu lạc bộ và môi trường thường xuyên tiếp xúc nước",
                  "Thẻ thành viên dài hạn, thẻ VIP hoặc thẻ bảo hành cao cấp",
                  "Khách hàng muốn sở hữu tấm thẻ độc đáo, không bao giờ bị hỏng"
              ],
              "nameZh": "防水撕不烂合成塑料卡",
              "nameJa": "耐水合成プラスチックカード",
              "nameKo": "방수 합성 플라스틱 카드",
              "taglineZh": "需要一张100%防水防油、撕不烂且永久耐用的坚韧名片吗？",
              "taglineJa": "水や油に強く、破れない高耐久な名刺が必要ですか？",
              "taglineKo": "물과 기름에 젖지 않고 찢어지지 않는 반영구 명함이 필요하신가요?",
              "descriptionZh": [
                  "100%防水防潮防油，可直接用水冲洗",
                  "高韧性合成塑料基材，反复弯折不破损",
                  "户外恶劣环境使用依然色彩如新"
              ],
              "descriptionJa": [
                  "水・油・湿気に強く、水洗い可能な100%耐水仕様",
                  "折り曲げても破れない高耐久合成樹脂素材",
                  "屋外や過酷な環境下でも色褪せない抜群の耐久性"
              ],
              "descriptionKo": [
                  "물과 습기에 젖지 않으며 세척 가능한 100% 완전 방수",
                  "구겨지거나 찢어지지 않는 고인성 합성 수지 재질",
                  "야외 및 습한 환경에서도 변색 없는 반영구 내구성"
              ],
              "bestForZh": [
                  "泳池水疗、餐饮后厨、化工及制造工程名片",
                  "VIP会员卡、行李吊牌及长期保存的联络卡",
                  "户外探险、体育俱乐部及活动入场凭证"
              ],
              "bestForJa": [
                  "スパ、飲食店の厨房、製造業や現場作業の名刺",
                  "VIP会員証、手荷物タグ、長期保管用カード",
                  "アウトドア、スポーツクラブ、イベントパス"
              ],
              "bestForKo": [
                  "스파, 워터파크, 주방 및 현장 작업 환경의 명함",
                  "VIP 멤버십 카드, 캐리어 러기지택, 영구 보관용 연락처 카드",
                  "아웃도어, 스포츠 클럽 및 현장 출입증"
              ],
              "hideFoilCheckbox": true,
              "pureImage": "/images/product/card-giaynhua.webp",
              "pureImages": [
                  "/images/product/card-giaynhua.webp",
                  "/images/product/card-giaynhua2.webp",
                  "/images/product/card-giaynhua3.webp"
              ],
          },         
      ]
  },

  {
    "id": "bao-thu",
    "categoryId": "office",
    "titleVi": "Bao thư - Envelopes",
    "titleEn": "Envelopes",
    "titleZh": "信封 - Envelopes",
    "titleJa": "封筒 - Envelopes",
    "titleKo": "봉투 - Envelopes",
    "descriptionVi": "Bao thư văn phòng gửi hợp đồng, báo giá và thư ngỏ đối tác với nắp dán keo chờ tiện lợi, nâng tầm uy tín doanh nghiệp.",
    "descriptionEn": "Professional corporate correspondence envelopes for contracts, invoices, and formal greetings.",
    "coverImage": "/images/category/baothu.webp",
    "shapes": [
      {
        "id": "bao-thu-lay-ngay",
        "nameVi": "Bao thư lấy ngay",
        "nameEn": "Express Fast Envelopes",
        "nameZh": "急件速印信封",
        "nameJa": "即日仕上げ封筒",
        "nameKo": "당일 급행 봉투",
        "descriptionVi": "In nhanh kỹ thuật số số lượng ít lấy ngay trong ngày, sẵn sàng phục vụ sự kiện gấp.",
        "descriptionEn": "Digital express printing in short runs delivered within the day for urgent meetings.",
        "image": "/images/category/baothulayngay.webp",
        "badgeVi": "Lấy ngay",
        "badgeEn": "Express"
      },
      {
        "id": "bao-thu-nho",
        "nameVi": "Bao thư nhỏ",
        "nameEn": "Small Envelopes (12x22cm)",
        "nameZh": "小号信封 (12x22cm)",
        "nameJa": "小サイズ封筒 (長3)",
        "nameKo": "소봉투 (12x22cm)",
        "descriptionVi": "Kích thước tiêu chuẩn 12x22cm (nắp 3cm), nắp có keo chờ bóc dán, phù hợp gửi thư tay, thiệp chúc mừng, thư ngỏ và phiếu voucher.",
        "descriptionEn": "Standard 12x22cm (3cm flap) envelope with peel-and-seal adhesive, perfect for formal letters, greeting cards, and vouchers.",
        "image": "/images/category/baothunho.webp",
        "badgeVi": "12x22cm",
        "badgeEn": "Small 12x22cm"
      },
      {
        "id": "bao-thu-trung",
        "nameVi": "Bao thư trung",
        "nameEn": "Medium Envelopes (16x23cm)",
        "nameZh": "中号信封 (16x23cm)",
        "nameJa": "中サイズ封筒 (角3)",
        "nameKo": "중봉투 (16x23cm)",
        "descriptionVi": "Kích thước 16x23cm (A5), nắp dán keo sẵn tiện lợi, đựng vừa vặn tờ rơi A5, cuốn catalogue mini hoặc chứng từ gấp đôi.",
        "descriptionEn": "Medium 16x23cm (A5) envelope with adhesive strip, sized for A5 flyers, mini booklets, and folded statements.",
        "image": "/images/category/baothutrung.webp",
        "badgeVi": "16x23cm",
        "badgeEn": "Medium A5"
      },
      {
        "id": "bao-thu-lon",
        "nameVi": "Bao thư lớn",
        "nameEn": "Large Envelopes (25x35cm)",
        "nameZh": "大号信封 (25x35cm)",
        "nameJa": "大サイズ封筒 (角2)",
        "nameKo": "대봉투 (25x35cm)",
        "descriptionVi": "Kích thước chuẩn 25x35cm đựng trọn vẹn tài liệu A4 không cần gấp, hồ sơ năng lực, hợp đồng kinh tế và catalogue dày dặn.",
        "descriptionEn": "Large 25x35cm A4 envelope holding unfolded contracts, company profiles, and thick catalogues securely.",
        "image": "/images/category/baothulon.webp",
        "badgeVi": "25x35cm A4",
        "badgeEn": "Large A4"
      },
      {
        "id": "bao-thu-cua-so",
        "nameVi": "Bao thư cửa sổ kính",
        "nameEn": "Clear Window Envelopes",
        "nameZh": "透明开窗信封",
        "nameJa": "窓付き封筒",
        "nameKo": "창문 투명 봉투",
        "descriptionVi": "Khoét cửa sổ dán màng kính trong suốt lộ tên người nhận và địa chỉ in sẵn trên tài liệu.",
        "descriptionEn": "Die-cut clear film window revealing recipient address printed on inner invoice documents.",
        "image": "/images/category/baothucuasokinh.webp",
        "badgeVi": "Cửa sổ kính",
        "badgeEn": "Window Film"
      }
    ],
    "materials": [
      {
        "icon": "Feather",
        "name": "Type F Paper",
        "nameVi": "Giấy loại F",
        "tagline": "Need classic uncoated envelopes that are easy to write on and stamp?",
        "taglineVi": "Bạn cần bao thư văn phòng chuẩn mực, dễ dàng viết tay và đóng dấu mộc?",
        "description": [
          "High-whiteness uncoated surface with a smooth, natural paper grain",
          "Absorbs ink instantly without smudging when signing or stamping",
          "Industry standard for corporate invoices, contracts, and daily correspondence"
        ],
        "descriptionVi": [
          "Bề mặt nhám mịn tự nhiên, độ trắng cao chuẩn văn phòng",
          "Thấm hút mực ký tên, viết tay và mực dấu mộc tức thì không bị nhòe",
          "Chất liệu chuẩn mực cho gửi hóa đơn, hợp đồng và thư từ giao dịch hằng ngày"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Corporate daily correspondence, invoices, and legal contracts",
          "Government, educational, and administrative mailings",
          "Companies seeking a professional, reliable, and cost-effective envelope"
        ],
        "bestForVi": [
          "Gửi thư từ giao dịch hằng ngày, hóa đơn, hợp đồng pháp lý doanh nghiệp",
          "Các cơ quan hành chính, trường học và tổ chức giáo dục",
          "Doanh nghiệp cần bao thư chuẩn mực, uy tín và tối ưu ngân sách"
        ],
        "nameZh": "道林纸 100-120gsm 商务公函信封",
        "nameJa": "上質紙 100-120gsm ビジネス定形封筒",
        "nameKo": "모조지 100-120gsm 표준 기업 봉투",
        "taglineZh": "邮寄发票、商务信函与日常公文的标准办公信封？",
        "taglineJa": "請求書や公文書の郵送に適した、標準的なビジネス封筒をお求めですか？",
        "taglineKo": "세금계산서나 공식 공문 발송에 가장 널리 쓰이는 표준 비즈니스 봉투인가요?",
        "descriptionZh": [
          "100-120gsm平滑洁白道林纸，纸质匀密不透墨",
          "耐磨抗撕裂，信封四角折痕挺括规范，糊口牢固不爆边",
          "支持单色或多色印刷公司Logo、地址及标准公函格式"
        ],
        "descriptionJa": [
          "100〜120gsmの上質紙を使用、中身が透けにくい安心の厚み",
          "折り目がしっかりしており、郵送時の擦れや破れにも強い",
          "社名・ロゴ・住所などを鮮明に印刷できる定番ビジネス仕様"
        ],
        "descriptionKo": [
          "100-120gsm 깨끗하고 매끄러운 모조지로 내부 비침이 적음",
          "접힘 선이 반듯하고 접착면이 튼튼하여 우편 발송 중 터짐 방지",
          "회사 로고, 주소, 우편번호 규격에 맞춘 깔끔한 정석 비즈니스 봉투"
        ],
        "bestForZh": [
          "增值税发票寄送、商业合同快递及常规公函往来",
          "日常办公行政信件、员工薪资单密封递送",
          "大批量采购、经久实用且成本优化的企业标配信封"
        ],
        "bestForJa": [
          "請求書・領収書・契約書の郵送、公的文書の発送",
          "日常のビジネスレター、給与明細書の社内配布",
          "大量に使用するオフィス向けの高コスパ封筒"
        ],
        "bestForKo": [
          "세금계산서, 정식 계약서, 공문서 우편 발송",
          "일상적인 거래처 안내문, 사내 급여 명세서 밀봉 전달",
          "대량 발주로 단가를 낮추면서 신뢰감을 주는 표준 기업 봉투"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/baothu-giayloaif.webp",
        "pureImages": [
          "/images/product/baothu-giayloaif.webp",
          "/images/product/baothu-giayloaif2.webp",
          "/images/product/baothu-giayloaif3.webp"
        ]
      },
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "tagline": "Need durable, waterproof envelopes with sharp corporate brand colors?",
        "taglineVi": "Bạn cần bao thư màu sắc rực rỡ, cứng cáp và cán màng chống ẩm ướt?",
        "description": [
          "Smooth coated surface with protective matte lamination for extra water resistance",
          "Vibrant CMYK full-bleed color printing that makes logos pop",
          "Higher paper weight providing a sturdy, substantial feel in the hand"
        ],
        "descriptionVi": [
          "Bề mặt tráng phủ láng mịn, cán màng mờ bảo vệ hạn chế thấm nước",
          "In màu CMYK tràn viền rực rỡ, giúp logo và màu thương hiệu sắc nét",
          "Định lượng giấy dày dặn, tạo cảm giác sang trọng và chắc tay khi nhận"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Real estate brochures, VIP event invitations, and sales kits",
          "Marketing agencies and brands with rich graphic identities",
          "Protecting important documents during courier or post delivery"
        ],
        "bestForVi": [
          "Gửi brochure dự án bất động sản, thiệp mời sự kiện VIP, bộ sales kit",
          "Các thương hiệu chú trọng hình ảnh đồ họa màu sắc rực rỡ",
          "Bảo vệ tài liệu quan trọng khi gửi qua bưu điện hoặc chuyển phát nhanh"
        ],
        "nameZh": "铜版纸 150-200gsm 彩印覆膜信封",
        "nameJa": "コート紙 150-200gsm カラーPP加工封筒",
        "nameKo": "스노우지 150-200gsm 컬러 코팅 봉투",
        "taglineZh": "全彩印刷企业VI品牌色，覆保护膜抗污耐磨？",
        "taglineJa": "コーポレートカラーを鮮やかに全面印刷し、汚れに強い封筒ですか？",
        "taglineKo": "회사 브랜드 컬러를 풀컬러로 선명하게 인쇄하고 오염을 방지한 봉투인가요?",
        "descriptionZh": [
          "150-200gsm厚实铜版纸，表面覆哑光膜提供全方位保护",
          "防水抗污耐折痕，有效抵抗潮湿天气与快递摩擦",
          "可满版印刷企业鲜艳标准VI底色，色彩饱和绚丽"
        ],
        "descriptionJa": [
          "150〜200gsmの厚手コート紙に両面マットPP加工で耐久性抜群",
          "撥水性があり汚れに強く、雨の日の配達でも中の書類を保護",
          "全面にコーポレートカラーを鮮やかに印刷できる華やかな仕様"
        ],
        "descriptionKo": [
          "150-200gsm 도톰한 스노우지에 무광 코팅으로 탁월한 내구성",
          "방수성과 오염 방지 기능으로 우천 시 배송에도 서류 완벽 보호",
          "회사 고유의 브랜드 컬러를 배경 전체에 선명하게 풀컬러 인쇄 가능"
        ],
        "bestForZh": [
          "高端商业营销信函、品牌宣传折页与VIP答谢信",
          "展会现场递交的重要项目资料袋、企业形象信封",
          "注重品牌色彩识别度、追求现代时尚质感的商业机构"
        ],
        "bestForJa": [
          "VIP顧客へのダイレクトメール、新製品案内の送付",
          "展示会や商談で手渡すプロモーション用資料封筒",
          "ブランドイメージを高めたいモダンな企業・サロン"
        ],
        "bestForKo": [
          "VIP 고객 전용 스페셜 다이렉트 메일(DM), 감사 카드 발송",
          "박람회 현장에서 건네는 프리미엄 프로젝트 제안서 봉투",
          "브랜드 컬러를 강렬하게 각인시키고자 하는 마케팅 봉투"
        ],
        "pureImage": "/images/product/baothu-giayloaic.webp",
        "pureImages": [
          "/images/product/baothu-giayloaic.webp",
          "/images/product/baothu-giayloaic2.webp",
          "/images/product/baothu-giayloaic3.webp"
        ],
      },
      {
        "icon": "Palette",
        "name": "Luxury Art Paper (EconoWhite / Modigliani)",
        "nameVi": "Giấy Mỹ Thuật Cao Cấp (EconoWhite / Modigliani)",
        "tagline": "Want a prestige tactile envelope that conveys high status before it's opened?",
        "taglineVi": "Bạn muốn bao thư mang đẳng cấp xúc giác sang trọng ngay trước khi mở thư?",
        "description": [
          "European textured art paper with distinctive tactile grain and warmth",
          "Refined, muted color tone that exudes luxury and understated elegance",
          "Pairs beautifully with metallic gold or silver foil logo stamping"
        ],
        "descriptionVi": [
          "Có vân nhám đặc trưng, cảm giác chạm cao cấp",
          "Màu sắc trầm ấm, thanh lịch, mang lại ấn tượng thẩm mỹ sang trọng",
          "Kết hợp hoàn hảo với chi tiết ép kim logo nhũ vàng hoặc nhũ bạc"
        ],
        "descriptionTraits": [
          "textured-art",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "C-suite executive mailings, luxury real estate, and private banking",
          "Law firms, architecture studios, and high-end hospitality brands",
          "Exclusive event invitations and VIP client correspondence"
        ],
        "bestForVi": [
          "Thư tín của lãnh đạo cấp cao, bất động sản hạng sang, ngân hàng VIP",
          "Văn phòng luật sư, studio kiến trúc và chuỗi khách sạn 5 sao",
          "Thiệp mời sự kiện đặc biệt và thư cảm ơn gửi khách hàng VIP"
        ],
        "nameZh": "高端特种艺术纸公函信封",
        "nameJa": "最高級特殊アート紙エグゼクティブ封筒",
        "nameKo": "수입 최고급 질감지 VIP 봉투",
        "taglineZh": "递送董事会决议、私人晚宴邀请函的尊崇定制信封？",
        "taglineJa": "VIPへの招待状や重要文書を送るための、格調高い特製封筒ですか？",
        "taglineKo": "VIP 초청장이나 핵심 기밀 문서를 봉인하여 전달할 명품 봉투인가요?",
        "descriptionZh": [
          "精选欧洲原产高档粗纹艺术纸，自带棉柔典雅质感",
          "封口造型可定制欧式三角封口或复古火漆印章封口",
          "奢华内敛，递交瞬间传递发件方的极高规格礼遇"
        ],
        "descriptionJa": [
          "ヨーロッパ直輸入の最高級特殊アート紙、手触りで伝わる品格",
          "優雅なダイヤモンドフラップ（洋封筒）やシーリングワックスに対応",
          "手にした瞬間に相手への敬意と特別な思いを伝えるマスターピース"
        ],
        "descriptionKo": [
          "유럽 직수입 최고급 질감지로 손끝에서 느껴지는 부드럽고 묵직한 품격",
          "우아한 다이아몬드 삼각 플랩 디자인 및 맞춤 실링 왁스 날인 가능",
          "봉투를 받는 순간 발송인의 높은 격식과 진심 어린 예우 전달"
        ],
        "bestForZh": [
          "董事会重要决议、私人银行家族信托保密文件",
          "奢华婚礼喜帖、顶级艺术晚宴与高规格庆典邀请函",
          "送交重要政商界领袖与战略贵宾的专属私享公函"
        ],
        "bestForJa": [
          "役員向け重要親展、プライベートバンキングの重要書類",
          "高級結婚式の招待状、ギャラリーレセプションの案内状",
          "重要取引先のエグゼクティブへ直接手渡す特別な書状"
        ],
        "bestForKo": [
          "이사회 중요 기밀 문서, 프라이빗 뱅킹(PB) 자산 관리 리포트",
          "특급 호텔 웨딩 청첩장, 럭셔리 갈라 디너 및 VIP 파티 초청장",
          "정재계 주요 귀빈 및 해외 파트너에게 전하는 최고급 의전 봉투"
        ],
        "pureImage": "/images/product/baothu-giaymythuat.webp",
        "pureImages": [
          "/images/product/baothu-giaymythuat.webp",
          "/images/product/baothu-giaymythuat2.webp",
          "/images/product/baothu-giaymythuat3.webp"
        ],
      },
      {
        "icon": "ShieldCheck",
        "name": "Natural Kraft Paper 180 - 250gsm",
        "nameVi": "Giấy Kraft Tự Nhiên (Eco-Rustic)",
        "tagline": "Need eco-friendly envelopes with a distinctive rustic, sustainable look?",
        "taglineVi": "Bạn cần bao thư mang phong cách mộc mạc, thân thiện với môi trường?",
        "description": [
          "100% recycled natural brown kraft paper with organic fiber texture",
          "High tensile strength and tear resistance for secure mailing",
          "Creates an authentic, artisanal aesthetic when printed with black ink or foil"
        ],
        "descriptionVi": [
          "Màu nâu tự nhiên tái chế 100% với vân xơ giấy mộc mạc, chân thực",
          "Độ dai cao, chống rách tốt khi vận chuyển bưu phẩm",
          "Tạo phong cách nghệ thuật cổ điển, tinh tế khi in màu đơn sắc hoặc ép kim"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Eco-conscious brands, sustainable fashion, and organic cosmetics",
          "Artisan coffee shops, boutique hotels, and craft workshops",
          "Creative direct mail campaigns aiming to stand out from white mail"
        ],
        "bestForVi": [
          "Thương hiệu xanh, thời trang bền vững và mỹ phẩm hữu cơ",
          "Quán cafe thủ công, boutique hotel và studio sáng tạo",
          "Chiến dịch marketing gửi thư tay tạo điểm nhấn khác biệt với bao thư trắng"
        ],
        "nameZh": "复古牛皮环保文件档案信封",
        "nameJa": "クラフト紙レトロ封筒（エコ仕様）",
        "nameKo": "친환경 크라프트 서류 봉투",
        "taglineZh": "经典耐磨牛皮纸材质，保护厚重合同与档案资料？",
        "taglineJa": "厚手で丈夫なクラフト紙を使用し、重要書類をしっかり保護する封筒ですか？",
        "taglineKo": "질기고 튼튼하여 두꺼운 계약서나 포트폴리오를 안전하게 담을 크라프트 봉투인가요?",
        "descriptionZh": [
          "180-250gsm高克重天然复古牛皮纸，纸质坚韧抗撕拉",
          "原木原色纤维清晰可见，散发纯朴环保的工坊质感",
          "大容量结构设计，可安心收纳厚叠合同与档案"
        ],
        "descriptionJa": [
          "180〜250gsmの厚口天然クラフト紙、破れにくく抜群の耐久性",
          "木の温もりが伝わる未晒の風合いで、環境に優しいエコ仕様",
          "厚みのある契約書やカタログも安心して収容できる頑丈さ"
        ],
        "descriptionKo": [
          "180-250gsm 고평량 천연 크라프트지로 질기고 찢어짐에 극도로 강함",
          "자연 그대로의 나무 섬유가 살아있는 빈티지 친환경 감성",
          "두꺼운 계약서 묶음이나 카탈로그도 안심하고 담는 대용량 보관력"
        ],
        "bestForZh": [
          "工程设计图纸、法律厚合同、审计底稿及项目档案归档",
          "建筑设计院、环保科研机构及文创工作室公函",
          "用于邮寄厚重书籍、画册与样品的坚固保护袋"
        ],
        "bestForJa": [
          "建築図面、厚手の契約書、法的文書、監査資料の保管",
          "デザイン事務所、環境NGO、レトロなセレクトショップ",
          "重みのある冊子やサンプルの発送用タフ封筒"
        ],
        "bestForKo": [
          "건축 설계 도면, 두꺼운 법률 소송 서류, 회계 감사 보고서 보관",
          "디자인 에이전시, 친환경 소셜 벤처, 문화예술 단체 공문 봉투",
          "두께감 있는 책자나 원단 샘플을 안전하게 우편 발송하는 보호 봉투"
        ],
        "pureImage": "/images/product/baothu-giaykraft.webp",
        "pureImages": [
          "/images/product/baothu-giaykraft.webp",
          "/images/product/baothu-giaykraft2.webp",
          "/images/product/baothu-giaykraft3.webp"
        ],
      },
    ]
  },
  {
      "id": "ao-thun",
      "categoryId": "office",
      "titleVi": "Áo thun đồng phục",
      "titleEn": "Uniform T-Shirts",
      "titleZh": "企业制服T恤",
      "titleJa": "ユニフォームTシャツ",
      "titleKo": "단체 유니폼 티셔츠",
      "descriptionVi": "Đồng phục doanh nghiệp, sự kiện và team building tạo sự gắn kết tập thể, thêu hoặc in logo sắc sảo bền màu.",
      "descriptionEn": "Custom corporate polo and crewneck shirts creating team cohesion with sharp embroidery and screen prints.",
      "coverImage": "/images/category/aothundongphuc.webp",
      "shapes": [
          {
              "id": "ao-thun-co-tru",
              "nameVi": "Áo thun đồng phục cổ trụ",
              "nameEn": "Polo Collar Uniform Shirts",
              "nameZh": "翻领POLO工装",
              "nameJa": "ポロシャツユニフォーム",
              "nameKo": "카라 폴로 단체 티셔츠",
              "descriptionVi": "Cổ bẻ bo dệt thanh lịch, lịch sự trong giao tiếp văn phòng và gặp gỡ khách hàng.",
              "descriptionEn": "Smart rib-knit collar polo shirt, offering professional presentation in sales and office work.",
              "image": "/images/category/aothundongphuccotru.webp",
              "badgeVi": "Cổ Polo",
              "badgeEn": "Polo"
          },
          {
              "id": "ao-thun-co-tron",
              "nameVi": "Áo thun đồng phục cổ tròn",
              "nameEn": "Round Neck Uniform T-Shirts",
              "nameZh": "圆领纯棉T恤",
              "nameJa": "クルーネックTシャツ",
              "nameKo": "라운드넥 단체 티셔츠",
              "descriptionVi": "Kiểu dáng cổ tròn năng động, thoải mái vận động cho các hoạt động ngoại khóa, team building.",
              "descriptionEn": "Comfortable crewneck design allowing active movement for sports events and outdoor team building.",
              "image": "/images/category/aothundongphuccotron.webp",
              "badgeVi": "Cổ tròn",
              "badgeEn": "Crewneck"
          }
      ],
      "materials": [
          {
              "icon": "Shirt",
              "name": "Cotton Fabric",
              "nameVi": "Vải cotton",
              "nameZh": "纯棉面料 Cotton",
              "nameJa": "コットン生地（綿100%）",
              "nameKo": "순면 코튼 원단",
              "tagline": "Seeking 100% natural cotton that is ultra-soft, breathable, and skin-friendly?",
              "taglineVi": "Bạn cần chất vải 100% cotton tự nhiên mềm mại, thấm hút mồ hôi tối đa và thân thiện với làn da?",
              "taglineZh": "需要柔软透气、亲肤吸汗且四季舒适的100%天然纯棉面料吗？",
              "taglineJa": "肌触りが柔らかく、通気性と吸汗性に優れた100%天然コットン素材をお求めですか？",
              "taglineKo": "피부에 자극 없이 부드럽고 땀 흡수와 통기성이 뛰어난 100% 순면 원단을 찾으시나요?",
              "description": [
                  "100% premium combed natural cotton with smooth surface and zero skin irritation",
                  "Superior moisture-wicking and 4-way flexibility keeping you cool and comfortable all day",
                  "Excellent color affinity for sharp DTF digital printing and durable silkscreen graphics"
              ],
              "descriptionVi": [
                  "Chất vải cotton tự nhiên dệt chải kỹ, bề mặt mềm mịn, không gây kích ứng da",
                  "Khả năng thấm hút mồ hôi và co giãn 4 chiều thoáng mát suốt ngày dài năng động",
                  "Bắt màu in sắc nét, hoàn hảo cho công nghệ in chuyển nhiệt DTF hoặc in lụa cao cấp"
              ],
              "descriptionZh": [
                  "100%精梳天然纯棉，面料平整细腻，亲肤舒适无刺激",
                  "卓越的吸湿排汗与四面弹力，长时间穿着依然清爽透气",
                  "印花显色细腻逼真，完美支持DTF数码直喷及高精丝网印花"
              ],
              "descriptionJa": [
                  "厳選されたコーマ糸100%天然コットン、なめらかな肌触りで敏感肌にも安心",
                  "抜群の吸水性と通気性、4方向ストレッチで一日中快適な着心地",
                  "発色性に優れ、DTFデジタル転写プリントや高精細シルクスクリーンに対応"
              ],
              "descriptionKo": [
                  "100% 고급 코마사 천연 순면 원단으로 부드러운 촉감과 피부 저자극성 보장",
                  "우수한 땀 흡수력과 4방향 신축성으로 하루 종일 쾌적하고 편안한 활동성 제공",
                  "선명한 프린팅 발색력으로 DTF 열전사 및 고급 나염 실크스크린 인쇄에 최적화"
              ],
              "descriptionTraits": [
                  "soft-light",
                  "smooth-base",
                  "eco-friendly"
              ],
              "bestFor": [
                  "Corporate culture t-shirts, startup casual wear, customer gifts",
                  "Youth volunteer teams, student unions, school clubs, creative workshops",
                  "Music festivals, outdoor marathons, community campaigns"
              ],
              "bestForVi": [
                  "Áo thun văn phòng trẻ trung, đồng phục startup, quà tặng khách hàng thân thiết",
                  "Đội nhóm tình nguyện, câu lạc bộ sinh viên, trường học, workshop sáng tạo",
                  "Sự kiện văn hóa nghệ thuật, giải chạy marathon, hoạt động vì cộng đồng"
              ],
              "bestForZh": [
                  "企业文化衫、初创团队日常便服及客户定制伴手礼",
                  "青年志愿者团队、高校社团、创意工坊活动制服",
                  "音乐节、马拉松赛事及品牌线下快闪活动"
              ],
              "bestForJa": [
                  "企業のスタッフTシャツ、スタートアップのカジュアル制服、ノベルティグッズ",
                  "ボランティア団体、学生サークル、学校行事、クリエイティブワークショップ",
                  "音楽フェス、マラソン大会、地域コミュニティイベント"
              ],
              "bestForKo": [
                  "기업 사내 단체티, 스타트업 캐주얼 유니폼 및 고객 감사 사은품",
                  "청년 봉사단, 대학 동아리, 학교 축제, 크리에이티브 워크숍 단체복",
                  "뮤직 페스티벌, 마라톤 대회 및 브랜드 팝업 행사 티셔츠"
              ],
              "hideFoilCheckbox": true,
              "pureImage": "/images/product/aothundongphuc-vaicotton.webp",
              "pureImages": [
                  "/images/product/aothundongphuc-vaicotton.webp",
                  "/images/product/aothundongphuc-vaicotton2.webp",
                  "/images/product/aothundongphuc-vaicotton3.webp"
              ]
          },
          {
              "icon": "Shirt",
              "name": "Pique Fabric (Lacoste)",
              "nameVi": "Vải cá sấu",
              "nameZh": "珠地网眼面料 Pique (鳄鱼布)",
              "nameJa": "鹿の子生地（ポロシャツ・ピケ・ラコステ調）",
              "nameKo": "PK 피케 원단 (카라티·라코스테 조직)",
              "tagline": "Need a structured, elegant pique fabric that maintains crisp collars and corporate professionalism?",
              "taglineVi": "Bạn muốn form áo đứng dáng, mắt dệt cá sấu sang trọng, lịch lãm khi gặp đối tác và khách hàng?",
              "taglineZh": "需要挺括有型、经典珠地网眼织造且商务感十足的经典POLO面料吗？",
              "taglineJa": "型崩れしにくく、上品な鹿の子編みでオフィスカジュアルにふさわしいポロシャツ生地ですか？",
              "taglineKo": "단정한 핏을 유지하며 클래식한 벌집 피케 조직으로 고급스러운 비즈니스 폴로 원단인가요?",
              "description": [
                  "Classic honeycomb pique knit texture with elegant structure and wrinkle resistance",
                  "Holds collar and shoulder silhouette firmly, resisting sagging or curling over 50+ washes",
                  "Ideal for computerized high-density logo embroidery and crisp chest pocket accents"
              ],
              "descriptionVi": [
                  "Mắt dệt hình tổ ong (pique) đặc trưng, dệt dày dặn đứng form và chống nhăn hiệu quả",
                  "Giữ dáng cổ áo bẻ và bờ vai cứng cáp, không bị xệ hay bai dão sau nhiều lần giặt",
                  "Đặc biệt phù hợp thêu vi tính logo sắc sảo độ nét cao ở ngực áo và tay áo"
              ],
              "descriptionZh": [
                  "经典蜂巢珠地网眼立体编织，厚实挺括，防皱耐磨不起球",
                  "领口与肩部线条立体坚挺，多次洗涤依然保持干练利落身形",
                  "与高密度电脑刺绣LOGO及胸口口袋设计完美契合，尽显商务质感"
              ],
              "descriptionJa": [
                  "立体的な鹿の子（ピケ）編み組織で、通気性に優れシワになりにくい構造",
                  "襟元と肩のシルエットを美しくキープし、繰り返しの洗濯でも型崩れを防止",
                  "胸元や袖への精密なコンピューター刺繍ロゴ加工に最も適したプレミアム素材"
              ],
              "descriptionKo": [
                  "클래식한 벌집 피케 조직감으로 구김 없이 단정한 실루엣과 탁월한 통기성 제공",
                  "칼라와 어깨 라인이 탄탄하게 유지되어 세탁 후에도 목 늘어남 및 변형 방지",
                  "가슴 및 소매 부분의 정밀 컴퓨터 자수 로고 표현에 가장 적합한 비즈니스 원단"
              ],
              "descriptionTraits": [
                  "thick-weight",
                  "textured-art",
                  "smooth-base"
              ],
              "bestFor": [
                  "Corporate office uniforms, sales representatives, customer consultants",
                  "Hospitality, hotel staff, fine dining restaurant front-of-house teams",
                  "Golf tournaments, executive trade expos, corporate anniversary gifts"
              ],
              "bestForVi": [
                  "Đồng phục công sở văn phòng, đội ngũ nhân viên kinh doanh, tư vấn viên",
                  "Nhà hàng cao cấp, khách sạn, chuỗi F&B, nhân sự tiếp đón tiền sảnh",
                  "Giải đấu thể thao golf, hội nghị triển lãm thương mại, kỷ niệm thành lập công ty"
              ],
              "bestForZh": [
                  "企业白领工装、商务销售团队、VIP客服顾问专属制服",
                  "星级酒店前台、高端连锁餐饮、会所前厅接待团队",
                  "高尔夫赛事、国际商贸博览会参展团队及周年庆典定制礼品"
              ],
              "bestForJa": [
                  "オフィスカジュアル制服、営業担当者、カスタマーコンサルタント",
                  "高級ホテル、レストラン、飲食チェーンのホール接客スタッフ",
                  "ゴルフコンペ、展示会出展ブーススタッフ、企業創立記念ウェア"
              ],
              "bestForKo": [
                  "기업 사무직 유니폼, 영업 및 컨설팅 부서 정장형 캐주얼 단체복",
                  "호텔, 고급 레스토랑 및 프랜차이즈 매장 프론트 서비스 직원",
                  "기업 골프 대회, 국제 무역 엑스포 참가팀 및 창립 기념 특별 유니폼"
              ],
              "hideFoilCheckbox": true,
              "pureImage": "/images/product/aothundongphuc-vaicasau.webp",
              "pureImages": [
                  "/images/product/aothundongphuc-vaicasau.webp",
                  "/images/product/aothundongphuc-vaicasau2.webp",
                  "/images/product/aothundongphuc-vaicasau3.webp"
              ]
          },
          {
              "icon": "Zap",
              "name": "Cool Spandex Fabric",
              "nameVi": "Vải thun lạnh",
              "nameZh": "冰爽丝滑速干面料 Cool Spandex",
              "nameJa": "接触冷感クールストレッチ（吸汗速乾）",
              "nameKo": "쿨 스판 기능성 원단 (냉감·흡한속건)",
              "tagline": "Looking for an ice-cool, fast-drying, and ultra-stretchy fabric for high-energy activities?",
              "taglineVi": "Bạn cần chất vải trơn mát lạnh khi chạm vào, mau khô tức thì và chống bám bụi bẩn cho sự kiện năng động?",
              "taglineZh": "需要触手生凉、瞬间速干且超强弹性的户外运动与团建制服面料吗？",
              "taglineJa": "触れた瞬間にひんやり心地よく、速乾性に優れたスポーツ＆イベント向け機能性素材ですか？",
              "taglineKo": "닿는 순간 시원한 쿨링감과 초고속 땀 건조 기능을 갖춘 활동적인 스포츠/행사용 원단인가요?",
              "description": [
                  "Silky polyester-spandex blend with instant cool-to-touch sensation and zero clinging",
                  "Ultra-quick moisture evaporation technology keeps skin dry during heavy exertion",
                  "Smooth, snag-resistant surface with vibrant sublimation all-over print capabilities"
              ],
              "descriptionVi": [
                  "Sợi Poly-Spandex trơn láng, mang lại cảm giác mát lạnh tức thì khi chạm vào da, không dính rít",
                  "Công nghệ thoát nhiệt và làm khô siêu tốc, ngăn mồ hôi ứ đọng khi vận động cường độ cao",
                  "Bề mặt chống bám bụi và chống nhăn tuyệt đối, in chuyển nhiệt 3D tràn viền sắc nét bền vĩnh viễn"
              ],
              "descriptionZh": [
                  "高支涤氨混纺面料，丝滑垂坠，触肤瞬间带来冰爽体感，不黏腻",
                  "专业级微孔排汗速干科技，剧烈运动下依然保持体表干爽舒适",
                  "不易粘毛防灰尘，完全支持3D热升华全幅彩印，色彩永不褪色"
              ],
              "descriptionJa": [
                  "ポリエステル・スパンデックス混紡のシルキータッチ、触れた瞬間に冷たさを感じる接触冷感",
                  "マイクロ吸汗速乾テクノロジーにより、激しい運動時でもサラサラ感が持続",
                  "シワやホコリが付きにくく、鮮やかなフルカラー昇華転写プリントに最適"
              ],
              "descriptionKo": [
                  "폴리-스판덱스 기능성 블렌딩으로 피부에 닿자마자 시원한 촉감과 매끄러운 드레이프성 선사",
                  "초고속 수분 흡수·배출 에어로쿨 기능으로 땀을 빠르게 건조시켜 격렬한 활동에도 쾌적함 유지",
                  "먼지가 묻지 않고 구김이 전혀 없으며, 화려한 전면 3D 승화 전사 나염 인쇄에 완벽 대응"
              ],
              "descriptionTraits": [
                  "waterproof-durability",
                  "soft-light",
                  "smooth-base"
              ],
              "bestFor": [
                  "Outdoor team building, corporate sports days, factory & warehouse teams",
                  "Gym fitness trainers, marathon running clubs, cycle racing teams",
                  "High-energy summer promotional campaigns and festival crews"
              ],
              "bestForVi": [
                  "Team building ngoài trời, hội thao doanh nghiệp, nhân sự nhà xưởng và kho vận",
                  "Huấn luyện viên gym, câu lạc bộ chạy bộ marathon, đội nhóm đạp xe thể thao",
                  "Chiến dịch quảng bá sự kiện mùa hè, PG/PB hội chợ ngoài trời sôi động"
              ],
              "bestForZh": [
                  "户外拓展团建、企业趣味运动会、工厂车间及仓储物流团队",
                  "健身房教练、马拉松跑团、骑行俱乐部等高强度运动团队",
                  "夏季户外地推推广、商演路演PG团队及大型音乐节志愿者"
              ],
              "bestForJa": [
                  "野外チームビルディング、社内運動会、工場・物流現場スタッフ",
                  "フィットネスジムトレーナー、ランニングクラブ、サイクルスポーツチーム",
                  "夏季屋外プロモーションイベント、販促キャンペーンスタッフウェア"
              ],
              "bestForKo": [
                  "야외 단체 팀빌딩, 사내 체육대회, 생산 현장 및 물류 센터 근무복",
                  "피트니스 트레이너 유니폼, 마라톤 러닝 크루, 사이클링 클럽 동호회복",
                  "여름철 야외 프로모션 행사, 로드쇼 홍보 스태프 및 서머 페스티벌 진행요원"
              ],
              "hideFoilCheckbox": true,
              "pureImage": "/images/product/aothundongphuc-vaithunlanh.webp",
              "pureImages": [
                  "/images/product/aothundongphuc-vaithunlanh.webp",
                  "/images/product/aothundongphuc-vaithunlanh2.webp",
                  "/images/product/aothundongphuc-vaithunlanh3.webp"
              ]
          }
      ]
  },

  {
      "id": "giay-ghi-chu",
      "categoryId": "office",
      "titleVi": "Giấy ghi chú - Block notes",
      "titleEn": "Block Notes & Memo Pads",
      "titleZh": "便签本 - Block notes",
      "titleJa": "メモ帳 - Block notes",
      "titleKo": "메모지 - Block notes",
      "descriptionVi": "Sổ tay ghi chú, memo pad đặt bàn văn phòng tiện dụng, đồng hành trong mọi buổi họp và làm quà tặng nội bộ.",
      "descriptionEn": "Custom desktop memo pads and block notes for quick daily ideas and client meeting gifts.",
      "coverImage": "/images/category/giayghichu.webp",
      "shapes": [
          {
              "id": "giay-ghi-chu-block",
              "nameVi": "Giấy ghi chú (Block notes)",
              "nameEn": "Desk Memo Block Notes",
              "nameZh": "办公便签纸",
              "nameJa": "デスク用ブロックメモ",
              "nameKo": "사무용 떡메모지",
              "descriptionVi": "Đóng block keo gáy xé từng tờ tiện lợi, in logo và đường kẻ mờ trang nhã trên từng trang giấy.",
              "descriptionEn": "Padded glue-top tear-off memo block with branded watermark and light rule lines on each sheet.",
              "image": "/images/category/blocknote.webp",
              "badgeVi": "Keo gáy xé",
              "badgeEn": "Tear-off Pad"
          }
      ],
      "materials": [
          {
              "icon": "Feather",
              "name": "Type F Paper (Ford)",
              "nameVi": "Giấy loại F",
              "nameZh": "道林纸 F类 (Ford)",
              "nameJa": "上質紙（Fタイプ・モジョ紙）",
              "nameKo": "모조지 F타입 (Ford)",
              "tagline": "Need smooth, ink-friendly note paper that prevents bleeding and facilitates fast writing?",
              "taglineVi": "Bạn cần xấp giấy note viết êm tay, thấm mực nhanh không lem nhòe cho các ghi chú văn phòng?",
              "taglineZh": "需要纸面顺滑平整、书写不洇墨且护眼舒适的办公便签纸吗？",
              "taglineJa": "インクが滲まず、ペン先が滑らかに走る書き心地抜群の上質メモ用紙をお求めですか？",
              "taglineKo": "잉크 번짐 없이 부드럽게 써지며 일상 업무 메모에 최적화된 백색 모조지인가요?",
              "description": [
                  "High-whiteness uncoated 80-100gsm Ford paper with smooth surface and zero glare",
                  "Optimal ink absorption with rapid drying for ballpoint, gel pens, and fountain pens",
                  "Padded glue top allows effortless, crisp tear-off without ragged sheet edges"
              ],
              "descriptionVi": [
                  "Chất giấy Ford trắng ngà 80gsm - 100gsm mịn lì, độ bám mực tốt và không gây lóa mắt",
                  "Thấm mực nhanh, không lem khi viết bằng bút bi, bút gel hay bút máy chuyên dụng",
                  "Gia công keo gáy chắc chắn, dễ dàng xé rời từng tờ phẳng phiu không bị rách góc"
              ],
              "descriptionZh": [
                  "80至100克优质无涂布道林纸，纸质平滑，视觉柔和不眩光",
                  "吸墨均匀迅速，圆珠笔、水性笔及钢笔均能顺畅书写不透墨",
                  "顶部环保胶装压痕牢固，撕取利落整齐，不掉页不毛边"
              ],
              "descriptionJa": [
                  "80〜100gsmの高級上質紙を使用し、反射を抑えた目に優しい仕上がり",
                  "インクの吸収性と速乾性に優れ、ボールペンや万年筆でも裏抜けなし",
                  "天のり加工で1枚ずつ綺麗に切り離せ、角折れや破れを防ぎます"
              ],
              "descriptionKo": [
                  "80~100gsm 프리미엄 무도공 모조지로 눈의 피로를 덜어주는 부드러운 백색도",
                  "빠른 잉크 건조성으로 볼펜, 젤펜, 만년필 사용 시에도 번짐 및 비침 방지",
                  "상단 풀제본 떡메모 가공으로 한 장씩 깔끔하게 뜯어 쓰기 편리"
              ],
              "descriptionTraits": [
                  "natural-grain",
                  "smooth-base",
                  "soft-light"
              ],
              "bestFor": [
                  "Daily office desk memos, meeting action items, client call reminders",
                  "Corporate stationery sets and internal team communication notes",
                  "Budget-friendly mass giveaways for training workshops and student conferences"
              ],
              "bestForVi": [
                  "Ghi chú nhanh tại bàn làm việc, biên bản cuộc họp, nhắc việc hàng ngày",
                  "Bộ văn phòng phẩm doanh nghiệp đồng bộ nhận diện thương hiệu công ty",
                  "Quà tặng số lượng lớn tại các buổi đào tạo, hội thảo và trường học"
              ],
              "bestForZh": [
                  "日常工位备忘、会议要点速记及电话留言提醒",
                  "企业统一视觉形象的办公文具与内部沟通便签",
                  "培训讲座、学术研讨会及校园活动高性价比批量赠品"
              ],
              "bestForJa": [
                  "デスクワークのToDoメモ、ミーティング記録、伝言メモ",
                  "企業のブランドアイデンティティを統一するオフィス文具",
                  "研修セミナーや説明会での大量配布用ノベルティ"
              ],
              "bestForKo": [
                  "사무실 데스크 업무 메모, 회의 내용 요약, 데일리 플래너",
                  "기업 로고가 인쇄된 사내 표준 업무용 문구 세트",
                  "기업 교육 연수, 세미나 및 학술 행사 대량 판촉 사은품"
              ],
              "pureImage": "/images/product/note-giayloaif.webp",
              "pureImages": [
                  "/images/product/note-giayloaif.webp",
                  "/images/product/note-giayloaif2.webp",
                  "/images/product/note-giayloaif3.webp"
              ]
          },
          {
              "icon": "Sparkles",
              "name": "Fine Art Paper",
              "nameVi": "Giấy mỹ thuật",
              "nameZh": "特种艺术纸 Fine Art Paper",
              "nameJa": "高級ファインペーパー（特殊紙）",
              "nameKo": "고급 수입지 / 특수지 (Fine Art)",
              "tagline": "Looking for a luxurious textured notepad that leaves an indelible executive impression?",
              "taglineVi": "Bạn muốn cuốn sổ ghi chú đẳng cấp với bề mặt gân sần mỹ thuật, khẳng định phong thái chuyên nghiệp?",
              "taglineZh": "需要触感温润有质感、带有自然纹理的高端商务艺术便签吗？",
              "taglineJa": "手にするたびに特別な紙の質感と高級感が伝わるファインペーパーメモですか？",
              "taglineKo": "손끝에서 전해지는 독특한 엠보 질감으로 프리미엄 품격을 전하는 특수지 메모패드인가요?",
              "description": [
                  "Imported fine art paper with distinctive tactile texture, felt finish, or pearlescent sheen",
                  "Luxurious bulk and rigidity that elevate simple notes into executive desk accessories",
                  "Harmonizes elegantly with foil stamping, letterpress, and gold gilded edges"
              ],
              "descriptionVi": [
                  "Giấy mỹ thuật nhập khẩu cao cấp với bề mặt vân sần tinh tế, xốp nhẹ hoặc ánh nhũ kim sa",
                  "Độ đanh và cứng cáp vượt trội, biến xấp giấy ghi chú thành phụ kiện bàn làm việc sang trọng",
                  "Kết hợp hoàn hảo với kỹ thuật ép kim vàng gold, bạc ánh kim hoặc mạ cạnh cuốn sổ"
              ],
              "descriptionZh": [
                  "进口高级艺术纸，拥有独特的布纹、水彩纹或微光珠光质感",
                  "纸张蓬松厚实挺括，将便签本升华为高档办公桌艺术摆件",
                  "完美搭配亮金/玫瑰金烫印、凸版印刷及边口刷金奢华工艺"
              ],
              "descriptionJa": [
                  "厳選された輸入ファインペーパー。フェザー調や微細な凹凸が高級感を演出",
                  "適度な厚みとコシがあり、書斎や役員デスクにふさわしい上質な佇まい",
                  "金箔・銀箔押しやエッジカラー（天金加工）との相性も抜群"
              ],
              "descriptionKo": [
                  "수입 최고급 예술 지류로 은은한 질감과 독보적인 손끝 촉감 선사",
                  "도톰하고 빳빳한 탄성감으로 단순한 메모지를 고급 데스크 오브제로 격상",
                  "금박·은박 로고 스탬핑 및 측면 엣지 금박 가공 시 럭셔리함 극대화"
              ],
              "descriptionTraits": [
                  "textured-art",
                  "natural-grain",
                  "foil-accent"
              ],
              "bestFor": [
                  "Executive boardroom pads, law firms, private wealth managers",
                  "Luxury hotels, architectural studios, high-end design agencies",
                  "VIP personalized gifts and executive conference stationery"
              ],
              "bestForVi": [
                  "Bàn làm việc giám đốc, văn phòng luật sư, công ty tư vấn tài chính cao cấp",
                  "Khách sạn 5 sao, studio kiến trúc, công ty thiết kế nội thất hạng sang",
                  "Quà tặng tri ân đối tác VIP, hội nghị lãnh đạo cấp cao"
              ],
              "bestForZh": [
                  "高管董事会议室、律师事务所及私人银行财富顾问工位",
                  "五星级奢华酒店、建筑设计事务所及高端创意机构",
                  "核心战略合作伙伴定制赠礼、总裁班及领袖峰会专享文具"
              ],
              "bestForJa": [
                  "役員会議室、法律事務所、プライベートバンクのデスク用",
                  "高級ホテル、建築設計事務所、デザインスタジオ",
                  "VIP顧客への特製ギフト、エグゼクティブセミナー配信用"
              ],
              "bestForKo": [
                  "임원진 집무실, 대형 로펌, 프라이빗 뱅커 전용 데스크 패드",
                  "특급 호텔 스위트룸, 건축사사무소, 하이엔드 인테리어 디자인 스튜디오",
                  "VIP 고객 초청 감사 선물 및 최고경영자(CEO) 포럼 기념품"
              ],
              "pureImage": "/images/product/note-giaymythuat.webp",
              "pureImages": [
                  "/images/product/note-giaymythuat.webp",
                  "/images/product/note-giaymythuat2.webp",
                  "/images/product/note-giaymythuat3.webp"
              ]
          },
          {
              "icon": "Layers",
              "name": "Kraft Paper",
              "nameVi": "Giấy Kraft",
              "nameZh": "环保牛皮纸 Kraft Paper",
              "nameJa": "クラフト紙（ヴィンテージ・エコ）",
              "nameKo": "크라프트지 (친환경 빈티지)",
              "tagline": "Aiming for an earthy, rustic vintage aesthetic with genuine eco-friendly sustainability?",
              "taglineVi": "Bạn muốn phong cách mộc mạc, đậm chất vintage và lan tỏa thông điệp sống xanh thân thiện môi trường?",
              "taglineZh": "崇尚复古质朴、原木手作温度与100%绿色环保理念的便签纸吗？",
              "taglineJa": "ナチュラルで温かみのあるクラフト感と、サステナブルなエコメッセージを届けたいですか？",
              "taglineKo": "자연 친화적이고 아날로그한 빈티지 감성을 담은 친환경 크라프트 메모지인가요?",
              "description": [
                  "Natural unbleached 80-120gsm virgin wood pulp kraft paper with tough fibrous strength",
                  "Signature warm golden-brown earthy hue bringing authentic retro handmade appeal",
                  "100% biodegradable and recyclable, pairs strikingly with black or white pigment ink"
              ],
              "descriptionVi": [
                  "Giấy Kraft nâu nguyên sinh 80gsm - 120gsm từ bột gỗ tự nhiên, dẻo dai khó rách",
                  "Tông màu nâu vàng ấm áp đặc trưng mang phong cách vintage & retro ấn tượng",
                  "Thân thiện môi trường 100%, dễ tái chế, in cực đẹp với mực đen tối giản hoặc mực trắng độc đáo"
              ],
              "descriptionZh": [
                  "天然未漂白木浆牛皮纸80-120克，纸力强韧抗撕，自然质朴",
                  "标志性大地暖棕色调，洋溢浓厚美式复古（Vintage）与手作温暖",
                  "100%可降解可回收，极佳搭配简约黑色线条或特色白墨印刷"
              ],
              "descriptionJa": [
                  "無漂白のバージンパルプクラフト紙80〜120gsm。繊維が強く破れにくい",
                  "温かみのあるブラウンカラーが素朴でレトロな魅力を放ちます",
                  "100%生分解性・リサイクル可能。黒インクや白インク印刷が美しく映えます"
              ],
              "descriptionKo": [
                  "무표백 천연 펄프 80~120gsm 크라프트지로 질기고 내구성이 뛰어남",
                  "특유의 따뜻한 브라운 컬러로 아날로그 레트로 무드와 빈티지 감성 연출",
                  "100% 친환경 생분해 및 재활용 가능, 모던 블랙 잉크 및 화이트 잉크 인쇄 추천"
              ],
              "descriptionTraits": [
                  "natural-grain",
                  "eco-friendly",
                  "soft-light"
              ],
              "bestFor": [
                  "Eco-conscious brands, organic lifestyle cafes, indie bookstores",
                  "Creative handcraft studios, artisan coffee roasters, eco-friendly events",
                  "Rustic gift packaging notes and vintage-themed promotional campaigns"
              ],
              "bestForVi": [
                  "Thương hiệu theo đuổi xu hướng xanh, quán cà phê mộc, tiệm sách nghệ thuật",
                  "Xưởng thủ công mỹ nghệ, thương hiệu thời trang vintage, sự kiện vì môi trường",
                  "Thẻ tag ghi chú đính kèm hộp quà mộc, bưu phẩm phong cách retro"
              ],
              "bestForZh": [
                  "绿色环保品牌、独立文艺书店、有机生活咖啡馆",
                  "手作工艺工作坊、手冲咖啡烘焙品牌、低碳环保倡议活动",
                  "复古礼盒随附备忘便签、文创周边及手作商品说明卡"
              ],
              "bestForJa": [
                  "エコ志向ブランド、ブックカフェ、オーガニックライフスタイルショップ",
                  "ハンドメイド工房、自家焙煎珈琲店、環境保護イベント",
                  "ギフト包装のメッセージカード、アンティーク調ステーショナリー"
              ],
              "bestForKo": [
                  "친환경 에코 브랜드, 감성 북카페, 오가닉 라이프스타일 샵",
                  "핸드메이드 공방, 로스터리 카페, 제로웨이스트 환경 캠페인",
                  "빈티지 선물 포장 동봉 메모, 레트로 감성 굿즈 상품"
              ],
              "pureImage": "/images/product/note-giaykraft.webp",
              "pureImages": [
                  "/images/product/note-giaykraft.webp",
                  "/images/product/note-giaykraft2.webp",
                  "/images/product/note-giaykraft3.webp"
              ]
          },
          {
              "icon": "Shield",
              "name": "PET Plastic Film",
              "nameVi": "Nhựa PET",
              "nameZh": "透明半透明 PET 塑料胶片",
              "nameJa": "PET透明・半透明フィルム（高耐久付箋）",
              "nameKo": "투명/반투명 PET 필름 (방수 인덱스 메모)",
              "tagline": "Looking for a waterproof, see-through PET sticky note that doesn't obscure text underneath?",
              "taglineVi": "Bạn cần loại giấy note nhựa PET trong suốt nhìn xuyên thấu, chống thấm nước và không che chữ bên dưới?",
              "taglineZh": "需要防水防撕、清透显字且不遮挡书本正文的透明PET索引便签吗？",
              "taglineJa": "本や書類の文字を隠さず、水に濡れても破れない透明・半透明PETフィルム付箋ですか？",
              "taglineKo": "책의 본문을 가리지 않고 투명하게 비치며 물에 젖지 않는 방수 PET 포스트잇 메모인가요?",
              "description": [
                  "Ultra-durable, waterproof transparent or frosted matte PET film that resists tearing",
                  "Clear see-through visibility lets you annotate charts, textbooks, and maps without obscuring content",
                  "Removable adhesive adheres firmly to paper, glass, and plastic with zero sticky residue"
              ],
              "descriptionVi": [
                  "Màng nhựa PET trong suốt hoặc phủ mờ (frosted) siêu dẻo dai, chống thấm nước tuyệt đối 100%",
                  "Nhìn xuyên thấu rõ ràng, cho phép ghi chú và vẽ đè lên sách, bản đồ, tài liệu mà không che khuất chữ gốc",
                  "Keo dán tháo gỡ linh hoạt (removable), dán chắc chắn trên mọi bề mặt và bóc ra không để lại vết keo dơ"
              ],
              "descriptionZh": [
                  "超韧100%防水透明或磨砂半透明PET薄膜，抗拉扯防撕裂",
                  "高清透光视野，可直接贴在教材、设计图纸及地图上做笔记而不遮挡底图",
                  "采用优质环保可移胶，反复粘贴不伤纸张表面，撕下毫无残胶残留"
              ],
              "descriptionJa": [
                  "100%完全防水の透明・半透明（フロスト）PET樹脂フィルム。破れず長持ち",
                  "文字や図面が透けて見えるため、書類や参考書の注記・ハイライトに最適",
                  "再剥離可能な粘着剤を採用し、糊残りなく綺麗に貼り直し可能"
              ],
              "descriptionKo": [
                  "100% 완전 방수 고인성 투명/반투명 매트 PET 필름으로 찢어지지 않는 반영구 내구성",
                  "밑글이 선명하게 투과되어 교재, 설계 도면, 지도 위에 직접 주석을 달아도 원본 완벽 보존",
                  "리무버블 점착 기술로 종이나 모니터에 단단히 붙고 떼어낼 때 끈적임 잔여물 전혀 없음"
              ],
              "descriptionTraits": [
                  "waterproof-durability",
                  "smooth-base",
                  "digital-precision"
              ],
              "bestFor": [
                  "Architectural blueprints, medical textbook annotation, study planners",
                  "Document indexing, contract signature tabs, and forensic research",
                  "Modern high-tech desk stationery and trendy translucent sticky pads"
              ],
              "bestForVi": [
                  "Đánh dấu bản vẽ thiết kế kiến trúc, chú thích giáo trình y khoa, sổ tay học tập",
                  "Phân trang hồ sơ, thẻ ký hợp đồng, lưu trữ tài liệu chứng từ quan trọng",
                  "Văn phòng phẩm công nghệ cao, xấp note trong suốt phong cách hiện đại"
              ],
              "bestForZh": [
                  "建筑工程图纸标注、医学院教材笔记、考研备考索引",
                  "财务凭证审阅、合同签字提示签、重要文件分类归档",
                  "高科技现代办公、极简透明文具潮流系列"
              ],
              "bestForJa": [
                  "建築図面・デザインスケッチへの注記、医学書や専門書の勉強用付箋",
                  "契約書の押印・署名箇所ガイド、重要書類のインデックス分類",
                  "スタイリッシュな半透明ステーショナリー、オフィス用高機能メモ"
              ],
              "bestForKo": [
                  "건축 도면 체크, 의학 교재 및 자격증 수험서 필기, 인덱스 탭",
                  "계약서 서명 위치 표시, 회계 전표 검토 및 중요 문서 분류 라벨",
                  "모던한 감성의 반투명 트렌디 데스크 문구, 고기능성 사무용품"
              ],
              "pureImage": "/images/product/note-nhuapet.webp",
              "pureImages": [
                  "/images/product/note-nhuapet.webp",
                  "/images/product/note-nhuapet2.webp",
                  "/images/product/note-nhuapet3.webp"
              ]
          }
      ]
  },

  {
      "id": "giay-tieu-de",
      "categoryId": "office",
      "titleVi": "Giấy tiêu đề - Letterheads",
      "titleEn": "Letterheads",
      "titleZh": "信纸便笺 - Letterheads",
      "titleJa": "レターヘッド - Letterheads",
      "titleKo": "레터헤드 - Letterheads",
      "descriptionVi": "Giấy in tiêu đề thư trang trọng dành cho hợp đồng, báo giá và công văn chính thức, chuẩn hóa nhận diện doanh nghiệp.",
      "descriptionEn": "Official corporate letterhead stationery formatted for laser and inkjet office contract printing.",
      "coverImage": "/images/category/giaytieude.webp",
      "shapes": [
          {
              "id": "giay-tieu-de-it",
              "nameVi": "Giấy tiêu đề số lượng ít",
              "nameEn": "Short-run Digital Letterheads",
              "nameZh": "少量数码信笺",
              "nameJa": "小ロットレターヘッド",
              "nameKo": "소량 레터헤드",
              "descriptionVi": "In nhanh kỹ thuật số từ 100 - 500 tờ cho văn phòng đại diện hoặc startup.",
              "descriptionEn": "Short-run digital print starting from 100 sheets for boutique consultancies and startups.",
              "image": "/images/category/giaytieudesoluongit.webp",
              "badgeVi": "Số lượng ít",
              "badgeEn": "Short Run"
          },
          {
              "id": "giay-tieu-de-lon",
              "nameVi": "Giấy tiêu đề số lượng lớn",
              "nameEn": "Bulk Offset Letterheads",
              "nameZh": "批量胶印高品质信笺",
              "nameJa": "大ロットオフセット便箋",
              "nameKo": "대량 오프셋 레터헤드",
              "descriptionVi": "In offset sắc nét số lượng từ 1.000 - 10.000 tờ, chi phí cực kỳ tiết kiệm cho tập đoàn lớn.",
              "descriptionEn": "High-volume offset printing with precise Pantone brand color matching for corporate headquarters.",
              "image": "/images/category/giaytieudesoluonglon.webp",
              "badgeVi": "Offset số lượng lớn",
              "badgeEn": "Bulk Offset"
          }
      ],
      "materials": [
          {
              "icon": "Feather",
              "name": "Type F Paper (Ford)",
              "nameVi": "Giấy loại F",
              "nameZh": "道林纸 F类 (Ford)",
              "nameJa": "上質紙（Fタイプ・モジョ紙）",
              "nameKo": "모조지 F타입 (Ford)",
              "tagline": "Seeking professional, non-glare letterhead paper compatible with all office laser and inkjet printers?",
              "taglineVi": "Bạn cần giấy tiêu đề trắng sáng tiêu chuẩn, in laser và in phun văn phòng mượt mà không kẹt giấy?",
              "taglineZh": "需要平整顺畅、完美适配各类办公室激光与喷墨打印机的标准企业信笺纸吗？",
              "taglineJa": "オフィス用レーザー＆インクジェットプリンターでスムーズに印刷できる標準上質紙ですか？",
              "taglineKo": "사무실 레이저 및 잉크젯 프린터에서 걸림 없이 부드럽게 출력되는 표준 모조지 레터헤드인가요?",
              "description": [
                  "High-grade 80-120gsm uncoated Ford woodfree paper with smooth finish and high whiteness",
                  "100% compatible with office desktop printers for printing contracts, proposals, and official letters",
                  "Absorbs ink crisply with zero smudging, ideal for official company seal stamping and executive signatures"
              ],
              "descriptionVi": [
                  "Giấy Ford trắng ngà cao cấp định lượng 80gsm - 120gsm, bề mặt mịn màng không chói mắt",
                  "Tương thích 100% với mọi dòng máy in laser và máy in phun văn phòng, không bị nhăn hay kẹt giấy",
                  "Bám mực hoàn hảo khi đóng dấu mộc công ty và ký tên bút máy, không bị nhòe hay lem xuyên mặt"
              ],
              "descriptionZh": [
                  "80-120克优质无涂布道林纸，纸质平滑均匀，洁白柔和不伤眼",
                  "100%完美适配各类激光及喷墨打印机二次打印，走纸顺畅不卡纸",
                  "公章盖印清晰快干，签字笔书写流利不晕染，企业正式信函标准之选"
              ],
              "descriptionJa": [
                  "80〜120gsmの上質紙。滑らかな紙肌と自然な白さで上品な仕上がり",
                  "オフィスのレーザー＆インクジェットプリンターでの追記印刷に完全対応し、紙詰まりなし",
                  "社印の捺印や万年筆での署名も美しく定着し、インクのにじみや裏抜けを防止"
              ],
              "descriptionKo": [
                  "80~120gsm 프리미엄 백색 모조지로 눈이 편안한 밝기와 매끄러운 표면 질감",
                  "사무실 레이저·잉크젯 프린터 2차 인쇄 시 용지 걸림 없이 100% 완벽 호환",
                  "회사 직인 날인 및 만년필 서명 시 번짐 없이 즉시 건조되는 정식 공문서 표준"
              ],
              "descriptionTraits": [
                  "natural-grain",
                  "smooth-base",
                  "soft-light"
              ],
              "bestFor": [
                  "Official corporate contracts, legal agreements, and commercial quotes",
                  "Government correspondence, executive announcements, and client proposals",
                  "Daily corporate correspondence and administrative paperwork"
              ],
              "bestForVi": [
                  "Hợp đồng kinh tế, bảng báo giá chính thức, biên bản thỏa thuận thương mại",
                  "Công văn gửi đối tác, thư ngỏ ban giám đốc, thông báo doanh nghiệp",
                  "Hồ sơ thanh toán, chứng từ văn phòng và thủ tục hành chính chuyên nghiệp"
              ],
              "bestForZh": [
                  "商务经济合同、官方正式报价单及战略合作协议",
                  "发函公文、董事会公开信及重要商务通告",
                  "日常企业行政公文往来与正规审批文件"
              ],
              "bestForJa": [
                  "取引先向け契約書、正式な見積書、業務提携合意書",
                  "公式対外文書、社長メッセージ、プレスリリース通知",
                  "日々の社内決裁書類や公的行政手続き書類"
              ],
              "bestForKo": [
                  "공식 계약서, 납품 견적서, 업무 제휴 협약서(MOU)",
                  "대외 공문서, 대표이사 명의 서한, 기업 공식 안내문",
                  "사내 결재 문서, 행정 증빙 서류 및 비즈니스 서신"
              ],
              "pureImage": "/images/product/tieude-giayloaif.webp",
              "pureImages": [
                  "/images/product/tieude-giayloaif.webp",
                  "/images/product/tieude-giayloaif2.webp",
                  "/images/product/tieude-giayloaif3.webp"
              ]
          },
          {
              "icon": "Sparkles",
              "name": "Fine Art Paper",
              "nameVi": "Giấy mỹ thuật",
              "nameZh": "特种艺术纸 Fine Art Paper",
              "nameJa": "高級ファインペーパー（特殊紙）",
              "nameKo": "고급 수입지 / 특수지 (Fine Art)",
              "tagline": "Desire luxurious, subtly textured letterhead for executive diplomacy, VIP contracts, and luxury branding?",
              "taglineVi": "Bạn muốn tiêu đề thư sang trọng đẳng cấp với bề mặt gân sần mỹ thuật, tôn vinh vị thế thương hiệu?",
              "taglineZh": "需要富有质感微纹理、低调奢华且彰显卓越企业声誉的高端艺术信纸吗？",
              "taglineJa": "手にした瞬間に伝わる特別な風合いと、最高峰のステータスを誇る特種便箋ですか？",
              "taglineKo": "손끝에서 느껴지는 고급스러운 결감으로 기업의 독보적인 품격을 전달하는 특수지 레터헤드인가요?",
              "description": [
                  "Imported fine art paper with delicate felt texture, subtle linen grain, or organic deckle finish",
                  "Heavier 100-140gsm luxury weight providing a tactile, distinguished hand-feel",
                  "Pairs masterfully with metallic gold/silver foil crests, blind debossing, and bespoke watermarks"
              ],
              "descriptionVi": [
                  "Giấy mỹ thuật nhập khẩu định lượng 100gsm - 140gsm với vân gân tinh tế, thớ giấy xốp đanh cao cấp",
                  "Cảm giác chạm dày dặn và đầm tay, tạo dấu ấn đẳng cấp ngay khi mở thư",
                  "Kết hợp hoàn hảo với kỹ thuật ép kim vàng/bạc logo doanh nghiệp, dập nổi biểu tượng thương hiệu"
              ],
              "descriptionZh": [
                  "进口100至140克高克重特种艺术纸，拥有细腻布纹、水彩纹或典雅自然织物触感",
                  "纸质挺括厚重，手指触碰瞬间即可感知非凡的尊荣质感",
                  "极佳融合亮金/银箔烫印、徽标深压凹印（Deboss）及水印防伪工艺"
              ],
              "descriptionJa": [
                  "100〜140gsmの輸入ファインペーパー。織り目風や微細な凹凸が気品を醸し出します",
                  "手に取った時の重厚感と上質感で、VIPレターの格調を一段と高めます",
                  "箔押し加工（ゴールド・シルバー）やエンボス加工と美しく調和"
              ],
              "descriptionKo": [
                  "100~140gsm 수입 최고급 특수지로 은은한 린넨 엠보 또는 오가닉 결감이 돋보임",
                  "도톰하고 우아한 두께감으로 편지봉투를 개봉하는 순간 남다른 품격 전달",
                  "골드/실버 박스탬핑 및 양각 엠보싱 심볼 마크와 완벽한 조화"
              ],
              "descriptionTraits": [
                  "textured-art",
                  "natural-grain",
                  "foil-accent"
              ],
              "bestFor": [
                  "Executive board communications, luxury hospitality agreements, private banking",
                  "Diplomatic letters, legal advisory opinions, architectural design contracts",
                  "VIP invitation letters, commemorative milestones, executive certificate stationery"
              ],
              "bestForVi": [
                  "Thư từ chủ tịch hội đồng quản trị, thỏa thuận khách sạn nghỉ dưỡng 5 sao, ngân hàng ưu tiên",
                  "Thư ngoại giao ngoại giao đoàn, văn bản tư vấn luật cao cấp, hợp đồng thiết kế kiến trúc",
                  "Thư mời dạ tiệc tri ân VIP, kỷ niệm thành lập tập đoàn, thư chúc mừng đối tác lớn"
              ],
              "bestForZh": [
                  "董事局主席函件、五星级奢华酒店协议及私人银行财富顾问信笺",
                  "外交使节往来信函、知名律师事务所法律意见书、高端建筑规划合同",
                  "VIP盛典答谢邀请函、集团重大庆典公函及高规格贺信"
              ],
              "bestForJa": [
                  "役員・社長名義の公式親書、高級ホテル・リゾート、プライベートバンク",
                  "外交文書、大手法律事務所の意見書、建築設計デザイン契約書",
                  "VIP顧客向け特別招待状、創立記念レター、表彰状兼信書"
              ],
              "bestForKo": [
                  "이사회 의장 친필 서한, 특급 호텔 리조트 계약서, 프라이빗 뱅킹 안내문",
                  "외교 공관 의전 서한, 대형 로펌 법률 자문서, 건축 디자인 설계 계약서",
                  "VIP 갈라 초청장, 그룹사 창립 기념 서한 및 최고급 감사 편지"
              ],
              "pureImage": "/images/product/tieude-giaymythuat.webp",
              "pureImages": [
                  "/images/product/tieude-giaymythuat.webp",
                  "/images/product/tieude-giaymythuat2.webp",
                  "/images/product/tieude-giaymythuat3.webp"
              ]
          },
          {
              "icon": "Layers",
              "name": "Kraft Paper",
              "nameVi": "Giấy Kraft",
              "nameZh": "环保牛皮纸 Kraft Paper",
              "nameJa": "クラフト紙（ヴィンテージ・エコ）",
              "nameKo": "크라프트지 (친환경 빈티지)",
              "tagline": "Aiming for a warm, rustic vintage aesthetic with authentic eco-friendly sustainable appeal?",
              "taglineVi": "Bạn muốn phong cách mộc mạc cổ điển, thân thiện môi trường và truyền tải lối sống xanh bền vững?",
              "taglineZh": "追求质朴自然、美式复古原木手作温度与100%低碳环保理念的企业信纸吗？",
              "taglineJa": "ナチュラルで素朴なクラフト感と、サステナビリティへの強いこだわりを表現したいですか？",
              "taglineKo": "따뜻하고 자연 친화적인 빈티지 무드로 지속 가능한 에코 브랜드 가치를 전하는 레터헤드인가요?",
              "description": [
                  "Natural unbleached 80-120gsm virgin wood pulp kraft paper with tough fibrous structure",
                  "Distinctive warm golden-brown earthy hue radiating authentic rustic and retro handmade charm",
                  "100% biodegradable and recyclable, perfectly suited for minimalist black, white, or earthy Pantone prints"
              ],
              "descriptionVi": [
                  "Giấy Kraft nâu mộc 80gsm - 120gsm từ sợi gỗ tự nhiên chưa tẩy trắng, đanh dẻo dai khó rách",
                  "Tông màu nâu vàng ấm áp đặc trưng, đậm chất vintage & retro được giới trẻ và thương hiệu xanh ưa chuộng",
                  "Tự phân hủy sinh học và tái chế 100%, in cực kỳ nổi bật với mực đen tối giản hoặc mực trắng chuyên dụng"
              ],
              "descriptionZh": [
                  "80-120克天然未漂白原生木浆牛皮纸，纸张纤维强韧耐折，质感质朴纯粹",
                  "标志性大地暖棕色调，散发纯正美式复古（Vintage）与手工自然温度",
                  "100%可降解可循环，非常适合搭配极简黑色几何线条或独具个性的白墨印制"
              ],
              "descriptionJa": [
                  "無漂白のバージンパルプクラフト紙80〜120gsm。繊維が長く丈夫で破れにくい",
                  "温かみのあるアースブラウンが、飾らないレトロ＆クラフトな雰囲気を演出",
                  "100%生分解性・環境配慮素材。ミニマルな黒インクや白インク印刷に最適"
              ],
              "descriptionKo": [
                  "무표백 천연 펄프 80~120gsm 크라프트지로 질기고 내구성이 우수한 친환경 종이",
                  "특유의 따뜻한 브라운 톤이 풍기는 아날로그 빈티지 감성과 내추럴한 브랜드 무드",
                  "100% 생분해성 및 재활용 가능, 모던 블랙 잉크 또는 화이트 잉크 인쇄 시 감각적인 대비 효과"
              ],
              "descriptionTraits": [
                  "natural-grain",
                  "eco-friendly",
                  "soft-light"
              ],
              "bestFor": [
                  "Eco-conscious brands, sustainable agriculture, organic food & cosmetics",
                  "Artisan coffee roasters, eco-resorts, indie apparel & craft studios",
                  "Sustainability milestone reports, eco-friendly campaign announcements, and creative studio pitches"
              ],
              "bestForVi": [
                  "Doanh nghiệp phát triển bền vững (ESG), nông nghiệp hữu cơ, mỹ phẩm thuần chay",
                  "Chuỗi cà phê rang xay thủ công, khu nghỉ dưỡng sinh thái, thương hiệu thời trang tái chế",
                  "Báo cáo phát triển bền vững, thư ngỏ chiến dịch môi trường, hồ sơ ý tưởng sáng tạo"
              ],
              "bestForZh": [
                  "绿色低碳环保企业（ESG）、有机农业及纯素天然美妆品牌",
                  "手作咖啡烘焙工坊、生态度假营地及环保文创设计师品牌",
                  "企业可持续发展报告公函、环保公益倡议书及创意方案自荐信"
              ],
              "bestForJa": [
                  "サステナブル企業（ESG）、オーガニック食品・コスメブランド",
                  "自家焙煎珈琲ショップ、エコツーリズムリゾート、アパレル工房",
                  "環境保護キャンペーン書簡、持続可能性レポート送付状、クリエイティブ企画書"
              ],
              "bestForKo": [
                  "친환경 ESG 경영 기업, 유기농 식품 및 비건 코스메틱 브랜드",
                  "스페셜티 로스터리 카페, 에코 리조트, 업사이클링 패션 스튜디오",
                  "지속가능경영 보고서 서한, 친환경 캠페인 안내문, 크리에이티브 기획서"
              ],
              "pureImage": "/images/product/tieude-giaykraft.webp",
              "pureImages": [
                  "/images/product/tieude-giaykraft.webp",
                  "/images/product/tieude-giaykraft2.webp",
                  "/images/product/tieude-giaykraft3.webp"
              ]
          }
      ]
  },

  {
    "id": "bia-dung-ho-so",
    "categoryId": "office",
    "titleVi": "Bìa đựng hồ sơ - Folders",
    "titleEn": "Folders & Presentation Folders",
    "titleZh": "文件夹封套 - Folders",
    "titleJa": "フォルダ - Folders",
    "titleKo": "서류 홀더 - Folders",
    "descriptionVi": "Kẹp tài liệu, kẹp profile chào thầu chuyên nghiệp, giữ hồ sơ đối tác gọn gàng cùng khe cắm danh thiếp tinh tế.",
    "descriptionEn": "High-end presentation folders holding bids, contracts, and proposals with integrated business card slots.",
    "coverImage": "/images/product/vd-item-folder.jpeg",
    "shapes": [
      {
        "id": "bia-ho-so-cao-cap",
        "nameVi": "Bìa đựng hồ sơ cao cấp",
        "nameEn": "Premium Luxury Folders",
        "nameZh": "烫金UV奢华封套",
        "nameJa": "高級特アート紙フォルダ",
        "nameKo": "최고급 특수가공 홀더",
        "descriptionVi": "Gia công ép kim logo vàng/bạc trên nền giấy mỹ thuật sần hoặc bìa cứng bồi carton 2mm sang trọng.",
        "descriptionEn": "Metallic foil stamping and selective spot UV on imported artboard or rigid 2mm board for VIP pitches.",
        "image": "/images/category/biadunghosocaocap.webp",
        "badgeVi": "Ép kim VIP",
        "badgeEn": "Luxury Foil"
      },
      {
        "id": "bia-ho-so-1-tay-gap",
        "nameVi": "Bìa đựng hồ sơ 1 tay gấp",
        "nameEn": "1-Pocket Presentation Folders",
        "nameZh": "单口袋文件夹",
        "nameJa": "1ポケットホルダー",
        "nameKo": "1단 접이식 서류 홀더",
        "descriptionVi": "Quy cách 1 tai gấp bên phải có khe cài namecard, kẹp tài liệu dày từ 10 - 20 tờ A4 phẳng phiu.",
        "descriptionEn": "Single right pocket with die-cut business card slot, holding 10-20 sheets of A4 paper cleanly.",
        "image": "/images/category/biadunghoso1taygap.webp",
        "badgeVi": "1 tay gấp",
        "badgeEn": "1 Pocket"
      },
      {
        "id": "bia-ho-so-2-tay-gap",
        "nameVi": "Bìa đựng hồ sơ 2 tay gấp",
        "nameEn": "2-Pocket Presentation Folders",
        "nameZh": "双口袋厚款文件夹",
        "nameJa": "2ポケットホルダー",
        "nameKo": "2단 접이식 서류 홀더",
        "descriptionVi": "Thiết kế 2 tai gấp đối xứng hai bên, chứa được lượng tài liệu lớn và hợp đồng hai bên ký kết.",
        "descriptionEn": "Dual symmetrical pockets with expansive spine gusset holding up to 50 sheets and multi-part contracts.",
        "image": "/images/category/biadunghoso2taygap.webp",
        "badgeVi": "2 tay gấp",
        "badgeEn": "2 Pockets"
      }
    ],
    "materials": [
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "tagline": "Need a clean, durable, and highly professional folder for everyday presentations?",
        "taglineVi": "Bạn cần bìa hồ sơ chuyên nghiệp, cứng cáp cho các buổi trình bày và họp thầu?",
        "description": [
          "Smooth coated surface with protective matte or glossy lamination",
          "High paper stiffness that maintains a crisp, structured fold without bending",
          "Vibrant and accurate CMYK reproduction for brand colors and imagery"
        ],
        "descriptionVi": [
          "Bề mặt tráng phủ mịn, được cán màng mờ hoặc bóng bảo vệ mực in chống trầy",
          "Độ cứng cao, định hình phom bìa chắc chắn khi cầm tay hoặc kẹp tài liệu",
          "Hiển thị màu sắc CMYK chuẩn xác, rực rỡ và sắc nét cho bộ nhận diện thương hiệu"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Corporate profile folders, project proposals, and sales kits",
          "Real estate, finance, and automotive showroom presentations",
          "Press kits and seminar handouts with business card insertion"
        ],
        "bestForVi": [
          "Hồ sơ năng lực doanh nghiệp, bản đề xuất dự án (Proposal)",
          "Bộ tài liệu kinh doanh, sales kit ngành bất động sản, tài chính, ô tô",
          "Bộ press kit họp báo, sự kiện ra mắt sản phẩm tích hợp khe cài danh thiếp"
        ],
        "nameZh": "铜版纸 300-350gsm（标准文件夹）",
        "nameJa": "コート紙 300-350gsm（定番フォルダ）",
        "nameKo": "스노우지 300-350gsm (표준 홀더)",
        "taglineZh": "需要一款挺括耐磨、能够整齐收纳公司文件的标准封套吗？",
        "taglineJa": "耐久性があり、書類を美しく整理できる定番フォルダをお求めですか？",
        "taglineKo": "탄탄하고 오염에 강하며 회사 서류를 깔끔히 보관할 표준 파일이 필요하신가요?",
        "descriptionZh": [
          "细腻涂布表面，覆盖哑膜或亮膜以防止划伤并保护油墨",
          "高挺度厚纸，手持或夹放多份文件时坚固不软塌",
          "高精色彩还原，使品牌VI视觉鲜明生动"
        ],
        "descriptionJa": [
          "インクの擦れを防ぎ美しさを保つマットPP・グロスPP加工",
          "高い剛性を持ち、手持ちでも書類をしっかりホールドする堅牢設計",
          "ブランドのコーポレートカラーを鮮やかに再現する高精細印刷"
        ],
        "descriptionKo": [
          "스크래치를 방지하고 인쇄면을 보호하는 무광/유광 코팅 마감",
          "두껍고 탄탄한 하드 페이퍼로 서류를 안전하게 지지하는 견고함",
          "브랜드 아이덴티티를 돋보이게 하는 선명하고 정밀한 컬러 구현"
        ],
        "bestForZh": [
          "企业资质画册、重大商业提案与投标书",
          "地产、金融、汽车行业高端销售工具包（Sales Kit）",
          "附带名片插槽的新品发布会与新闻发布会资料套件"
        ],
        "bestForJa": [
          "会社案内、プロジェクト提案書、入札資料",
          "不動産・金融・自動車業界の営業資料セット（セールスキット）",
          "名刺スリット付きの新製品発表会・プレスリリース用フォルダ"
        ],
        "bestForKo": [
          "기업 제안서, 입찰 서류, 사업 계획서(Proposal)",
          "부동산, 금융, 자동차 산업의 프리미엄 영업 키트",
          "명함 꽂이가 포함된 기자회견 및 신제품 런칭 프레스킷"
        ],
        "pureImage": "/images/product/biahoso-giayloaic.webp",
        "pureImages": [
          "/images/product/biahoso-giayloaic.webp",
          "/images/product/biahoso-giayloaic2.webp",
          "/images/product/biahoso-giayloaic3.webp"
        ],
      },
      {
        "icon": "Feather",
        "name": "Type F Paper",
        "nameVi": "Giấy loại F",
        "tagline": "Need a natural, writable uncoated folder with a refined corporate tone?",
        "taglineVi": "Bạn cần bìa hồ sơ giấy mộc tự nhiên, dễ viết tay và không phản quang?",
        "description": [
          "Natural matte uncoated surface with a fine paper grain",
          "Diffused light absorption without glare under bright meeting room lights",
          "Holds shape firmly while allowing hand-written notes or stamps"
        ],
        "descriptionVi": [
          "Bề mặt nhám mộc tự nhiên, không tráng phủ với vân giấy mịn",
          "Ánh sáng khuếch tán đều, không chói mắt dưới ánh đèn phòng họp",
          "Độ cứng tốt, đồng thời dễ dàng ký tên, ghi chú hoặc đóng dấu mộc"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Legal, financial, and educational proposal folders",
          "Brands aiming for an understated, sustainable corporate aesthetic",
          "Internal executive portfolios and contract folders"
        ],
        "bestForVi": [
          "Hồ sơ đề xuất ngành luật, tài chính, kiểm toán và giáo dục",
          "Doanh nghiệp hướng đến thẩm mỹ thanh lịch, mộc mạc và bền vững",
          "Kẹp tài liệu nội bộ cấp cao và bộ hợp đồng khách hàng"
        ],
        "nameZh": "道林纸 300gsm（素雅环保质感）",
        "nameJa": "上質紙 300gsm（ナチュラル風合い）",
        "nameKo": "모조지 300gsm (친환경 내추럴 홀더)",
        "taglineZh": "追求环保质朴、无眩光且便于在封套上亲笔书写？",
        "taglineJa": "ペンで直接メモが書き込める、素朴で温かみのあるフォルダをご希望ですか？",
        "taglineKo": "표면에 직접 메모를 남길 수 있는 친환경 내추럴 홀더를 원하시나요?",
        "descriptionZh": [
          "天然粗面无涂层纸，保留自然细腻的纸张纤维肌理",
          "光线漫射均匀，在会议室灯光下柔和不刺眼",
          "纸张挺括，极其便于手写备注、签名与盖章"
        ],
        "descriptionJa": [
          "自然な風合いを持つ無塗工紙で、手触りの良い素朴な質感",
          "光の反射がなく、会議室の照明下でも見やすい落ち着いた仕上がり",
          "しっかりとしたコシがあり、手書きメモや押印に最適"
        ],
        "descriptionKo": [
          "코팅 없는 자연스러운 종이 결이 살아있는 따뜻한 텍스처",
          "조명 아래에서도 눈부심 없이 편안하게 문서를 검토할 수 있는 무광",
          "도톰하고 탄탄하여 수기 메모, 서명, 결재 도장 날인에 최적화"
        ],
        "bestForZh": [
          "法律、会计、审计、咨询及教育学术提案",
          "注重环保、简约典雅与可持续理念的现代品牌",
          "企业内部高管审批及客户正式签约合同夹"
        ],
        "bestForJa": [
          "法律・会計・コンサルティング・教育機関の重要提案書",
          "環境保護やサステナビリティを掲げる洗練されたブランド",
          "役員用書類や正式なクライアント契約書ファイル"
        ],
        "bestForKo": [
          "법률, 회계, 감사, 컨설팅 및 교육 기관 제안서",
          "친환경과 지속가능성을 추구하는 모던 감성 브랜드",
          "사내 주요 기안서 및 고객 정식 계약서 바인더"
        ],
        "pureImage": "/images/product/biahoso-giayloaif.webp",
        "pureImages": [
          "/images/product/biahoso-giayloaif.webp",
          "/images/product/biahoso-giayloaif2.webp",
          "/images/product/biahoso-giayloaif3.webp"
        ],
      },
      {
        "icon": "Palette",
        "name": "Luxury Art Paper",
        "nameVi": "Giấy Mỹ Thuật Cao Cấp",
        "tagline": "Want a distinctive, artisan tactile texture that conveys prestige?",
        "taglineVi": "Bạn muốn bìa hồ sơ mang đậm tính nghệ thuật, xúc giác cao cấp khi chạm tay?",
        "description": [
          "European textured art paper with subtle tactile grain and matte depth",
          "Rich, warm ink absorption that gives designs an understated prestige",
          "Pairs effortlessly with minimalist layouts and metallic foil stamping"
        ],
        "descriptionVi": [
          "Vân giấy mỹ thuật châu Âu đặc trưng, đem lại cảm giác xúc giác sang trọng khi chạm",
          "Thấm màu mực tự nhiên tạo sắc thái trầm ấm, chiều sâu nghệ thuật cho thiết kế",
          "Kết hợp hoàn hảo với bố cục tối giản và các chi tiết ép kim điểm nhấn"
        ],
        "descriptionTraits": [
          "textured-art",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "Architects, interior design studios, and creative agencies",
          "Luxury real estate projects and private banking wealth management kits",
          "VIP partner gifting and high-level stakeholder presentations"
        ],
        "bestForVi": [
          "Công ty kiến trúc, thiết kế nội thất và studio sáng tạo",
          "Dự án bất động sản hạng sang, bộ tài liệu dịch vụ ngân hàng riêng (VIP)",
          "Bộ hồ sơ gửi đối tác cấp cao, nhà đầu tư chiến lược"
        ],
        "nameZh": "高端进口特种艺术纸",
        "nameJa": "最高級特殊アート紙",
        "nameKo": "최고급 수입 예술지",
        "taglineZh": "想要在商务递交文件的一瞬间，以独特的触感惊艳客户？",
        "taglineJa": "資料を手渡した瞬間、指先から伝わる圧倒的な上質さを演出したいですか？",
        "taglineKo": "고객에게 서류를 건네는 첫 순간 손끝에서 전해지는 압도적 품격을 원하시나요?",
        "descriptionZh": [
          "欧洲进口特种艺术纸纹理，带来极致奢华的指尖触感",
          "吸墨自然温润，赋予整体视觉深厚而低调的艺术意境",
          "与极简排版及局部烫金工艺相得益彰"
        ],
        "descriptionJa": [
          "ヨーロッパ輸入の高級特殊紙ならではの繊細で豊かな触感",
          "インクが自然に馴染み、深みのある落ち着いた発色を実現",
          "ミニマルなデザインや箔押しアクセントと完璧に調和"
        ],
        "descriptionKo": [
          "유럽산 최고급 수입 예술지의 독보적인 감각적 촉감",
          "잉크가 깊이 있게 스며들어 차분하고 품격 있는 예술적 분위기 연출",
          "미니멀한 타이포그래피 및 섬세한 금박 포인트와의 완벽한 조화"
        ],
        "bestForZh": [
          "知名建筑设计事务所、室内设计与创意艺术空间",
          "顶级豪宅楼盘、私人银行家族办公室尊贵资料册",
          "呈送战略投资人与跨国企业高管的专属文件套"
        ],
        "bestForJa": [
          "建築設計事務所、インテリアデザイン、クリエイティブスタジオ",
          "高級不動産プロジェクト、プライベートバンク（VIP）向け資料",
          "重要パートナーや戦略的投資家に届ける特別なプレゼン資料"
        ],
        "bestForKo": [
          "건축가, 인테리어 디자인 스튜디오, 크리에이티브 에이전시",
          "하이엔드 주거 프로젝트, 프라이빗 뱅킹(PB) VIP 서류함",
          "핵심 투자자 및 글로벌 파트너에게 전달하는 최고급 포트폴리오"
        ],
        "pureImage": "/images/product/biahoso-giaymythuat.webp",
        "pureImages": [
          "/images/product/biahoso-giaymythuat.webp",
          "/images/product/biahoso-giaymythuat2.webp",
          "/images/product/biahoso-giaymythuat3.webp"
        ],
      },
    ]
  },
  {
    "id": "nhan-dan",
    "categoryId": "packaging",
    "titleVi": "Nhãn Dán - Decal Label",
    "titleEn": "Decal Labels & Stickers",
    "titleZh": "不干胶标签 - Decal Label",
    "titleJa": "ラベル・シール - Decal Label",
    "titleKo": "라벨 스티커 - Decal Label",
    "descriptionVi": "Tem nhãn dán bao bì sản phẩm, tem niêm phong và sticker quảng cáo bế demi mọi hình dáng, bám dính chắc chắn.",
    "descriptionEn": "Custom product packaging labels, tamper seals, and branded stickers kiss-cut to any shape.",
    "coverImage": "/images/category/nhandan.webp",
    "shapes": [
      {
        "id": "sticker-sheets",
        "nameVi": "Nhãn Sticker dạng Tờ",
        "nameEn": "Kiss-cut Sticker Sheets",
        "nameZh": "拼版多图贴纸套装",
        "nameJa": "シートタイプステッカー",
        "nameKo": "시트형 멀티 스티커 팩",
        "descriptionVi": "Dàn nhiều hình bế demi trên 1 tờ A4 / A3, dễ dàng bóc dán từng chiếc tiện lợi.",
        "descriptionEn": "Multiple kiss-cut shapes nested on one convenient A4/A3 sheet for easy peeling and retail packaging.",
        "image": "/images/category/nhanstickerdangto.webp",
        "badgeVi": "Dạng tờ A4",
        "badgeEn": "Sticker Sheet"
      },
      {
        "id": "decal-uv-dtf",
        "nameVi": "Nhãn Decal UV nổi - UV DTF",
        "nameEn": "3D Raised UV DTF Decals",
        "nameZh": "水晶标立体UV转印贴",
        "nameJa": "立体UV転写シール (UV DTF)",
        "nameKo": "입체 UV 전사 스티커 (UV DTF)",
        "descriptionVi": "Công nghệ in UV nổi không cần màng keo nền, dán chuyển chữ nổi 3D sang ly sứ, nón bảo hiểm, kim loại.",
        "descriptionEn": "Direct-to-film 3D raised UV transfers adhering seamlessly to glass, metal, hard plastic without clear background film.",
        "image": "/images/category/nhandecaluvnoi.webp",
        "badgeVi": "Chữ nổi 3D",
        "badgeEn": "3D UV DTF"
      },
      {
        "id": "decal-tem-be",
        "nameVi": "Nhãn Decal Tem Bể/ Tem Vỡ",
        "nameEn": "Destructible Tamper / Warranty Seals",
        "nameZh": "易碎防伪质保封条",
        "nameJa": "改ざん防止・脆性質保シール",
        "nameKo": "파손형 봉인 / 정품인증 씰",
        "descriptionVi": "Chất liệu decal giòn tự vỡ vụn khi bóc tách, chống mở hộp tráo đổi linh kiện và bảo hành sản phẩm.",
        "descriptionEn": "Ultra-destructible eggshell vinyl that fragments instantly upon any removal attempt for warranty protection.",
        "image": "/images/category/temvo.webp",
        "badgeVi": "Bảo hành",
        "badgeEn": "Warranty"
      }
    ],
    "materials": LABEL_MATERIALS
  },
  {
    "id": "tui-giay",
    "categoryId": "packaging",
    "titleVi": "Túi giấy - Paper bags",
    "titleEn": "Paper Bags",
    "titleZh": "纸质手提袋 - Paper bags",
    "titleJa": "紙袋・ショッパー - Paper bags",
    "titleKo": "종이 쇼핑백 - Paper bags",
    "descriptionVi": "Bao bì túi giấy sang trọng nâng tầm giá trị sản phẩm, lan tỏa nhận diện thương hiệu trên mọi nẻo đường.",
    "descriptionEn": "Premium custom retail shopping bags elevating product value and displaying your brand identity everywhere.",
    "coverImage": "/images/category/tuigiay.webp",
    "shapes": [
      {
        "id": "tui-giay-chuan",
        "nameVi": "Túi giấy chuẩn",
        "nameEn": "Standard Paper Shopping Bags",
        "nameZh": "标准手提袋",
        "nameJa": "標準ショッパー",
        "nameKo": "표준 쇼핑백",
        "descriptionVi": "Quy cách túi xỏ dây dù hoặc ruy băng có đệm đáy cứng chịu lực, thông dụng cho thời trang và mỹ phẩm.",
        "descriptionEn": "Classic cord-handled bag with bottom reinforcement board, versatile for boutiques and cosmetics.",
        "image": "/images/category/tuigiaychuan.webp",
        "badgeVi": "Xỏ dây",
        "badgeEn": "Cord Handle"
      },
      {
        "id": "tui-giay-quai-hot-xoai",
        "nameVi": "Túi giấy quai hột xoài",
        "nameEn": "Die-cut Handle Bags",
        "nameZh": "冲孔提手袋",
        "nameJa": "小判抜き紙袋",
        "nameKo": "타공 손잡이 종이백",
        "descriptionVi": "Đục lỗ tay xách hạt xoài trực tiếp trên thân miệng túi, tạo form gọn nhẹ và hiện đại.",
        "descriptionEn": "Integrated die-cut oval handle on the bag top, offering a sleek, lightweight profile for gifts and lightweight retail.",
        "image": "/images/category/tuigiayquaihopxoai.webp",
        "badgeVi": "Quai đục lỗ",
        "badgeEn": "Die-Cut"
      },
      {
        "id": "tui-giay-co-nap",
        "nameVi": "Túi giấy có nắp/ nắp gập",
        "nameEn": "Flap-closure Paper Bags",
        "nameZh": "折叠盖式礼品纸袋",
        "nameJa": "フタ付きギフトバッグ",
        "nameKo": "덮개형 기프트 종이백",
        "descriptionVi": "Thiết kế nắp gập che kín miệng túi thắt nơ sang trọng, bảo vệ quà tặng kín đáo và đẳng cấp.",
        "descriptionEn": "Fold-over flap closure with ribbon tie, concealing contents and creating a luxury unboxing feel.",
        "image": "/images/category/tuigiayconap.webp",
        "badgeVi": "Nắp gập VIP",
        "badgeEn": "Flap Closure"
      },
      {
        "id": "tui-giay-ep-kim",
        "nameVi": "Túi giấy ép kim",
        "nameEn": "Foil Stamped Luxury Bags",
        "nameZh": "烫金高档精品袋",
        "nameJa": "箔押し紙袋",
        "nameKo": "박가공 쇼핑백",
        "descriptionVi": "Gia công ép kim nhũ vàng hoặc bạc nổi bật logo, tạo điểm nhấn kim loại sang trọng dưới ánh đèn.",
        "descriptionEn": "Metallic foil logo stamping in gold, silver, or rose gold for premium jewelry and fashion brands.",
        "image": "/images/category/tuigiayepkim.webp",
        "badgeVi": "Ép kim nhũ",
        "badgeEn": "Foil Accent"
      },
      {
        "id": "tui-giay-banh-mi",
        "nameVi": "Túi giấy bánh mì",
        "nameEn": "Bread & Bakery Bags",
        "nameZh": "烘焙面包纸袋",
        "nameJa": "ベーカリー袋",
        "nameKo": "베이커리 빵봉투",
        "descriptionVi": "Quy cách đáy đứng hoặc đáy dẹp không quai, chuyên dụng cho bánh mì, cà phê hạt và thức ăn nhanh.",
        "descriptionEn": "Pinch-bottom or stand-up gusseted bags without handles, food-grade safe for bakeries and coffee beans.",
        "image": "/images/category/tuigiaybanhmi.webp",
        "badgeVi": "Thực phẩm",
        "badgeEn": "Food Safe"
      },
      {
        "id": "tui-giay-co-san",
        "nameVi": "Túi Giấy Có Sẵn",
        "nameEn": "In-Stock Ready-made Bags",
        "nameZh": "现货空白袋",
        "nameJa": "既製品即納バッグ",
        "nameKo": "기성 완제품 쇼핑백",
        "descriptionVi": "Túi sản xuất sẵn nhiều kích thước, hỗ trợ in nhanh logo số lượng ít lấy ngay trong ngày.",
        "descriptionEn": "Pre-assembled blank stock in popular dimensions, ready for fast overprinting in low MOQs.",
        "image": "/images/category/tuigiaycosan.webp",
        "badgeVi": "Lấy ngay",
        "badgeEn": "In Stock"
      }
    ],
    "materials": [
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "tagline": "Need vibrant, waterproof shopping bags that showcase your retail brand everywhere?",
        "taglineVi": "Bạn cần túi shopping màu sắc sắc nét, cán màng chống thấm cho cửa hàng bán lẻ?",
        "description": [
          "C250 or C300 coated paper laminated matte or glossy for extra carrying strength",
          "Full-bleed CMYK color printing that makes logos and brand patterns stand out",
          "Reinforced top fold and cardboard bottom insert to carry heavy weights securely"
        ],
        "descriptionVi": [
          "Dày dặn được cán màng mờ hoặc bóng gia tăng độ dai",
          "In màu CMYK tràn viền rực rỡ, hiển thị trọn vẹn logo và họa tiết thương hiệu",
          "Gia cố nắp gấp và lót đáy bằng bìa cứng, chịu lực xách nặng không rách đáy"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Fashion boutiques, clothing brands, and shoe retail stores",
          "Cosmetics, perfume counters, and beauty gift packaging",
          "Corporate event giveaways and trade show attendee gift bags"
        ],
        "bestForVi": [
          "Cửa hàng thời trang, shop quần áo, giày dép và phụ kiện bán lẻ",
          "Showroom mỹ phẩm, nước hoa và túi đựng quà làm đẹp cao cấp",
          "Túi phát tài liệu, quà tặng sự kiện hội nghị và triển lãm doanh nghiệp"
        ],
        "nameZh": "铜版纸 250-300gsm 覆膜手提袋",
        "nameJa": "コート紙 250-300gsm PP加工ショッパー",
        "nameKo": "스노우지 250-300gsm 코팅 쇼핑백",
        "taglineZh": "零售门店需要印刷精美、色彩靓丽且承重力强的标准购物袋？",
        "taglineJa": "店舗用ショッパーに最適な、丈夫で鮮やかな紙袋をお求めですか？",
        "taglineKo": "매장 쇼핑백으로 최적화된 선명하고 튼튼한 종이 가방이 필요하신가요?",
        "descriptionZh": [
          "250-300gsm加厚铜版纸，双面覆哑光膜增强抗撕裂强度",
          "底部加垫厚灰板，承重力提升至5-8公斤不易脱底",
          "全彩鲜明四色印刷，完美展现品牌高清广告视觉"
        ],
        "descriptionJa": [
          "250〜300gsmの厚手コート紙に両面マットPP加工で破れを防止",
          "底面に厚紙を敷き込み、5〜8kgの重量物もしっかり支える耐荷重性",
          "鮮やかなフルカラー印刷で、歩く広告塔として抜群のPR効果"
        ],
        "descriptionKo": [
          "250-300gsm 도톰한 스노우지에 무광 라미네이팅으로 찢어짐 방지",
          "바닥면에 두꺼운 하드 패드를 덧대어 5~8kg 하중도 거뜬히 지탱",
          "선명한 4도 컬러 인쇄로 거리의 걸어 다니는 훌륭한 브랜드 광고판"
        ],
        "bestForZh": [
          "商场服装专卖店、鞋包皮具店日常购物手提袋",
          "企业品牌发布会、大型会展随手礼袋与资料袋",
          "各类消费品牌兼顾美观与性价比的通用主力袋型"
        ],
        "bestForJa": [
          "アパレルショップ、セレクトショップの定番ショッパー",
          "展示会や新製品発表会での資料・ノベルティ配布用バッグ",
          "デザイン性と実用性を両立した、最も汎用性の高い手提げ袋"
        ],
        "bestForKo": [
          "패션 의류 브랜드 매장, 잡화점, 리테일 매장 메인 쇼핑백",
          "기업 박람회 부스, 콘퍼런스 기념품 및 자료 배포용 백",
          "브랜드 인지도 제고와 실용성을 모두 갖춘 표준 종이 쇼핑백"
        ],
        "pureImage": "/images/product/tuigiay-giayloaic.webp",
        "pureImages": [
          "/images/product/tuigiay-giayloaic.webp",
          "/images/product/tuigiay-giayloaic2.webp",
          "/images/product/tuigiay-giayloaic3.webp"
        ],
      },
      {
        "icon": "ShieldCheck",
        "name": "Type I Paper",
        "nameVi": "Giấy loại I",
        "tagline": "Need maximum bag rigidity and a crisp high-white look for luxury gifts?",
        "taglineVi": "Bạn cần túi giấy siêu bền, độ cứng cao và mặt trắng mịn cho quà tặng VIP?",
        "description": [
          "Bright-white coated exterior with high tensile strength and tear resistance",
          "Maintains a structured, upright shape without wrinkling during carrying",
          "Holds hot foil stamping and embossed brand crests with exceptional sharpness"
        ],
        "descriptionVi": [
          "Mặt ngoài trắng mịn tráng phủ cao cấp, độ dai và chịu lực kéo vượt trội",
          "Giữ phom túi vuông vức, đứng dáng, không bị nhăn nhúm trong quá trình xách",
          "Khả năng bắt nhũ ép kim và dập nổi logo cực kỳ sắc nét, sang trọng"
        ],
        "descriptionTraits": [
          "smooth-base",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "Luxury jewelry boutiques, Swiss watches, and high-end fashion",
          "Pharmaceutical corporate gifting and premium healthcare hampers",
          "C-suite executive gift bags for VIP partner conferences"
        ],
        "bestForVi": [
          "Thương hiệu trang sức xa xỉ, đồng hồ và thời trang hàng hiệu",
          "Túi quà tặng dược phẩm, y tế cao cấp và quà biếu tập đoàn",
          "Túi xách quà tặng VIP trong các hội nghị đối tác chiến lược"
        ],
        "nameZh": "白卡纸 Ivory 250-300gsm（坚韧抗撕裂）",
        "nameJa": "アイボリー紙 250-300gsm（高剛性・高級紙袋）",
        "nameKo": "아이보리지 250-300gsm (고강도 럭셔리 쇼핑백)",
        "taglineZh": "纸质超硬超挺，手提袋立体挺立不塌陷？",
        "taglineJa": "コシが強く自立する、型崩れしない高級ブランド紙袋ですか？",
        "taglineKo": "형태가 무너지지 않고 탄탄하게 각이 잡히는 명품 쇼핑백인가요?",
        "descriptionZh": [
          "高等级单铜白卡纸，纸张挺拔坚韧，抗拉伸与撕裂性能优异",
          "袋身笔挺如盒，即使空袋摆放依然立体不塌软",
          "内表面洁白平滑无杂质，开袋体验干净高级"
        ],
        "descriptionJa": [
          "コシが強く引き裂きに強い高級白板紙（アイボリー紙）を採用",
          "空の状態でも型崩れせずシャキッと美しく自立する高い剛性",
          "内側まで純白で清潔感があり、ギフトを開けた瞬間の満足感が高い"
        ],
        "descriptionKo": [
          "탄탄하고 질긴 고급 아이보리지로 제작되어 탁월한 형태 유지력",
          "내용물이 없어도 구김 없이 반듯하게 각이 살아있는 자립형 구조",
          "가방 안쪽 면까지 새하얗고 청결하여 럭셔리한 개봉 만족감 선사"
        ],
        "bestForZh": [
          "高级护肤品、医美机构、母婴精品与香氛店",
          "轻奢时装配饰、高端手机电子产品包装手提袋",
          "注重包装硬挺质感与高档次形象的品牌专属"
        ],
        "bestForJa": [
          "高級コスメ、美容クリニック、サロン専売品、フレグランス",
          "ハイブランドのアクセサリー、高級ガジェットの持ち帰り袋",
          "しっかりとした上質感と清潔感を重視するブランド"
        ],
        "bestForKo": [
          "프리미엄 코스메틱, 피부과 에스테틱, 럭셔리 향수 샵",
          "하이엔드 패션 액세서리, 최신 IT 디바이스 쇼핑백",
          "구김 없이 반듯한 명품 브랜드의 완벽한 핏을 원하는 매장"
        ],
        "pureImage": "/images/product/tuigiay-giayloaii.webp",
        "pureImages": [
          "/images/product/tuigiay-giayloaii.webp",
          "/images/product/tuigiay-giayloaii2.webp",
          "/images/product/tuigiay-giayloaii3.webp"
        ],
      },
      {
        "icon": "Palette",
        "name": "Luxury Textured Art Paper Bag",
        "nameVi": "Giấy Mỹ Thuật Nhám Cao Cấp",
        "tagline": "Want a bespoke artisan shopping bag that feels like a collector's item?",
        "taglineVi": "Bạn muốn túi giấy mang đậm xúc giác nghệ thuật châu Âu khác biệt khi chạm?",
        "description": [
          "Printed on European textured art paper with tactile surface grain",
          "Rich, understated matte colors conveying boutique craftsmanship",
          "Paired with satin ribbon, grosgrain, or braided cotton handles"
        ],
        "descriptionVi": [
          "In trên giấy mỹ thuật châu Âu có vân nhám đặc trưng, cảm giác chạm xa xỉ",
          "Màu sắc trầm ấm, tĩnh lặng, tôn vinh giá trị thủ công cao cấp của thương hiệu",
          "Kết hợp quai dây lụa satin, ruy băng gân hoặc dây cotton tết thủ công"
        ],
        "descriptionTraits": [
          "textured-art",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "Haute couture fashion houses, bespoke tailors, and luxury bridal salons",
          "High-end art galleries, museums, and architectural firms",
          "Exclusive VIP client gifting packages and holiday luxury sets"
        ],
        "bestForVi": [
          "Thương hiệu thời trang xa xỉ, tiệm may đo cao cấp và salon áo cưới",
          "Gallery nghệ thuật, bảo tàng và các công ty kiến trúc hàng đầu",
          "Túi quà tặng giới hạn dành riêng cho đối tác VVIP và tiệc thượng lưu"
        ],
        "nameZh": "高端进口特种艺术纸手提袋",
        "nameJa": "最高級テクスチャアート紙袋",
        "nameKo": "최고급 수입 텍스처 예술지 쇼핑백",
        "taglineZh": "为贵重奢侈品或高级珠宝定制，散发迷人纸张纹理？",
        "taglineJa": "高級ジュエリーやハイブランドにふさわしい、特別な質感の紙袋ですか？",
        "taglineKo": "명품 주얼리나 고급 선물 포장에 어울리는 독보적인 질감의 쇼핑백인가요?",
        "descriptionZh": [
          "欧洲进口高端特种艺术纸精制，拥有细腻凹凸自然纹理",
          "纸质高贵，无需大面积满版印刷，微小细节彰显大牌气场",
          "搭配纯棉织带或真丝手提绳，触碰即是奢华体验"
        ],
        "descriptionJa": [
          "ヨーロッパ直輸入の特殊テクスチャ紙を使用、手触りで違いがわかる",
          "過度な印刷を控え、紙そのものの美しさを引き出す贅沢な仕立て",
          "コットンコードやシルクリボンとの組み合わせで極上のラグジュアリー感"
        ],
        "descriptionKo": [
          "유럽 직수입 최고급 텍스처 예술지로 제작되어 촉각으로 느껴지는 차별화",
          "과도한 인쇄 없이 여백의 미와 종이 자체의 결만으로 명품 아우라 발산",
          "최고급 면 직조 로프나 실크 리본을 매치하여 손끝 닿는 곳마다 럭셔리 경험"
        ],
        "bestForZh": [
          "高级私人定制珠宝首饰、名表、高定礼服手提袋",
          "私人银行大客户礼品袋、艺术品拍卖行鉴赏礼袋",
          "专为金字塔尖高净值客户量身打造的极致包装"
        ],
        "bestForJa": [
          "ハイジュエリー、高級時計、オーダーメイドスーツのショッパー",
          "プライベートバンク、アートオークションのVIPギフトバッグ",
          "本物志向の富裕層顧客へのおもてなしにふさわしい逸品"
        ],
        "bestForKo": [
          "하이엔드 파인 주얼리, 명품 시계, 오트쿠튀르 맞춤 양복점",
          "프라이빗 뱅크 VVIP 사은품 백, 프리미엄 갤러리 옥션 쇼퍼백",
          "품격의 정점을 추구하는 최상위 VIP를 위한 럭셔리 패키징"
        ],
        "pureImage": "/images/product/tuigiay-giaymythuat.webp",
        "pureImages": [
          "/images/product/tuigiay-giaymythuat.webp",
          "/images/product/tuigiay-giaymythuat2.webp",
          "/images/product/tuigiay-giaymythuat3.webp"
        ],
      },
      {
          "icon": "ShieldCheck",
          "name": "Natural Eco Kraft Paper",
          "nameVi": "Túi giấy kraft",
          "tagline": "Eco-friendly recyclable brown kraft paper with authentic vintage organic grain",
          "taglineVi": "Giấy xi măng nâu tự nhiên tái chế 100%, dẻo dai và thân thiện môi trường",
          "description": [
              "Biodegradable natural unbleached long-fiber kraft paper",
              "High tensile strength and tear resistance carrying heavy jars and clothes",
              "Creates an authentic handmade, organic, and eco-friendly brand identity"
          ],
          "descriptionVi": [
              "Chất liệu giấy tự nhiên tự phân hủy, không tẩy trắng hóa chất độc hại",
              "Độ dai và chịu tải tốt, xách được quần áo, hũ hạt dinh dưỡng và mỹ phẩm",
              "Tạo nét thẩm mỹ mộc mạc, gần gũi với thiên nhiên được khách hàng trẻ ưa chuộng"
          ],
          "descriptionTraits": [
              "eco-friendly",
              "natural-grain",
              "thick-weight"
          ],
          "bestFor": [
              "Eco-friendly fashion brands, craft bakeries, organic skincare, coffee roasters"
          ],
          "bestForVi": [
              "Cửa hàng thực phẩm sạch, tiệm bánh, thời trang vintage, quán cafe"
          ],
          "pureImage": "/images/product/tuigiay-giaykraft.webp",
          "pureImages": [
              "/images/product/tuigiay-giaykraft.webp",
              "/images/product/tuigiay-giaykraft2.webp",
              "/images/product/tuigiay-giaykraft3.webp"
          ],
          "nameZh": "环保牛皮纸手提袋 (Natural Eco Kraft)",
          "nameJa": "エコクラフト紙手提げ袋（無漂白・リサイクル）",
          "nameKo": "친환경 크라프트 종이 쇼핑백 (에코 빈티지)",
          "taglineZh": "采用100%可循环未漂白长纤维原木纸浆，质朴自然且耐撕抗拉力极强的手提袋？",
          "taglineJa": "無漂白・高強度の天然クラフト紙を使用。素朴でオーガニックな温もりを伝えるエコ紙袋ですか？",
          "taglineKo": "100% 재활용 가능한 무표백 천연 펄프로 질기고 튼튼하며 에코 감성을 전하는 친환경 쇼핑백인가요?",
          "descriptionZh": [
              "可生物降解未漂白天然长纤维牛皮纸，低碳环保无有害化学残留",
              "抗拉伸强度与耐磨性能出色，承装沉重玻璃瓶、衣物及坚果礼盒不易破底",
              "营造手作烘焙、有机农业与绿色低碳生活方式的质朴高级品牌视觉"
          ],
          "descriptionJa": [
              "生分解性のある無漂白バージンパルプクラフト紙で、環境負荷が極めて低いエコ素材",
              "繊維が長く引裂強度に優れ、重いボトルや衣服、ギフトボックスもしっかり運べるタフさ",
              "素朴でナチュラルな風合いが、オーガニック志向やクラフトブランドの魅力を最大化"
          ],
          "descriptionKo": [
              "생분해 가능한 천연 무표백 장섬유 크라프트지로 환경 오염 없이 지속 가능한 에코 패키징",
              "우수한 인장 강도와 찢김 방지 내구성으로 무거운 유리병, 의류, 베이커리 포장도 안전하게 수납",
              "아날로그 감성의 내추럴한 질감으로 젊은 층과 친환경 오가닉 브랜드에서 가장 선호하는 디자인"
          ],
          "bestForZh": [
              "绿色环保时尚潮牌、手作烘焙坊、有机天然果蔬专卖店、精品独立咖啡馆"
          ],
          "bestForJa": [
              "サステナブルアパレル、手作りパン屋、オーガニックスキンケア、自家焙煎コーヒーショップ"
          ],
          "bestForKo": [
              "친환경 패션 브랜드, 수제 베이커리 전문점, 유기농 뷰티 샵, 스페셜티 로스터리 카페"
          ]
      },
    ]
  },
  {
    "id": "hop-giay",
    "categoryId": "packaging",
    "titleVi": "Hộp Giấy - Paper box",
    "titleEn": "Paper Boxes & Packaging",
    "titleZh": "纸盒包装 - Paper box",
    "titleJa": "化粧箱・ペーパーボックス",
    "titleKo": "종이 상자 / 패키지 박스",
    "descriptionVi": "Hộp đựng sản phẩm tinh tế, bảo vệ an toàn hàng hóa khi vận chuyển và tạo trải nghiệm mở hộp (unboxing) ấn tượng.",
    "descriptionEn": "Rigid luxury and folding carton packaging designed for protection and delighting unboxing experiences.",
    "coverImage": "/images/category/hopgiay.webp",
    "shapes": [
      {
        "id": "hop-giay-thong-dung",
        "nameVi": "Hộp Giấy Thông Dụng",
        "nameEn": "Standard Folding Cartons",
        "nameZh": "通用折叠彩盒",
        "nameJa": "汎用折りたたみ化粧箱",
        "nameKo": "일반 접이식 단상자",
        "descriptionVi": "Quy cách nắp gài đáy gài hoặc đáy khóa tiện lợi, tối ưu chi phí cho mỹ phẩm, dược phẩm và thực phẩm.",
        "descriptionEn": "Convenient tuck-end and snap-lock bottom folding carton for cosmetics, pharmaceuticals, and retail retail goods.",
        "image": "/images/category/hopgiaythongdung.webp",
        "badgeVi": "Nắp gài",
        "badgeEn": "Tuck-End"
      }
    ],
    "materials": [
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "tagline": "Need vibrant, full-color retail packaging that protects your product on shelves?",
        "taglineVi": "Bạn cần hộp giấy màu sắc rực rỡ, cán màng chống trầy cho sản phẩm bán lẻ?",
        "description": [
          "Smooth coated C300 or C350 paper with protective matte or glossy lamination",
          "Vibrant full-color CMYK reproduction for photographic product imagery",
          "Ideal folding carton structure for retail display and consumer goods"
        ],
        "descriptionVi": [
          "Tráng phủ mịn, cán màng mờ hoặc bóng bảo vệ",
          "In màu CMYK rực rỡ, hiển thị hình ảnh sản phẩm và đồ họa bắt mắt",
          "Quy cách hộp gấp tiện lợi, chuẩn mực cho quầy kệ trưng bày bán lẻ"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Cosmetics, skincare creams, and perfume retail packaging",
          "Consumer electronics, accessories, and tech gadget boxes",
          "Food supplements, confectionery, and specialty retail goods"
        ],
        "bestForVi": [
          "Hộp bao bì mỹ phẩm, kem dưỡng da, nước hoa trưng bày kệ bán lẻ",
          "Hộp đựng phụ kiện công nghệ, thiết bị điện tử tiêu dùng",
          "Hộp thực phẩm chức năng, bánh kẹo và hàng tiêu dùng cao cấp"
        ],
        "nameZh": "铜版卡纸 300-350gsm 覆膜彩盒",
        "nameJa": "コートボール紙 300-350gsm PP加工化粧箱",
        "nameKo": "스노우지 300-350gsm 코팅 패키지 상자",
        "taglineZh": "适用于各类快速消费品、食品及电子配件的通用彩色包装盒？",
        "taglineJa": "日用品やコスメ、電子機器に最適な定番カラー化粧箱ですか？",
        "taglineKo": "화장품, 소비재, 전자 부품 포장에 최적화된 표준 컬러 패키지 상자인가요?",
        "descriptionZh": [
          "300-350gsm优质高挺度铜版卡纸，正反双面覆哑光膜",
          "折痕平整，自动折盒成型顺畅，卡扣紧密不松脱",
          "四色全彩高清印刷，色彩饱满，货架陈列吸睛吸客"
        ],
        "descriptionJa": [
          "300〜350gsmの高品質コートボール紙に両面マットPP加工",
          "スジ入れが正確で組み立てやすく、フタの噛み合わせも確実",
          "フルカラー印刷が映える滑らかな表面で、店頭での視認性抜群"
        ],
        "descriptionKo": [
          "300-350gsm 고강도 스노우지에 무광 코팅을 더해 스크래치 완벽 방지",
          "정밀 오시선 가공으로 조립이 간편하며 날개 잠금부가 탄탄하게 결합",
          "선명한 4도 인쇄로 매장 진열대에서 고객 시선을 사로잡는 표준 패키지"
        ],
        "bestForZh": [
          "日常快消品、烘焙点心、日化用品及玩具包装盒",
          "电商快递商品内包装、数码电子配件标准彩盒",
          "需要大批量印刷、兼顾成本与精美度的主力彩盒"
        ],
        "bestForJa": [
          "お菓子・洋菓子、日用品、コスメ、電子アクセサリの化粧箱",
          "EC通販商品の個装箱、小型ガジェットの外箱",
          "コストを抑えつつ美しく大量生産したい製品パッケージ"
        ],
        "bestForKo": [
          "제과 베이커리, 생활잡화, 소형 전자제품 단상자",
          "이커머스 배송용 개별 제품 컬러 패키지 박스",
          "합리적인 단가로 대량 생산 가능한 가장 널리 쓰이는 포장 상자"
        ],
        "pureImage": "/images/product/hopgiay-giayloaic.webp",
        "pureImages": [
          "/images/product/hopgiay-giayloaic.webp",
          "/images/product/hopgiay-giayloaic2.webp",
          "/images/product/hopgiay-giayloaic3.webp"
        ],
      },
      {
        "icon": "ShieldCheck",
        "name": "Type I Paper",
        "nameVi": "Giấy loại I",
        "tagline": "Need maximum box rigidity and crisp high-white cleanliness for pharma or luxury?",
        "taglineVi": "Bạn cần hộp giấy siêu cứng, độ trắng cao chuẩn mực cho dược phẩm hay quà tặng?",
        "description": [
          "Bright-white coated exterior with a clean, natural uncoated interior",
          "Superior stiffness and tear resistance that prevents structural crushing",
          "Holds complex die-cut locks, tuck flaps, and foil stamping beautifully"
        ],
        "descriptionVi": [
          "Mặt ngoài trắng mịn tráng phủ cao cấp, mặt trong trắng sạch tự nhiên",
          "Độ dai và cứng vượt trội, chịu lực tốt, không bị bóp méo khi đóng gói",
          "Giữ phom khóa đáy, nắp gài chuẩn xác, bắt nhũ ép kim cực kỳ sắc nét"
        ],
        "descriptionTraits": [
          "smooth-base",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "Pharmaceutical medicine boxes, clinical supplies, and healthcare goods",
          "Premium cosmetic serums, facial kits, and luxury beauty packaging",
          "High-end corporate gift sets requiring structural integrity"
        ],
        "bestForVi": [
          "Hộp thuốc dược phẩm, thiết bị y tế và sản phẩm chăm sóc sức khỏe",
          "Hộp mỹ phẩm serum cao cấp, bộ sản phẩm làm đẹp sang trọng",
          "Hộp quà tặng doanh nghiệp yêu cầu phom hộp vững chãi, đứng dáng"
        ],
        "nameZh": "单铜白卡 Ivory 300-350gsm（医药化妆品级）",
        "nameJa": "高級白板紙 300-350gsm（医薬品・化粧品規格）",
        "nameKo": "고급 아이보리지 300-350gsm (의약품·화장품 규격)",
        "taglineZh": "内表面雪白洁净，挺度极高，符合医药与高端美妆严苛标准？",
        "taglineJa": "内面まで純白で清潔感があり、医薬品や高級コスメ規格を満たす箱ですか？",
        "taglineKo": "안쪽 면까지 하얗고 청결하며 의약품 및 고급 뷰티 기준을 만족하는 패키지인가요?",
        "descriptionZh": [
          "单面涂布纯白卡纸，反面同样洁白平整，坚韧抗裂抗折",
          "纸张挺度超越普通铜版卡纸，抗挤压变形能力强",
          "无杂质异味，完全符合药品、母婴及高档护肤品标准"
        ],
        "descriptionJa": [
          "裏面まで真っ白で清潔感のある高級白板紙（アイボリー紙）",
          "コシが強く潰れにくいため、大切な製品をしっかり保護",
          "衛生的で匂い移りがなく、医薬品や高級コスメの厳格な規格に対応"
        ],
        "descriptionKo": [
          "안쪽 면까지 새하얗고 매끄러운 최고급 편면 코팅 아이보리지",
          "종이 밀도와 탄성이 높아 외부 충격에도 찌그러짐 없는 탁월한 강도",
          "이물질과 냄새가 없어 제약, 바이오, 영유아 및 고기능성 화장품 기준 충족"
        ],
        "bestForZh": [
          "医药保健品盒、功能性口服液包装、医疗器械小盒",
          "高端面霜、精华液护肤品及法国香水外包装盒",
          "注重包装内部开盒洁净感与高端硬朗质感的品牌"
        ],
        "bestForJa": [
          "医薬品・サプリメント・健康食品・医療機器パッケージ",
          "高級スキンケア美容液・香水の外箱化粧箱",
          "開けた瞬間にも清潔感と高品質を実感させたいブランド"
        ],
        "bestForKo": [
          "건강기능식품, 프리미엄 영양제, 의료용 바이알 패키지 박스",
          "고기능성 세럼, 프리미엄 크림, 수입 향수 럭셔리 단상자",
          "상자를 열었을 때 안쪽까지 하얗고 완벽한 마감을 원하는 브랜드"
        ],
        "pureImage": "/images/product/hopgiay-giayloaii.webp",
        "pureImages": [
          "/images/product/hopgiay-giayloaii.webp",
          "/images/product/hopgiay-giayloaii2.webp",
          "/images/product/hopgiay-giayloaii3.webp"
        ],
      },
      // {
      //   "icon": "Award",
      //   "name": "Couche Mounted on E/B-Flute Corrugated Board",
      //   "nameVi": "Couche Bồi Carton Sóng E / Sóng B",
      //   "tagline": "Need extra shock-proof protection for heavier items or e-commerce shipping?",
      //   "taglineVi": "Bạn cần hộp bồi sóng cứng cáp chịu lực va đập khi gửi hàng chuyển phát nhanh?",
      //   "description": [
      //     "Laminated C250/C300 printed sheet mounted onto strong E-flute corrugated cardboard",
      //     "Provides superior cushioning and compression resistance during transit",
      //     "Combines high-definition retail print quality with shipping box ruggedness"
      //   ],
      //   "descriptionVi": [
      //     "In màu sắc nét được bồi lên lớp carton sóng E hoặc sóng B cứng cáp",
      //     "Khả năng chống va đập, chịu lực đè nén vượt trội trong quá trình vận chuyển",
      //     "Kết hợp hoàn hảo giữa thẩm mỹ in ấn bán lẻ và độ bền của hộp bảo vệ"
      //   ],
      //   "descriptionTraits": [
      //     "smooth-base",
      //     "waterproof-durability",
      //     "glossy-coat"
      //   ],
      //   "bestFor": [
      //     "E-commerce subscription boxes and courier shipping mailers",
      //     "Heavy glass bottles, wine, ceramics, and electronic appliances",
      //     "Fruit gift boxes, agricultural exports, and bulk retail packs"
      //   ],
      //   "bestForVi": [
      //     "Hộp ship COD thương mại điện tử, hộp quà gửi chuyển phát nhanh",
      //     "Hộp đựng chai lọ thủy tinh nặng, rượu vang, gốm sứ và thiết bị điện",
      //     "Hộp quà trái cây, nông sản xuất khẩu và giỏ quà thực phẩm"
      //   ],
      //   "nameZh": "彩色铜版纸裱E坑/B坑加强瓦楞纸盒",
      //   "nameJa": "コート紙合紙 E段/B段 段ボール箱",
      //   "nameKo": "컬러 스노우지 합지 E골/B골 골판지 박스",
      //   "taglineZh": "需要抵抗快递暴力分拣、兼顾高清彩色印刷与坚硬防撞缓冲？",
      //   "taglineJa": "配送時の衝撃から製品を守り、鮮やかな外装印刷も両立させたいですか？",
      //   "taglineKo": "택배 배송 충격으로부터 제품을 안전하게 보호하면서 컬러풀한 외관을 유지할 박스인가요?",
      //   "descriptionZh": [
      //     "面纸彩印高精铜版纸，手工裱贴加强型E坑或B坑瓦楞芯纸",
      //     "抗压耐摔防撞缓冲，有效吸收快递长途颠簸冲击",
      //     "折叠卡扣设计，免胶水即插即锁，打包发货极速高效"
      //   ],
      //   "descriptionJa": [
      //     "コート紙に鮮やかに印刷し、E段またはB段の段ボール芯に合紙",
      //     "輸送時の落下や衝撃から中の商品をしっかりガードする高強度",
      //     "ワンタッチで組み立て可能な効率的なロック構造"
      //   ],
      //   "descriptionKo": [
      //     "선명하게 인쇄된 스노우지를 탄탄한 E골/B골 강화 골판지에 합지 가공",
      //     "택배 배송 중 던짐과 적재 하중을 거뜬히 견뎌내는 강력한 완충력",
      //     "테이프 없이 원터치 조립이 가능한 편리한 스마트 락 구조"
      //   ],
      //   "bestForZh": [
      //     "电商快递发货飞机盒、易碎玻璃瓶罐外发箱",
      //     "电子数码产品外箱、家用小电器及五金工具箱",
      //     "兼顾外表全彩精美与内在强力保护的电商首选"
      //   ],
      //   "bestForJa": [
      //     "EC通販の配送用メール便ボックス、割れ物・ボトルの発送箱",
      //     "家電製品・ガジェット・工具・シューズボックス",
      //     "見た目の美しさと配送時の保護性能を両立した発送用化粧箱"
      //   ],
      //   "bestForKo": [
      //     "이커머스 배송용 프리미엄 컬러 날개 박스, 유리병 완충 배송 상자",
      //     "스마트 기기, 소형 가전, 생활 가전 컬러 골판지 박스",
      //     "택배 상자 자체가 하나의 세련된 선물 포장이 되는 브랜드 박스"
      //   ],
      //   "pureImage": "/images/product/carbon.webp",
      //   "pureImages": [
      //     "/images/product/carbon.webp",
      //     "/images/product/box-board2.webp",
      //     "/images/product/box-board3.webp"
      //   ],
      // },
      {
        "icon": "Feather",
        "name": "Natural Kraft 250 - 350gsm (Eco-Box)",
        "nameVi": "Hộp Giấy Kraft",
        "tagline": "Want sustainable, rustic packaging that appeals to eco-conscious consumers?",
        "taglineVi": "Bạn muốn bao bì hộp giấy mộc mạc, thân thiện môi trường cho sản phẩm xanh?",
        "description": [
          "100% recycled natural brown Kraft paper with organic tactile texture",
          "High tear resistance and authentic artisan visual warmth",
          "Looks exceptional with minimalist black ink, white ink, or foil stamping"
        ],
        "descriptionVi": [
          "Màu nâu tự nhiên tái chế 100% với vân xơ giấy mộc mạc, chân thực",
          "Độ dai cao, mang lại thiện cảm thẩm mỹ thân thiện, bảo vệ môi trường",
          "Hiệu ứng thị giác ấn tượng khi in đơn sắc đen, in mực trắng hoặc ép kim"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Organic soaps, handmade cosmetics, and natural skincare bars",
          "Artisan tea, roasted coffee beans, and dried herbal products",
          "Sustainable fashion accessories and eco-friendly home goods"
        ],
        "bestForVi": [
          "Hộp xà phòng hữu cơ, mỹ phẩm handmade và sản phẩm thiên nhiên",
          "Hộp trà thảo mộc, cà phê rang xay và đặc sản nông sản khô",
          "Hộp đựng phụ kiện thời trang xanh và đồ gia dụng thân thiện môi trường"
        ],
        "nameZh": "天然环保原色牛皮纸包装盒",
        "nameJa": "未晒クラフト紙ナチュラルボックス",
        "nameKo": "친환경 천연 크라프트 포장 박스",
        "taglineZh": "追求环保零塑料覆膜、天然复古原色烘焙与手作包装？",
        "taglineJa": "エコでナチュラル、焼き菓子やクラフト製品にぴったりの箱ですか？",
        "taglineKo": "베이커리, 수제 비누, 친환경 제품에 최적화된 내추럴 크라프트 상자인가요?",
        "descriptionZh": [
          "采用未经漂白的原生态天然牛皮纸，质朴厚实抗穿刺",
          "纸面散发天然木质纤维纹理，复古手工感强烈",
          "完全不含塑料覆膜，可100%直接生物降解与回收"
        ],
        "descriptionJa": [
          "無漂白の天然クラフト紙を使用、破れや突き刺しに強いタフな仕様",
          "木の温もりを感じさせる風合いで、オーガニックなイメージを強調",
          "ラミネート不使用で、完全リサイクル可能なエコフレンドリー設計"
        ],
        "descriptionKo": [
          "표백 처리를 하지 않은 자연 그대로의 도톰한 크라프트 보드지",
          "자연스러운 나무 섬유 결이 살아있는 내추럴 아날로그 감성",
          "비닐 코팅을 일절 배제하여 100% 친환경 자연 분해 및 종이 재활용 가능"
        ],
        "bestForZh": [
          "手工皂、香薰蜡烛、手作皮具及天然护肤品包装",
          "手工曲奇、坚果谷物、精品咖啡豆及农创产品盒",
          "主打纯天然、有机、零污染的可持续发展品牌"
        ],
        "bestForJa": [
          "手作り石鹸、アロマキャンドル、オーガニックコスメ",
          "焼き菓子、コーヒー豆、ナッツ、ドライフルーツのパッケージ",
          "自然派志向・サステナブルをコンセプトにするブランド"
        ],
        "bestForKo": [
          "수제 비누, 아로마 캔들, 오가닉 화장품 패키지",
          "수제 쿠키, 로스팅 원두, 건강 견과류 및 프리미엄 농산물 상자",
          "지속가능한 친환경 가치와 진정성을 전달하는 에코 브랜드"
        ],
        "pureImage": "/images/product/hopgiay-giaykraft.webp",
        "pureImages": [
          "/images/product/hopgiay-giaykraft.webp",
          "/images/product/hopgiay-giaykraft2.webp",
          "/images/product/hopgiay-giaykraft3.webp"
        ],
      },
      // {
      //   "icon": "Gem",
      //   "name": "Premium Rigid Gift Box (2mm Greyboard)",
      //   "nameVi": "Hộp Cứng Cao Cấp (Bồi Carton 2mm)",
      //   "tagline": "Want a luxurious rigid gift box that creates an unforgettable unboxing moment?",
      //   "taglineVi": "Bạn muốn hộp quà cứng cao cấp tạo trải nghiệm mở hộp đẳng cấp khó quên?",
      //   "description": [
      //     "2mm to 3mm rigid greyboard wrapped in printed C150 paper or luxury art paper",
      //     "Available in magnetic closure, lift-off lid, or sliding drawer box styles",
      //     "Enhanced with hot foil stamping, embossing, and custom velvet/EVA inserts"
      //   ],
      //   "descriptionVi": [
      //     "Dày 2 - 3mm bồi giấy Couche in màu hoặc giấy mỹ thuật xa xỉ",
      //     "Quy cách hộp nam châm nắp gập, hộp âm dương hoặc hộp kéo bao diêm sang trọng",
      //     "Tích hợp ép kim nhũ vàng, dập nổi logo và khay mút lót nhung bảo vệ sản phẩm"
      //   ],
      //   "descriptionTraits": [
      //     "foil-accent",
      //     "embossed-depth",
      //     "glossy-coat"
      //   ],
      //   "bestFor": [
      //     "VIP corporate Tet gift hampers and Mid-Autumn mooncake boxes",
      //     "High-end spirits, vintage wine, and premium jewelry boxes",
      //     "Luxury cosmetics gift sets and VIP commemorative watches"
      //   ],
      //   "bestForVi": [
      //     "Hộp quà Tết doanh nghiệp VIP và bộ hộp bánh trung thu cao cấp",
      //     "Hộp rượu ngoại sang trọng, yến sào và trang sức giá trị cao",
      //     "Bộ hộp quà mỹ phẩm giới hạn và đồng hồ kỷ niệm cho đại biểu"
      //   ],
      //   "nameZh": "奢华精装天地盖硬盒（裱2mm高密灰板）",
      //   "nameJa": "特製高級貼り箱（2mm芯材・ギフトボックス）",
      //   "nameKo": "프리미엄 고급 싸바리 박스 (2mm 하드보드)",
      //   "taglineZh": "用于名酒、贵重礼品或高端手表，需要永不变形的奢华开箱礼遇？",
      //   "taglineJa": "高級酒、時計、ジュエリーにふさわしい、絶対に歪まない最高級貼り箱ですか？",
      //   "taglineKo": "명품 와인, 고급 시계, 프리미엄 선물용으로 변형 없이 영구 소장할 상자인가요?",
      //   "descriptionZh": [
      //     "内部以2-3mm超厚高密工业灰板为骨架，坚若磐石永不变形",
      //     "外层手工裱糊特种艺术纸或彩印铜版纸，天地盖或书本翻盖式",
      //     "内部可定制高密度EVA或海绵丝绸开槽内托，固定保护贵重产品"
      //   ],
      //   "descriptionJa": [
      //     "2〜3mmの頑丈な高密度芯材を用いた、歪みのない本格貼り箱仕様",
      //     "熟練職人による手作業の美しい貼り込み、天地蓋やマグネット式",
      //     "製品の形状に合わせてウレタンやサテン布の専用トレーをオーダー可能"
      //   ],
      //   "descriptionKo": [
      //     "2~3mm 고밀도 압축 하드보드를 뼈대로 제작하여 절대 찌그러지지 않는 싸바리 박스",
      //     "외면에 고급 수입지나 스노우지를 정밀 수작업으로 마감한 상하 분리형/자석형",
      //     "내부에 맞춤형 고밀도 EVA 폼 스펀지와 실크 공단 완충 트레이 내장 가능"
      //   ],
      //   "bestForZh": [
      //     "高端洋酒名茶、燕窝海参花胶等名贵滋补礼盒",
      //     "奢华珠宝首饰、名表、高档钢笔及定制企业收藏品",
      //     "供重要贵宾永久典藏、传递至尊敬意的旗舰产品包装"
      //   ],
      //   "bestForJa": [
      //     "高級酒、銘茶、高級健康食品のプレミアムギフト箱",
      //     "ジュエリー、高級時計、万年筆、記念メダルボックス",
      //     "最高の敬意と特別感を伝える、永久保存版パッケージ"
      //   ],
      //   "bestForKo": [
      //     "고급 양주, 전통 명차, 산삼, 홍삼 등 프리미엄 명절 선물 세트",
      //     "명품 주얼리, 명품 시계, 만년필, 귀금속 수납 하드 케이스",
      //     "귀빈과 주요 고객에게 잊지 못할 감동을 선사하는 최고급 싸바리 패키지"
      //   ],
      //   "pureImage": "/images/product/carton.webp",
      //   "pureImages": [
      //     "/images/product/carton.webp",
      //     "/images/product/box-rigid2.webp",
      //     "/images/product/box-rigid3.webp"
      //   ],
      // },
    ]
  },
  {
    "id": "mac-san-pham",
    "categoryId": "packaging",
    "titleVi": "Mác sản phẩm - Product Tags",
    "titleEn": "Product Tags & Hangtags",
    "titleZh": "商品吊牌 - Product Tags",
    "titleJa": "下げ札・タグ - Product Tags",
    "titleKo": "의류 행택 / 태그 - Product Tags",
    "descriptionVi": "Thẻ bài, mác treo quần áo, phụ kiện thời trang và trang sức khẳng định thương hiệu và cung cấp thông tin giá cả, xuất xứ.",
    "descriptionEn": "Custom apparel hangtags and jewelry price cards highlighting brand quality and care instructions.",
    "coverImage": "/images/category/macsanpham.webp",
    "shapes": [
      {
        "id": "mac-pho-thong",
        "nameVi": "Mác sản phẩm phổ thông",
        "nameEn": "Standard Hangtags",
        "nameZh": "常规商品价格吊牌",
        "nameJa": "スタンダード下げ札",
        "nameKo": "일반 상품 행택",
        "descriptionVi": "Quy cách in chuẩn cán màng mờ hoặc bóng, đục lỗ xỏ dây tròn hoặc cấn đường xé giá tiện lợi.",
        "descriptionEn": "Standard hangtags with matte or gloss lamination, round drill hole or tear-off perforated price stub.",
        "image": "/images/category/macsanphamphothong.webp",
        "badgeVi": "Phổ thông",
        "badgeEn": "Standard"
      },
      {
        "id": "mac-cao-cap",
        "nameVi": "Mác Sản Phẩm Cao Cấp",
        "nameEn": "Premium Luxury Hangtags",
        "nameZh": "加厚特种纸高档吊牌",
        "nameJa": "高級特殊紙下げ札",
        "nameKo": "고급 프리미엄 브랜드 택",
        "descriptionVi": "Chất liệu giấy bồi dày 2-3 lớp, ép kim nhũ vàng và dập mắt gà kim loại xỏ dây dù sang trọng.",
        "descriptionEn": "Multi-ply laminated heavy stock with gold foil accents and brass eyelet grommet for luxury apparel.",
        "image": "/images/category/macsanphamcaocap.webp",
        "badgeVi": "Ép kim mắt gà",
        "badgeEn": "Eyelet Grommet"
      },
      {
        "id": "tag-thoi-trang",
        "nameVi": "Tag thời trang",
        "nameEn": "Fashion Apparel Tags",
        "nameZh": "服装服饰专属标签",
        "nameJa": "アパレル・ファッションタグ",
        "nameKo": "패션 브랜드 의류 태그",
        "descriptionVi": "Quy cách bế bo góc hoặc hình dáng chuông, cấn đục lỗ xỏ dây tiêu chuẩn ngành may mặc.",
        "descriptionEn": "Classic rectangular or shaped hangtags with punch hole ready for garment cord attachment.",
        "image": "/images/category/tagthoitrang.webp",
        "badgeVi": "May mặc",
        "badgeEn": "Apparel"
      },
      {
        "id": "tag-trang-suc",
        "nameVi": "Tag trang sức",
        "nameEn": "Jewelry & Accessory Tags",
        "nameZh": "精美首饰珠宝小标签",
        "nameJa": "ジュエリー・アクセサリータグ",
        "nameKo": "주얼리 / 액세서리 미니 택",
        "descriptionVi": "Kích thước mini nhỏ gọn, đục lỗ xỏ khuyên tai, nhẫn và vòng tay tinh xảo.",
        "descriptionEn": "Miniature die-cut cards engineered for earrings, necklaces, and delicate accessories.",
        "image": "/images/category/tagtrangsuc.webp",
        "badgeVi": "Mini trang sức",
        "badgeEn": "Jewelry"
      },
      {
        "id": "tag-cam-on",
        "nameVi": "Tag cảm ơn",
        "nameEn": "Thank You Gift Tags",
        "nameZh": "精美感恩感谢卡吊牌",
        "nameJa": "サンキュー・感謝タグ",
        "nameKo": "감사 땡큐 기프트 택",
        "descriptionVi": "Thiết kế xinh xắn gửi lời tri ân ngọt ngào đến khách hàng kèm trong mỗi gói hàng đơn mua.",
        "descriptionEn": "Heartfelt mini appreciation thank-you cards slipped into e-commerce packaging parcels.",
        "image": "/images/category/tagcamon.webp",
        "badgeVi": "Tri ân",
        "badgeEn": "Thank You"
      }
    ],
    "materials": [
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "tagline": "Need clean, rigid hang tags with drilled holes for your apparel collection?",
        "taglineVi": "Bạn cần mác treo quần áo dày dặn, khoan lỗ chuẩn mực cho bộ sưu tập thời trang?",
        "description": [
          "Smooth C300 or C350 coated paper laminated matte or glossy for extra rigidity",
          "Vibrant CMYK printing for brand logos, barcodes, sizes, and care instructions",
          "Precision 3mm or 4mm drilled hole ready for stringing or tagging guns"
        ],
        "descriptionVi": [
          "Láng mịn, cán màng mờ hoặc bóng cứng cáp",
          "In màu CMYK sắc nét logo thương hiệu, mã vạch, kích cỡ và hướng dẫn giặt ủi",
          "Khoan lỗ tròn 3mm hoặc 4mm chuẩn xác, sẵn sàng xỏ dây hoặc gắn súng bắn mác"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Fashion retail apparel, denim wear, and casual clothing collections",
          "Luggage tags, handbag identification tags, and footwear labels",
          "Retail price tags and barcode swing tags for department stores"
        ],
        "bestForVi": [
          "Quần áo thời trang bán lẻ, trang phục denim và bộ sưu tập thường nhật",
          "Mác treo túi xách, hành lý và mác giày dép thời trang",
          "Mác giá bán lẻ và thẻ treo mã vạch tại các trung tâm thương mại"
        ],
        "nameZh": "铜版纸 300-350gsm 服装吊牌（标准款）",
        "nameJa": "コート紙 300-350gsm アパレル下げ札",
        "nameKo": "스노우지 300-350gsm 표준 의류 행택",
        "taglineZh": "服装商场零售必备、厚实平整的标准品牌吊牌？",
        "taglineJa": "アパレル製品に欠かせない、しっかりとした厚みの定番ブランドタグですか？",
        "taglineKo": "의류 매장에서 널리 쓰이는 탄탄하고 깔끔한 표준 브랜드 행택인가요?",
        "descriptionZh": [
          "300-350gsm优质加厚铜版纸，双面覆哑光膜手感细腻",
          "表面平整挺括不易起皱，全彩印刷色彩饱满锐利",
          "预打标准圆孔，穿挂麻绳、丝带或吊粒极为顺畅"
        ],
        "descriptionJa": [
          "300〜350gsmの厚手コート紙に両面マットPP加工で上品な仕上がり",
          "しっかりとしたコシがあり、店頭で触れてもシワになりにくい",
          "標準パンチ穴加工済みで、紐やタグピンの取り付けが簡単"
        ],
        "descriptionKo": [
          "300-350gsm 도톰한 스노우지에 양면 무광 코팅으로 고급스러운 질감",
          "구김 없이 반듯하고 탄탄하여 수많은 피팅에도 형태 유지",
          "정밀 타공 가공으로 행택 끈이나 옷핀을 부드럽게 결합"
        ],
        "bestForZh": [
          "快时尚男女服饰、童装、运动服饰标准品牌吊牌",
          "箱包手袋、鞋靴专柜日常价格与条形码信息牌",
          "大批量采购、兼顾品牌形象与成本效益的理想选择"
        ],
        "bestForJa": [
          "メンズ・レディース・キッズのアパレル定番ブランドタグ",
          "バッグ・シューズ・ファッション小物のプライスタグ",
          "コストとクオリティを両立したいアパレルブランド"
        ],
        "bestForKo": [
          "남녀 캐주얼 의류, 아동복, 스포츠웨어 표준 브랜드 행택",
          "가방, 신발, 패션 잡화 매장 가격표 및 바코드 태그",
          "합리적인 제작비로 높은 브랜드 이미지를 전달하는 대중적 행택"
        ],
        "pureImage": "/images/product/mac-giayloaic.webp",
        "pureImages": [
          "/images/product/mac-giayloaic.webp",
          "/images/product/mac-giayloaic2.webp",
          "/images/product/mac-giayloaic3.webp"
        ],
      },
      {
        "icon": "Feather",
        "name": "Type F Paper",
        "nameVi": "Giấy loại F",
        "tagline": "Want an uncoated natural tag where sales staff can write prices or batch codes?",
        "taglineVi": "Bạn muốn mác treo giấy mộc tự nhiên để nhân viên ghi tay giá tiền hay mã lô?",
        "description": [
          "Natural matte uncoated Ford 300gsm paper with soft light diffusion",
          "Zero glare under boutique spotlights, making typography clean and readable",
          "Absorbs pens and stamps easily for handwritten price tags or SKU markers"
        ],
        "descriptionVi": [
          "Nhám mịn tự nhiên, không tráng phủ hay cán màng trơn",
          "Hoàn toàn không chói sáng dưới đèn showroom, giúp đọc thông tin rõ ràng",
          "Dễ dàng viết tay giá bán, mã lô hoặc đóng dấu mộc bảo hành lên mác"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Boutique apparel brands, vintage thrift stores, and handmade crafts",
          "Artisan ceramic, homeware, and organic textile hang tags",
          "Minimalist fashion brands favoring an organic, uncoated aesthetic"
        ],
        "bestForVi": [
          "Thương hiệu thời trang boutique, cửa hàng đồ vintage và thủ công",
          "Mác treo đồ gốm sứ thủ công, đồ trang trí nhà cửa và vải vóc hữu cơ",
          "Thương hiệu thời trang tối giản ưu tiên phong cách mộc mạc, tự nhiên"
        ],
        "nameZh": "道林纸 300gsm 素雅吊牌（便于书写价格）",
        "nameJa": "上質紙 300gsm 手書き用ナチュラル下げ札",
        "nameKo": "모조지 300gsm 수기용 내추럴 가격택",
        "taglineZh": "棉麻服饰、复古手作店需要手写价格和尺码的吊牌？",
        "taglineJa": "リネンやナチュラル服に似合う、手書きで価格を記入できるタグですか？",
        "taglineKo": "린넨 의류나 핸드메이드 제품에 손글씨로 가격을 적을 수 있는 내추럴 택인가요?",
        "descriptionZh": [
          "300gsm无涂层道林厚卡纸，保留自然细腻纸张纤维",
          "吸墨渗透好，便于圆珠笔、打码机现场填写价格与尺码",
          "手感纯朴温润，展现回归自然的品牌设计初心"
        ],
        "descriptionJa": [
          "300gsmの未塗工上質紙、さらりとした手触りで自然な風合い",
          "インクが素早く馴染み、手書きでの価格・サイズ記入に最適",
          "オーガニックで素朴な世界観を表現するナチュラルタグ"
        ],
        "descriptionKo": [
          "300gsm 두꺼운 모조지로 눈부심 없는 내추럴한 천연 질감",
          "볼펜이나 스탬프로 가격, 사이즈를 현장에서 직접 적기에 최적",
          "자연 친화적이고 아날로그한 감성을 중시하는 브랜드에 적합"
        ],
        "bestForZh": [
          "棉麻天然材质服饰、手工针织毛衣及手作布艺包",
          "文创小店手工饰品、陶艺工艺品与古着复古服饰",
          "倡导可持续慢时尚、注重手写温度的独立设计师品牌"
        ],
        "bestForJa": [
          "リネン・コットンウェア、ハンドメイドニット、布小物",
          "ヴィンテージ古着、クラフト雑貨、陶器・アクセサリー",
          "スローファッションや手作りの温もりを大切にするブランド"
        ],
        "bestForKo": [
          "린넨 의류, 친환경 오가닉 코튼, 핸드메이드 니트웨어",
          "빈티지 구제 샵, 수제 가죽 공예품, 핸드메이드 주얼리",
          "슬로우 패션과 손글씨의 정성을 전하고자 하는 독립 디자이너 브랜드"
        ],
        "pureImage": "/images/product/mac-giayloaif.webp",
        "pureImages": [
          "/images/product/mac-giayloaif.webp",
          "/images/product/mac-giayloaif2.webp",
          "/images/product/mac-giayloaif3.webp"
        ],
      },
      {
        "icon": "ShieldCheck",
        "name": "Type I Paper",
        "nameVi": "Giấy loại I",
        "tagline": "Need maximum tag stiffness and a crisp high-white executive appearance?",
        "taglineVi": "Bạn cần mác treo siêu cứng, độ trắng mịn chuẩn mực cho thời trang hàng hiệu?",
        "description": [
          "Bright-white coated front side with exceptional structural stiffness",
          "Prevents bending or curling when garments are handled on store racks",
          "Holds sharp metallic foil stamping and embossed crests beautifully"
        ],
        "descriptionVi": [
          "Mặt ngoài trắng mịn tráng phủ cao cấp, độ cứng và chịu lực vượt trội",
          "Không bị quăn mép hay cong vênh khi khách hàng xem quần áo trên giá treo",
          "Khả năng bắt nhũ ép kim và dập nổi biểu tượng thương hiệu cực kỳ sắc nét"
        ],
        "descriptionTraits": [
          "smooth-base",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "Designer fashion collections, tailoring houses, and luxury coats",
          "High-end leather goods, luxury handbags, and leather footwear",
          "VIP corporate gift swing tags and warranty cards"
        ],
        "bestForVi": [
          "Bộ sưu tập thời trang thiết kế, tiệm may đo cao cấp và áo khoác xa xỉ",
          "Đồ da hàng hiệu, túi xách cao cấp và giày da sang trọng",
          "Mác treo quà tặng doanh nghiệp VIP và thẻ bảo hành sản phẩm"
        ],
        "nameZh": "超厚白卡 Ivory 300-350gsm（挺括硬挺）",
        "nameJa": "厚紙アイボリー 300-350gsm 高品位タグ",
        "nameKo": "아이보리지 300-350gsm 고강도 럭셔리 행택",
        "taglineZh": "吊牌需要足够硬朗挺直，绝不轻易卷曲或折断？",
        "taglineJa": "曲がりにくくピンと張った、高級感を演出する厚手下げ札ですか？",
        "taglineKo": "쉽게 구부러지지 않고 빳빳함을 유지하는 프리미엄 브랜드 태그인가요?",
        "descriptionZh": [
          "300-350gsm进口单铜超白白卡纸，纸质紧实超高挺度",
          "正反面皆雪白无瑕，边缘裁切平直光滑不掉屑",
          "抗折弯抗变形性能出众，挂在厚重外套上依然笔挺"
        ],
        "descriptionJa": [
          "300〜350gsmの高密度アイボリー紙、抜群の剛性と白色度",
          "両面とも清潔感のある白さで、エッジの裁断面も滑らか",
          "厚手のコートに吊るしてもへたらない、高級感あふれるタフさ"
        ],
        "descriptionKo": [
          "300-350gsm 고밀도 아이보리지로 제작되어 압도적인 탄성과 강도",
          "양면 모두 티끌 없이 새하얗고 매끄러우며 절단면이 깔끔함",
          "두꺼운 겨울 코트나 패딩에 걸어두어도 빳빳함을 잃지 않는 단단함"
        ],
        "bestForZh": [
          "高端商务西装、羊绒大衣、羽绒服及设计师时装",
          "高端皮具真皮手袋、真皮皮鞋专柜专属吊牌",
          "注重包装挺拔硬朗与国际大牌质感的中高端品牌"
        ],
        "bestForJa": [
          "テーラードスーツ、カシミヤコート、ダウンジャケット",
          "高級レザートート、本革シューズ、フォーマルウェア",
          "一流ブランドの風格と耐久性を求めるアパレルメーカー"
        ],
        "bestForKo": [
          "맞춤 정장, 캐시미어 코트, 프리미엄 다운 점퍼 브랜드 행택",
          "명품 수제 가죽 가방, 천연 가죽 구두 전용 라벨",
          "국제적인 명품 수준의 빳빳한 하드 핏을 추구하는 패션 브랜드"
        ],
        "pureImage": "/images/product/mac-giayloaii.webp",
        "pureImages": [
          "/images/product/mac-giayloaii.webp",
          "/images/product/mac-giayloaii2.webp",
          "/images/product/mac-giayloaii3.webp"
        ],
      },
      {
        "icon": "Palette",
        "name": "Luxury Art Paper Hang Tag",
        "nameVi": "Mác Giấy Mỹ Thuật Nhám Cao Cấp",
        "tagline": "Want a bespoke European textured art tag that feels like an artisan label?",
        "taglineVi": "Bạn muốn mác treo mang vân giấy mỹ thuật châu Âu khác biệt khi chạm tay?",
        "description": [
          "Printed on European textured art paper with subtle tactile grain",
          "Muted, warm color absorption conveying couture craftsmanship",
          "Pairs beautifully with cotton string, eyelet grommets, and foil stamping"
        ],
        "descriptionVi": [
          "In trên giấy mỹ thuật châu Âu có vân nhám đặc trưng, sang trọng khi chạm",
          "Màu mực thấm tự nhiên tạo sắc thái trầm tĩnh, tôn vinh kỹ thuật may đo",
          "Kết hợp hoàn hảo với dây cotton, khoen kim loại và chi tiết ép kim logo"
        ],
        "descriptionTraits": [
          "textured-art",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "Haute couture apparel, wedding dresses, and evening gowns",
          "Artisan jewelry collections and luxury cashmere/silk garments",
          "Exclusive designer collaborations and limited-edition releases"
        ],
        "bestForVi": [
          "Thời trang thiết kế cao cấp, váy cưới và dạ hội hạng sang",
          "Bộ sưu tập trang sức thủ công và trang phục cashmere/lụa xa xỉ",
          "Các phiên bản hợp tác đặc biệt của nhà thiết kế và hàng giới hạn"
        ],
        "nameZh": "高端进口粗纹特种纸吊牌",
        "nameJa": "特殊テクスチャ紙 高級ファッションタグ",
        "nameKo": "수입 예술 질감지 프리미엄 패션 행택",
        "taglineZh": "高端独立设计师品牌，需要浓郁纸张触感传达品味？",
        "taglineJa": "デザイナーズブランドにふさわしい、個性的な紙肌を持つタグですか？",
        "taglineKo": "디자이너 브랜드의 철학과 감성을 전해줄 독특한 결이 있는 행택인가요?",
        "descriptionZh": [
          "欧洲进口高端特种棉纹艺术纸，独特触感纸纹极富艺术张力",
          "无过多涂层，纸质天然厚重，沉稳深邃的大牌气质",
          "与素雅凹凸压印或单色典雅印刷完美契合"
        ],
        "descriptionJa": [
          "ヨーロッパ直輸入の特殊テクスチャ紙、指先で違いがわかる質感",
          "紙本来の温かみと高級感を活かし、ブランドの哲学を表現",
          "シンプルな空押しや単色プリントが美しく映える設計"
        ],
        "descriptionKo": [
          "유럽 직수입 최고급 질감지로 손끝에서 느껴지는 차별화된 아우라",
          "과도한 광택을 배제한 자연스럽고 묵직한 오트쿠튀르 감성",
          "은은한 형압과 절제된 미니멀 타이포그래피의 완벽한 조화"
        ],
        "bestForZh": [
          "高级时装周秀款、小众设计师独立品牌吊牌",
          "天然真丝服饰、贵重羊绒制品及高端配饰标签",
          "追求极致艺术美学与低调奢华格调的先锋品牌"
        ],
        "bestForJa": [
          "コレクション出展ブランド、オートクチュール、限定品",
          "シルク製品、高級ニット、こだわり派セレクトショップ",
          "アート性の高いデザインと圧倒的な差別化を図りたいブランド"
        ],
        "bestForKo": [
          "서울패션위크 런웨이 컬렉션, 독립 하이엔드 디자이너 의류",
          "실크 원피스, 최고급 캐시미어 머플러, 파인 액세서리 행택",
          "타협 없는 미학과 절제된 럭셔리를 지향하는 프리미엄 브랜드"
        ],
        "pureImage": "/images/product/mac-giaymythuat.webp",
        "pureImages": [
          "/images/product/mac-giaymythuat.webp",
          "/images/product/mac-giaymythuat2.webp",
          "/images/product/mac-giaymythuat3.webp"
        ],
      },
      // {
      //     "icon": "Tag",
      //     "name": "Couche 300, Kraft & Art Paper",
      //     "nameVi": "Giấy C300, Giấy Kraft & Giấy Mỹ Thuật",
      //     "tagline": "Rigid heavy paper stock with pre-punched string hole",
      //     "taglineVi": "Giấy dày dặn bấm sẵn lỗ xỏ dây, cán màng mờ hoặc giữ vân mộc tự nhiên",
      //     "description": [
      //         "Pre-drilled 3mm or 5mm string hole ready for tag pins or wax cords",
      //         "Smooth matte lamination protects against ink rubbing onto clothing fabrics",
      //         "Rich color fidelity for barcode and care instruction icons"
      //     ],
      //     "descriptionVi": [
      //         "Bấm sẵn lỗ xỏ dây 3mm hoặc 5mm tiện luồn dây dù gắn cúc áo",
      //         "Cán màng mờ bảo vệ chống lem mực sang vải quần áo",
      //         "Màu in chuẩn xác rõ ràng mã vạch và ký hiệu hướng dẫn giặt ủi"
      //     ],
      //     "descriptionTraits": [
      //         "thick-weight",
      //         "smooth-base",
      //         "eco-friendly"
      //     ],
      //     "bestFor": [
      //         "Clothing brands, leather bags, handmade jewelry, cosmetic gift bundles"
      //     ],
      //     "bestForVi": [
      //         "Thương hiệu thời trang, túi xách đồ da, trang sức thủ công"
      //     ],
      //     "pureImage": "/images/product/vd-item-tag.jpeg",
      //     "pureImages": [
      //         "/images/product/vd-item-tag.jpeg",
      //         "/images/product/vd-item-tag.jpeg",
      //         "/images/product/vd-item-tag.jpeg"
      //     ],
      //     "nameZh": "高克重吊牌纸 (铜版纸300g/牛皮纸/特种艺术纸)",
      //     "nameJa": "厚口下げ札用紙（コート300g・クラフト・高級アート紙）",
      //     "nameKo": "고평량 의류 행택 용지 (스노우 300g/크라프트/수입지)",
      //     "taglineZh": "预打穿绳孔、平整硬挺不刮伤衣物，条形码与洗涤图标清晰易读的服饰吊牌？",
      //     "taglineJa": "糸通し穴加工済み。衣服を傷つけず、バーコードや洗濯絵表示が鮮明に読める高品質タグですか？",
      //     "taglineKo": "끈 타공 홀 가공이 완료되어 걸기 편하고 의류에 잉크가 묻어나지 않는 고선명 행택인가요?",
      //     "descriptionZh": [
      //         "预钻3mm或5mm精密穿绳孔，可直接搭配塑料子弹头吊粒、麻绳或棉蜡绳",
      //         "双面表面覆哑光保护膜，防潮防刮花，彻底防止油墨意外摩擦蹭染浅色布料",
      //         "高解像度极细线条输出，微型条形码、防伪二维码及国际洗涤标清晰锐利"
      //     ],
      //     "descriptionJa": [
      //         "3mmまたは5mmの糸通し穴が標準でパンチ済み。ロックスループラスチックや蝋引き紐に即座に対応",
      //         "両面マットラミネート加工により、インクが衣服の生地に色移りするリスクをシャットアウト",
      //         "高精細プリントにより、小さなバーコード、QRコード、洗濯取扱い表示ピクトグラムも鮮明"
      //     ],
      //     "descriptionKo": [
      //         "3mm 또는 5mm 끈 타공 홀이 정밀 가공되어 옷핀, 스트링, 왁스 코드에 손쉽게 결착",
      //         "양면 매트 무광 코팅으로 마찰에 의한 잉크 번짐과 밝은 의류 원단 오염을 원천 차단",
      //         "초정밀 마이크로 인쇄로 소형 바코드, 정품 인증 QR코드, 세탁 관리 기호가 또렷하고 선명"
      //     ],
      //     "bestForZh": [
      //         "时尚原创设计师服装、轻奢皮具箱包、手作纯银饰品、高端美妆礼盒随赠吊牌"
      //     ],
      //     "bestForJa": [
      //         "アパレルブランド、本革バッグ、ハンドメイドジュエリー、コスメギフトセットの下げ札"
      //     ],
      //     "bestForKo": [
      //         "패션 디자이너 의류 브랜드, 수제 가죽 가방, 핸드메이드 주얼리 행택, 뷰티 기프트 태그"
      //     ]
      // }
    ]
  },
  {
    "id": "lich-tet",
    "categoryId": "tet",
    "titleVi": "Lịch Để Bàn - Calendars",
    "titleEn": "Desk Calendars",
    "titleZh": "台历桌历 - Calendars",
    "titleJa": "卓上カレンダー - Calendars",
    "titleKo": "탁상 달력 - Calendars",
    "descriptionVi": "Ấn phẩm quà tặng năm mới ý nghĩa, hiện diện 365 ngày trên bàn làm việc của đối tác và khách hàng thân thiết.",
    "descriptionEn": "Meaningful corporate New Year gifts that keep your brand visible on client desks for all 365 days.",
    "coverImage": "/images/category/lichdeban.webp",
    "shapes": [
      {
        "id": "lich-de-ban",
        "nameVi": "Lịch để bàn",
        "nameEn": "Desk Calendars",
        "nameZh": "企业定制台历",
        "nameJa": "スタンダード卓上カレンダー",
        "nameKo": "기업 맞춤 탁상 달력",
        "descriptionVi": "Quy cách lịch chữ A hoặc chữ M 13 tờ đóng gáy lò xo đôi, đế bồi simili cứng cáp đứng vững chãi trên bàn làm việc.",
        "descriptionEn": "Classic 13-sheet A-frame or M-frame desk calendar with wire-o spiral binding on rigid standing simili base.",
        "image": "/images/category/lichdebancon.webp",
        "badgeVi": "Lịch chữ A",
        "badgeEn": "A-Frame"
      },
      {
        "id": "lich-ban-2026",
        "nameVi": "Lịch để bàn 2026",
        "nameEn": "Desk Calendars 2026",
        "nameZh": "2026新春台历",
        "nameJa": "2026年 卓上カレンダー",
        "nameKo": "2026 신년 탁상 달력",
        "descriptionVi": "Bộ sưu tập 13 tờ lò xo chữ A đón xuân Bính Ngọ 2026, thiết kế phong thủy tài lộc.",
        "descriptionEn": "13-sheet wire-o bound A-frame calendar collection celebrating 2026 with joyful festive artworks.",
        "image": "/images/category/lichdeban2026.webp",
        "badgeVi": "Xuân 2026",
        "badgeEn": "New 2026"
      },
      {
        "id": "lich-nam-cham",
        "nameVi": "Lịch ảnh nam châm dẻo",
        "nameEn": "Flexible Magnetic Photo Calendars",
        "nameZh": "冰箱贴软磁日历",
        "nameJa": "マグネットフォトカレンダー",
        "nameKo": "자석 포토 캘린더",
        "descriptionVi": "Tấm lịch nam châm dẻo hít tủ lạnh hoặc bề mặt kim loại, nhỏ gọn và tiện lợi xem ngày.",
        "descriptionEn": "Flexible magnetic calendar sheet adhering to refrigerators and metal cabinets for daily viewing.",
        "image": "/images/category/lichanhnamchamdeo.webp",
        "badgeVi": "Nam châm dẻo",
        "badgeEn": "Magnetic"
      }
    ],
    "materials": [
      {
        "icon": "Feather",
        "name": "Ford 230 - 250gsm (Writable Tet Calendar)",
        "nameVi": "Lịch Để Bàn Giấy Ford (Dễ Ghi Chú)",
        "tagline": "Want a non-glossy desk calendar where your team can write reminders easily?",
        "taglineVi": "Bạn muốn lịch để bàn giấy mộc không chói sáng, tiện ghi chú lịch làm việc?",
        "description": [
          "Uncoated Ford 230-250gsm paper that absorbs pen and pencil notes instantly",
          "Soft matte surface with zero reflections under office fluorescent lighting",
          "Clean, minimalist aesthetic that looks professional on executive desks"
        ],
        "descriptionVi": [
          "Không tráng phủ, bám mực bút bi và bút chì cực tốt",
          "Bề mặt nhám mịn không phản quang, bảo vệ mắt dưới ánh đèn văn phòng",
          "Phong cách tối giản, chuẩn mực, phù hợp không gian làm việc hiện đại"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Project managers, accountants, and executives who take daily notes",
          "Academic institutions, law offices, and consulting firms",
          "Companies desiring a practical, non-glossy desktop organizer"
        ],
        "bestForVi": [
          "Quản lý dự án, kế toán và lãnh đạo thường xuyên ghi chú lịch công tác",
          "Trường học, văn phòng luật sư và các tổ chức tư vấn chuyên nghiệp",
          "Doanh nghiệp ưu tiên trải nghiệm tiện dụng, không bóng chói"
        ],
        "nameZh": "道林纸新春台历（日常行程随心记录）",
        "nameJa": "上質紙新春卓上カレンダー（予定記入型）",
        "nameKo": "모조지 새해 탁상 달력 (스케줄 메모형)",
        "taglineZh": "日历格清晰宽敞，方便随手拿笔记录会议与备忘事项？",
        "taglineJa": "スケジュールを直接ペンで書き込みやすい、機能的なカレンダーですか？",
        "taglineKo": "회의 일정과 중요 메모를 볼펜으로 번짐 없이 기록할 수 있는 캘린더인가요?",
        "descriptionZh": [
          "内页采用230-250gsm优质厚道林纸，吸墨快，纸面无反光",
          "日期格子间距宽绰，方便使用圆珠笔或水笔书写会议备忘",
          "翻页顺滑不透墨，满足商务日程规划与日常备忘功能"
        ],
        "descriptionJa": [
          "本文に230〜250gsmの上質紙を採用、目に優しい無光沢の紙面",
          "日付枠が広く、ペンでスケジュールやToDoを書き込みやすい",
          "裏抜けがなく、実用的なスケジュール管理に特化した機能派"
        ],
        "descriptionKo": [
          "230-250gsm 도톰한 모조지 내지로 조명 아래에서도 눈이 편안함",
          "날짜별 메모 공간이 넓어 볼펜으로 일정과 미팅을 적기 편리함",
          "잉크 비침 없이 부드럽게 넘어가 비즈니스 일정 관리에 최적"
        ],
        "bestForZh": [
          "项目经理、财务主管、设计师等日程密集的专业白领",
          "需要随时在桌面上随手记录待办事项的工作狂族群",
          "崇尚理性实用与健康护眼视觉的企业定制方案"
        ],
        "bestForJa": [
          "スケジュール管理が必須のマネージャー、士業、エンジニア",
          "デスクですぐにメモを取る習慣のあるビジネスパーソン",
          "機能性と実用性を最重視するオフィスカレンダー"
        ],
        "bestForKo": [
          "프로젝트 일정 관리가 많은 실무진, 전문직, 영업팀",
          "책상 위에서 상시 할 일을 메모하고 체크하는 오피스 워커",
          "실용성과 필기 편의성을 최우선으로 고려하는 기업"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/lich-giayloaif.webp",
        "pureImages": [
          "/images/product/lich-giayloaif.webp",
          "/images/product/lich-giayloaif2.webp",
          "/images/product/lich-giayloaif3.webp"
        ]
      },
      {
        "icon": "Palette",
        "name": "Luxury Art Paper Calendar",
        "nameVi": "Lịch Giấy Mỹ Thuật Cao Cấp",
        "tagline": "Want a bespoke artisan calendar that feels like an art gallery piece?",
        "taglineVi": "Bạn muốn lịch để bàn mang đậm xúc giác nghệ thuật sang trọng như một bộ sưu tập?",
        "description": [
          "Printed on European textured art paper with subtle tactile grain",
          "Warm, muted ink absorption conveying artisan craftsmanship and exclusivity",
          "Combined with custom wooden or rigid hardboard stands"
        ],
        "descriptionVi": [
          "In trên giấy mỹ thuật châu Âu có vân nhám đặc trưng, sang trọng khi chạm",
          "Màu mực thấm tự nhiên tạo sắc thái trầm ấm, tinh tế và độc bản",
          "Kết hợp hài hòa với đế lịch bằng gỗ tự nhiên hoặc bìa cứng bồi thủ công"
        ],
        "descriptionTraits": [
          "textured-art",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "VIP client gifting, luxury real estate, and private banking wealth management",
          "Art galleries, museums, and high-end design agencies",
          "Commemorative corporate anniversary editions"
        ],
        "bestForVi": [
          "Quà tặng tri ân khách hàng VIP, bất động sản hạng sang, ngân hàng riêng",
          "Gallery nghệ thuật, bảo tàng và các studio thiết kế danh tiếng",
          "Ấn phẩm kỷ niệm thành lập doanh nghiệp phiên bản giới hạn"
        ],
        "nameZh": "高端进口特种纸艺术年历",
        "nameJa": "高級特殊アート紙カレンダー",
        "nameKo": "고급 수입 예술지 프리미엄 달력",
        "taglineZh": "作为高端VIP年终答谢礼品，追求极尽奢华的艺术品格调？",
        "taglineJa": "VIP顧客への年末ギフトにふさわしい、美術品のようなカレンダーですか？",
        "taglineKo": "VIP 고객을 위한 연말 최고급 선물로 예술 작품 같은 달력을 찾으시나요?",
        "descriptionZh": [
          "全套选用进口特种粗纹艺术纸，自带尊贵棉绒纸张触感",
          "吸墨厚重深邃，摄影与艺术作品如同油画原作般极具质感",
          "配以高规格礼品纸盒独立封装，拆箱仪式感十足"
        ],
        "descriptionJa": [
          "全面にヨーロッパ輸入の最高級テクスチャ紙を使用、贅沢な手触り",
          "深い奥行きのある発色で、写真やアートを美術品のように再現",
          "専用の高級化粧箱に個装され、贈呈時の圧倒的なプレミアム感"
        ],
        "descriptionKo": [
          "전 페이지 유럽산 최고급 텍스처 수입지를 사용하여 극상의 촉감 선사",
          "깊이감 있는 발색으로 사진과 미술 작품을 갤러리 원화 수준으로 재현",
          "맞춤형 전용 선물 박스에 1:1 개별 포장되어 최고의 언박싱 경험 제공"
        ],
        "bestForZh": [
          "私人银行财富中心、高端汽车俱乐部、超五星酒店行政礼遇",
          "当代画廊、知名摄影大师作品的限量联名定制款",
          "送给战略级核心合作伙伴与领袖人物的尊享元旦心意"
        ],
        "bestForJa": [
          "プライベートバンク、高級車オーナーズクラブ、外資系ホテル",
          "ギャラリーのアート作品集や著名写真家とのコラボレーション",
          "最重要顧客（VIP）や経営陣へ贈る特別なマスターピース"
        ],
        "bestForKo": [
          "프라이빗 뱅킹(PB) VIP 고객, 슈퍼카 오너스 클럽, 특급 호텔",
          "갤러리 소장 작품전 및 유명 사진작가의 한정판 아트 콜라보 달력",
          "최상위 핵심 VIP 파트너와 의사결정권자를 위한 특별한 헌정 기프트"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/lich-giaymythuat.webp",
        "pureImages": [
          "/images/product/lich-giaymythuat.webp",
          "/images/product/lich-giaymythuat2.webp",
          "/images/product/lich-giaymythuat3.webp"
        ]
      },
      {
          "icon": "Calendar",
          "name": "Couche 250gsm & Rigid Simili Base",
          "nameVi": "Giấy Couche 250gsm & Đế Bồi Simili / Linen",
          "tagline": "Vivid 13-sheet full-color printing with sturdy stand-up cardboard frame",
          "taglineVi": "In 13 tờ 2 mặt màu sắc rực rỡ, đế bồi simili cứng cáp đứng vững vàng trên bàn",
          "description": [
              "250gsm heavyweight coated sheets with smooth page turning",
              "Double-wire metal spiral binding in gold, silver, or classic black",
              "Rigid 2mm cardboard stand wrapped in luxury linen or buckram simili"
          ],
          "descriptionVi": [
              "Giấy ruột C250 dày dặn lật mở êm ái, màu in sắc sảo cả 13 tờ",
              "Lò xo xoắn kép kim loại vàng ánh kim, bạc hoặc đen trang nhã",
              "Khung đế carton dày 2mm bồi simili hoặc vải linen đứng vững chãi"
          ],
          "descriptionTraits": [
              "thick-weight",
              "smooth-base",
              "foil-accent"
          ],
          "bestFor": [
              "Corporate New Year VIP gifts, bank client appreciation, office staff desks"
          ],
          "bestForVi": [
              "Quà tặng Tết tri ân đối tác ngân hàng, doanh nghiệp, nhân viên công ty"
          ],
          "pureImage": "/images/product/lich-giayloaic.webp",
          "pureImages": [
              "/images/product/lich-giayloaic.webp",
              "/images/product/lich-giayloaic2.webp",
              "/images/product/lich-giayloaic3.webp"
          ],
          "nameZh": "铜版纸250g内页 & 人造革/亚麻硬板台历架",
          "nameJa": "コート紙250g＆高級レザー調・リネン貼合台紙（卓上カレンダー）",
          "nameKo": "스노우지 250g 내지 & 삼각대 하드보드 레자/린넨 합지 (탁상달력)",
          "taglineZh": "13张双面全彩微喷内页、搭配2mm厚实皮革/亚麻硬质三角底座的稳重商务桌历？",
          "taglineJa": "13枚両面フルカラーの滑らかなめくり心地と、デスクに重厚に自立する三角台紙カレンダーですか？",
          "taglineKo": "13장 양면 풀컬러의 부드러운 넘김과 책상 위에 묵직하게 자립하는 고급 레자 삼각대 탁상달력인가요?",
          "descriptionZh": [
              "内页采用250克厚实高白铜版纸，翻页顺畅不卷边，全彩印刷13张双面画面通透",
              "金属双线圈装订，提供璀璨亮金、优雅银白或沉稳经典曜黑三种高档配色",
              "2mm硬质灰板外裹高级人造革(Simili)或典雅亚麻布纹(Linen)，稳立办公桌面不易倾倒"
          ],
          "descriptionJa": [
              "本文は250gの厚口コート紙を採用し、めくりやすく13枚両面すべてが発色豊かで鮮やか",
              "ダブルループ金属リング製本で、ゴールド・シルバー・マットブラックの3色から選択可能",
              "2mm厚の硬質芯材に高級リネン風クロスまたは合皮(Simili)を貼り込み、デスク上で安定自立"
          ],
          "descriptionKo": [
              "내지는 250g 고급 스노우지를 사용하여 넘김이 부드럽고 13장 양면 모두 맑고 선명한 인쇄 품질",
              "골드, 실버, 클래식 블랙의 견고한 메탈 더블 트윈와이어 링 제본으로 360도 완벽 펼침",
              "2mm 단단한 하드보드에 고급 레자(Simili) 또는 패브릭 린넨(Linen) 원단을 합지하여 흔들림 없는 안정성"
          ],
          "bestForZh": [
              "银行金融VIP客户新年谢礼、企业年终回馈合作伙伴、员工办公工位常备日历"
          ],
          "bestForJa": [
              "銀行・金融機関のVIP顧客向け新春ギフト、企業の年間感謝品、社内デスク用カレンダー"
          ],
          "bestForKo": [
              "금융권 및 대기업 VIP 신년 답례품, 비즈니스 파트너 감사 선물, 사무실 데스크용 프리미엄 달력"
          ]
      }
    ]
  },
  {
    "id": "bao-li-xi",
    "categoryId": "tet",
    "titleVi": "Bao Lì Xì",
    "titleEn": "Red Envelopes - Lucky Money",
    "titleZh": "新年红包 - Red Envelopes",
    "titleJa": "お年玉袋・ポチ袋",
    "titleKo": "새해 복돈 봉투",
    "descriptionVi": "Ấn phẩm may mắn đầu năm mới trao gửi tài lộc, bình an và dấu ấn thương hiệu gắn kết cùng khách hàng.",
    "descriptionEn": "Traditional Lunar New Year lucky money packets sharing blessings, prosperity, and brand recognition.",
    "coverImage": "/images/category/baolixi.webp",
    "shapes": [
      {
        "id": "bao-li-xi-chuan",
        "nameVi": "Bao Lì Xì",
        "nameEn": "Standard Red Envelopes",
        "nameZh": "标准全开式红包",
        "nameJa": "標準お年玉袋",
        "nameKo": "표준 새해 복돈 봉투",
        "descriptionVi": "Kích thước chuẩn 8 x 16 cm để thẳng tờ tiền polymer may mắn không cần gấp, nắp gài thanh lịch.",
        "descriptionEn": "Standard 8 x 16 cm size fitting polymer banknotes flat without folding, with easy tuck-in tab closure.",
        "image": "/images/category/baolixi.webp",
        "badgeVi": "Chuẩn 8x16",
        "badgeEn": "Standard"
      },
      {
        "id": "bao-li-xi-2026",
        "nameVi": "Bao lì xì 2026",
        "nameEn": "Year of the Horse 2026 Packets",
        "nameZh": "2026生肖贺岁红包",
        "nameJa": "2026年干支ポチ袋",
        "nameKo": "2026 신년 캐릭터 봉투",
        "descriptionVi": "Bộ sưu tập mẫu thiết kế chủ đề xuân Bính Ngọ 2026 độc quyền, họa tiết vui tươi, ấn tượng.",
        "descriptionEn": "Exclusive 2026 zodiac Lunar New Year artistic design collection with lively joyful festival artwork.",
        "image": "/images/category/baolixi2026.webp",
        "badgeVi": "Xuân 2026",
        "badgeEn": "New 2026"
      },
      {
        "id": "bao-li-xi-ep-kim",
        "nameVi": "Bao lì xì ép kim cao cấp",
        "nameEn": "Foil Stamped Luxury Packets",
        "nameZh": "烫金高档贺岁红包",
        "nameJa": "高級金箔押しお年玉袋",
        "nameKo": "프리미엄 금박 복돈 봉투",
        "descriptionVi": "Gia công ép kim vàng 3D lấp lánh câu chúc may mắn trên nền giấy đỏ nhung hoặc giấy mỹ thuật.",
        "descriptionEn": "Radiant 3D metallic gold foil stamping on premium red velvet or artistic paper, reflecting prestige.",
        "image": "/images/category/baolixiepkimcaocap.webp",
        "badgeVi": "Ép kim nhũ",
        "badgeEn": "Gold Foil"
      }
    ],
    "materials": [
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "tagline": "Need vibrant red lucky envelopes with protective lamination for corporate gifting?",
        "taglineVi": "Bạn cần bao lì xì đỏ rực rỡ, cán màng chống trầy cho quà tặng Tết doanh nghiệp?",
        "description": [
          "Smooth C150 coated paper with protective matte lamination for elegance",
          "Vibrant Lunar New Year red and gold CMYK full-bleed reproduction",
          "Standard 8x16cm size fitting Vietnamese banknotes straight without folding"
        ],
        "descriptionVi": [
          "Láng mịn, cán màng mờ bảo vệ chống trầy xước, sang trọng",
          "In màu CMYK rực rỡ sắc đỏ và vàng mang không khí may mắn ngày Tết",
          "Kích thước chuẩn 8x16cm, vừa vặn tờ tiền Việt Nam thẳng phẳng không gập"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Corporate Tet giveaways for clients, employees, and partners",
          "Bank, insurance, and real estate customer appreciation sets",
          "Retail promotional gifts during the Lunar New Year shopping season"
        ],
        "bestForVi": [
          "Quà tặng tri ân dịp Tết dành cho đối tác, khách hàng và nhân viên",
          "Bộ quà tặng tri ân của các ngân hàng, bảo hiểm và bất động sản",
          "Quà tặng khuyến mãi dịp mua sắm sắm Tết cho cửa hàng bán lẻ"
        ],
        "nameZh": "铜版纸 150gsm 覆膜（经典喜庆利是封）",
        "nameJa": "コート紙 150gsm PP加工（定番お年玉袋）",
        "nameKo": "스노우지 150gsm 코팅 (표준 세뱃돈 봉투)",
        "taglineZh": "红火喜庆、色彩鲜亮且耐磨不褪色的经典春节红包？",
        "taglineJa": "色鮮やかで破れにくい、おめでたい定番の新年ポチ袋ですか？",
        "taglineKo": "선명하고 화려한 컬러에 구김 없는 표준 새해 세뱃돈 봉투인가요?",
        "descriptionZh": [
          "150gsm优质加厚铜版纸，表面覆哑膜或亮膜提供保护",
          "满版正红四色高清印刷，色彩饱满喜庆，耐磨不掉色",
          "标准通用红包尺寸，可平整放入百元大钞不折角"
        ],
        "descriptionJa": [
          "150gsmの厚手コート紙にPP加工を施し、擦れや色落ちを防止",
          "鮮やかな赤色をフルカラーで美しく再現、華やかなお正月感",
          "お札を折らずにスッキリ入れられる標準サイズ（大サイズ対応）"
        ],
        "descriptionKo": [
          "150gsm 도톰한 스노우지에 코팅을 입혀 구김과 모서리 헤짐 방지",
          "화사하고 선명한 전통 홍색 풀컬러 인쇄로 설 명절의 기쁨 전달",
          "지폐를 접지 않고 빳빳하게 그대로 넣을 수 있는 표준 세뱃돈 봉투 규격"
        ],
        "bestForZh": [
          "企业春节走访拜年伴手礼、员工新年开工利是红包",
          "商场超市新年满额促销赠送给顾客的喜庆红包",
          "大批量订制、兼顾喜庆视觉与预算控制的企业首选"
        ],
        "bestForJa": [
          "企業の仕事始め（初出）で社員に配るお年玉袋",
          "店舗の初売り・新春キャンペーンでの来客プレゼント",
          "コストを抑えつつ華やかに大量配布したい企業ノベルティ"
        ],
        "bestForKo": [
          "기업 신년 시무식 세뱃돈 봉투, 임직원 설날 귀향 보너스 봉투",
          "신년 맞이 매장 방문 고객 사은품 증정용 복주머니 봉투",
          "합리적인 예산으로 대량 제작하여 널리 배포하는 기업 표준 홍보물"
        ],
        "pureImage": "/images/product/lixi-giayloaic.webp",
        "pureImages": [
          "/images/product/lixi-giayloaic.webp",
          "/images/product/lixi-giayloaic2.webp",
          "/images/product/lixi-giayloaic3.webp"
        ],
      },
      {
        "icon": "Feather",
        "name": "Type F Paper",
        "nameVi": "Giấy loại F",
        "tagline": "Want a traditional uncoated red envelope where you can write New Year wishes?",
        "taglineVi": "Bạn muốn bao lì xì giấy mộc cổ truyền, dễ dàng viết lời chúc Tết lên phong bao?",
        "description": [
          "Natural matte uncoated Ford paper with authentic traditional warmth",
          "Zero lamination glare, creating a nostalgic, artisanal holiday aesthetic",
          "Allows handwritten New Year blessings and calligraphy pen signatures"
        ],
        "descriptionVi": [
          "Nhám mịn tự nhiên, mang lại cảm giác truyền thống ấm áp",
          "Hoàn toàn không bóng chói, tạo thẩm mỹ thủ công, hoài niệm ngày Tết",
          "Dễ dàng dùng bút thư pháp hoặc bút mực viết lời chúc may mắn lên phong bao"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Traditional cultural brands, tea houses, and Vietnamese heritage gifts",
          "Schools, universities, and cultural organizations celebrating Tet",
          "Minimalist holiday designs pairing red paper with gold calligraphy"
        ],
        "bestForVi": [
          "Thương hiệu văn hóa truyền thống, tiệm trà và quà tặng đậm chất Việt",
          "Trường học, đại học và các tổ chức văn hóa mừng xuân mới",
          "Thiết kế tối giản kết hợp nền giấy đỏ mộc và chữ thư pháp vàng"
        ],
        "nameZh": "道林纸 120-150gsm（传统质朴新年红包）",
        "nameJa": "上質紙 120-150gsm（和風素朴ポチ袋）",
        "nameKo": "모조지 120-150gsm (전통 감성 세뱃돈 봉투)",
        "taglineZh": "追求纸面古朴自然触感，可亲手写下吉祥祝福赠语？",
        "taglineJa": "手書きで新年のメッセージを書き添えられる、温もりあるポチ袋ですか？",
        "taglineKo": "손수 새해 덕담을 적어 건넬 수 있는 차분하고 따뜻한 종이 봉투인가요?",
        "descriptionZh": [
          "120-150gsm优质道林纸，纸面微糙无涂层反光",
          "保留传统纸张的自然质朴，适合亲笔书写新年寄语与落款",
          "红金色泽沉稳温润，透出浓浓书香门第的雅致年味"
        ],
        "descriptionJa": [
          "120〜150gsmの上質紙を使用、手触りが良く光沢を抑えた仕上がり",
          "毛筆や万年筆で新年の温かいメッセージを手書き可能",
          "落ち着いた深みのある赤と金が醸し出す、上品な和の趣"
        ],
        "descriptionKo": [
          "120-150gsm 모조지로 번들거림 없는 자연스럽고 차분한 질감",
          "만년필이나 붓펜으로 정성 어린 새해 덕담을 직접 적기에 최적",
          "자극적이지 않고 은은하게 감도는 전통 한지 감성의 설맞이 봉투"
        ],
        "bestForZh": [
          "长辈给晚辈亲笔书写家训赠言的温情新年红包",
          "书画协会、传统茶道社团与文化机构专属利是封",
          "注重传统礼仪规制、追求温情走心的文化企业定制"
        ],
        "bestForJa": [
          "祖父母から孫へ、手書きの一言を添えて渡すお年玉袋",
          "書道教室、茶道・華道教室、伝統文化関連の記念品",
          "形式的なものより心のこもった温もりを伝えたい贈り物"
        ],
        "bestForKo": [
          "부모님이 자녀나 손주에게 따뜻한 덕담을 손수 적어 건네는 봉투",
          "서예 학원, 전통 다도 모임, 문화 예술 단체 신년 봉투",
          "진심 어린 손글씨와 전통적인 예의를 갖추고자 하는 품격 있는 선물"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/lixi-giayloaif.webp",
        "pureImages": [
          "/images/product/lixi-giayloaif.webp",
          "/images/product/lixi-giayloaif2.webp",
          "/images/product/lixi-giayloaif3.webp"
        ]
      },
      {
        "icon": "Palette",
        "name": "Luxury Red Textured Art Paper",
        "nameVi": "Giấy Mỹ Thuật Đỏ Vân Nhám Sang Trọng",
        "tagline": "Want a bespoke European textured art paper red envelope that conveys prestige?",
        "taglineVi": "Bạn muốn bao lì xì trên giấy mỹ thuật đỏ có vân nhám châu Âu khác biệt khi chạm?",
        "description": [
          "Crafted from premium dyed-red European textured art paper",
          "Rich tactile surface grain exuding executive exclusivity and respect",
          "Pairs immaculately with metallic gold foil stamping and blind debossing"
        ],
        "descriptionVi": [
          "Chế tác từ giấy mỹ thuật châu Âu nhuộm đỏ nguyên bản từ xơ giấy",
          "Vân nhám đặc trưng sang trọng, thể hiện sự trân quý và uy tín của chủ nhân",
          "Kết hợp hoàn hảo với gia công ép kim nhũ vàng 24K và dập chìm họa tiết"
        ],
        "descriptionTraits": [
          "textured-art",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "C-suite executive gifting for VIP partners and major investors",
          "Luxury hotels, private banking wealth management, and high-end fashion",
          "Exclusive limited-edition Tet gift sets for discerning clients"
        ],
        "bestForVi": [
          "Quà tặng Tết đẳng cấp của lãnh đạo C-suite gửi đối tác và nhà đầu tư lớn",
          "Khách sạn 5 sao, dịch vụ ngân hàng VIP và thương hiệu thời trang xa xỉ",
          "Bộ lì xì phiên bản giới hạn dành riêng cho khách hàng VIP"
        ],
        "nameZh": "大红纹理特种艺术纸尊贵利是封",
        "nameJa": "最高級紅特殊紙ポチ袋（テクスチャ入り）",
        "nameKo": "붉은색 프리미엄 질감지 설맞이 봉투",
        "taglineZh": "大红通体透染，细腻纸纹透露出浓厚的节日庄重典雅？",
        "taglineJa": "深紅の風合い紙が醸し出す、格調高く上品なお年玉袋ですか？",
        "taglineKo": "깊이 있는 진홍빛 종이 결에서 품격이 묻어나는 VIP 설맞이 봉투인가요?",
        "descriptionZh": [
          "全通透深红特种艺术粗纹纸，自带高贵纸肌纹理",
          "吸墨深邃，烫金工艺在暗红纹理纸上呈现极高对比度",
          "质地厚实硬挺，拿在手中极具分量感与高贵气质"
        ],
        "descriptionJa": [
          "芯まで深紅に染められた超高級特殊紙、格調高い手触り",
          "深い赤のテクスチャの上に、金箔が鮮烈なコントラストで輝く",
          "しっかりとした厚みがあり、手に持った瞬間に伝わる確かな重厚感"
        ],
        "descriptionKo": [
          "속까지 붉게 물들인 최고급 레드 수입 질감지의 독보적인 촉감",
          "깊은 버건디 레드 바탕 위로 황금빛 금박이 극적인 대비감 연출",
          "도톰하고 빳빳하여 손에 쥐었을 때 전해지는 묵직한 프리미엄 감도"
        ],
        "bestForZh": [
          "企业董事长、集团高管新年致赠重要客户的至尊红包",
          "私人银行、高端会所与奢侈品牌VIP迎春贺岁私享礼",
          "重大商业签约或大额新年喜金包装专属"
        ],
        "bestForJa": [
          "経営陣が最重要パートナーへ手渡すプレミアム迎春ポチ袋",
          "プライベートバンク、外資系ラグジュアリーブランドのVIPギフト",
          "特別な慶事や大口の報奨金を入れる格式ある祝儀袋"
        ],
        "bestForKo": [
          "그룹사 대표이사가 핵심 귀빈에게 전하는 최고급 세뱃돈 봉투",
          "프라이빗 뱅킹(PB), 명품 부티크 VIP 고객 신년 사은 봉투",
          "임원진 특별 신년 격려금 및 중요 비즈니스 축하금 봉투"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/lixi-giaymythuat.webp",
        "pureImages": [
          "/images/product/lixi-giaymythuat.webp",
          "/images/product/lixi-giaymythuat2.webp",
          "/images/product/lixi-giaymythuat3.webp"
        ]
      },
      {
        "icon": "Leaf",
        "name": "Kraft 150gsm (Vintage & Eco Red Envelope)",
        "nameVi": "Kraft 150gsm (Lì Xì Cổ Điển & Thân Thiện)",
        "tagline": "Want a rustic, eco-friendly envelope with a vintage aesthetic?",
        "taglineVi": "Bạn muốn bao lì xì mang phong cách mộc mạc, hoài cổ và thân thiện môi trường?",
        "description": [
          "100% recycled brown Kraft paper with a distinct vintage, organic texture",
          "Excellent for single-color (black/red) printing or minimalist retro designs",
          "Stands out from standard glossy envelopes with a unique tactile feel"
        ],
        "descriptionVi": [
          "Màu nâu tái chế 100% mang lại kết cấu mộc mạc, tự nhiên và hoài cổ",
          "Phù hợp nhất với thiết kế tối giản, in typo hoặc họa tiết retro đơn sắc",
          "Tạo sự khác biệt hoàn toàn so với bao lì xì đỏ bóng bẩy thông thường"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Organic food brands, vegan restaurants, and eco-friendly campaigns",
          "Vintage clothing boutiques and artisan craft workshops",
          "Brands promoting sustainability during the Lunar New Year"
        ],
        "bestForVi": [
          "Thương hiệu thực phẩm sạch, thuần chay và chiến dịch sống xanh",
          "Shop thời trang vintage, tiệm cafe và xưởng thủ công mỹ nghệ",
          "Doanh nghiệp muốn truyền tải thông điệp bảo vệ môi trường dịp năm mới"
        ],
        "nameZh": "复古环保牛皮纸新春利是封",
        "nameJa": "クラフト紙レトロポチ袋（エコ仕様）",
        "nameKo": "친환경 빈티지 크라프트 세뱃돈 봉투",
        "taglineZh": "原色牛皮纸与红金图腾碰撞，诠释新潮复古中国年？",
        "taglineJa": "クラフトの素朴さと金箔の対比がモダンなエコポチ袋ですか？",
        "taglineKo": "크라프트지의 아날로그 감성과 금빛 문양이 조화를 이룬 빈티지 봉투인가요?",
        "descriptionZh": [
          "纯天然无漂白原色牛皮纸，天然长木浆纤维粗粝古朴",
          "复古牛皮底色与大红烫金碰撞出新潮国潮复古风",
          "践行绿色零塑料环保理念，可100%自然降解"
        ],
        "descriptionJa": [
          "無漂白の未晒クラフト紙を使用、素朴で温かみのあるクラシック調",
          "クラフトの茶色と華やかな金箔・朱色が織りなすレトロモダンな魅力",
          "プラスチックフリーで環境に優しく、持続可能な新年のご挨拶"
        ],
        "descriptionKo": [
          "무표백 천연 브라운 크라프트지로 연출하는 뉴트로 감성의 세뱃돈 봉투",
          "크라프트지의 빈티지한 브라운과 화려한 골드박이 만나 힙한 조화",
          "비닐 코팅 없는 100% 친환경 종이 재질로 환경까지 생각한 신년 선물"
        ],
        "bestForZh": [
          "年轻人喜爱的国潮文创品牌、潮流手作小店迎春周边",
          "追求个性复古、崇尚自然环保理念的创意设计机构",
          "新春特色咖啡馆、烘焙工坊随单附赠的新年小惊喜"
        ],
        "bestForJa": [
          "レトロモダンを愛する若者向けアパレルや雑貨ブランド",
          "環境意識の高いクリエイティブエージェンシー、エコショップ",
          "カフェやベーカリーのお正月限定オリジナルグッズ"
        ],
        "bestForKo": [
          "MZ세대를 겨냥한 뉴트로 감성 브랜드, 디자인 문구 샵",
          "친환경 가치를 실천하는 소셜 벤처 및 크리에이티브 스튜디오",
          "트렌디한 카페 및 베이커리 매장의 설 명절 스페셜 굿즈"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/lixi-giaykraft.webp",
        "pureImages": [
          "/images/product/lixi-giaykraft.webp",
          "/images/product/lixi-giaykraft2.webp",
          "/images/product/lixi-giaykraft3.webp"
        ]
      },
    ]
  },
  {
    "id": "thiep-tet",
    "categoryId": "tet",
    "titleVi": "Thiệp Mời - Invitation Cards",
    "titleEn": "Invitation Cards",
    "titleZh": "邀请函请柬 - Invitation Cards",
    "titleJa": "招待状 - Invitation Cards",
    "titleKo": "초대장 - Invitation Cards",
    "descriptionVi": "Thiệp chúc Tết và thiệp mời tiệc Tất niên gala dinner gửi trao tình cảm tri ân trân quý đến nhân viên và đối tác.",
    "descriptionEn": "Corporate Lunar New Year greeting cards and year-end gala dinner invitations expressing gratitude.",
    "coverImage": "/images/category/thiepmoi.webp",
    "shapes": [
      {
        "id": "thiep-su-kien",
        "nameVi": "Thiệp sự kiện",
        "nameEn": "Event & Gala Invitations",
        "nameZh": "企业年会晚宴请柬",
        "nameJa": "イベント・パーティー招待状",
        "nameKo": "행사 및 송년회 초대장",
        "descriptionVi": "Thiệp mời tiệc tất niên Year End Party sang trọng, ép kim nhũ vàng câu chúc tân xuân.",
        "descriptionEn": "Year End Party gala invitation cards with gold foil borders and matching red envelopes.",
        "image": "/images/category/thiepsukien.webp",
        "badgeVi": "Year End Party",
        "badgeEn": "Gala Dinner"
      }
    ],
    "materials": [
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "tagline": "Need a crisp, rigid New Year greeting card with vibrant festive artwork?",
        "taglineVi": "Bạn cần thiệp chúc Tết cứng cáp, màu sắc sắc nét cho khách hàng và đối tác?",
        "description": [
          "Heavyweight C300 coated board with protective matte or glossy lamination",
          "Vibrant CMYK reproduction of spring blossoms, fireworks, and calligraphy",
          "Standard folded A5 or long greeting format with matching envelopes"
        ],
        "descriptionVi": [
          "Dày dặn được cán màng mờ hoặc bóng bảo vệ sang trọng",
          "In màu CMYK rực rỡ hình ảnh hoa xuân, pháo hoa và lời chúc năm mới",
          "Quy cách thiệp gấp A5 hoặc thiệp dài chuẩn mực kèm bao thư đồng bộ"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Corporate New Year greetings for clients, suppliers, and staff",
          "Bank and insurance client appreciation holiday cards",
          "Retail loyalty program holiday thank-you mailers"
        ],
        "bestForVi": [
          "Thiệp chúc Tết doanh nghiệp gửi đối tác, nhà cung cấp và nhân viên",
          "Thiệp chúc mừng xuân mới của các ngân hàng, công ty bảo hiểm",
          "Thư ngỏ tri ân khách hàng thân thiết dịp cuối năm"
        ],
        "nameZh": "铜版纸 300gsm 覆膜新春贺年卡",
        "nameJa": "コート紙 300gsm PP加工年賀カード",
        "nameKo": "스노우지 300gsm 코팅 새해 연하장",
        "taglineZh": "企业大批量寄送客户与合作伙伴的新春祝贺卡？",
        "taglineJa": "取引先や顧客へ一斉に送る、定番のカラー年賀カードですか？",
        "taglineKo": "거래처와 고객들에게 단체로 감사의 뜻을 전할 표준 새해 연하장인가요?",
        "descriptionZh": [
          "300gsm优质平滑铜版纸，双面覆哑光膜手感细腻顺滑",
          "四色全彩鲜亮印刷，新春红金色调饱和喜庆，耐磨不褪色",
          "通用折叠或单张明信片样式，配以大红烫金信封"
        ],
        "descriptionJa": [
          "300gsmの厚手コート紙に両面マットPP加工で上品な手触り",
          "鮮やかなフルカラー印刷でおめでたい新春の色彩を再現",
          "定番の2つ折りまたはポストカード型、専用の赤封筒付き"
        ],
        "descriptionKo": [
          "300gsm 도톰한 스노우지에 양면 무광 코팅으로 부드러운 그립감",
          "설 명절의 화려한 전통 색채를 선명한 풀컬러로 재현",
          "표준 2단 접지 또는 엽서형 스타일로 전용 레드 봉투 세트 포함"
        ],
        "bestForZh": [
          "企业春节面向全体客户、合作伙伴批量寄送的新春贺卡",
          "商场会员新年积分兑换专属新年祝福明信片",
          "高性价比、大批量定制发信的主力迎春贺卡"
        ],
        "bestForJa": [
          "取引先や顧客へ一斉に送る定番の新春グリーティングカード",
          "店舗会員への年始のご挨拶、感謝のメッセージカード",
          "コストを抑えて大量に郵送したい企業の年賀状"
        ],
        "bestForKo": [
          "기업이 모든 고객과 협력사에 단체로 발송하는 신년 연하장",
          "멤버십 회원 대상 설맞이 감사 인사 엽서",
          "합리적인 제작비로 대량 우편 발송이 가능한 표준 새해 카드"
        ],
        "pureImage": "/images/product/thiep-giayloaic.webp",
        "pureImages": [
          "/images/product/thiep-giayloaic.webp",
          "/images/product/thiep-giayloaic2.webp",
          "/images/product/thiep-giayloaic3.webp"
        ],
      },
      {
        "icon": "Feather",
        "name": "Type F Paper",
        "nameVi": "Giấy loại F",
        "tagline": "Want an uncoated holiday card where executives can pen handwritten messages?",
        "taglineVi": "Bạn muốn thiệp Tết giấy mộc để lãnh đạo viết tay lời chúc riêng tới đối tác?",
        "description": [
          "Natural matte uncoated Ford 300gsm board with warm tactile texture",
          "Absorbs fountain pens, calligraphic ink, and signatures without bleeding",
          "Conveys a heartfelt, personal corporate touch that glossy cards cannot match"
        ],
        "descriptionVi": [
          "Nhám mịn tự nhiên, mang lại cảm giác mộc mạc và chân thành",
          "Bám mực bút máy, bút thư pháp và bút ký lãnh đạo mượt mà không bị nhòe",
          "Thể hiện sự trân quý cá nhân hóa sâu sắc gửi đến từng đối tác quan trọng"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "CEO and C-suite handwritten New Year greetings to key partners",
          "Educational, cultural, and diplomatic New Year correspondence",
          "Minimalist holiday cards prioritizing authentic warmth and simplicity"
        ],
        "bestForVi": [
          "Lãnh đạo CEO viết tay lời chúc mừng năm mới gửi đối tác chiến lược",
          "Thiệp chúc Tết của các cơ quan ngoại giao, giáo dục và tổ chức văn hóa",
          "Thiệp Tết tối giản chú trọng sự tinh tế, ấm áp và chân thật"
        ],
        "nameZh": "道林纸 300gsm（手写温情新春贺卡）",
        "nameJa": "上質紙 300gsm 手書き年賀状（筆記良好）",
        "nameKo": "모조지 300gsm 자필 축하용 새해 카드",
        "taglineZh": "领导或员工需要手写一段充满温情的新年祝福话语？",
        "taglineJa": "万年筆や毛筆で、手書きのメッセージを添えたい温もりある賀状ですか？",
        "taglineKo": "대표이사나 임직원이 직접 자필 메시지를 정성스레 적을 연하장인가요?",
        "descriptionZh": [
          "300gsm无涂层纯白道林厚纸，保留自然纸面的微糙质朴",
          "吸墨渗透快不透背，钢笔水笔书写流畅，字迹苍劲有力",
          "适合领导层亲笔题写新年贺词与落款，情真意切"
        ],
        "descriptionJa": [
          "300gsmの上質紙を使用、手書き文字が引き立つマットな紙面",
          "万年筆や筆ペンでも滲まず、サラサラと滑らかな書き心地",
          "代表者からの直筆メッセージを添える温もりある年賀状"
        ],
        "descriptionKo": [
          "300gsm 비코팅 모조지로 자연스러운 종이 결이 그대로 살아있음",
          "만년필이나 붓펜으로 작성해도 뒷면 비침 없이 먹이 깊게 스며듦",
          "대표이사나 임직원이 직접 자필 덕담을 정성스레 적기에 최적"
        ],
        "bestForZh": [
          "公司董事长、总经理亲自手写签名致赠核心战略贵宾",
          "文教机构、艺术社团向专家导师呈递的谦逊拜年贴",
          "崇尚真挚文字交流、强调手写温度的走心新春祝福"
        ],
        "bestForJa": [
          "経営トップから特別な恩師・取引先トップへの直筆年賀状",
          "教育機関、学会、文化団体からの新春のご挨拶便り",
          "印刷文字だけでなく手書きの温もりを届けたい特別な贈り物"
        ],
        "bestForKo": [
          "대표이사가 핵심 VIP 파트너에게 손수 서명하여 전달하는 연하장",
          "학계, 문화예술계 은사님과 자문위원에게 올리는 신년 문안 카드",
          "기계적인 인쇄를 넘어 손글씨의 진정성을 전하고자 하는 카드"
        ],
        "pureImage": "/images/product/thiep-giayloaif.webp",
        "pureImages": [
          "/images/product/thiep-giayloaif.webp",
          "/images/product/thiep-giayloaif2.webp",
          "/images/product/thiep-giayloaif3.webp"
        ],
      },
      {
        "icon": "Palette",
        "name": "Luxury Textured Art Paper Greeting Card",
        "nameVi": "Giấy Mỹ Thuật Vân Nhám Sang Trọng",
        "tagline": "Want a bespoke European textured art card that conveys exceptional prestige?",
        "taglineVi": "Bạn muốn thiệp chúc Tết mang vân giấy mỹ thuật châu Âu sang trọng khi chạm tay?",
        "description": [
          "Printed on European textured art paper with tactile surface grain",
          "Subtle, refined color absorption creating an artisan holiday aesthetic",
          "Pairs immaculately with metallic foil stamping and custom envelope liners"
        ],
        "descriptionVi": [
          "In trên giấy mỹ thuật châu Âu có vân nhám đặc trưng, sang trọng khi chạm",
          "Thấm màu mực tự nhiên tạo sắc thái trầm ấm, thanh lịch và nghệ thuật",
          "Kết hợp hoàn hảo với ép kim nhũ vàng và bao thư lót họa tiết đồng bộ"
        ],
        "descriptionTraits": [
          "textured-art",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "Luxury real estate, private banking, and 5-star hotel New Year greetings",
          "Architecture studios, interior designers, and fashion brand cards",
          "VIP partner gifting accompanied by luxury holiday hampers"
        ],
        "bestForVi": [
          "Bất động sản hạng sang, ngân hàng VIP và khách sạn 5 sao chúc Tết",
          "Studio kiến trúc, thiết kế nội thất và các thương hiệu thời trang cao cấp",
          "Thiệp chúc mừng đi kèm giỏ quà Tết thượng hạng gửi đối tác VVIP"
        ],
        "nameZh": "高端进口粗纹艺术纸新年尊享贺卡",
        "nameJa": "最高級テクスチャアート紙 迎春カード",
        "nameKo": "수입 고급 질감지 프리미엄 연하장",
        "taglineZh": "指尖传递厚实纹理，专为VIP重要客户量身定制？",
        "taglineJa": "特別なVIP顧客へ届ける、圧倒的な紙質と風合いを誇る賀状ですか？",
        "taglineKo": "손끝에 감도는 품격 있는 종이 결로 VIP 고객을 감동시킬 명품 카드인가요?",
        "descriptionZh": [
          "精选高档进口特种粗纹艺术纸，拥有如油画画布般厚实肌理",
          "纸质天然高雅，色彩沉淀内敛深邃，极具艺术收藏价值",
          "与凹凸压印及局部烫金相结合，彰显独一无二的品味"
        ],
        "descriptionJa": [
          "ヨーロッパ輸入の最高級テクスチャアート紙、重厚な手触り",
          "インクが深みをもって馴染み、美術品のような美しさを放つ",
          "箔押しや空押し加工と調和し、相手への敬意を格調高く表現"
        ],
        "descriptionKo": [
          "유럽 직수입 최고급 질감지로 제작되어 손에 닿는 묵직한 예술적 촉감",
          "깊이 있는 종이 결 위에 얹혀진 색감이 미술관 도록처럼 감동적",
          "로고 금박과 디테일한 엠보싱이 어우러져 압도적인 명품 카드로 탄생"
        ],
        "bestForZh": [
          "大型跨国企业高管专属订制的新春VIP问候贺卡",
          "私人银行财富俱乐部、奢侈品牌旗舰店尊享新年礼遇",
          "专为社会名流、行业领袖准备的高规格新春贺帖"
        ],
        "bestForJa": [
          "グローバル企業役員向けVIPニューイヤーカード",
          "プライベートバンク、高級ホテル、ハイブランド顧客用賀状",
          "社会的地位の高い要人へ送る、一切の妥協のない最高峰カード"
        ],
        "bestForKo": [
          "글로벌 기업 최고위층 전용 VIP 신년 인비테이션 카드",
          "프라이빗 뱅킹(PB), 명품 플래그십 스토어 고객 연하장",
          "사회 지도층 인사 및 업계 리더에게 전하는 최고 격식의 신년 서신"
        ],
        "pureImage": "/images/product/thiep-giaymythuat.webp",
        "pureImages": [
          "/images/product/thiep-giaymythuat.webp",
          "/images/product/thiep-giaymythuat2.webp",
          "/images/product/thiep-giaymythuat3.webp"
        ],
      },
      // {
      //   "icon": "Feather",
      //   "name": "Natural Kraft 250 - 300gsm (Eco Greeting Card)",
      //   "nameVi": "Giấy Kraft Nâu Mộc Mạc",
      //   "tagline": "Want a sustainable, rustic Tet greeting card with traditional Vietnamese warmth?",
      //   "taglineVi": "Bạn muốn thiệp chúc Tết mang phong cách mộc mạc, hoài niệm và thân thiện môi trường?",
      //   "description": [
      //     "100% recycled natural brown Kraft paper with authentic organic texture",
      //     "Warm, vintage aesthetic that evokes feelings of nostalgia and heritage",
      //     "Looks stunning with red calligraphy, black ink, or gold foil stamping"
      //   ],
      //   "descriptionVi": [
      //     "Màu nâu tự nhiên tái chế 100% với vân xơ giấy mộc mạc, chân thực",
      //     "Mang lại thiện cảm thẩm mỹ truyền thống ấm áp, hoài niệm ngày Tết",
      //     "Hiệu ứng thị giác tuyệt đẹp khi kết hợp thư pháp đỏ, mực đen hoặc ép kim"
      //   ],
      //   "descriptionTraits": [
      //     "natural-grain",
      //     "soft-light",
      //     "foil-accent"
      //   ],
      //   "bestFor": [
      //     "Artisan agricultural cooperatives and eco-friendly brand greetings",
      //     "F&B brands, coffee shops, and businesses promoting natural wellness",
      //     "Rustic holiday correspondence celebrating heritage and sustainability"
      //   ],
      //   "bestForVi": [
      //     "Thiệp chúc Tết từ các hợp tác xã nông sản sạch và thương hiệu hữu cơ",
      //     "Thương hiệu F&B, quán cà phê và doanh nghiệp hướng tới lối sống xanh",
      //     "Thiệp xuân mộc mạc tôn vinh văn hóa truyền thống và sự phát triển bền vững"
      //   ],
      //   "nameZh": "复古质朴牛皮纸新年明信片/贺卡",
      //   "nameJa": "クラフト紙レトロ年賀カード（エコ調）",
      //   "nameKo": "친환경 빈티지 크라프트 연하장",
      //   "taglineZh": "以环保质朴的方式表达最纯粹的新年祝福？",
      //   "taglineJa": "飾らない素朴な温もりを届ける、クラフト紙のエコ年賀状ですか？",
      //   "taglineKo": "과장 없이 담백하고 진심 어린 새해 인사를 전할 크라프트 카드인가요?",
      //   "descriptionZh": [
      //     "250-300gsm加厚原生态天然牛皮纸，散发浓郁复古年味",
      //     "红金色图腾与牛皮纸底色交织，质朴中流淌着真挚温情",
      //     "完全不含塑料覆膜，践行绿色低碳环保新年生活方式"
      //   ],
      //   "descriptionJa": [
      //     "250〜300gsmの厚口天然クラフト紙、レトロで温かみのある風合い",
      //     "クラフトの素朴な茶色と金箔の対比がモダンなエコ年賀状",
      //     "プラスチックフリーで環境に優しく、サステナブルな新年の誓い"
      //   ],
      //   "descriptionKo": [
      //     "250-300gsm 도톰한 천연 크라프트지로 빈티지한 아날로그 명절 감성",
      //     "따뜻한 브라운 컬러와 반짝이는 골드박이 조화를 이루는 감성 디자인",
      //     "비닐 코팅을 배제한 친환경 종이 재질로 따뜻한 온기 전달"
      //   ],
      //   "bestForZh": [
      //     "年轻人推崇的国潮文创、新潮独立工作室新年贺卡",
      //     "主打生态有机、自然环保理念的可持续品牌客户贺信",
      //     "充满乡村自然田园气息与文艺小资情怀的新年问候"
      //   ],
      //   "bestForJa": [
      //     "若手クリエイター、デザインスタジオの個性的な年賀状",
      //     "オーガニックブランド、エシカル企業のサステナブル賀状",
      //     "気取らない自然体の温もりを伝えたい新年のご挨拶"
      //   ],
      //   "bestForKo": [
      //     "MZ세대 인기 디자인 스튜디오, 감성 라이프스타일 브랜드 연하장",
      //     "친환경 가치와 유기농을 지향하는 소셜 벤처 기업의 새해 편지",
      //     "격식에 얽매이지 않고 따스한 마음을 전하고 싶은 감성 카드"
      //   ],
      //   "pureImage": "/images/product/kraft.webp",
      //   "pureImages": [
      //     "/images/product/kraft.webp",
      //     "/images/product/thieptet-kraft2.webp",
      //     "/images/product/thieptet-kraft3.webp"
      //   ],
      // },
    ]
  },
  {
    "id": "mac-san-pham",
    "categoryId": "tet",
    "titleVi": "Mác sản phẩm - Product Tags",
    "titleEn": "Product Tags & Hangtags",
    "titleZh": "商品吊牌 - Product Tags",
    "titleJa": "下げ札・タグ - Product Tags",
    "titleKo": "상품 행택 - Product Tags",
    "descriptionVi": "Thẻ treo quà Tết, tag cảm ơn đính kèm hộp quà, giỏ quà xuân sang trọng và khẳng định dấu ấn thương hiệu.",
    "descriptionEn": "Festive Tet product hangtags and thank-you cards for holiday gift hampers and luxury packaging.",
    "coverImage": "/images/category/tagsanphamtet.webp",
    "shapes": [
      {
        "id": "tag-san-pham",
        "nameVi": "Tag sản phẩm",
        "nameEn": "Product Tags",
        "nameZh": "年货商品专属吊牌",
        "nameJa": "商品ブランドタグ",
        "nameKo": "설 선물 상품 태그",
        "descriptionVi": "Mác treo hộp quà Tết, đục lỗ xỏ dây dù hoặc nơ đỏ may mắn, cấn xé giá tiện lợi.",
        "descriptionEn": "Branded hangtags for New Year gift hampers with pre-punched string hole and festive accents.",
        "image": "/images/category/tagsanpham.webp"
      },
      {
        "id": "tag-cam-on",
        "nameVi": "Tag cảm ơn",
        "nameEn": "Thank You Gift Tags",
        "nameZh": "新年感谢感恩吊牌",
        "nameJa": "サンキュー・感謝タグ",
        "nameKo": "새해 감사 카드 택",
        "descriptionVi": "Thiết kế thiệp mini gửi lời tri ân ngọt ngào và lời chúc tân xuân an khang đến khách hàng.",
        "descriptionEn": "Charming mini thank-you cards conveying warm holiday wishes in every Tet parcel.",
        "image": "/images/category/tagcamontet.webp"
      }
    ],
    "materials": [
      {
          "icon": "Tag",
          "name": "Couche 300gsm Matte Laminated",
          "nameVi": "Giấy Couche 300gsm Cán Màng Mờ",
          "tagline": "Rigid heavy paper stock with pre-punched string hole for festive gift boxes",
          "taglineVi": "Định lượng C300 tiêu chuẩn cán màng mờ, màu sắc rực rỡ đục lỗ xỏ nơ đỏ may mắn",
          "description": [
              "Pre-drilled 3mm or 5mm string hole ready for tag pins or wax cords",
              "Smooth matte lamination protects against ink rubbing onto gifts",
              "Rich color fidelity for festive greetings and barcodes"
          ],
          "descriptionVi": [
              "Bấm sẵn lỗ xỏ dây 3mm hoặc 5mm tiện luồn dây dù, nơ ruy băng đỏ may mắn",
              "Cán màng mờ bảo vệ bề mặt chống trầy xước, không lem nhòe màu",
              "Màu in chuẩn sắc nét lời chúc xuân an khang và thông tin thương hiệu"
          ],
          "descriptionTraits": [
              "thick-weight",
              "smooth-base"
          ],
          "bestFor": [
              "Tet gift boxes, confectionery hampers, corporate gift tags"
          ],
          "bestForVi": [
              "Hộp quà Tết, giỏ quà bánh mứt doanh nghiệp, phụ kiện thời trang xuân"
          ],
          "pureImage": "/images/product/mactet-giayloaic.webp",
          "pureImages": [
              "/images/product/mactet-giayloaic.webp",
              "/images/product/mactet-giayloaic2.webp",
              "/images/product/mactet-giayloaic3.webp"
          ],
          "nameZh": "铜版纸300g双面覆哑膜 (高质感服饰标/宣传卡)",
          "nameJa": "コート紙300g 両面マットラミネート加工（高級下げ札・カード）",
          "nameKo": "스노우지 300g 양면 무광 코팅 (프리미엄 의류 행택/카드)",
          "taglineZh": "300克厚实高白铜版纸，双面覆盖细腻哑膜，防刮防水防反光的耐用质感之选？",
          "taglineJa": "300gのコシのある厚手コート紙に両面マットPPを施し、光の反射と擦れを防ぐ上品なカード用紙ですか？",
          "taglineKo": "300g 탄탄한 고평량 스노우지에 양면 무광 코팅으로 빛 반사와 스크래치를 방지하는 베스트셀러인가요?",
          "descriptionZh": [
              "300克高密度纯木浆铜版原纸，纸身硬挺平直，不易折痕破损",
              "双面覆盖微米级触感哑膜，有效消除强光反光并隔绝水汽与指纹污渍",
              "全彩网点还原精确细腻，无论明艳红色还是深沉黑色都能呈现沉稳高级质感"
          ],
          "descriptionJa": [
              "坪量300gの高密度パルプ用紙で、折れ曲がりにくく端正な直線を保持",
              "両面に極薄マットラミネートを施し、反射光を抑えながら水滴や指紋汚れをしっかりガード",
              "色の再現性が極めて高く、鮮やかな祝祭カラーからシックな濃色まで深みのある発色"
          ],
          "descriptionKo": [
              "300g 고밀도 원지를 사용하여 구김이나 꺾임 없이 빳빳하고 단단한 그립감 제공",
              "양면 매트 무광 라미네이팅으로 눈부신 빛 반사를 줄이고 지문과 습기 오염을 철저히 차단",
              "풀컬러 망점 재현력이 우수하여 선명한 원색부터 고급스러운 다크 톤까지 깔끔하게 구현"
          ],
          "bestForZh": [
              "年货礼包专属吊牌、新春促销双面彩色卡片、企业VIP感谢卡"
          ],
          "bestForJa": [
              "新春ギフト用下げ札、お正月セールのカラープロモーションカード、VIP感謝カード"
          ],
          "bestForKo": [
              "설날 선물 세트 전용 행택, 신년 기획 프로모션 미니 카드, VIP 고객 리워드 카드"
          ]
      },
      {
          "icon": "ShieldCheck",
          "name": "Natural Kraft Paper 300gsm",
          "nameVi": "Giấy Kraft Nâu Vintage 300gsm",
          "tagline": "Eco-friendly rustic brown kraft paper with authentic vintage New Year charm",
          "taglineVi": "Giấy xi măng nâu mộc mạc dày dặn, đậm chất Tết xưa truyền thống và ấm cúng",
          "description": [
              "100% biodegradable recycled long-fiber brown kraft stock",
              "Pairs beautifully with red cords and nostalgic calligraphy",
              "Sturdy 300gsm thickness keeps hangtags flat and durable"
          ],
          "descriptionVi": [
              "Chất giấy kraft tự nhiên tái chế thân thiện môi trường",
              "Tôn vinh nét đẹp thư pháp mộc mạc và tranh vẽ dân gian ngày Tết",
              "Độ dày 300gsm cứng cáp không bị cong vênh khi treo giỏ quà"
          ],
          "descriptionTraits": [
              "natural-grain",
              "eco-friendly",
              "thick-weight"
          ],
          "bestFor": [
              "Artisan tea hampers, organic dried fruits, vintage Tet gift sets"
          ],
          "bestForVi": [
              "Giỏ quà đặc sản quê, hộp trà hạt mộc, quà tặng Tết handmade organic"
          ],
          "pureImage": "/images/product/mactet-giaykraft.webp",
          "pureImages": [
              "/images/product/mactet-giaykraft.webp",
              "/images/product/mactet-giaykraft2.webp",
              "/images/product/mactet-giaykraft3.webp"
          ],
          "nameZh": "加厚复古牛皮纸300g (天然棕色未漂白)",
          "nameJa": "特厚クラフト紙300g（無漂白・ヴィンテージブラウン）",
          "nameKo": "고평량 빈티지 브라운 크라프트지 300g (무표백 두꺼운 종이)",
          "taglineZh": "300克高克重厚实牛皮纸，天然质朴暖棕色调，抗撕裂耐折的生态复古材质？",
          "taglineJa": "300gのしっかりとした厚みを誇るクラフト紙。未漂白の温かいブラウンがレトロな魅力を放ちますか？",
          "taglineKo": "300g의 두껍고 질긴 무표백 크라프트지로 따뜻한 아날로그 감성과 탁월한 내구성을 자랑하나요?",
          "descriptionZh": [
              "300克高挺度未漂白长纤维木浆牛皮纸，纤维咬合紧密，耐折抗破度极高",
              "标志性大地暖棕色底色，自带手工制作与绿色环保的真实温度",
              "搭配黑色极简文字、红金烫箔或白色专用油墨印刷，产生独特的撞色对比视觉"
          ],
          "descriptionJa": [
              "300gの特厚未漂白ロングパルプ紙で、繊維が強く破れや折れに対して圧倒的な強度",
              "アースカラー特有の温かみのあるブラウンが、オーガニックでレトロなブランド世界観を構築",
              "ブラックインクのミニマル印刷や白インク・金箔押しを組み合わせると印象的なコントラスト"
          ],
          "descriptionKo": [
              "300g 고인장 무표백 천연 펄프로 섬유질이 촘촘하여 찢어짐에 매우 강하고 단단한 강도",
              "특유의 내추럴한 어스 브라운 색상이 전하는 핸드메이드 감성과 친환경 브랜드 가치",
              "블랙 1도 텍스트 인쇄, 화이트 특수 잉크 또는 골드박 가공 시 세련되고 감각적인 대비 효과"
          ],
          "bestForZh": [
              "有机农产品礼盒吊牌、复古手作工坊标签、绿色低碳环保商品卡"
          ],
          "bestForJa": [
              "オーガニック食品の下げ札、ハンドメイド革製品タグ、環境配慮型商品のブランドカード"
          ],
          "bestForKo": [
              "유기농 농산물 기프트 택, 가죽 공방 수제 태그, 친환경 에코 브랜드 상품 라벨"
          ]
      },
      {
          "icon": "Sparkles",
          "name": "Premium Art Red Foil Stamped",
          "nameVi": "Giấy Mỹ Thuật Đỏ Ánh Kim Ép Kim",
          "tagline": "Luxurious red pearl cardstock with radiant metallic gold foil stamping",
          "taglineVi": "Giấy mỹ thuật đỏ ánh xà cừ cao cấp, ép kim vàng nổi bật logo và lời chúc năm mới",
          "description": [
              "Heavy premium cardstock with shimmering metallic texture",
              "Precision metallic gold or silver foil stamping highlights",
              "Elevates luxury hampers and corporate Year-End gifts"
          ],
          "descriptionVi": [
              "Chất giấy mỹ thuật nhập khẩu đỏ tươi rực rỡ phủ ánh kim sa lấp lánh",
              "Gia công ép kim nhũ vàng 3D sắc nét logo thương hiệu và câu đối tân xuân",
              "Nâng tầm đẳng cấp giỏ quà Tết VIP trao gửi đối tác quan trọng"
          ],
          "descriptionTraits": [
              "metallic-shine",
              "textured-art",
              "foil-accent"
          ],
          "bestFor": [
              "Luxury wine bottles, VIP Tet hampers, bird's nest and ginseng gift sets"
          ],
          "bestForVi": [
              "Hộp quà Tết VIP, chai rượu vang nhập khẩu, yến sào đông trùng hạ thảo"
          ],
          "pureImage": "/images/product/mactet-giaymythuat.webp",
          "pureImages": [
              "/images/product/mactet-giaymythuat.webp",
              "/images/product/mactet-giaymythuat2.webp",
              "/images/product/mactet-giaymythuat3.webp",
          ],
          "nameZh": "奢华金闪红艺术纸 + 烫金工艺 (年节尊享版)",
          "nameJa": "金ラメ真紅アート紙 + 箔押し加工（新春プレミアム仕様）",
          "nameKo": "골드 펄 레드 수입지 + 3D 금박 후가공 (신년 한정판)",
          "taglineZh": "红色艺术纸表面流淌金光微闪，结合立体电化铝烫印，彰显顶级奢华的新春视觉？",
          "taglineJa": "深紅の紙にきらめく金ラメと、まばゆいメタリック箔押しが融合した最高峰の正月仕様ですか？",
          "taglineKo": "골드 펄이 흐르는 붉은 예술지에 선명한 입체 금박을 더해 압도적인 고급스러움을 전하는 신년 한정판인가요?",
          "descriptionZh": [
              "特选深红节庆艺术基纸，表面融合细微金粉闪斑，触感微浮雕肌理，贵气天成",
              "高吨位精密烫金工艺，电化铝牢固贴合，棱角锋利平整，光芒璀璨夺目",
              "专为高端节日馈赠设计，让客户触碰的一瞬间即刻感知非凡品牌尊荣"
          ],
          "descriptionJa": [
              "特選の深紅アート紙に微細なゴールドラメが散りばめられ、手触りも上質な立体テクスチャー",
              "精密な高圧箔押し加工により、ゴールドやブロンズ箔がシャープに密着し、贅沢な輝きを演出",
              "特別な新春ギフトやプレミアム会員向けにふさわしい、最高峰の品格とステータス感"
          ],
          "descriptionKo": [
              "엄선된 딥 레드 아트지에 미세한 금빛 펄이 골고루 분사되어 손끝에서 느껴지는 고급스러운 촉감",
              "초정밀 핫포일 프레싱으로 금박의 외곽선이 칼처럼 날카롭고 매끈하게 반사되어 시선 강탈",
              "최고급 신년 선물과 VIP 전용 패키징을 위해 설계된 압도적인 품격과 가치"
          ],
          "bestForZh": [
              "名贵洋酒及顶级名茶新春吊牌、企业至尊黑金VIP赠卡、限量奢礼认证证书"
          ],
          "bestForJa": [
              "高級ワイン・銘茶の新春タグ、企業ロイヤルVIPギフトカード、限定コレクション認定証"
          ],
          "bestForKo": [
              "고급 위스키 및 명품차 신년 패키지 택, 기업 로열 VIP 멤버십 카드, 한정판 선물 보증서"
          ]
      }
    ]
  },
  {
    "id": "vouchers",
    "categoryId": "tet",
    "titleVi": "Phiếu Quà Tặng - Gift Vouchers",
    "titleEn": "Gift Vouchers",
    "titleZh": "新年礼品券 - Gift Vouchers",
    "titleJa": "ギフト券・引換券",
    "titleKo": "설 선물 상품권 / 바우처",
    "descriptionVi": "Thẻ quà tặng tri ân khách hàng, kích cầu mua sắm và gửi trọn lời chúc may mắn đầu năm mới.",
    "descriptionEn": "Festive vouchers and promotional discount cards driving holiday retail shopping excitement.",
    "coverImage": "/images/category/phieuquatang.webp",
    "shapes": [
      {
        "id": "phieu-qua-tang-pho-thong",
        "nameVi": "Phiếu quà tặng phổ thông",
        "nameEn": "Standard Gift Vouchers",
        "nameZh": "通用春节代金券",
        "nameJa": "スタンダード商品券",
        "nameKo": "일반 명절 상품권 바우처",
        "descriptionVi": "Kích thước tiêu chuẩn 7x15cm hoặc 10x20cm, in giấy C300 cán màng mờ, phát tặng dịp lễ Tết.",
        "descriptionEn": "Standard 7x15cm or 10x20cm festive gift vouchers on 300gsm Couche with matte finish.",
        "image": "/images/category/phieuquatangphothong.webp"
      }
    ],
    "materials": VOUCHER_MATERIALS
  },
  {
    "id": "nhan-dan",
    "categoryId": "tet",
    "titleVi": "Nhãn Dán - Decal Label",
    "titleEn": "Decal Labels & Stickers",
    "titleZh": "新年贴纸 - Decal Label",
    "titleJa": "ラベル・シール - Decal Label",
    "titleKo": "라벨 스티커 - Decal Label",
    "descriptionVi": "Tem nhãn dán giỏ quà Tết, hộp bánh mứt, chai rượu vang và sticker trang trí không khí xuân rực rỡ.",
    "descriptionEn": "Custom product packaging labels and decorative stickers for Tet gift baskets, wine bottles, and confectionery.",
    "coverImage": "/images/category/nhandan.webp",
    "shapes": [],
    "materials": LABEL_MATERIALS
  },
  {
    "id": "to-roi",
    "categoryId": "tet",
    "titleVi": "Tờ rơi - Flyers",
    "titleEn": "Flyers & Certificates",
    "titleZh": "宣传单/证书 - Flyers",
    "titleJa": "チラシ・表彰状 - Flyers",
    "titleKo": "전단지 / 상장 - Flyers",
    "descriptionVi": "Tờ rơi thông báo lịch nghỉ Tết, chương trình khuyến mãi xuân, bằng khen vinh danh và vòng tay sự kiện tất niên.",
    "descriptionEn": "Holiday promotional flyers, Year-End employee merit certificates, and event wristbands for gala celebrations.",
    "coverImage": "/images/category/toroi.webp",
    "shapes": [
      {
        "id": "to-roi-so-luong-it",
        "nameVi": "Tờ rơi số lượng ít",
        "nameEn": "Short-run Digital Flyers",
        "nameZh": "少量数码快印传单",
        "nameJa": "小ロットオンデマンドチラシ",
        "nameKo": "소량 디지털 전단지",
        "descriptionVi": "In kỹ thuật số lấy nhanh trong ngày từ 50 - 200 tờ thông báo lịch nghỉ Tết, khuyến mãi hội chợ xuân.",
        "descriptionEn": "Same-day fast digital printing from 50-200 sheets for holiday schedule notices and seasonal promos.",
        "image": "/images/category/toroisoluongit.webp"
      },
      {
        "id": "bang-khen",
        "nameVi": "Bằng khen",
        "nameEn": "Certificates of Merit & Awards",
        "nameZh": "企业年终荣誉证书/奖状",
        "nameJa": "表彰状・感謝状・ディプロマ",
        "nameKo": "연말 표창장 / 상장",
        "descriptionVi": "Giấy khen, chứng nhận vinh danh nhân viên và đối tác xuất sắc tại tiệc tổng kết cuối năm Year End Party.",
        "descriptionEn": "Prestige certificates and awards honoring employees and partners at Year-End Gala parties.",
        "image": "/images/category/bangkhen.webp",
        "materials": [
          {
            "icon": "Layers",
            "name": "Type C Paper 250-300gsm",
            "nameVi": "Giấy loại C 250-300gsm",
            "tagline": "Need vibrant full-color official certificates with a smooth professional finish?",
            "taglineVi": "Bạn cần bằng khen in màu sắc nét, bề mặt láng mịn chuyên nghiệp chuẩn công ty?",
            "description": [
              "Smooth coated Couche 250-300gsm paper with matte or glossy lamination",
              "Vivid CMYK reproduction for corporate logos, emblems, and ornamental borders",
              "Lamination protects against moisture and fingerprints for long-term framing"
            ],
            "descriptionVi": [
              "Giấy Couche 250-300gsm láng mịn, cán màng mờ hoặc bóng trang trọng",
              "In màu CMYK rực rỡ logo doanh nghiệp, hoa văn viền và con dấu đỏ sắc nét",
              "Cán màng bảo vệ chống ẩm và vân tay, giữ bằng khen đẹp khi đóng khung treo"
            ],
            "descriptionTraits": [
              "smooth-base",
              "glossy-coat",
              "thick-weight"
            ],
            "bestFor": [
              "Corporate Year-End merit certificates and employee appreciation awards",
              "Training completion diplomas and partner recognition plaques",
              "Large-quantity official certificates for company-wide ceremonies"
            ],
            "bestForVi": [
              "Bằng khen vinh danh nhân viên xuất sắc tại tiệc tất niên Year End Party",
              "Giấy chứng nhận hoàn thành khóa đào tạo và bằng tri ân đối tác",
              "In số lượng lớn bằng khen chính thức cho lễ tổng kết toàn công ty"
            ],
            "pureImage": "/images/product/bangkhen-giayloaic.webp",
            "pureImages": [
              "/images/product/bangkhen-giayloaic.webp",
              "/images/product/bangkhen-giayloaic2.webp",
              "/images/product/bangkhen-giayloaic3.webp"
            ],
            "nameZh": "铜版纸 250-300gsm 哑膜覆膜（标准企业荣誉证书）",
            "nameJa": "コート紙 250-300gsm マットラミネート（公式表彰状）",
            "nameKo": "스노우지 250-300gsm 무광 코팅 (공식 표창장)",
            "taglineZh": "企业年终表彰大会颁发的标准全彩荣誉证书与奖状？",
            "taglineJa": "年末表彰式に欠かせない、鮮やかなフルカラー印刷の公式表彰状ですか？",
            "taglineKo": "연말 시상식에서 수여할 선명한 풀컬러 공식 표창장인가요?",
            "descriptionZh": [
              "250-300gsm铜版纸双面覆哑膜或光膜，手感厚重庄严",
              "全彩四色精准还原企业标识、花纹边框与公章印文",
              "覆膜层有效防潮防指纹，装裱入框长期陈列不褪色"
            ],
            "descriptionJa": [
              "250〜300gsmの厚手コート紙に両面マットまたは光沢ラミネート加工",
              "フルカラー4色で社章・飾り枠・社印を精密に再現",
              "ラミネートが湿気や指紋を防ぎ、額装しても長年美しさを保つ"
            ],
            "descriptionKo": [
              "250-300gsm 스노우지에 양면 무광 또는 유광 코팅으로 묵직하고 격식 있는 질감",
              "풀컬러 4도 인쇄로 기업 로고, 문양 테두리, 직인을 정밀하게 구현",
              "코팅층이 습기와 지문을 차단하여 액자에 담아 오래 전시해도 변색 없음"
            ],
            "bestForZh": [
              "企业年终杰出员工荣誉证书、部门标兵奖状、全彩颁奖典礼"
            ],
            "bestForJa": [
              "年度末の優秀社員表彰状、部門MVP認定証、全社表彰式"
            ],
            "bestForKo": [
              "연말 우수 사원 표창장, 부서 MVP 인증서, 전사 시상식 공식 상장"
            ]
          },
          {
            "icon": "Feather",
            "name": "Type F Paper 200-250gsm",
            "nameVi": "Giấy loại F 200-250gsm",
            "tagline": "Want a classic uncoated certificate with an elegant matte finish for calligraphy and handwritten signatures?",
            "taglineVi": "Bạn muốn bằng khen giấy mộc tự nhiên, viết tay chữ ký đẹp và không chói lóa khi treo tường?",
            "description": [
              "Natural uncoated Ford 200-250gsm paper with warm ivory-white tone",
              "Ink absorbs smoothly for clean ballpoint signatures and rubber stamps",
              "Zero glare under office lighting, perfect for framed wall display"
            ],
            "descriptionVi": [
              "Giấy Ford 200-250gsm không tráng phủ, tông trắng ngà ấm áp trang nhã",
              "Mực bút bi và mực dấu đỏ thấm đều đẹp, chữ ký tay sắc nét trang trọng",
              "Hoàn toàn không bị chói lóa dưới đèn văn phòng, lý tưởng đóng khung treo tường"
            ],
            "descriptionTraits": [
              "natural-grain",
              "soft-light",
              "thick-weight"
            ],
            "bestFor": [
              "Traditional calligraphy-style merit certificates and appreciation letters",
              "Academic diplomas and professional training completion certificates",
              "Handwritten signature awards where pen ink must absorb cleanly"
            ],
            "bestForVi": [
              "Bằng khen phong cách cổ điển trang trọng với font chữ thư pháp truyền thống",
              "Giấy chứng nhận tốt nghiệp khóa học và bằng hoàn thành chương trình đào tạo",
              "Bằng khen cần chữ ký tay và đóng dấu đỏ bảo đảm mực thấm đều sắc nét"
            ],
            "pureImage": "/images/product/bangkhen-giayloaif.webp",
            "pureImages": [
              "/images/product/bangkhen-giayloaif.webp",
              "/images/product/bangkhen-giayloaif2.webp",
              "/images/product/bangkhen-giayloaif3.webp"
            ],
            "hideFoilCheckbox": true,
            "nameZh": "道林纸 200-250gsm 无涂层（经典手签奖状）",
            "nameJa": "上質紙 200-250gsm 非コート（手書きサイン入り表彰状）",
            "nameKo": "모조지 200-250gsm 무코팅 (수기 서명용 고전 상장)",
            "taglineZh": "偏好素雅温润无反光、方便领导亲笔签名盖章的传统风格奖状？",
            "taglineJa": "温かみのある無塗工紙で、手書きサインや朱印が美しく映える伝統的な賞状ですか？",
            "taglineKo": "은은하고 따뜻한 무코팅지로 대표 친필 서명과 직인이 아름답게 스며드는 전통 상장인가요?",
            "descriptionZh": [
              "200-250gsm无涂层道林纸，色调温暖象牙白，手感柔和细腻",
              "签字笔墨水与印泥快速均匀渗透，手签与盖章清晰不晕染",
              "无反光纸面在任何灯光与玻璃框中均不刺眼，典雅庄重"
            ],
            "descriptionJa": [
              "200〜250gsmの非コート上質紙、温かみのあるアイボリーホワイトの色調",
              "ボールペンや万年筆のインクがスムーズに吸収され、署名と社印が美しく定着",
              "照明や額縁のガラス越しでもギラつかない落ち着いた紙面で格式を演出"
            ],
            "descriptionKo": [
              "200-250gsm 무코팅 모조지로 따뜻한 아이보리 화이트 톤의 클래식한 질감",
              "볼펜과 주인 잉크가 빠르게 고르게 스며들어 수기 서명과 날인이 깔끔하게 정착",
              "어떤 조명 아래에서도 빛 반사 없이 차분하여 유리 액자 속에서도 품격을 유지"
            ],
            "bestForZh": [
              "领导亲签传统手写风格奖状、学术结业证书、培训合格认定证"
            ],
            "bestForJa": [
              "経営陣の直筆サイン入り伝統的な表彰状、修了証書、研修認定証"
            ],
            "bestForKo": [
              "임원 친필 서명 전통 표창장, 학술 수료증, 사내 연수 인증서"
            ]
          },
          {
            "icon": "Palette",
            "name": "Premium Art Paper with Foil",
            "nameVi": "Giấy Mỹ Thuật Cao Cấp Ép Kim",
            "tagline": "Want a luxurious textured art certificate with radiant gold foil for VIP award ceremonies?",
            "taglineVi": "Bạn muốn bằng khen giấy mỹ thuật vân nhám sang trọng, ép kim nhũ vàng trao tặng tại Gala VIP?",
            "description": [
              "Heavy imported European art paper with elegant tactile grain texture",
              "Radiant 3D gold or silver metallic foil stamping for borders and emblems",
              "Archival-grade longevity for commemorative certificates worthy of framing"
            ],
            "descriptionVi": [
              "Giấy mỹ thuật nhập khẩu châu Âu dày dặn, bề mặt vân nhám đẳng cấp khi chạm tay",
              "Ép kim nhũ vàng 3D viền hoa văn cổ điển và chữ vinh danh lấp lánh trang trọng",
              "Chất lượng lưu trữ bền vĩnh cửu, xứng đáng đóng khung kính trao tại lễ Gala tất niên"
            ],
            "descriptionTraits": [
              "textured-art",
              "foil-accent",
              "thick-weight"
            ],
            "bestFor": [
              "VIP Year-End Gala merit certificates and lifetime achievement awards",
              "Gold Partner recognition plaques and executive appreciation honors",
              "Limited-edition commemorative certificates for milestone anniversaries"
            ],
            "bestForVi": [
              "Bằng khen VIP tại Gala tất niên, giải thưởng cống hiến trọn đời cho doanh nghiệp",
              "Giấy chứng nhận Đối tác Vàng và tri ân ban lãnh đạo xuất sắc",
              "Bằng khen giới hạn kỷ niệm dấu mốc quan trọng của công ty"
            ],
            "pureImage": "/images/product/bangkhen-giaymythuat.webp",
            "pureImages": [
              "/images/product/bangkhen-giaymythuat.webp",
              "/images/product/bangkhen-giaymythuat2.webp",
              "/images/product/bangkhen-giaymythuat3.webp"
            ],
            "nameZh": "高端进口特种艺术纸 + 3D烫金（顶级年终荣誉证书）",
            "nameJa": "最高級アート紙 + 3D金箔押し（プレミアム表彰状）",
            "nameKo": "최고급 수입 예술지 + 3D 금박 (프리미엄 VIP 표창장)",
            "taglineZh": "年终Gala盛典上颁发的最高荣誉、触感奢华且金箔璀璨的顶级证书？",
            "taglineJa": "年末ガラパーティーの最高栄誉にふさわしい、触感と金箔の輝きが際立つ最上位の表彰状ですか？",
            "taglineKo": "연말 갈라 시상식에서 수여하는 최고 영예, 촉감과 금박의 빛이 압도적인 최상급 표창장인가요?",
            "descriptionZh": [
              "欧洲进口高克重纯棉特种艺术纸，表面质感独特细腻，触感温润高贵",
              "3D立体烫金工艺精准凸显古典花纹边框与荣誉文字，金属光泽夺目辉煌",
              "无酸抗氧化纸质配方，裱入实木玻璃画框数十年不变黄不脆化"
            ],
            "descriptionJa": [
              "ヨーロッパ伝統の厚手コットン系ファインアート紙、独特の紙肌が最高級の風格を演出",
              "3D立体ゴールド箔で唐草飾り枠や表彰タイトルを美しく浮かび上がらせ、眩い輝きで栄誉を称える",
              "中性紙アーカイブ仕様で、額装保存しても長年にわたり変色や劣化がない永続性"
            ],
            "descriptionKo": [
              "유럽 전통의 두터운 코튼 파인아트 수입지로 독특한 엠보 질감과 묵직한 프리미엄 중량감",
              "3D 입체 골드박으로 클래식 문양 테두리와 표창 문구를 정밀하게 각인, 압도적인 위엄",
              "중성 보존 용지로 유리 액자에 담아 수십 년 전시해도 변색·노화 없이 품격 유지"
            ],
            "bestForZh": [
              "企业年终Gala杰出人物最高荣誉证书、金牌战略合作伙伴奖状、里程碑纪念证书"
            ],
            "bestForJa": [
              "年末ガラ表彰式の最優秀賞状、ゴールドパートナー認定証、創業記念アニバーサリー証書"
            ],
            "bestForKo": [
              "연말 갈라 최우수 공로 표창장, 골드 파트너 인증서, 기업 마일스톤 기념 상장"
            ]
          }
        ]
      },
      {
        "id": "vong-tay-su-kien",
        "nameVi": "Vòng tay sự kiện",
        "nameEn": "Event Wristbands",
        "nameZh": "年会活动防水手环",
        "nameJa": "イベント用リストバンド",
        "nameKo": "행사용 방수 손목 밴드",
        "descriptionVi": "Vòng tay giấy Tyvek hoặc nhựa không thấm nước có số nhảy kiểm soát ra vào tiệc tất niên, Countdown đón năm mới.",
        "descriptionEn": "Waterproof numbered event wristbands for Year-End parties and New Year Countdown galas.",
        "image": "/images/category/vongtaysukien.webp",
        "materials": WRISTBAND_MATERIALS
      }
    ],
    "materials": [
      {
        "icon": "Layers",
        "name": "Type C Paper",
        "nameVi": "Giấy loại C",
        "tagline": "Need the industry-standard glossy flyer for mass distribution and events?",
        "taglineVi": "Bạn cần tờ rơi tiêu chuẩn láng mịn, chuẩn màu cho chiến dịch phát quảng cáo?",
        "description": [
          "Smooth coated C150 paper balancing stiffness with economical distribution weight",
          "Vibrant full-bleed CMYK color reproduction that grabs immediate attention",
          "Most popular choice for street marketing, store openings, and mailboxes"
        ],
        "descriptionVi": [
          "Láng mịn, cân bằng hoàn hảo giữa độ dày và chi phí",
          "In màu CMYK rực rỡ tràn viền, thu hút sự chú ý của khách hàng ngay lập tức",
          "Lựa chọn phổ biến nhất cho phát tờ rơi đường phố, khai trương và showroom"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Grand openings, promotional sales events, and supermarket flyers",
          "Real estate project launches and educational course recruitments",
          "Restaurant takeaway menus and food delivery promotional inserts"
        ],
        "bestForVi": [
          "Khai trương cửa hàng, sự kiện khuyến mãi lớn và tờ rơi siêu thị",
          "Mở bán dự án bất động sản và tuyển sinh các khóa học trung tâm",
          "Menu gọi món mang đi của nhà hàng và tờ quảng cáo kẹp trong hộp hàng"
        ],
        "nameZh": "铜版纸 150gsm（大批量宣传传单）",
        "nameJa": "コート紙 150gsm（大量ポスティングチラシ）",
        "nameKo": "스노우지 150gsm (대량 배포용 표준 전단지)",
        "taglineZh": "新店开业、促销活动需要在街头商圈大批量派发的宣传单？",
        "taglineJa": "新規オープンやイベント告知で、街頭配布や新聞折込に使うチラシですか？",
        "taglineKo": "신규 매장 오픈이나 프로모션 시 거리 대량 배포용 가성비 전단지인가요?",
        "descriptionZh": [
          "150gsm高性价比铜版纸，双面全彩高清印刷",
          "光泽度佳，色彩还原饱满鲜艳，吸睛效果极强",
          "纸张轻薄适中，极其便于折叠、装箱与现场大批量派发"
        ],
        "descriptionJa": [
          "150gsmのコストパフォーマンスに優れたコート紙、両面フルカラー印刷",
          "ほどよい光沢感があり、写真やイラストが鮮やかに発色",
          "軽くてかさばらず、街頭での手渡しやポスティングに最適"
        ],
        "descriptionKo": [
          "150gsm 가성비 뛰어난 스노우지로 양면 고해상도 풀컬러 인쇄",
          "화사한 발색과 매끄러운 표면으로 한눈에 시선을 사로잡는 주목도",
          "적당한 두께감으로 접거나 대량 휴대 및 거리 배포에 최적화"
        ],
        "bestForZh": [
          "新店开业大酬宾、商场周末促销打折宣传单",
          "街头商圈地推海量派发、周边社区信箱入户投递",
          "追求高覆盖率与低单页成本的主力广告传单"
        ],
        "bestForJa": [
          "新規オープン、セール告知、キャンペーンチラシ",
          "駅前や街頭での手配り、新聞折込、ポスティング",
          "低コストで広範囲に大量告知したいプロモーション"
        ],
        "bestForKo": [
          "신규 오픈 이벤트, 주말 특가 세일, 프로모션 전단지",
          "역세권 거리 배포, 아파트 우편함 대량 투입 배포용",
          "최소의 비용으로 최대의 홍보 효과를 내는 필수 전단지"
        ],
        "hideFoilCheckbox": false,
        "pureImage": "/images/product/flyer-giayloaic.webp",
        "pureImages": [
          "/images/product/flyer-giayloaic.webp",
          "/images/product/flyer-giayloaic2.webp",
          "/images/product/flyer-giayloaic3.webp"
        ]
      },
      {
        "icon": "Feather",
        "name": "Type F Paper",
        "nameVi": "Giấy loại F",
        "tagline": "Want a natural uncoated flyer that clients can read without glare or write on?",
        "taglineVi": "Bạn muốn tờ rơi giấy mộc tự nhiên, không chói mắt và khách có thể điền thông tin?",
        "description": [
          "Natural uncoated matte Ford paper with soft light diffusion",
          "Zero glare under sunlight or bright store lighting",
          "Allows customers to write notes, fill questionnaires, or clip coupons easily"
        ],
        "descriptionVi": [
          "Không tráng phủ nhám mịn tự nhiên, khuếch tán ánh sáng dịu nhẹ",
          "Hoàn toàn không chói lóa dưới ánh nắng mặt trời hay đèn showroom",
          "Khách hàng có thể viết ghi chú, điền phiếu khảo sát hoặc cắt coupon khuyến mãi"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Medical clinic handouts, educational questionnaires, and training sheets",
          "Minimalist brands favoring an organic, non-glossy communication style",
          "Direct mail coupon inserts and customer survey forms"
        ],
        "bestForVi": [
          "Tờ rơi thông tin y tế bệnh viện, phiếu khảo sát học sinh và đào tạo",
          "Thương hiệu tối giản ưa chuộng phong cách giao tiếp mộc mạc, tự nhiên",
          "Tờ rơi kẹp coupon giảm giá và phiếu thăm dò ý kiến khách hàng"
        ],
        "nameZh": "道林纸 100-120gsm（哑光易书写单页）",
        "nameJa": "上質紙 100-120gsm（書き込み用チラシ）",
        "nameKo": "모조지 100-120gsm (필기형 매트 전단지)",
        "taglineZh": "宣传单附带客户问卷调查或需要现场手写优惠券？",
        "taglineJa": "アンケートや申込記入欄が付いた、ペンで書き込みやすいチラシですか？",
        "taglineKo": "고객 설문조사나 신청서 양식이 포함되어 직접 수기 작성이 필요한 전단지인가요?",
        "descriptionZh": [
          "100-120gsm进口道林纸，纸面微糙无眩光",
          "吸墨均匀迅速，圆珠笔、签字笔书写流利不透墨",
          "适合附带客户登记表、调查问卷或现场手写优惠券"
        ],
        "descriptionJa": [
          "100〜120gsmの上質紙、目に優しく反射のない落ち着いた紙面",
          "ボールペンや鉛筆で書き込みやすく、インクが裏抜けしない",
          "アンケート、申込書、記入式クーポンを兼ねたチラシに最適"
        ],
        "descriptionKo": [
          "100-120gsm 모조지로 조명 아래에서도 눈부심 없는 차분한 질감",
          "잉크 흡수가 빨라 볼펜, 연필로 고객이 직접 작성하기 편리함",
          "고객 상담 카드, 설문조사, 현장 할인 쿠폰 겸용 전단지로 최적"
        ],
        "bestForZh": [
          "课外培训机构报名表、健身房体验课意向登记表",
          "医疗体检套餐说明书附带身体健康问卷",
          "各类带有互动填写与签字确认环节的推广单页"
        ],
        "bestForJa": [
          "学習塾・スクールの入会案内、フィットネスクラブの体験申込書",
          "クリニックの問診票付きパンフレット、健康診断案内",
          "顧客が記入して提出するインタラクティブなチラシ"
        ],
        "bestForKo": [
          "학원 수강 신청서, 피트니스 클럽 무료 체험 상담 카드",
          "건강검진 프로그램 안내문 및 사전 문진표",
          "고객이 현장에서 직접 작성하여 회수하는 참여형 전단지"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/flyer-giayloaif.webp",
        "pureImages": [
          "/images/product/flyer-giayloaif.webp",
          "/images/product/flyer-giayloaif2.webp",
          "/images/product/flyer-giayloaif3.webp"
        ]
      },
      {
        "icon": "Leaf",
        "name": "Kraft Paper (Vintage & Eco-friendly)",
        "nameVi": "Giấy Kraft (Cổ Điển & Thân Thiện)",
        "tagline": "Want an eco-friendly, rustic flyer to highlight organic or sustainable products?",
        "taglineVi": "Bạn muốn tờ rơi mộc mạc, thân thiện môi trường để quảng bá sản phẩm xanh?",
        "description": [
          "100% recycled brown Kraft paper with a distinct vintage, organic texture",
          "Excellent for single-color (black/brown) printing or minimalist designs",
          "Stands out from standard glossy flyers with a unique tactile feel"
        ],
        "descriptionVi": [
          "Màu nâu tái chế 100% mang lại kết cấu mộc mạc, tự nhiên và cổ điển",
          "Phù hợp nhất với thiết kế tối giản hoặc in đơn sắc (đen/nâu đậm)",
          "Tạo sự khác biệt hoàn toàn so với tờ rơi bóng bẩy thông thường"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Organic food stores, vegan restaurants, and eco-friendly campaigns",
          "Vintage clothing boutiques and artisan craft workshops",
          "Sustainable brand awareness drives and local community events"
        ],
        "bestForVi": [
          "Cửa hàng thực phẩm sạch, nhà hàng chay và chiến dịch sống xanh",
          "Shop thời trang vintage và xưởng thủ công mỹ nghệ",
          "Truyền thông nhận diện thương hiệu bền vững và sự kiện cộng đồng"
        ],
        "nameZh": "复古环保牛皮纸特色宣传页",
        "nameJa": "クラフト紙レトロフライヤー（環境配慮型）",
        "nameKo": "크라프트지 빈티지 친환경 홍보물",
        "taglineZh": "烘焙咖啡、环保理念、自然风格店铺的特色宣传单？",
        "taglineJa": "カフェやヴィンテージショップに似合う、環境に配慮したチラシですか？",
        "taglineKo": "베이커리, 카페, 자연주의 브랜드의 철학을 전달할 빈티지 홍보물인가요?",
        "descriptionZh": [
          "纯天然无漂白牛皮纸，散发浓厚复古情调与手作温度",
          "纸质柔韧耐磨，即使揉皱也别具一种自然粗狂之美",
          "绿色环保可回收，完美契合可持续发展品牌理念"
        ],
        "descriptionJa": [
          "無漂白の未晒クラフト紙、どこか懐かしいヴィンテージ感",
          "破れにくくしなやかで、環境意識の高さをアピール可能",
          "エコでナチュラルな生活を提案するショップにベストマッチ"
        ],
        "descriptionKo": [
          "화학 표백을 거치지 않은 천연 크라프트지로 빈티지한 아날로그 감성",
          "질기고 유연하여 자연스러운 멋과 친환경적인 메시지 전달",
          "100% 재활용 가능한 용지로 브랜드의 지속가능성 가치 강조"
        ],
        "bestForZh": [
          "精品手冲咖啡馆、现烤欧包烘焙店、精酿小酒馆",
          "文创集市、复古古着店、环保公益活动宣传页",
          "追求与众不同文艺腔调与自然质感的特色店铺"
        ],
        "bestForJa": [
          "カフェ、ベーカリー、クラフトビアバー、自然派食品店",
          "フリーマーケット、古着屋、環境フェスティバルのフライヤー",
          "オーガニックやハンドメイドの魅力を伝えたい店舗"
        ],
        "bestForKo": [
          "스페셜티 카페, 천연 발효 베이커리, 수제 맥주 펍 안내장",
          "플리마켓, 빈티지 편집숍, 친환경 생태 캠페인 리플렛",
          "개성 있는 아날로그 감성으로 마니아층을 사로잡는 감성 매장"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/flyer-giayloaik.webp",
        "pureImages": [
          "/images/product/flyer-giayloaik.webp",
          "/images/product/flyer-giayloaik2.webp",
          "/images/product/flyer-giayloaik3.webp"
        ]
      },
      {
        "icon": "Sparkles",
        "name": "Art Paper (Premium & Textured)",
        "nameVi": "Giấy Mỹ Thuật (Sang Trọng & Đẳng Cấp)",
        "tagline": "Need a high-end, textured flyer that feels like a luxury invitation?",
        "taglineVi": "Bạn cần tờ rơi cao cấp, có gân giấy sang trọng như một tấm thiệp mời?",
        "description": [
          "Premium imported art paper with elegant textures (linen, felt, or metallic)",
          "Delivers an immediate sense of luxury, prestige, and exclusivity",
          "Pairs perfectly with foil stamping or embossed logos for maximum impact"
        ],
        "descriptionVi": [
          "Đa dạng vân giấy (gân ngang, nhám, ánh kim)",
          "Mang lại cảm giác sang trọng, đẳng cấp và độc quyền ngay khi chạm vào",
          "Kết hợp hoàn hảo với ép kim nhũ hoặc dập nổi logo để tạo ấn tượng mạnh"
        ],
        "descriptionTraits": [
          "textured-art",
          "natural-grain",
          "foil-accent"
        ],
        "bestFor": [
          "Luxury real estate launches, high-end jewelry, and automotive showrooms",
          "VIP event invitations disguised as promotional flyers",
          "Exclusive wellness retreats, aesthetic clinics, and 5-star hotels"
        ],
        "bestForVi": [
          "Lễ mở bán bất động sản hạng sang, trang sức cao cấp và showroom ô tô",
          "Tờ rơi dạng thiệp mời gửi đến khách hàng VIP tham dự sự kiện",
          "Viện thẩm mỹ, resort 5 sao và các dịch vụ chăm sóc sức khỏe thượng lưu"
        ],
        "nameZh": "高端特种纸艺术宣传单",
        "nameJa": "高級特殊紙プレミアムリーフレット",
        "nameKo": "고급 수입지 프리미엄 리플렛",
        "taglineZh": "艺术展讯、高级沙龙需要向高端客群精准递送的品味之选？",
        "taglineJa": "高級サロンや個展の案内など、厳選された顧客へ届けるフライヤーですか？",
        "taglineKo": "프리미엄 살롱, 갤러리 초대 등 타깃 고객에게 전달할 고급 리플렛인가요?",
        "descriptionZh": [
          "精选高档粗纹艺术纸，具有如水彩画纸般的触感张力",
          "纸张挺括厚实，吸墨温润深邃，赋予设计浓厚艺术气质",
          "彻底告别廉价传单感，成为值得长期留存的微型艺术品"
        ],
        "descriptionJa": [
          "画用紙のような風合いを持つ最高級特殊紙、圧倒的な存在感",
          "深みのある落ち着いた発色で、デザインをアートの領域へ昇華",
          "捨てられにくく、手元に長く残るプレミアムなフライヤー"
        ],
        "descriptionKo": [
          "수채화지처럼 고급스러운 결이 살아있는 최고급 수입 예술지",
          "도톰하고 탄탄하여 쥐었을 때 전해지는 묵직한 프리미엄 감도",
          "쉽게 버려지지 않고 서재나 냉장고에 붙여두고 소장하는 미니 아트 포스터"
        ],
        "bestForZh": [
          "画廊艺术展览门票式单页、博物馆大师特展邀请单",
          "高级定制西服、名表珠宝私享品鉴会高端宣传单",
          "高端楼盘奢华发布会、高端私人会所专享宣传品"
        ],
        "bestForJa": [
          "アートギャラリーの個展案内、美術館の特別展フライヤー",
          "高級時計・宝飾品の内覧会、ラグジュアリーサロンの案内状",
          "デザインと紙質にこだわり抜いた最高峰のプロモーション"
        ],
        "bestForKo": [
          "갤러리 개인전 도록형 리플렛, 미술관 기획전 초청 브로슈어",
          "명품 시계·주얼리 프라이빗 VIP 살롱 인비테이션",
          "디자인과 종이의 퀄리티를 최우선으로 여기는 프리미엄 프로젝트"
        ],
        "hideFoilCheckbox": false,
        "pureImage": "/images/product/flyer-giaymythuat.webp",
        "pureImages": [
          "/images/product/flyer-giaymythuat.webp",
          "/images/product/flyer-giaymythuat2.webp",
          "/images/product/flyer-giaymythuat3.webp"
        ]
      },
      {
        "icon": "Droplets",
        "name": "Waterproof Plastic (Tear-Resistant)",
        "nameVi": "Nhựa Chống Nước (Siêu Bền & Không Rách)",
        "tagline": "Need an indestructible, waterproof flyer for outdoor events or wet environments?",
        "taglineVi": "Bạn cần tờ rơi siêu bền, chống nước tuyệt đối cho sự kiện ngoài trời hay môi trường ẩm ướt?",
        "description": [
          "Synthetic plastic material (PVC/PET) that is completely waterproof and tear-proof",
          "Maintains vibrant colors and structural integrity even when submerged in water",
          "Ideal for long-term reusable menus or outdoor heavy-duty promotions"
        ],
        "descriptionVi": [
          "Tổng hợp dẻo dai, hoàn toàn không thấm nước và xé không rách",
          "Giữ nguyên màu sắc rực rỡ và độ bền cấu trúc ngay cả khi ngâm trong nước",
          "Hoàn hảo cho menu dùng nhiều lần hoặc tờ rơi quảng cáo môi trường khắc nghiệt"
        ],
        "descriptionTraits": [
          "waterproof-durability",
          "smooth-base",
          "glossy-coat"
        ],
        "bestFor": [
          "Poolside bar menus, seafood restaurants, and outdoor food festivals",
          "Theme parks, water sports rentals, and beach club promotions",
          "Industrial product sheets used in wet or oily manufacturing floors"
        ],
        "bestForVi": [
          "Menu quán bar hồ bơi, nhà hàng hải sản và lễ hội ẩm thực ngoài trời",
          "Công viên giải trí, dịch vụ thể thao dưới nước và câu lạc bộ bãi biển",
          "Tờ hướng dẫn sản phẩm công nghiệp dùng trong nhà máy ẩm ướt hoặc dầu mỡ"
        ],
        "nameZh": "撕不烂完全防水塑料宣传单",
        "nameJa": "完全防水合成樹脂フライヤー（破れ知らず）",
        "nameKo": "완벽 방수 합성 플라스틱 홍보물 (파손 방지)",
        "taglineZh": "户外暴晒、雨淋或水上乐园环境依然完好无损的宣传页？",
        "taglineJa": "雨風にさらされる屋外や、水回りの施設でも破れないタフなチラシですか？",
        "taglineKo": "야외 페스티벌이나 워터파크처럼 물에 노출되어도 절대 젖지 않는 홍보물인가요?",
        "descriptionZh": [
          "特种撕不烂合成塑料材质，100%全防水耐油污抗撕拽",
          "即使放入水中浸泡数天，字迹与画面依然崭新不化墨",
          "抗紫外线暴晒，耐候性能极强，户外严苛环境首选"
        ],
        "descriptionJa": [
          "破れ知らずの合成樹脂素材、100%完全防水・耐油仕様",
          "水に浸けてもインクが滲まず、汚れもサッと拭き取れる",
          "紫外線や風雨に強く、屋外の過酷な環境でも劣化しない"
        ],
        "descriptionKo": [
          "손으로 찢을 수 없는 강력 합성 플라스틱 소재로 100% 완전 방수",
          "물속에 담가도 잉크 번짐이나 종이 부풀림이 전혀 발생하지 않음",
          "자외선과 비바람에 강한 내후성으로 야외 가혹한 환경에서도 완벽 유지"
        ],
        "bestForZh": [
          "水上乐园、海滨浴场、潜水俱乐部与游艇会活动单",
          "汽车越野拉力赛、户外徒步露营路线指南单",
          "餐饮火锅厨房湿滑油污环境中的点餐宣传页"
        ],
        "bestForJa": [
          "ウォーターパーク、ダイビングスクール、マリーナの案内",
          "野外フェス、キャンプ場マップ、トレッキングルート案内",
          "プールサイドや雨天の野外イベントでの配布チラシ"
        ],
        "bestForKo": [
          "워터파크, 서핑 스쿨, 스쿠버 다이빙 클럽 야외 안내문",
          "야외 락 페스티벌, 오토캠핑장 지도, 트레킹 코스 가이드",
          "비가 오는 날씨나 물기 가득한 야외 축제 현장 배포용"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/flyer-nhuachongnuoc.webp",
        "pureImages": [
          "/images/product/flyer-nhuachongnuoc.webp",
          "/images/product/flyer-nhuachongnuoc2.webp",
          "/images/product/flyer-nhuachongnuoc3.webp"
        ]
      },
      {
          "icon": "Layers",
          "name": "Couche 150gsm Fast-Print",
          "nameVi": "Giấy Couche 150gsm (Lấy Nhanh)",
          "tagline": "Same-day fast digital printing on glossy Couche for holiday notices and spring sale campaigns",
          "taglineVi": "Định lượng bóng láng in kỹ thuật số lấy ngay trong ngày, thông báo lịch nghỉ Tết và ưu đãi mùa xuân",
          "description": [
              "Smooth semi-gloss surface ensures crisp typography and festive vibrant color",
              "Moderate thickness easy to fold, insert into orders, or distribute hand-to-hand",
              "Most economical choice for rapid turnarounds before the holiday closure"
          ],
          "descriptionVi": [
              "Bề mặt giấy láng bóng mịn màng, thể hiện màu đỏ may mắn và hình ảnh hoa xuân sắc nét",
              "Độ dày vừa vặn dễ gấp gọn, kẹp vào túi hàng giao Tết hoặc phát tay sự kiện",
              "Tốc độ in lấy ngay trong ngày, giải pháp hoàn hảo cho thông báo nghỉ Tết cấp tốc"
          ],
          "descriptionTraits": [
              "smooth-base",
              "digital-precision"
          ],
          "bestFor": [
              "Holiday schedule notices, Spring sale circulars, festive menus"
          ],
          "bestForVi": [
              "Thông báo lịch nghỉ Tết, khuyến mãi hội chợ xuân, tờ rơi thực đơn tiệc tất niên"
          ],
          "pureImage": "/images/category/toroisoluongit.webp",
          "pureImages": [
              "/images/category/toroisoluongit.webp",
              "/images/category/toroi.webp",
              "/images/category/toroigiare.webp"
          ],
          "nameZh": "铜版纸150g数码快印 (当天取件/节庆传单)",
          "nameJa": "コート紙150g オンデマンド特急印刷（即日仕上げ・新春チラシ）",
          "nameKo": "스노우지 150g 디지털 당일 급행 인쇄 (신년 휴무 공지/전단지)",
          "taglineZh": "微光半滑面纸张、当天即可极速交货，专为春节放假通知与开春促销定制的高效传单？",
          "taglineJa": "しなやかな光沢コート紙で即日スピード仕上げ。休業案内や新春初売りセールチラシに最適ですか？",
          "taglineKo": "적당한 두께의 광택지로 당일 즉시 인쇄되어 설 연휴 휴무 안내 및 신년 첫 세일 홍보에 최적인가요?",
          "descriptionZh": [
              "表面微光平滑细腻，全彩数码快印展现浓郁节日红金色彩与清晰文字排版",
              "150克克重适中轻盈，手感顺滑易折叠，方便夹入配送外卖袋或街头派发",
              "数码直印无须制版，极速当天出件，是节前紧急赶工与通知传达的最优解"
          ],
          "descriptionJa": [
              "滑らかな半光沢面が、おめでたい新春の赤や初売りの文字をクッキリと鮮やかに表現",
              "150gの適度な厚みで折りやすく、商品への同梱配布や店頭での手渡し配布にぴったり",
              "版代不要のオンデマンドデジタル印刷により、即日納品可能なスピード重視のベストソリューション"
          ],
          "descriptionKo": [
              "은은한 광택의 매끄러운 표면으로 신년 분위기의 붉은색과 행사 텍스트가 번짐 없이 또렷하게 출력",
              "150g의 적당한 두께로 접기가 편해 배송 가방에 동봉하거나 거리 배포용으로 안성맞춤",
              "판 제작 없는 최첨단 디지털 고속 인쇄로 당일 즉시 수령 가능한 긴급 홍보의 구원투수"
          ],
          "bestForZh": [
              "春节放假及营业时间通知、开春特惠促销传单、年夜饭及春茗菜单海报"
          ],
          "bestForJa": [
              "年末年始の休業案内、新春初売りセールの折り込みチラシ、新年会メニュー案内"
          ],
          "bestForKo": [
              "설 연휴 영업 및 휴무 일정 안내문, 신년 특별 할인 전단지, 신년회 코스 메뉴판"
          ]
      },
      {
          "icon": "ShieldCheck",
          "name": "Couche 300gsm Matte Laminated",
          "nameVi": "Giấy Couche 300gsm Cán Màng Mờ",
          "tagline": "Sturdy heavyweight artboard with silky matte finish for prestigious New Year open letters",
          "taglineVi": "Chất giấy dày dặn đầm tay cán màng mờ 2 mặt sang trọng, thư ngỏ tân xuân và giới thiệu chương trình cuối năm",
          "description": [
              "Heavy 300gsm cardstock feel equivalent to premium postcards",
              "Silky double-sided matte lamination resists smudges and finger oils",
              "Supports gold foil accents and custom die-cut rounded corners"
          ],
          "descriptionVi": [
              "Định lượng C300 dày dặn cứng cáp như tấm thiệp chúc mừng năm mới",
              "Cán màng mờ 2 mặt chống trầy xước, êm ái khi chạm tay và không chói lóa",
              "Thích hợp làm thư ngỏ tri ân gửi tặng kèm quà Tết cho đối tác khách hàng thân thiết"
          ],
          "descriptionTraits": [
              "thick-weight",
              "smooth-base"
          ],
          "bestFor": [
              "New Year corporate greeting cards, luxury brand open letters, gala flyers"
          ],
          "bestForVi": [
              "Thư ngỏ tri ân tân xuân, thư mời Year End Party, giới thiệu dự án đầu năm"
          ],
          "pureImage": "/images/category/toroicaocap.webp",
          "pureImages": [
              "/images/category/toroicaocap.webp",
              "/images/category/toroi.webp",
              "/images/product/art-foil.webp"
          ],
          "nameZh": "铜版纸300g双面覆哑膜 (高质感服饰标/宣传卡)",
          "nameJa": "コート紙300g 両面マットラミネート加工（高級下げ札・カード）",
          "nameKo": "스노우지 300g 양면 무광 코팅 (프리미엄 의류 행택/카드)",
          "taglineZh": "300克厚实高白铜版纸，双面覆盖细腻哑膜，防刮防水防反光的耐用质感之选？",
          "taglineJa": "300gのコシのある厚手コート紙に両面マットPPを施し、光の反射と擦れを防ぐ上品なカード用紙ですか？",
          "taglineKo": "300g 탄탄한 고평량 스노우지에 양면 무광 코팅으로 빛 반사와 스크래치를 방지하는 베스트셀러인가요?",
          "descriptionZh": [
              "300克高密度纯木浆铜版原纸，纸身硬挺平直，不易折痕破损",
              "双面覆盖微米级触感哑膜，有效消除强光反光并隔绝水汽与指纹污渍",
              "全彩网点还原精确细腻，无论明艳红色还是深沉黑色都能呈现沉稳高级质感"
          ],
          "descriptionJa": [
              "坪量300gの高密度パルプ用紙で、折れ曲がりにくく端正な直線を保持",
              "両面に極薄マットラミネートを施し、反射光を抑えながら水滴や指紋汚れをしっかりガード",
              "色の再現性が極めて高く、鮮やかな祝祭カラーからシックな濃色まで深みのある発色"
          ],
          "descriptionKo": [
              "300g 고밀도 원지를 사용하여 구김이나 꺾임 없이 빳빳하고 단단한 그립감 제공",
              "양면 매트 무광 라미네이팅으로 눈부신 빛 반사를 줄이고 지문과 습기 오염을 철저히 차단",
              "풀컬러 망점 재현력이 우수하여 선명한 원색부터 고급스러운 다크 톤까지 깔끔하게 구현"
          ],
          "bestForZh": [
              "年货礼包专属吊牌、新春促销双面彩色卡片、企业VIP感谢卡"
          ],
          "bestForJa": [
              "新春ギフト用下げ札、お正月セールのカラープロモーションカード、VIP感謝カード"
          ],
          "bestForKo": [
              "설날 선물 세트 전용 행택, 신년 기획 프로모션 미니 카드, VIP 고객 리워드 카드"
          ]
      },
      {
          "icon": "Sparkles",
          "name": "Fine Art Paper with Gold Foil",
          "nameVi": "Giấy Mỹ Thuật Cao Cấp Ép Kim",
          "tagline": "Textured art paper accented with 3D metallic gold foil for Year-End certificates of merit",
          "taglineVi": "Giấy mỹ thuật dày cao cấp vân nhám, ép kim vàng câu chúc vinh danh bằng khen và giấy chứng nhận cuối năm",
          "description": [
              "Heavy European fine art paper with distinct elegant organic surface texture",
              "Radiant 3D gold or bronze metallic foil highlights for prestigious awards",
              "Archival-grade longevity preserving commemorative honours for years"
          ],
          "descriptionVi": [
              "Chất giấy mỹ thuật nhập khẩu cao cấp bề mặt sần nhẹ vân mộc mạc đẳng cấp",
              "Gia công ép kim nhũ vàng viền hoa văn cổ điển và chữ vinh danh xuất sắc",
              "Độ bền lưu trữ vĩnh cửu, trang trọng lồng khung kính trao tặng tại tiệc tất niên"
          ],
          "descriptionTraits": [
              "textured-art",
              "foil-accent",
              "thick-weight"
          ],
          "bestFor": [
              "Year-End merit certificates, gala awards, honorary acknowledgments"
          ],
          "bestForVi": [
              "Bằng khen vinh danh nhân viên xuất sắc, giấy chứng nhận đối tác vàng, tiệc Gala Tân Niên"
          ],
          "pureImage": "/images/product/art-foil.webp",
          "pureImages": [
              "/images/product/art-foil.webp",
              "/images/category/toroisoluongit.webp",
              "/images/category/toroi.webp"
          ],
          "nameZh": "高档特种艺术纸 + 3D立体烫金 (年终表彰荣誉证书)",
          "nameJa": "最高級アート紙 + 3D金箔押し（年末表彰状・ディプロマ）",
          "nameKo": "최고급 파인아트 수입지 + 3D 골드박 후가공 (종무식 표창장/수료증)",
          "taglineZh": "手感粗粝沉稳的欧洲进口特种纸，点缀3D浮雕金属金箔，庄严颁发年终荣誉表彰？",
          "taglineJa": "重厚で気品ある特殊アート紙に、立体3D金箔押しが輝く格式高い表彰状・感謝状ですか？",
          "taglineKo": "기품 있는 수입 파인아트지에 3D 입체 금박 테두리를 더해 한 해의 노고를 기리는 최고 권위의 표창장인가요?",
          "descriptionZh": [
              "进口高克重纯棉或亚麻特种艺术纸，质地厚重挺直，自带天然质朴纹理",
              "边框与核心荣誉文字施加3D立体亮金烫箔，金属折光凌厉璀璨，威严高贵",
              "无酸环保抗氧化配方，保存数十年不变黄脆化，装裱入实木玻璃画框尊荣常青"
          ],
          "descriptionJa": [
              "ヨーロッパ伝統の厚手ファインアート紙を使用し、独特のオーガニックな紙肌が格式の高さを証明",
              "賞状の伝統的な唐草飾り枠や表彰タイトルに3D立体ゴールド箔を施し、眩い輝きで栄誉を称える",
              "変色しにくい中性紙アーカイブ仕様で、長期保管や額装保存に最適な永続性"
          ],
          "descriptionKo": [
              "유럽 전통의 두터운 코튼 파인아트 수입지로 자연스러운 엠보 질감과 묵직한 중량감 선사",
              "화려한 클래식 문양 테두리와 표창 타이틀에 3D 입체 골드박을 가공하여 압도적인 권위와 위엄",
              "오랜 세월 변색되지 않는 중성 보존 용지로 유리 액자에 담아 평생 소장할 수 있는 기념비적 완성도"
          ],
          "bestForZh": [
              "企业年终杰出员工表彰证书、年度战略金牌合作伙伴奖状、新春年会颁奖礼"
          ],
          "bestForJa": [
              "年度末の優秀社員表彰状、ゴールドパートナー認定証、年間アワード表彰式"
          ],
          "bestForKo": [
              "연말 종무식 우수 임직원 표창장, 최우수 파트너사 위촉장, 신년 킥오프 어워즈 공로패"
          ]
      }
    ]
  },
  {
    "id": "poster-bangron-standee",
    "categoryId": "tet",
    "titleVi": "Poster - Băng rôn - Standee",
    "titleEn": "Posters - Banners - Standees",
    "titleZh": "海报 - 横幅 - 展架",
    "titleJa": "ポスター・横断幕・看板",
    "titleKo": "포스터 - 현수막 - 배너거치대",
    "descriptionVi": "Băng rôn chúc mừng năm mới khổ lớn, standee tiệc tất niên và hashtag chụp hình check-in lưu giữ kỷ niệm xuân.",
    "descriptionEn": "Large Lunar New Year street banners, Year-End Party standees, and festive photo prop hashtags.",
    "coverImage": "/images/category/poster-bangron-standee.webp",
    "shapes": [
      {
        "id": "bang-ron-hiflex",
        "nameVi": "Băng rôn Hiflex",
        "nameEn": "Hiflex Spring Festival Banners",
        "nameZh": "新春大红Hiflex横幅",
        "nameJa": "新春ターポリン横断幕",
        "nameKo": "새해 맞이 하이플렉스 현수막",
        "descriptionVi": "Bạt Hiflex khổ lớn chúc mừng năm mới treo ngang đường phố, cổng chào rực rỡ đón xuân tài lộc.",
        "descriptionEn": "Heavy-duty outdoor PVC banners welcoming the Lunar New Year across streets and gates.",
        "image": "/images/category/poster-bangron-standee.webp"
      },
      {
        "id": "hashtag-cam-tay",
        "nameVi": "Hashtag cầm tay",
        "nameEn": "Handheld Photo Hashtags",
        "nameZh": "新年拍照手牌Hashtag",
        "nameJa": "手持ちフォトプロップス",
        "nameKo": "신년 촬영 해시태그 피켓",
        "descriptionVi": "Biển chụp hình check-in tiệc tất niên Year End Party, Gala mừng xuân bế theo hình linh vật, câu chúc Tết.",
        "descriptionEn": "Custom-cut handheld photo props for corporate Year-End Galas and festive photo booths.",
        "image": "/images/category/hashtagcamtay.webp"
      },
      {
        "id": "hashtag-tay-cam-roi",
        "nameVi": "Hashtag tay cầm rời",
        "nameEn": "Detachable Handle Hashtags",
        "nameZh": "可拆卸手柄新年手牌",
        "nameJa": "持ち手分離型フォトプロップス",
        "nameKo": "분리형 손잡이 해시태그 피켓",
        "descriptionVi": "Quy cách cán rời gắn khớp tiện xếp gọn mang đi sự kiện xa, đóng thùng vận chuyển không lo gãy hỏng.",
        "descriptionEn": "Flat-pack detachable handle photo props easy to transport to distant event venues.",
        "image": "/images/category/hashtagtaycamroi.webp"
      }
    ],
    "materials": [
      {
          "icon": "Layers",
          "name": "PP Film (Polypropylene)",
          "nameVi": "Poster chất liệu PP",
          "tagline": "High-resolution PP synthetic paper for indoor posters and roll-up banners",
          "taglineVi": "Giấy nhựa PP tổng hợp láng mịn, in độ phân giải cao cho poster trong nhà và standee cuộn",
          "description": [
              "Super-smooth synthetic paper base with zero visible paper fibers",
              "Rich, high-density color reproduction for photo-realistic graphics",
              "Coated with protective matte or glossy lamination against scratches"
          ],
          "descriptionVi": [
              "Bề mặt giấy nhựa tổng hợp siêu mịn, không lộ xơ giấy",
              "Tái tạo màu sắc chân thực chuẩn sắc nét đến từng chi tiết ảnh",
              "Cán màng mờ hoặc màng bóng bảo vệ bề mặt chống trầy xước nước nhẹ"
          ],
          "descriptionTraits": [
              "smooth-base",
              "digital-precision",
              "glossy-coat"
          ],
          "bestFor": [
              "Indoor event roll-up banners, cinema posters, showroom displays"
          ],
          "bestForVi": [
              "Standee cuộn sự kiện, poster rạp chiếu phim, biển quảng cáo showroom"
          ],
          "pureImage": "/images/category/poster-bangron-standee.webp",
          "pureImages": [
              "/images/category/poster-bangron-standee.webp",
              "/images/hero/mayinngoaitroi.webp",
              "/images/hero/slide-1.jpg"
          ],
          "nameZh": "PP合成纸海报 (Polypropylene)",
          "nameJa": "PP合成紙ポスター（ポリプロピレン）",
          "nameKo": "PP 합성지 포스터 (롤업 배너용)",
          "taglineZh": "需要平滑细腻、微喷色彩饱和且适用于室内易拉宝与海报的优质PP纸吗？",
          "taglineJa": "紙の繊維がなく高精細、屋内のロールアップバナーやポスターに最適なPP合成紙をお探しですか？",
          "taglineKo": "종이 결 없이 매끄럽고 발색이 선명하여 실내 롤업 배너 및 포스터에 최적인 PP 합성지인가요?",
          "descriptionZh": [
              "超平滑高分子聚丙烯基材，纸面细腻无任何可见纸张纤维",
              "高密度12色微喷写真输出，真实还原照片级细腻画质与艳丽色彩",
              "表面覆盖高透明哑膜或光膜，防刮擦防轻微泼水，卷曲不易变形"
          ],
          "descriptionJa": [
              "超平滑なポリプロピレン基材で、紙の繊維感がなく極めて滑らかな表面",
              "高密度・高精細カラー出力により、写真のような忠実な色彩再現性を実現",
              "マットまたは光沢PPラミネート加工で表面を保護し、擦れや水滴を防ぐ"
          ],
          "descriptionKo": [
              "초평활 합성 수지 원단으로 종이 섬유 결 없이 매끄러운 프리미엄 표면",
              "고밀도 컬러 출력으로 사진 수준의 선명하고 깊이 있는 색감 완벽 구현",
              "표면 무광/유광 코팅으로 스크래치와 생활 방수를 방지하며 컬링 현상 억제"
          ],
          "bestForZh": [
              "室内活动易拉宝、商场促销海报、影院立牌及高端展厅背景陈列"
          ],
          "bestForJa": [
              "屋内イベント用ロールアップバナー、映画館ポスター、ショールーム展示看板"
          ],
          "bestForKo": [
              "실내 행사 롤업 배너, 영화관 포스터, 쇼룸 홍보 디스플레이 및 백드롭"
          ]
      },
      {
          "icon": "Shield",
          "name": "Hiflex PVC Banner",
          "nameVi": "Băng rôn Hiflex",
          "tagline": "Durable waterproof PVC vinyl for large outdoor banners and hoardings",
          "taglineVi": "Bạt PVC dẻo dai chống thấm nước 100%, chịu mưa nắng chuyên cho băng rôn ngoài trời",
          "description": [
              "Reinforced PVC fabric withstands heavy rain, direct sunlight, and wind",
              "Most economical solution for large-scale outdoor visibility",
              "Finished with reinforced hemmed edges and brass eyelets for easy hanging"
          ],
          "descriptionVi": [
              "Chất liệu bạt PVC cốt sợi chịu lực tốt trước nắng gắt và mưa bão",
              "Giải pháp tiết kiệm ngân sách nhất cho quảng cáo diện rộng ngoài trời",
              "Hoàn thiện gấp mép dán gia cường và đóng khoen nhôm tiện xỏ dây treo"
          ],
          "descriptionTraits": [
              "waterproof-durability",
              "thick-weight"
          ],
          "bestFor": [
              "Street banners, construction fences, grand opening announcements"
          ],
          "bestForVi": [
              "Băng rôn ngang đường, hàng rào công trình, banner khai trương cửa hàng"
          ],
          "pureImage": "/images/category/poster-bangron-standee.webp",
          "pureImages": [
              "/images/hero/mayinngoaitroi.webp",
              "/images/category/poster-bangron-standee.webp",
              "/images/hero/mayinoffset.webp"
          ],
          "nameZh": "Hiflex户外防雨防晒喷绘布 (PVC Banner)",
          "nameJa": "ターポリン・ハイフレックス屋外横断幕 (PVC)",
          "nameKo": "하이플렉스 대형 옥외 현수막 (방수 PVC)",
          "taglineZh": "需要坚韧耐撕裂、100%防水防风、适合大面积户外广告的高性价比喷绘布吗？",
          "taglineJa": "強風や雨天にも耐え、100%完全防水で長期の屋外掲示に耐える高コスパ幕をお探しですか？",
          "taglineKo": "비바람과 자외선에 강하고 100% 완전 방수로 장기간 옥외 홍보에 최적인 실속형 현수막인가요?",
          "descriptionZh": [
              "内夹高强聚酯纤维网层，抗拉力极强，抵御户外强风、暴雨与烈日暴晒",
              "大面积户外品牌宣传最具成本效益的解决方案，视认距离远",
              "四周热合加厚折边工艺，压铆高强度金属打孔扣眼，方便拉绳悬挂"
          ],
          "descriptionJa": [
              "ポリエステル繊維補強のPVC素材で、強風・豪雨・直射日光に耐える高耐久仕様",
              "広範囲の屋外広告において最もコストパフォーマンスに優れた実力派",
              "周囲を折り返して補強溶着し、ハトメ（真鍮穴）加工済みで簡単にロープ結束可能"
          ],
          "descriptionKo": [
              "폴리에스터 메쉬 보강 PVC 원단으로 거센 바람과 폭우, 자외선에도 끄떡없는 내구성",
              "대형 옥외 광고 및 거리 홍보물 중 가장 경제적이고 확실한 시인성 제공",
              "사방 미싱/열접착 보강 및 아일렛(금속 구멍) 펀칭으로 로프 결속 용이"
          ],
          "bestForZh": [
              "过街横幅、建筑工地安全围挡广告、开业庆典及展会户外巨幅宣传"
          ],
          "bestForJa": [
              "道路横断幕、工事現場の仮囲いシート、店舗オープニング垂れ幕、屋外イベント"
          ],
          "bestForKo": [
              "거리 현수막, 공사 현장 펜스 배너, 매장 오픈 축하 대형 현수막, 옥외 홍보"
          ]
      },
      {
          "icon": "Sparkles",
          "name": "PP Mounted on 5mm Foam Board",
          "nameVi": "PP Bồi Formex 5mm (Hashtag & Standee)",
          "tagline": "Rigid lightweight foam board with high-res laminated PP graphics for event photo props",
          "taglineVi": "Tấm format dày 5mm cứng cáp bồi decal PP sắc nét, chuyên dụng cho hashtag check-in tiệc tất niên và mô hình chào xuân",
          "description": [
              "Rigid 5mm density PVC foam board holds its shape flat without bending",
              "Laminated with anti-glare matte film perfect for smartphone flash photography",
              "Precision CNC laser contour cutting to any cartoon mascot or slogan shape"
          ],
          "descriptionVi": [
              "Tấm format dày 5mm siêu nhẹ nhưng cứng cáp, cầm chắc tay không lo gãy gập",
              "Cán màng mờ chống lóa đèn flash máy ảnh, lên hình chụp check-in rực rỡ và rõ nét",
              "Cắt CNC bế bo theo đúng viền hình linh vật xuân, biểu tượng Tết và chữ cách điệu"
          ],
          "descriptionTraits": [
              "thick-weight",
              "digital-precision",
              "smooth-base"
          ],
          "bestFor": [
              "Handheld photo hashtags, Year-End Party photo booths, mascot cutouts"
          ],
          "bestForVi": [
              "Hashtag chụp ảnh check-in sự kiện, standee hình linh vật Tết, biển chào đón xuân"
          ],
          "pureImage": "/images/category/hashtagcamtay.webp",
          "pureImages": [
              "/images/category/hashtagcamtay.webp",
              "/images/category/hashtagtaycamroi.webp",
              "/images/category/ppboiformat.webp"
          ],
          "nameZh": "5mm高密度KT板/雪弗板裱PP (新春拍照道具/迎宾立牌)",
          "nameJa": "5mmスチレンボード貼りPPシート（新春フォトプロップス＆等身大パネル）",
          "nameKo": "5mm 고밀도 폼보드 합지 PP (신년 촬영 소품 해시태그 & 스탠디)",
          "taglineZh": "5mm厚度硬挺轻便、覆防反光哑膜、数控激光异形裁切的年会合影手牌与生肖立体展架？",
          "taglineJa": "厚み5mmで軽量かつ頑丈。反射しないマットPP加工で写真撮影に最適な新春フォトパネルですか？",
          "taglineKo": "5mm의 탄탄한 두께감에 가볍고, 카메라 플래시 눈부심이 없는 연말연시 촬영용 해시태그 피켓인가요?",
          "descriptionZh": [
              "5mm高密度环保PVC发泡板，结构平整硬挺不弯曲，手持轻巧长时间不累",
              "表面覆盖防眩光高透哑膜，闪光灯与手机补光拍摄均不反光，合影画面细腻出彩",
              "高精度数控雕刻机异形铣切，可贴合生肖吉祥物卡通轮廓、春联文字精准成型"
          ],
          "descriptionJa": [
              "厚さ5mmの高密度軽量ボードを採用し、たわみがなく手持ち撮影でも軽くて疲れない",
              "スマホのフラッシュや照明が反射しないノングレアマットラミネートで、SNS映えする綺麗な撮影を実現",
              "高精度CNCルーター加工により、干支キャラクターやメッセージの輪郭に沿って精密に異形カット"
          ],
          "descriptionKo": [
              "5mm 고밀도 압축 폼보드로 휘어짐 없이 견고하면서도 매우 가벼워 장시간 촬영 시에도 피로감 없음",
              "스마트폰 플래시나 조명 불빛이 반사되지 않는 무광 매트 코팅으로 SNS 인증샷 촬영에 최적화",
              "초정밀 CNC 레이저 장비로 새해 동물 캐릭터 및 캘리그라피 모양 그대로 매끄러운 자유형 외곽 재단"
          ],
          "bestForZh": [
              "企业尾牙年会合影拍照手牌、商场新年签到背景打卡道具、生肖立体卡通立牌"
          ],
          "bestForJa": [
              "忘年会・新年会の記念撮影用手持ちパネル、イベント受付の案内ボード、干支の等身大POP"
          ],
          "bestForKo": [
              "송년회 및 신년회 기념 촬영용 손피켓 해시태그, 행사 등록 데스크 웰컴 보드, 설맞이 마스코트 입간판"
          ]
      },
      {
        "icon": "Layers",
        "name": "Paper Decal Laminated (Couche Sticker)",
        "nameVi": "Decal Giấy Cán Màng (Chuẩn Nhãn Hàng)",
        "tagline": "Need the most cost-effective, vibrant sticker decal for dry indoor products?",
        "taglineVi": "Bạn cần tem decal giấy sắc nét, kinh tế nhất cho sản phẩm khô và bao bì?",
        "description": [
          "Smooth coated paper adhesive decal with protective matte or glossy lamination",
          "Vibrant CMYK printing that adheres firmly to paper boxes, jars, and bags",
          "Optimal choice for products stored in normal indoor temperature and humidity"
        ],
        "descriptionVi": [
          "Bề mặt láng mịn được cán màng mờ hoặc bóng bảo vệ chống trầy",
          "In màu CMYK sắc nét, bám dính chắc chắn lên hộp giấy, chai lọ và túi bao bì",
          "Lựa chọn tối ưu chi phí cho sản phẩm lưu trữ trong điều kiện nhiệt độ phòng"
        ],
        "descriptionTraits": [
          "smooth-base",
          "glossy-coat",
          "soft-light"
        ],
        "bestFor": [
          "Food packaging boxes, confectionery jars, and bakery containers",
          "Dry cosmetic jars, perfume cartons, and candle vessels",
          "Shipping parcel address labels and promotional giveaway stickers"
        ],
        "bestForVi": [
          "Hộp bao bì thực phẩm, hũ bánh kẹo và hộp đồ ăn khô",
          "Hũ mỹ phẩm khô, vỏ hộp nước hoa và cốc nến thơm tinh dầu",
          "Nhãn dán địa chỉ gói hàng bưu phẩm và sticker khuyến mãi tặng kèm"
        ],
        "nameZh": "铜版纸不干胶覆膜（标准商品贴纸）",
        "nameJa": "アート紙シール PPラミネート加工（定番ラベル）",
        "nameKo": "코팅 코팅지 유포지 라벨 스티커",
        "taglineZh": "大批量张贴于纸箱、干燥包装袋的经济型全彩贴纸？",
        "taglineJa": "段ボールや乾いたパッケージに貼る、高コスパなカラーシールですか？",
        "taglineKo": "박스나 건조 포장재에 부착하는 대량 가성비 컬러 스티커인가요?",
        "descriptionZh": [
          "高白度不干胶面纸，全彩印刷后表面覆盖哑膜或光膜",
          "背胶初粘力强，贴合平整牢固，不易翘边起角",
          "支持任意尺寸切平张或成卷，适配手工贴标或半自动贴标"
        ],
        "descriptionJa": [
          "白色度の高いシール紙に高精細カラー印刷、表面にラミネート加工",
          "初期粘着力が高く、一度貼れば角浮きせずしっかり密着",
          "シート仕上げまたはロール仕上げに対応、手作業・機械貼付の両方に適合"
        ],
        "descriptionKo": [
          "백색도가 뛰어난 스티커 전용지에 인쇄 후 무광/유광 코팅 마감",
          "초기 접착력이 우수하여 들뜸이나 떨어짐 없이 탄탄하게 부착",
          "재단 낱장형 또는 롤형 공급 가능하여 수작업 및 기계 라벨링 완벽 지원"
        ],
        "bestForZh": [
          "纸箱外箱标志、产品外包装封口及快递发货贴纸",
          "商场超市商品全彩宣传贴纸及折扣促销标签",
          "大批量使用、讲求性价比的干燥环境通用贴纸"
        ],
        "bestForJa": [
          "段ボールの表示ラベル、製品パッケージの封印シール",
          "店頭商品のプロモーションシール、セールス告知ステッカー",
          "乾燥した屋内で大量に使用する高コスパシール"
        ],
        "bestForKo": [
          "박스 외관 표기, 제품 상자 봉인용 라벨, 배송 스티커",
          "매장 상품 포인트 스티커, 할인 프로모션 홍보 라벨",
          "건조한 환경에서 대량으로 사용하는 다목적 가성비 스티커"
        ],
        "pureImage": "/images/product/couche.webp",
        "pureImages": [
          "/images/product/couche.webp",
          "/images/product/decal-laminate2.webp",
          "/images/product/decal-laminate1.webp"
        ]
      },
      {
        "icon": "Feather",
        "name": "Uncoated Writable Paper Decal (Ford)",
        "nameVi": "Decal Giấy Ford (Dễ Viết Tay & Đóng Dấu)",
        "tagline": "Want a writable sticker decal where you can fill in expiry dates or batch numbers?",
        "taglineVi": "Bạn muốn tem decal giấy mộc tự nhiên có thể viết tay ngày sản xuất hay hạn dùng?",
        "description": [
          "Natural uncoated Ford paper adhesive surface without lamination glare",
          "Absorbs ballpoint ink, markers, and date stamps immediately without smearing",
          "Authentic, artisanal aesthetic for handmade goods and organic products"
        ],
        "descriptionVi": [
          "Bề mặt mộc nhám tự nhiên, không tráng phủ hay cán màng",
          "Bám mực viết tay, bút bi, bút lông và dấu mộc ngày tháng không bị nhòe",
          "Thẩm mỹ thủ công chân thực cho sản phẩm handmade và đồ hữu cơ"
        ],
        "descriptionTraits": [
          "natural-grain",
          "soft-light",
          "foil-accent"
        ],
        "bestFor": [
          "Handmade bakery expiration stickers and harvest date labels",
          "Medical laboratory test tube labels and pharmacy prescriptions",
          "Artisan craft workshops and organic farmers' market packaging"
        ],
        "bestForVi": [
          "Sticker ghi ngày sản xuất, hạn sử dụng cho bánh ngọt thủ công",
          "Nhãn dán ống nghiệm phòng xét nghiệm và nhãn toa thuốc nhà thuốc",
          "Sản phẩm thủ công truyền thống và nông sản sạch tự nhiên"
        ],
        "nameZh": "书写纸不干胶（易于盖章与圆珠笔书写）",
        "nameJa": "上質紙シール（スタンプ・筆記適性抜群）",
        "nameKo": "모조지 스티커 (스탬프 날인 및 필기용)",
        "taglineZh": "需要现场盖印检验章、手写有效期或装箱数量的标签？",
        "taglineJa": "検印スタンプや手書きでメモを書き加えたい管理用シールですか？",
        "taglineKo": "검사 도장을 찍거나 유통기한을 펜으로 직접 적을 스티커인가요?",
        "descriptionZh": [
          "无涂层书写纸面层，墨水渗透吸收快，干燥迅速不蹭脏",
          "铅笔、圆珠笔、签字笔均可顺畅书写，盖印章印迹清晰",
          "背胶牢固耐温，适用于各类办公档案及仓储管理"
        ],
        "descriptionJa": [
          "表面が無塗工の上質紙で、インクの吸収が早く乾きやすい仕様",
          "鉛筆やボールペンでの書き込み、各種スタンプの押印に最適",
          "一度貼ればしっかり固定され、書類管理や在庫識別に便利"
        ],
        "descriptionKo": [
          "무광 비코팅 모조지 표면으로 잉크 흡수가 빠르고 번짐이 전혀 없음",
          "연필, 볼펜, 만년필 필기는 물론 스탬프 도장 날인에 최적화",
          "접착력이 강해 서류철, 보관 박스, 자산 관리 표기 시 영구 부착"
        ],
        "bestForZh": [
          "需要现场手写生产日期、保质期、批次号的货品标签",
          "企业文件档案分类标签、库房货架位置标识条",
          "检验员质检签名章、出厂合格证及设备保养贴"
        ],
        "bestForJa": [
          "製造年月日、賞味期限、ロット番号を手書きする商品ラベル",
          "オフィス書類のインデックス、倉庫ラックの棚番表示",
          "検品合格証、検査スタンプ用ラベル、保守点検ステッカー"
        ],
        "bestForKo": [
          "제조일자, 유통기한, 담당자 이름을 펜으로 직접 수기하는 라벨",
          "사무용 바인더 라벨, 창고 랙 번호 및 물품 분류 스티커",
          "품질 검사원 합격 도장 날인용 씰 및 설비 정기 점검표"
        ],
        "pureImage": "/images/product/ford.webp",
        "pureImages": [
          "/images/product/ford.webp",
          "/images/product/decal-ford2.webp",
          "/images/product/decal-ford3.webp"
        ]
      },
      {
        "icon": "ShieldCheck",
        "name": "100% Waterproof Transparent PVC Decal",
        "nameVi": "Decal Nhựa Trong Suốt (Chống Nước 100%)",
        "tagline": "Need a clear, invisible waterproof decal that lets your product show through?",
        "taglineVi": "Bạn cần tem decal trong suốt chống nước 100%, nhìn thấu màu sản phẩm bên trong?",
        "description": [
          "Transparent synthetic PVC/PET film with strong water-resistant adhesive",
          "Creates a seamless 'no-label' printed directly on bottle look",
          "100% waterproof and tear-resistant, ideal for wet bathroom or chilled use"
        ],
        "descriptionVi": [
          "Trong suốt với lớp keo chống thấm nước vượt trội",
          "Tạo hiệu ứng 'nhãn tàng hình' như được in trực tiếp lên bề mặt chai lọ",
          "Chống nước 100% và không rách, hoàn hảo cho môi trường phòng tắm hoặc ướp lạnh"
        ],
        "descriptionTraits": [
          "waterproof-durability",
          "smooth-base",
          "glossy-coat"
        ],
        "bestFor": [
          "Clear glass beverage bottles, cold-pressed juice jars, and milk tea cups",
          "Shampoo, shower gel, and skincare cosmetics used in bathrooms",
          "Window decal branding and transparent gift box seals"
        ],
        "bestForVi": [
          "Chai thủy tinh nước giải khát, chai nước ép lạnh và ly trà sữa",
          "Chai dầu gội, sữa tắm và mỹ phẩm sử dụng trong môi trường ẩm ướt",
          "Sticker dán kính cửa hàng và tem niêm phong hộp quà trong suốt"
        ],
        "nameZh": "超透PVC透明不干胶（防水耐撕）",
        "nameJa": "高透明PVC耐水ステッカー（完全防水仕様）",
        "nameKo": "100% 완전 방수 투명 PVC 데칼 스티커",
        "taglineZh": "想要若隐若现如同直接印刷在瓶身玻璃上的透明无边感？",
        "taglineJa": "ボトルの下地が透けて見え、直接印刷したような透明シールですか？",
        "taglineKo": "유리병이나 용기 표면에 직접 인쇄한 듯 투명하고 깔끔한 라벨인가요?",
        "descriptionZh": [
          "采用高透明光学级PVC塑料基材，透光率极佳",
          "贴在玻璃或透明瓶身时如同无缝直接丝网印刷",
          "100%防水防潮防油，撕扯不破，耐脏污耐擦洗"
        ],
        "descriptionJa": [
          "高い透明度を誇るクリアPVCフィルムを使用し、下地がそのまま透ける",
          "ガラス瓶やクリアボトルに貼ると、まるで直接印刷したような一体感",
          "100%完全耐水・耐油性で、破れにくく水拭き清掃も安心"
        ],
        "descriptionKo": [
          "투명도가 뛰어난 광학급 투명 PVC 재질로 배경이 그대로 투과",
          "유리병이나 투명 용기에 부착 시 용기에 직접 인쇄한 듯 일체감 선사",
          "100% 완전 방수, 방유, 찢김 방지 재질로 오염 시 물세척 가능"
        ],
        "bestForZh": [
          "玻璃门窗展示贴、透明饮料瓶、冷萃咖啡瓶标签",
          "护肤品透明乳液瓶、香薰精油瓶及手工香水瓶贴",
          "追求轻盈、前卫、现代极简裸妆视觉的产品包装"
        ],
        "bestForJa": [
          "ガラス窓の店舗サイン、透明ボトル、コールドブリューコーヒー",
          "コスメボトル、アロマオイル瓶、ハンドメイド香水ラベル",
          "透明感を活かしたミニマルで洗練された商品パッケージ"
        ],
        "bestForKo": [
          "유리창 쇼윈도 매장 데칼, 투명 페트병, 콜드브루 커피 라벨",
          "화장품 에센스 보틀, 디퓨저 유리병, 수제 향수 라벨",
          "투명한 용기의 내용물 색상을 그대로 살리는 감각적인 디자인"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/decaltrongsuot.webp",
        "pureImages": [
          "/images/product/decaltrongsuot.webp",
          "/images/product/decal-pvc2.webp",
          "/images/product/decal-pvc3.webp"
        ]
      },
      {
        "icon": "Award",
        "name": "White Synthetic PVC Plastic Decal",
        "nameVi": "Decal Nhựa Trắng Sữa (Siêu Bền Chống Nước)",
        "tagline": "Need an indestructible white plastic sticker for refrigerated or chemical products?",
        "taglineVi": "Bạn cần tem nhựa trắng sữa chống rách, chịu lạnh và nước cho chai lọ thủy hải sản?",
        "description": [
          "Opaque white synthetic plastic film with exceptional durability and opacity",
          "Resists ice, freezing temperatures, condensation, and chemical oils",
          "Vibrant CMYK colors stay sharp even after months in cold storage"
        ],
        "descriptionVi": [
          "Màng nhựa tổng hợp màu trắng sữa đục, độ bền kéo và độ che phủ tuyệt đối",
          "Chịu nước đá, nhiệt độ cấp đông, nước đọng và hóa chất dầu mỡ cực tốt",
          "Màu in CMYK sắc nét, không phai kể cả sau nhiều tháng bảo quản lạnh"
        ],
        "descriptionTraits": [
          "waterproof-durability",
          "smooth-base",
          "glossy-coat"
        ],
        "bestFor": [
          "Frozen seafood packaging, ice cream containers, and chilled dairy goods",
          "Automotive chemical lubricants, industrial oils, and cleaning spray bottles",
          "Outdoor machinery warning labels and weatherproof equipment stickers"
        ],
        "bestForVi": [
          "Bao bì hải sản đông lạnh, hộp kem và các sản phẩm sữa ướp lạnh",
          "Chai nhớt xe cộ, hóa chất công nghiệp và chai xịt tẩy rửa gia dụng",
          "Nhãn cảnh báo trên máy móc ngoài trời và tem thiết bị chịu thời tiết"
        ],
        "nameZh": "哑白/亮白合成纸PP塑料不干胶",
        "nameJa": "白塩ビ合成紙ステッカー（耐候性・耐水性抜群）",
        "nameKo": "유백색 방수 합성 유포지 스티커",
        "taglineZh": "常年经受冷水浸泡、冷藏冷冻依然牢固不脱胶不掉色？",
        "taglineJa": "水濡れや冷蔵・冷凍環境でも剥がれず破れない高耐久シールですか？",
        "taglineKo": "물에 젖거나 냉동 보관해도 떨어지지 않는 100% 방수 유포지 스티커인가요?",
        "descriptionZh": [
          "特种合成塑料薄膜面层，具有超强韧性，手工用力拉扯不破",
          "优异的防水、防潮、抗冷凝水性能，冰桶浸泡不掉胶不卷边",
          "表面平滑洁白，印刷色彩对比度极高，户外耐候性极佳"
        ],
        "descriptionJa": [
          "引き裂き強度の高い合成樹脂フィルムを採用、手で引っ張っても破れない",
          "水や湿気、結露に極めて強く、氷水や冷蔵庫に入れても剥がれない",
          "滑らかな純白のベース紙で、発色が鮮明で屋外での耐候性も抜群"
        ],
        "descriptionKo": [
          "질기고 강력한 합성 유포지 소재로 손으로 힘껏 잡아당겨도 절대 안 찢어짐",
          "탁월한 방수 및 결로 방지 성능으로 얼음물에 담가도 라벨이 분리되지 않음",
          "새하얀 베이스에서 뿜어져 나오는 선명한 색감과 뛰어난 내구성"
        ],
        "bestForZh": [
          "冷冻生鲜食品、冰镇啤酒饮料、冷藏奶制品标签",
          "潮湿浴室使用的沐浴露、洗发水及家庭日化清洁剂瓶贴",
          "户外仪器设备铭牌、电动车及工业管道警示标识贴"
        ],
        "bestForJa": [
          "冷凍食品、クラフトビール、要冷蔵乳製品のラベル",
          "シャンプーやボディソープなど浴室で使う水回りボトル",
          "屋外機器の銘板シール、機械・配管の注意警告ステッカー"
        ],
        "bestForKo": [
          "냉동 밀키트, 냉장 맥주 및 탄산음료, 유제품 방수 라벨",
          "욕실에서 물을 상시 접하는 샴푸, 바디워시 용기 라벨",
          "야외 노출 산업 장비 명판, 전자기기 및 배관 안전 경고 스티커"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/decaltrangsua.webp",
        "pureImages": [
          "/images/product/decaltrangsua.webp",
          "/images/product/decal-white1.webp",
          "/images/product/decal-white3.webp"
        ]
      },
      {
        "icon": "Sparkles",
        "name": "Custom Die-Cut Shape Decal + Foil",
        "nameVi": "Decal Bế Theo Hình Dáng Bất Kỳ + Ép Kim",
        "tagline": "Want custom contour-cut stickers with shimmering metallic foil logo accents?",
        "taglineVi": "Bạn muốn tem decal bế theo hình dáng độc quyền kèm ép kim logo lấp lánh?",
        "description": [
          "Precision digital die-cutting following any intricate logo outline or shape",
          "Combined with hot foil stamping in gold, silver, or holographic metallic sheen",
          "Delivered on easy-peel kiss-cut sheets or individual promotional sticker die-cuts"
        ],
        "descriptionVi": [
          "Bế cắt kỹ thuật số viền chính xác theo mọi hình dáng logo hay hoa văn phức tạp",
          "Kết hợp ép kim nhũ vàng, nhũ bạc hoặc nhũ holographic lấp lánh điểm nhấn",
          "Bàn giao dạng tờ cấn màng xé (Kiss-cut sheet) hoặc cắt rời từng hình (Die-cut)"
        ],
        "descriptionTraits": [
          "foil-accent",
          "embossed-depth",
          "glossy-coat"
        ],
        "bestFor": [
          "Luxury wine bottles, perfume seals, and high-end cosmetic labels",
          "Branded promotional stickers for skateboards, laptops, and water bottles",
          "Limited-edition holiday gift seals and VIP packaging authentication"
        ],
        "bestForVi": [
          "Nhãn chai rượu vang sang trọng, tem niêm phong nước hoa và mỹ phẩm VIP",
          "Sticker nhận diện thương hiệu dán laptop, bình nước, mũ bảo hiểm quà tặng",
          "Tem niêm phong quà Tết giới hạn và chứng nhận hàng chính hãng"
        ],
        "nameZh": "任意异形精准模切 + 局部电化铝烫金",
        "nameJa": "自由形状ダイカット + 箔押し加工シール",
        "nameKo": "자유형 도무송 다이컷 + 금박 후가공 스티커",
        "taglineZh": "贴纸裁切成品牌独特形状，辅以闪耀烫金工艺？",
        "taglineJa": "ブランド独自の形状にカットし、箔押しで高級感をプラスしたシールですか？",
        "taglineKo": "로고 모양 그대로 맞춤 재단하고 금박을 입힌 프리미엄 스티커인가요?",
        "descriptionZh": [
          "精准数控模切刀线，可切割成任意不规则曲线或品牌专属图形",
          "局部结合烫亮金、哑金、烫镭射或银箔工艺，闪烁金属光芒",
          "排废干净整齐，剥离撕取顺畅不粘连"
        ],
        "descriptionJa": [
          "高精度ダイカット技術で、ハートやキャラクターなど自由な形状にカット",
          "金・銀・ホログラム箔押しを組み合わせて、眩いメタリックの輝きをプラス",
          "カス取りが綺麗に処理され、指先でサッと剥がしやすい快適仕様"
        ],
        "descriptionKo": [
          "초정밀 레이저 도무송 가공으로 캐릭터나 브랜드 로고 모양 그대로 재단",
          "골드박, 실버박, 홀로그램박 등 메탈릭 광택 후가공을 결합한 화려함",
          "여백이 깔끔하게 탈착되어 손쉽게 떼어내 부착할 수 있는 완성도"
        ],
        "bestForZh": [
          "文创IP周边、卡通插画贴纸、潮牌潮流手账贴",
          "高端礼盒封口贴、奢侈品VIP防拆封口贴",
          "为产品增添趣味性、收藏价值与高辨识度的创意贴标"
        ],
        "bestForJa": [
          "キャラクターグッズ、イラストレーターの限定ステッカー",
          "ギフトラッピングの封印シール、プレミアム会員向け特典シール",
          "高いデザイン性とコレクター価値を持つオリジナルシール"
        ],
        "bestForKo": [
          "인기 캐릭터 굿즈, 다이어리 꾸미기(다꾸) 스티커, 패션 브랜드 씰",
          "스페셜 기프트 박스 봉인 스티커, VIP 브랜드 리워드 굿즈",
          "독창적인 조형미와 반짝이는 금빛으로 소장 가치를 높인 라벨"
        ],
        "hideFoilCheckbox": true,
        "pureImage": "/images/product/decal-foil1.webp",
        "pureImages": [
          "/images/product/decal-foil1.webp",
          "/images/product/decal-foil2.webp",
          "/images/product/decal-foil3.webp"
        ]
      },
      {
        "icon": "Palette",
        "name": "Korean Art Canvas (Wooden Frame)",
        "nameVi": "Canvas Hàn Quốc (Khung Gỗ)",
        "tagline": "Gallery-quality wall canvas to elevate living spaces",
        "taglineVi": "Tranh canvas chất lượng phòng tranh làm đẹp không gian sống",
        "description": [
          "Imported Korean cotton canvas with natural woven texture",
          "UV eco-solvent inks offer vibrant color and 10+ year fade resistance",
          "Stretched over solid kiln-dried pine wood frame ready to hang"
        ],
        "descriptionVi": [
          "Vải canvas cotton Hàn Quốc có vân dệt vải tự nhiên",
          "Mực in UV sắc nét, kháng nước, bền màu trên 10 năm",
          "Căng khung gỗ thông tự nhiên đã qua sấy chống mối mọt"
        ],
        "descriptionTraits": [
          "textured-art",
          "waterproof-durability",
          "soft-light"
        ],
        "bestFor": [
          "Family portraits and wedding wall photos",
          "Living room, bedroom and home office decoration",
          "Housewarming and anniversary gifts"
        ],
        "bestForVi": [
          "Ảnh gia đình, ảnh cưới phóng lớn trang trí phòng khách",
          "Tranh trang trí phòng ngủ, góc làm việc cá nhân",
          "Quà tặng tân gia, sinh nhật, kỷ niệm đầy ý nghĩa"
        ],
        "nameZh": "韩国精编油画布（实木内框）",
        "nameJa": "韓国製アートキャンバス（天然木枠）",
        "nameKo": "한국산 고급 캔버스 (원목 프레임)",
        "taglineZh": "需要一幅微喷色彩准确、画布紧绷且长年不褪色的艺术挂画？",
        "taglineJa": "発色が美しく、耐久性に優れた本格的なキャンバスアートをお探しですか？",
        "taglineKo": "오랜 시간 변색 없이 갤러리 수준의 감동을 전할 캔버스 액자인가요?",
        "descriptionZh": [
          "高密度特制艺术油画布，搭配烘干防虫防蛀实木内框",
          "高精度12色艺术微喷，耐紫外线室内长年不褪色",
          "四周包边立体装裱，免外框直接悬挂，现代极简立体感"
        ],
        "descriptionJa": [
          "高密度な韓国製アートキャンバスと、防湿・防虫処理済みの天然木枠",
          "12色高精細ジークレープリントで、紫外線に強く色褪せない耐久性",
          "側面まで印刷を巻き込むギャラリーラップ仕様で、額縁なしでそのまま飾れる"
        ],
        "descriptionKo": [
          "한국산 프리미엄 고밀도 캔버스 원단과 건조 원목 내장 프레임",
          "12색 초정밀 지클리 피그먼트 출력으로 실내 영구 보존 및 자외선 변색 방지",
          "옆면까지 입체감 있게 감싸는 갤러리 랩 마감으로 프레임 없이 바로 거치"
        ],
        "bestForZh": [
          "现代家居客厅、卧室背景墙艺术装饰挂画",
          "精品酒店客房、高级餐厅与咖啡馆空间氛围营造",
          "婚纱照、家庭写真大片与个人艺术肖像陈列"
        ],
        "bestForJa": [
          "モダンリビング、ベッドルーム、オフィスのインテリアアート",
          "ホテル客室、カフェ、高級サロンの空間演出",
          "ウェディング写真、家族写真、アート写真のディスプレイ"
        ],
        "bestForKo": [
          "모던 거실, 침실 침대 헤드 벽면 인테리어 액자",
          "호텔 객실, 카페, 프라이빗 뷰티 살롱 벽면 데코",
          "대형 웨딩 본식 사진, 가족 기념사진 및 아티스틱 프로필 캔버스"
        ],
        "hideFoilCheckbox": true,
        "hideDoubleSidedCheckbox": true,
        "pureImage": "/images/product/canvascotton.webp",
        "pureImages": [
          "/images/product/canvascotton.webp",
          "/images/product/canvascotton2.webp",
          "/images/product/canvascotton3.webp"
        ]
      },
      {
        "icon": "Sparkles",
        "name": "Glitter Shimmer Canvas",
        "nameVi": "Canvas Ánh Kim Tuyến",
        "tagline": "Subtle shimmering canvas for dazzling art pieces",
        "taglineVi": "Vải canvas phủ kim tuyến lấp lánh nhẹ nhàng dưới ánh đèn",
        "description": [
          "Fine glitter particles woven into canvas surface catch ambient light",
          "High-definition 1200 DPI printing for crisp facial and landscape details",
          "Complete with composite floating frame in gold, black, or natural wood"
        ],
        "descriptionVi": [
          "Bề mặt phủ lớp kim tuyến mịn bắt sáng lấp lánh khi có ánh đèn",
          "Độ phân giải in 1200 DPI tái tạo chân thực từng chi tiết ảnh",
          "Kèm khung viền composite cao cấp (màu vàng đồng, đen hoặc vân gỗ)"
        ],
        "descriptionTraits": [
          "metallic-shine",
          "textured-art",
          "waterproof-durability"
        ],
        "bestFor": [
          "Glamour wedding and personal portrait prints",
          "Modern interior statement art pieces",
          "Luxury commemorative gifts"
        ],
        "bestForVi": [
          "Ảnh cưới nghệ thuật và ảnh chân dung cá nhân phong cách sang trọng",
          "Tranh nghệ thuật trang trí căn hộ cao cấp",
          "Quà tặng lưu niệm đẳng cấp cho bạn bè và người thân"
        ],
        "nameZh": "璀璨金葱闪粉艺术油画布",
        "nameJa": "ラメ入りキラキラキャンバス",
        "nameKo": "글리터 펄 캔버스 아트",
        "taglineZh": "画面在灯光照射下散发若隐若现的微光星尘效果？",
        "taglineJa": "光を受けるとキラキラと上品に輝く特別なキャンバスですか？",
        "taglineKo": "빛을 받으면 캔버스 표면에서 은은한 반짝임이 살아나는 액자극인가요?",
        "descriptionZh": [
          "画布织物表层嵌入细腻闪粉微粒，灯光照射下波光粼粼",
          "赋予夜景、星空、婚纱与珠宝画面神秘梦幻的立体微光",
          "防水抗污涂层保护，即使潮湿天气依然亮丽生辉"
        ],
        "descriptionJa": [
          "キャンバス生地に繊細なラメ粒子を織り込み、光を受けると上品に輝く",
          "夜景、星空、ウェディングドレス、宝石の煌めきをドラマチックに演出",
          "防汚・防湿コーティングで、美しい輝きを長期間キープ"
        ],
        "descriptionKo": [
          "캔버스 직물 표면에 미세한 글리터 펄 입자가 분사되어 빛에 따라 반짝임",
          "야경, 은하수, 순백의 웨딩드레스 사진에 신비롭고 몽환적인 감성 극대화",
          "방수 방습 코팅 처리로 습한 날씨에도 펄과 색감이 영구 보존"
        ],
        "bestForZh": [
          "璀璨夜景摄影、银河星空与唯美婚纱摄影作品",
          "高端美妆SPA、珠宝展厅及奢华会所空间艺术陈设",
          "追求与众不同梦幻光影效果的艺术爱好者"
        ],
        "bestForJa": [
          "夜景写真、天体写真、華やかなウェディングフォト",
          "ジュエリーサロン、エステサロン、ラグジュアリーラウンジ",
          "個性的な輝きと幻想的な空間を演出したいインテリア"
        ],
        "bestForKo": [
          "도시 야경 사진, 환상적인 별자리 및 은하수 풍경 사진",
          "웨딩 화보의 반짝이는 베일과 드레스 디테일 강조 액자",
          "주얼리 쇼룸, 프리미엄 뷰티 샵의 감각적인 오브제"
        ],
        "hideFoilCheckbox": true,
        "hideDoubleSidedCheckbox": true,
        "pureImage": "/images/product/vaikimtuyen.webp",
        "pureImages": [
          "/images/product/vaikimtuyen.webp",
          "/images/product/canvaskimtuyen2.webp",
          "/images/product/canvaskimtuyen3.webp"
        ]
      }
    ]
  }
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

export function getSubgroupById(id: string, categoryId?: string): SubgroupCategory | undefined {
  if (categoryId) {
    const directCat = SUBGROUPS_CATALOG.find((s) => s.id === id && s.categoryId === categoryId);
    if (directCat) return directCat;
    const aliasTarget = SUBGROUP_ALIASES[id];
    if (aliasTarget) {
      const matchedCat = SUBGROUPS_CATALOG.find((s) => s.id === aliasTarget && s.categoryId === categoryId);
      if (matchedCat) return matchedCat;
    }
  }
  const direct = SUBGROUPS_CATALOG.find((s) => s.id === id);
  if (direct) return direct;
  const aliasTarget = SUBGROUP_ALIASES[id];
  if (aliasTarget) {
    const matched = SUBGROUPS_CATALOG.find((s) => s.id === aliasTarget);
    if (matched) return matched;
  }
  return undefined;
}

export function getSubgroupsByCategory(catId: string): SubgroupCategory[] {
  return SUBGROUPS_CATALOG.filter((s) => s.categoryId === catId);
}
