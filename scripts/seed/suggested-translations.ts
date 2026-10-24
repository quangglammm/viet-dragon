import type { MaterialTraitKey } from "@/data/material-traits";

// AI-SUGGESTED translations for the Chinese, Japanese and Korean text the site does not have yet. They are written
// from the Vietnamese and English sources, are NOT reviewed by a native reader, and are flagged everywhere:
//   * applied as revision 2 of each affected entity, with `SUGGESTION_COMMENT` (revision 1 keeps the original data);
//   * listed in full, with a "native reader approved" column, in the owner report.
// Everything else in zh/ja/ko already exists in the site's data. Terminology follows the words the site already uses
// (zh 烫金 / 压凸, ja 箔押し / エンボス, ko 박 / 엠보싱).

export const SUGGESTED_LOCALES = ["zh", "ja", "ko"] as const;
export type SuggestedLocale = (typeof SUGGESTED_LOCALES)[number];

export const SUGGESTION_COMMENT = "Bản dịch đề xuất (AI) — cần người bản ngữ duyệt";

export interface TraitText {
  label: string;
  description: string;
}

/** The trait glossary (an icon + label + explanation per material trait) has no zh/ja/ko today. */
export const TRAIT_SUGGESTIONS: Record<MaterialTraitKey, Record<SuggestedLocale, TraitText>> = {
  "glossy-coat": {
    zh: { label: "亮面涂层", description: "表面涂布光泽层，光线反射清晰如镜面。" },
    ja: { label: "グロスコート", description: "表面に光沢コートを施し、鏡のようにくっきりと光を反射します。" },
    ko: { label: "유광 코팅", description: "표면에 광택 코팅을 입혀 거울처럼 선명하게 빛을 반사합니다." },
  },
  "smooth-base": {
    zh: { label: "平滑底纸", description: "纸面平滑细腻，看不出纸张纹路。" },
    ja: { label: "なめらかな紙面", description: "紙目が目立たない、なめらかな下地です。" },
    ko: { label: "매끄러운 바탕", description: "종이 결이 보이지 않는 매끄러운 바탕입니다." },
  },
  "foil-accent": {
    zh: { label: "烫金点缀", description: "在表面烫印金属箔细节。" },
    ja: { label: "箔押しのアクセント", description: "表面に金属箔を押して、華やかなアクセントを加えます。" },
    ko: { label: "박 포인트", description: "표면에 금속 박을 눌러 찍어 포인트를 더합니다." },
  },
  "natural-grain": {
    zh: { label: "天然纸纹", description: "哑光表面，带有细腻自然的纸张纹理。" },
    ja: { label: "自然な紙目", description: "きめ細かな自然な紙目を持つ、マットな質感です。" },
    ko: { label: "자연스러운 종이 결", description: "고운 종이 결이 살아 있는 무광 표면입니다." },
  },
  "soft-light": {
    zh: { label: "柔和漫射光", description: "光线在表面均匀漫射，不眩光、不反光。" },
    ja: { label: "やわらかな拡散光", description: "光が表面で均一に拡散し、まぶしさや映り込みがありません。" },
    ko: { label: "부드러운 확산광", description: "빛이 표면에 고르게 퍼져 눈부심이나 반사가 없습니다." },
  },
  "textured-art": {
    zh: { label: "艺术纹理纸", description: "独特的触感纹理，带来手工艺术般的高级质感。" },
    ja: { label: "風合いのあるアート紙", description: "はっきりとした手触りの紙質が、職人的で上質な印象を与えます。" },
    ko: { label: "질감 있는 아트지", description: "뚜렷한 촉감의 종이 질감으로 수공예적이고 고급스러운 느낌을 줍니다." },
  },
  "metallic-shine": {
    zh: { label: "珠光金属光泽", description: "细腻的珠光质感，随光线变化呈现柔美色泽。" },
    ja: { label: "パールメタリックの輝き", description: "ほのかな真珠光沢が、光の角度で美しく表情を変えます。" },
    ko: { label: "펄 메탈릭 광택", description: "은은한 진주빛 광택이 빛에 따라 아름답게 변합니다." },
  },
  "waterproof-durability": {
    zh: { label: "防水塑料材质", description: "耐撕裂，100% 防水的合成基材。" },
    ja: { label: "防水プラスチック", description: "破れにくく、100%防水の合成素材です。" },
    ko: { label: "방수 플라스틱", description: "찢어짐에 강하고 100% 방수되는 합성 소재입니다." },
  },
  "embossed-depth": {
    zh: { label: "3D 压凸工艺", description: "为标志和重点图案打造可触摸的立体浮雕效果。" },
    ja: { label: "3Dエンボス加工", description: "ロゴやポイント部分に、触れて分かる立体的な凹凸を加えます。" },
    ko: { label: "3D 엠보싱", description: "로고와 포인트 부분에 손으로 느껴지는 입체 양각·음각을 더합니다." },
  },
  "digital-precision": {
    zh: { label: "快速数码印刷", description: "高速数码印刷，色彩鲜明，交付迅速。" },
    ja: { label: "スピードデジタル印刷", description: "高速のデジタル印刷で、色鮮やかに短納期で仕上げます。" },
    ko: { label: "빠른 디지털 인쇄", description: "고속 디지털 인쇄로 선명한 색상과 짧은 제작 기간을 제공합니다." },
  },
  "thick-weight": {
    zh: { label: "厚实卡纸", description: "高克重纸张挺括厚实，手感扎实高档。" },
    ja: { label: "厚手のカードストック", description: "重みのある厚紙が、しっかりとした上質な手触りを生みます。" },
    ko: { label: "두꺼운 카드지", description: "묵직한 평량의 종이가 단단하고 고급스러운 촉감을 줍니다." },
  },
  "eco-friendly": {
    zh: { label: "环保材质", description: "可生物降解、可回收的纸张，支持可持续发展。" },
    ja: { label: "環境にやさしい素材", description: "生分解性でリサイクル可能な紙素材で、サステナビリティに貢献します。" },
    ko: { label: "친환경 소재", description: "생분해와 재활용이 가능한 종이로 지속 가능성을 지원합니다." },
  },
};

