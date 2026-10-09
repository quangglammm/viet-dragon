// data/tet-menu.ts
// Structured submenu data for "Ấn phẩm Tết" (Tet Publications) megamenu

export interface TetSubmenuItem {
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

export interface TetSubmenuGroup {
  id: string;
  titleVi: string;
  titleEn: string;
  titleZh?: string;
  titleJa?: string;
  titleKo?: string;
  href: string;
  image: string;
  items: TetSubmenuItem[];
}

export const TET_SUBMENU_COLUMNS: {
  id: string;
  groups: TetSubmenuGroup[];
}[] = [
  // Column 1: Lịch Để Bàn, Bao Lì Xì & Thiệp Mời
  {
    id: "col-calendars-lixi-invitations",
    groups: [
      {
        id: "calendars",
        titleVi: "Lịch Để Bàn - Calendars",
        titleEn: "Desk Calendars",
        titleZh: "台历桌历 - Calendars",
        titleJa: "卓上カレンダー - Calendars",
        titleKo: "탁상 달력 - Calendars",
        href: "/products/tet/lich-tet",
        image: "/images/category/lichdeban.webp",
        items: [
          {
            id: "calendar-desk-standard",
            nameVi: "Lịch để bàn",
            nameEn: "Desk Calendars",
            nameZh: "企业定制台历",
            nameJa: "スタンダード卓上カレンダー",
            nameKo: "기업 맞춤 탁상 달력",
            kind: "shape",
            href: "/products/tet/lich-tet#lich-de-ban",
            image: "/images/category/lichdebancon.webp",
          },
          {
            id: "calendar-desk-2026",
            nameVi: "Lịch để bàn 2026",
            nameEn: "Desk Calendars 2026",
            nameZh: "2026迎春新年台历",
            nameJa: "2026年 新春卓上カレンダー",
            nameKo: "2026 신년 탁상 달력",
            kind: "shape",
            href: "/products/tet/lich-tet#lich-ban-2026",
            image: "/images/category/lichdeban2026.webp",
          },
          {
            id: "calendar-magnetic-flexible",
            nameVi: "Lịch ảnh nam châm dẻo",
            nameEn: "Flexible Magnetic Photo Calendars",
            nameZh: "冰箱贴软磁相片日历",
            nameJa: "マグネットフォトカレンダー",
            nameKo: "자석 포토 캘린더 (냉장고용)",
            kind: "shape",
            href: "/products/tet/lich-tet#lich-nam-cham",
            image: "/images/category/lichanhnamchamdeo.webp",
          },
        ],
      },
      {
        id: "lixi",
        titleVi: "Bao Lì Xì",
        titleEn: "Lucky Money Envelopes",
        titleZh: "新年利是封/红包",
        titleJa: "お年玉・ポチ袋",
        titleKo: "새해 세뱃돈 봉투",
        href: "/products/tet/bao-li-xi",
        image: "/images/category/baolixi.webp",
        items: [
          {
            id: "lixi-standard",
            nameVi: "Bao Lì Xì",
            nameEn: "Standard Red Envelopes",
            nameZh: "经典新年红包",
            nameJa: "定番お年玉袋",
            nameKo: "클래식 세뱃돈 봉투",
            kind: "shape",
            href: "/products/tet/bao-li-xi#bao-li-xi-chuan",
            image: "/images/category/baolixi.webp",
          },
          {
            id: "lixi-2026",
            nameVi: "Bao lì xì 2026",
            nameEn: "Year 2026 Red Envelopes",
            nameZh: "2026蛇年专属利是封",
            nameJa: "2026年 干支ポチ袋",
            nameKo: "2026 신년 세뱃돈 봉투",
            kind: "shape",
            href: "/products/tet/bao-li-xi#bao-li-xi-2026",
            image: "/images/category/baolixi2026.webp",
          },
          {
            id: "lixi-foil-premium",
            nameVi: "Bao lì xì ép kim cao cấp",
            nameEn: "Premium Foil-Stamped Red Envelopes",
            nameZh: "烫金奢华特种纸红包",
            nameJa: "箔押し高級ポチ袋",
            nameKo: "금박 프리미엄 세뱃돈 봉투",
            kind: "shape",
            href: "/products/tet/bao-li-xi#bao-li-xi-ep-kim",
            image: "/images/category/baolixiepkimcaocap.webp",
          },
        ],
      },
      {
        id: "invitations",
        titleVi: "Thiệp Mời - Invitation Cards",
        titleEn: "Invitation Cards",
        titleZh: "邀请函请柬 - Invitation Cards",
        titleJa: "招待状 - Invitation Cards",
        titleKo: "초대장 - Invitation Cards",
        href: "/products/tet/thiep-tet",
        image: "/images/category/thiepmoi.webp",
        items: [
          {
            id: "invitation-event",
            nameVi: "Thiệp sự kiện",
            nameEn: "Event & Gala Invitations",
            nameZh: "企业年会晚宴请柬",
            nameJa: "イベント・パーティー招待状",
            nameKo: "행사 및 송년회 초대장",
            kind: "shape",
            href: "/products/tet/thiep-tet#thiep-su-kien",
            image: "/images/category/thiepsukien.webp",
          },
        ],
      },
    ],
  },

  // Column 2: Mác sản phẩm, Phiếu Quà Tặng & Nhãn Dán
  {
    id: "col-tags-vouchers-labels",
    groups: [
      {
        id: "tags",
        titleVi: "Mác sản phẩm - Product Tags",
        titleEn: "Product Tags & Hangtags",
        titleZh: "商品吊牌 - Product Tags",
        titleJa: "下げ札・タグ - Product Tags",
        titleKo: "상품 행택 - Product Tags",
        href: "/products/tet/mac-san-pham",
        image: "/images/category/tagsanphamtet.webp",
        items: [
          {
            id: "tag-product",
            nameVi: "Tag sản phẩm",
            nameEn: "Standard Product Tags",
            nameZh: "年货商品专属吊牌",
            nameJa: "商品ブランドタグ",
            nameKo: "설 선물 상품 태그",
            kind: "shape",
            href: "/products/tet/mac-san-pham#tag-san-pham",
            image: "/images/category/tagsanpham.webp",
          },
          {
            id: "tag-thank-you",
            nameVi: "Tag cảm ơn",
            nameEn: "Thank You Gift Tags",
            nameZh: "新年感谢感恩吊牌",
            nameJa: "サンキュー・感謝タグ",
            nameKo: "새해 감사 카드 택",
            kind: "shape",
            href: "/products/tet/mac-san-pham#tag-cam-on",
            image: "/images/category/tagcamontet.webp",
          },
        ],
      },
      {
        id: "vouchers",
        titleVi: "Phiếu Quà Tặng - Gift Vouchers",
        titleEn: "Gift Vouchers",
        titleZh: "新年礼品券 - Gift Vouchers",
        titleJa: "ギフト券・引换券",
        titleKo: "설 선물 상품권 / 바우처",
        href: "/products/tet/vouchers",
        image: "/images/category/phieuquatang.webp",
        items: [
          {
            id: "voucher-standard",
            nameVi: "Phiếu quà tặng phổ thông",
            nameEn: "Standard Gift Vouchers",
            nameZh: "通用春节代金券",
            nameJa: "スタンダード商品券",
            nameKo: "일반 명절 상품권 바우처",
            kind: "shape",
            href: "/products/tet/vouchers#phieu-qua-tang-pho-thong",
            image: "/images/category/phieuquatangphothong.webp",
          },
        ],
      },
      {
        id: "labels",
        titleVi: "Nhãn Dán - Decal Label",
        titleEn: "Decal Labels & Stickers",
        titleZh: "新年贴纸 - Decal Label",
        titleJa: "ラベル・シール - Decal Label",
        titleKo: "라벨 스티커 - Decal Label",
        href: "/products/tet/nhan-dan",
        image: "/images/category/nhandan.webp",
        items: [
          {
            id: "label-paper",
            nameVi: "Nhãn decal giấy",
            nameEn: "Paper Decal Labels",
            nameZh: "铜版纸年品标签",
            nameJa: "上質紙・アート紙シール",
            nameKo: "아트지 종이 라벨 스티커",
            kind: "material",
            href: "/products/tet/nhan-dan",
            image: "/images/product/decalgiay.webp",
            isFast: true,
          },
          {
            id: "label-plastic",
            nameVi: "Nhãn decal nhựa",
            nameEn: "Plastic / PVC Decal Labels",
            nameZh: "防水塑料年品贴纸",
            nameJa: "ユポ・PVC耐水プラシール",
            nameKo: "방수 플라스틱 데칼 라벨",
            kind: "material",
            href: "/products/tet/nhan-dan",
            image: "/images/product/decalnhua.webp",
            isFast: true,
          },
          {
            id: "label-kraft",
            nameVi: "Nhãn decal giấy Kraft",
            nameEn: "Kraft Paper Decal Labels",
            nameZh: "复古牛皮纸贴纸",
            nameJa: "ヴィンテージクラフトシール",
            nameKo: "크라프트지 데칼 라벨",
            kind: "material",
            href: "/products/tet/nhan-dan",
            image: "/images/product/decalgiaykraft.webp",
          },
          {
            id: "label-art-paper",
            nameVi: "Nhãn decal giấy mỹ thuật",
            nameEn: "Fine Art Paper Decal Labels",
            nameZh: "特种艺术纸质感标签",
            nameJa: "高級アート紙ラベル",
            nameKo: "고급 수입지 감성 라벨",
            kind: "material",
            href: "/products/tet/nhan-dan",
            image: "/images/product/decalgiaymythuat.webp",
          },
          {
            id: "label-metallic-foil",
            nameVi: "Nhãn decal xi bạc/vàng",
            nameEn: "Metallic Silver / Gold Decals",
            nameZh: "烫金银箔高端年品贴纸",
            nameJa: "金・銀ホイル耐熱ラベル",
            nameKo: "은데드롱 / 금광 데칼 라벨",
            kind: "material",
            href: "/products/tet/nhan-dan",
            image: "/images/product/decalxibac.webp",
          },
        ],
      },
    ],
  },

  // Column 3: Tờ rơi & Poster - Băng rôn - Standee
  {
    id: "col-flyers-posters",
    groups: [
      {
        id: "flyers",
        titleVi: "Tờ rơi - Flyers",
        titleEn: "Flyers & Certificates",
        titleZh: "宣传单/证书 - Flyers",
        titleJa: "チラシ・表彰状 - Flyers",
        titleKo: "전단지 / 상장 - Flyers",
        href: "/products/tet/to-roi",
        image: "/images/category/toroi.webp",
        items: [
          {
            id: "flyer-short-run",
            nameVi: "Tờ rơi số lượng ít",
            nameEn: "Short-run Digital Flyers",
            nameZh: "少量数码快印传单",
            nameJa: "小ロットオンデマンドチラシ",
            nameKo: "소량 디지털 전단지",
            kind: "shape",
            href: "/products/tet/to-roi#to-roi-so-luong-it",
            image: "/images/category/toroisoluongit.webp",
            isFast: true,
          },
          {
            id: "certificate-award",
            nameVi: "Bằng khen",
            nameEn: "Certificates of Merit & Awards",
            nameZh: "企业年终荣誉证书/奖状",
            nameJa: "表彰状・感謝状・ディプロマ",
            nameKo: "연말 표창장 / 상장",
            kind: "shape",
            href: "/products/tet/to-roi#bang-khen",
            image: "/images/category/bangkhen.webp",
          },
          {
            id: "ticket-wristband",
            nameVi: "Vòng tay sự kiện",
            nameEn: "Event Wristbands",
            nameZh: "年会活动防水手环",
            nameJa: "イベント用リストバンド",
            nameKo: "행사용 방수 손목 밴드",
            kind: "shape",
            href: "/products/tet/to-roi#vong-tay-su-kien",
            image: "/images/category/vongtaysukien.webp",
          },
        ],
      },
      {
        id: "posters-standee",
        titleVi: "Poster - Băng rôn - Standee",
        titleEn: "Posters - Banners - Standees",
        titleZh: "海报 - 横幅 - 展架",
        titleJa: "ポスター・横断幕・看板",
        titleKo: "포스터 - 현수막 - 배너거치대",
        href: "/products/tet/poster-bangron-standee",
        image: "/images/category/poster-bangron-standee.webp",
        items: [
          {
            id: "banner-hiflex",
            nameVi: "Băng rôn Hiflex",
            nameEn: "Hiflex Banners",
            nameZh: "Hiflex喷绘布横幅",
            nameJa: "ターポリン・ハイフレックス幕",
            nameKo: "하이플렉스 대형 현수막",
            kind: "material",
            href: "/products/tet/poster-bangron-standee/hashtag-cam-tay",
            image: "/images/category/poster-bangron-standee.webp",
          },
          {
            id: "poster-pp",
            nameVi: "Poster chất liệu PP",
            nameEn: "PP Material Posters",
            nameZh: "PP材质高清海报",
            nameJa: "PP合成紙ポスター",
            nameKo: "PP 합성지 포스터",
            kind: "material",
            href: "/products/tet/poster-bangron-standee/hashtag-cam-tay",
            image: "/images/product/posterchatlieupp.webp",
          },
          {
            id: "hashtag-handheld",
            nameVi: "Hashtag cầm tay",
            nameEn: "Handheld Photo Hashtags",
            nameZh: "新年拍照手牌Hashtag",
            nameJa: "手持ちフォトプロップス",
            nameKo: "신년 촬영 해시태그 피켓",
            kind: "shape",
            href: "/products/tet/poster-bangron-standee#hashtag-cam-tay",
            image: "/images/category/hashtagcamtay.webp",
          },
          {
            id: "hashtag-detachable",
            nameVi: "Hashtag tay cầm rời",
            nameEn: "Detachable Handle Hashtags",
            nameZh: "可拆卸手柄新年手牌",
            nameJa: "持ち手分離型フォトプロップス",
            nameKo: "분리형 손잡이 해시태그 피켓",
            kind: "shape",
            href: "/products/tet/poster-bangron-standee#hashtag-tay-cam-roi",
            image: "/images/category/hashtagtaycamroi.webp",
          },
        ],
      },
    ],
  },
];