export interface BulletSuggestion {
  /** The product (`<category>/<id>`) and the option's Vietnamese name, which identify the option in the source. */
  product: string;
  optionNameVi: string;
  /** Three "best for" bullets per language, in the order of the Vietnamese ones. They replace the single summary line. */
  bestFor: Record<SuggestedLocale, readonly [string, string, string]>;
}

/** Three Tet-flyer options have ONE summarizing zh/ja/ko "best for" line where Vietnamese and English have three. */
export const BULLET_SUGGESTIONS: readonly BulletSuggestion[] = [
  {
    product: "tet/to-roi",
    optionNameVi: "Giấy loại C 250-300gsm",
    bestFor: {
      zh: ["公司年终晚宴（Year End Party）优秀员工表彰奖状", "培训结业证书及合作伙伴感谢状", "用于全公司总结表彰大会的大批量正式奖状印刷"],
      ja: ["年末パーティー（Year End Party）で贈る優秀社員の表彰状", "研修修了証書と、パートナー企業への感謝状", "全社の総括式典向けに、公式の表彰状を大量印刷"],
      ko: ["송년 파티(Year End Party)에서 우수 직원을 시상하는 표창장", "교육 수료증 및 파트너사 감사장", "전사 결산·시상식용 공식 표창장 대량 인쇄"],
    },
  },
  {
    product: "tet/to-roi",
    optionNameVi: "Giấy loại F 200-250gsm",
    bestFor: {
      zh: ["采用传统书法字体、庄重古典风格的奖状", "课程毕业证书及培训项目结业证书", "需要手写签名和盖红章、要求墨水吸收均匀清晰的奖状"],
      ja: ["伝統的な書道書体を用いた、格式ある古典的スタイルの表彰状", "コースの修了証書および研修プログラムの修了認定証", "手書きの署名と朱印が必要で、インクが均一ににじまず吸収される表彰状"],
      ko: ["전통 서예체를 사용한 격조 있는 고전풍 표창장", "과정 수료증 및 교육 프로그램 이수 증명서", "손글씨 서명과 붉은 직인이 필요해 잉크가 고르고 선명하게 스며들어야 하는 표창장"],
    },
  },
  {
    product: "tet/to-roi",
    optionNameVi: "Giấy Mỹ Thuật Cao Cấp Ép Kim",
    bestFor: {
      zh: ["年终盛典（Gala）VIP 荣誉奖状及企业终身贡献奖", "金牌合作伙伴认证及优秀领导层致谢状", "纪念公司重要里程碑的限量版奖状"],
      ja: ["年末ガラのVIP表彰状、および企業への生涯功労賞", "ゴールドパートナー認定証、および優れた経営陣への感謝状", "会社の重要な節目を記念する限定版の表彰状"],
      ko: ["연말 갈라 VIP 표창장 및 기업 평생 공로상", "골드 파트너 인증서 및 우수 경영진 감사장", "회사의 중요한 이정표를 기념하는 한정판 상장"],
    },
  },
];

/** How many texts the suggestions add or replace, for the report and the tests. */
export const SUGGESTION_TEXT_COUNTS = {
  traits: Object.keys(TRAIT_SUGGESTIONS).length * SUGGESTED_LOCALES.length * 2,
  bullets: BULLET_SUGGESTIONS.length * SUGGESTED_LOCALES.length * 3,
} as const;

/**
 * The three "best for" bullets that replaced the single summarizing zh/ja/ko line (AI-suggested, revision 2 of the product).
 * Every other bullet must still equal the source; these 9 lists must equal the suggestion instead.
 */
export function suggestedBulletsFor(productKey: string, source: { nameVi: string; bestForVi: string[]; bestForZh?: string[] }, kind: string, locale: string): readonly string[] | undefined {
  if (kind !== "best_for" || !(SUGGESTED_LOCALES as readonly string[]).includes(locale)) return undefined;
  const suggestion = BULLET_SUGGESTIONS.find((s) => s.product === productKey && s.optionNameVi === source.nameVi && s.bestFor.zh.length === source.bestForVi.length && source.bestForZh?.length === 1);
  return suggestion?.bestFor[locale as (typeof SUGGESTED_LOCALES)[number]];
}
