import { LOCALES } from "../localized";
import type { SeedStats } from "../context";
import type { Notes } from "../notes";
import type { ReportData } from "./collect";
import { counted, lines, n, percent, renderDecision, table, type DecisionContent } from "./format";
import { FIXED_WORDS } from "./url-proposal";

// Part 2 of the report: what the owner decides for Vietnamese and English (the two languages that must be complete and
// reviewed first). Each states what visitors see today, what the import did, and a recommendation — every figure
// comes from the run. The Chinese / Japanese / Korean items are Part 3 (other-languages.ts): information, not decisions.

const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);

function urlSystem(data: ReportData): DecisionContent {
  const { urls } = data;
  const fixedWords = table(
    ["Trang", "Tiếng Việt", "English (中文 / 日本語 / 한국어 theo English)"],
    [
      ["Sản phẩm", `/${FIXED_WORDS.products.vi}`, `/${FIXED_WORDS.products.en}`],
      ["In nhanh lấy liền", `/${FIXED_WORDS.products.vi}/${FIXED_WORDS.fastPrint.vi}`, `/${FIXED_WORDS.products.en}/${FIXED_WORDS.fastPrint.en}`],
      ["Blog", `/${FIXED_WORDS.blog.vi}`, `/${FIXED_WORDS.blog.en}`],
    ],
  );
  const categories = table(["Danh mục (mã nội bộ)", "Tiếng Việt", "English"], urls.categories.map((c) => [`\`${c.key}\``, `/${c.vi}`, `/${c.en}`]));
  const products = table(["Đường dẫn hiện nay (mọi ngôn ngữ)", "Tiếng Việt (mới)", "English (mới)"], urls.products.map((p) => [`\`/products/${p.key}\``, `\`${p.vi}\``, `\`${p.en}\``]));
  const kept = LOCALES.map((l) => `${l}: ${n(urls.oldUrlsKept[l])}`).join(", ");
  return {
    title: "Hệ thống đường dẫn (URL) theo từng ngôn ngữ",
    today:
      "Mọi ngôn ngữ đang dùng chung một đường dẫn gốc tiếng Việt, chỉ khác phần đầu: `/products/marketing/to-roi`, `/en/products/marketing/to-roi`, `/zh/products/marketing/to-roi`… Các từ cố định (`products`, `blog`, `fast-print`) và tên danh mục cũng đều là tiếng Anh.",
    facts: [
      lines([
        "Đề xuất: **mỗi ngôn ngữ có đường dẫn riêng** — từ cố định, danh mục, sản phẩm, hình thức, chất liệu và bài viết. Chỉ dùng chữ Latin không dấu (a-z, 0-9, gạch nối) ở mọi ngôn ngữ, nên tiếng Trung / Nhật / Hàn dùng lại đường dẫn của English.",
        "Tiếng Việt vẫn là ngôn ngữ mặc định (không có tiền tố `/vi`); các ngôn ngữ khác có tiền tố (`/en`, `/zh`, `/ja`, `/ko`).",
      ]),
      "**Từ cố định** (áp dụng khi website chuyển sang đọc từ cơ sở dữ liệu):",
      fixedWords,
      "**Danh mục:**",
      categories,
      `**${n(urls.products.length)} sản phẩm** (đường dẫn đầy đủ):`,
      products,
      lines([
        `Còn ${n(urls.shapes.length)} hình thức, ${n(urls.options.length)} lựa chọn chất liệu và ${n(urls.posts.length)} bài viết có đường dẫn riêng — danh sách đầy đủ ở Phụ lục A.`,
        "Tiếng Anh do máy tạo từ tên tiếng Anh (ví dụ «Flyers & Leaflets» → `flyers-leaflets`); có thể chưa đẹp ở một vài chỗ — ghi cách sửa vào Phụ lục A.",
        `**Đường dẫn cũ vẫn mở được:** mọi đường dẫn đang chạy hiện nay sẽ tự chuyển hướng (mã 308) sang đường dẫn mới của đúng ngôn ngữ. Số đường dẫn cũ được giữ theo ngôn ngữ: ${kept}.`,
        "**Rủi ro cần biết:** tiếng Việt là ngôn ngữ chính và đã được Google lập chỉ mục; toàn bộ đường dẫn tiếng Việt sẽ đổi (ví dụ `/products/marketing/to-roi` → `/san-pham/tiep-thi/to-roi`). Chuyển hướng 308 giữ lại gần như toàn bộ giá trị tìm kiếm, nhưng thứ hạng có thể dao động vài tuần.",
      ]),
    ].join("\n\n"),
    after: "Cơ sở dữ liệu đã có sẵn đường dẫn riêng cho từng ngôn ngữ (tiếng Việt giữ đường dẫn hiện nay; English tạo mới; tiếng Trung/Nhật/Hàn sao chép English) và giữ đường dẫn cũ làm đường dẫn chuyển hướng. Website chưa đổi gì.",
    recommendation:
      "Đồng ý. Đổi **một lần duy nhất** khi đưa hệ thống mới vào chạy (không đổi từng phần), giữ chuyển hướng 308 lâu dài, và gửi sơ đồ trang (sitemap) mới cùng thẻ hreflang cho từng ngôn ngữ để Google hiểu các phiên bản tương ứng.",
  };
}

function sizesAndSpecs(data: ReportData): DecisionContent {
  const { replay } = data;
  const { stats } = data.outcome;
  return {
    title: "Kích thước và thông số in thay đổi theo ngôn ngữ và theo chất liệu",
    today:
      "Trang sản phẩm tự suy ra danh sách kích thước, công nghệ hoàn thiện và chất liệu gợi ý từ *tên* sản phẩm — mà tên lại đổi theo ngôn ngữ đang xem. Vì thế cùng một sản phẩm có thể hiện danh sách khác nhau tùy ngôn ngữ hoặc tùy chất liệu đang chọn.",
    facts: lines([
      `Trong ${n(replay.renders)} lượt hiển thị thẻ chất liệu (trang × lựa chọn × ngôn ngữ), có ${n(replay.rendersWithAnyDifference)} lượt (${percent(replay.rendersWithAnyDifference, replay.renders)}) cho kết quả khác danh sách duy nhất sẽ được lưu.`,
      `Chia theo loại: kích thước khác ${n(replay.sizeDifferences)} lượt, chất liệu gợi ý khác ${n(replay.materialHintDifferences)} lượt, hoàn thiện khác ${n(replay.finishingDifferences)} lượt. (Nếu các lựa chọn trùng tên tiếng Việt chỉ tính một lần: ${n(replay.distinctWithAnyDifference)} tổ hợp.)`,
      `${n(stats.sizeLanguageDependent.length)} sản phẩm/hình thức có kích thước đổi theo ngôn ngữ của tên; ${n(stats.specLanguageDependent.length)} danh sách thông số đổi theo ngôn ngữ.`,
    ]),
    after: "Mỗi sản phẩm và mỗi hình thức có **một** danh sách kích thước và một danh sách thông số, lấy theo tên tiếng Việt.",
    recommendation: "Giữ như vậy. Nếu cần danh sách riêng cho từng chất liệu thì bổ sung sau, không phải làm lại dữ liệu.",
  };
}

function menuDifferences(stats: SeedStats): DecisionContent {
  const { menu } = stats;
  return {
    title: "Menu khác với danh mục sản phẩm",
    today: "Menu lớn không chỉ lấy tên và ảnh từ sản phẩm: nhiều mục có tên, ảnh hoặc nhãn «In nhanh» riêng.",
    facts: lines([
      `${n(menu.groups)} nhóm và ${n(menu.items)} mục menu đã nhập.`,
      `Tên riêng được lưu: ${n(menu.itemLabelOverrides)} mục, ${n(menu.groupLabelOverrides)} nhóm; mô tả riêng của nhóm (trang Tết): ${n(menu.groupDescriptionOverrides)}.`,
      `Ảnh riêng: ${n(menu.itemImageOverrides)} mục, ${n(menu.groupImageOverrides)} nhóm; nhãn «In nhanh»: ${n(menu.fastItems)} mục.`,
    ]),
    after: "Chỉ những chỗ khác với sản phẩm mới được lưu riêng; phần còn lại tự lấy từ sản phẩm.",
    recommendation: "Giữ nguyên lúc này; dọn dần những tên/ảnh riêng không cần thiết khi chỉnh menu.",
  };
}

function icons(data: ReportData): DecisionContent {
  const missing = data.icons.filter((icon) => !icon.cardCanDraw);
  const affected = sum(missing.map((icon) => icon.options));
  const total = sum(data.icons.map((icon) => icon.options));
  return {
    title: "Biểu tượng mà thẻ chất liệu hiện chưa vẽ được",
    today: "Dữ liệu dùng nhiều biểu tượng hơn số mà thẻ chất liệu biết vẽ; những lựa chọn còn lại hiện chỉ hiện một biểu tượng chung.",
    facts: lines([
      `${n(data.icons.length)} biểu tượng được dùng, thẻ chỉ vẽ được ${n(data.icons.length - missing.length)}; ${n(missing.length)} biểu tượng không vẽ được, ảnh hưởng ${n(affected)} trong ${n(total)} lựa chọn.`,
      `Chưa vẽ được: ${missing.map((icon) => `${icon.name} (${n(icon.options)})`).join(", ") || "không có"}.`,
    ]),
    after: "Tất cả biểu tượng đã có trong thư viện biểu tượng mới và được lưu theo tên; thẻ chất liệu sẽ vẽ đầy đủ khi website chuyển sang đọc từ cơ sở dữ liệu.",
    recommendation: "Mở rộng thư viện biểu tượng (đã làm) thay vì chọn lại biểu tượng cho từng lựa chọn.",
  };
}

function duplicateUrls(notes: Notes): DecisionContent {
  const collisions = notes.get("option-slug-collision");
  return {
    title: "Hai lựa chọn có cùng đường dẫn",
    today: "Trong cùng một sản phẩm, có lựa chọn trùng đường dẫn nên chỉ một trong hai truy cập được.",
    facts: counted(`${n(collisions.length)} trường hợp.`, collisions),
    after: "Lựa chọn thứ hai được thêm hậu tố «-2» để cả hai đều truy cập được.",
    recommendation: "Đặt tên khác cho lựa chọn thứ hai (đường dẫn tự cập nhật, đường dẫn cũ vẫn hoạt động).",
  };
}

function droppedUrls(stats: SeedStats): DecisionContent {
  return {
    title: "Đường dẫn «tự suy ra» giữa các danh mục sẽ không còn hoạt động",
    today:
      "Mã website hiện cố gắng đoán sản phẩm cho mọi tổ hợp danh mục + tên (ví dụ /products/office/lich-tet hiện ra sản phẩm của danh mục Tết). Không có liên kết nào trên website trỏ tới các đường dẫn đoán này.",
    facts: [
      lines([
        `Giữ lại các đường dẫn cũ/đường dẫn khác của sản phẩm trong đúng danh mục của nó (${n(stats.productAliasRows)} dòng cho cả 5 ngôn ngữ) và đường dẫn cũ của hình thức/chất liệu (${n(stats.segmentAliasRows)} dòng) — các liên kết hiện có (kể cả banner trang chủ) đều vẫn hoạt động ở mọi ngôn ngữ.`,
      ]),
      counted(`Không nhập ${n(stats.droppedCrossCategoryAliases.length)} đường dẫn đoán giữa các danh mục; chúng sẽ trả về «không tìm thấy».`, stats.droppedCrossCategoryAliases, 4),
    ].join("\n"),
    after: "Các đường dẫn đoán này không còn hoạt động.",
    recommendation: "Đồng ý. Chỉ cần giữ lại nếu bạn biết có website khác hoặc kết quả Google đang trỏ tới một đường dẫn trong danh sách (xem Phụ lục B).",
  };
}

function leftovers(data: ReportData): DecisionContent {
  const { notes, stats } = data.outcome;
  const orphans = sum(Object.values(stats.unusedTranslationKeys).map((keys) => keys.length));
  const strays = notes.get("media-stray");
  return {
    title: "Dữ liệu thừa: khóa dịch mồ côi, tệp tạm, ảnh không dùng",
    today: "Trong mã và thư mục ảnh còn sót những thứ không được trang nào dùng.",
    facts: [
      lines([`${n(orphans)} khóa dịch không khớp sản phẩm/hình thức nào (${Object.entries(stats.unusedTranslationKeys).map(([table, keys]) => `${table}: ${n(keys.length)}/${n(stats.translationKeyTotals[table] ?? 0)}`).join("; ")}) — không được nhập.`]),
      counted(`${n(strays.length)} tệp tạm/sao lưu không được đăng ký:`, strays),
      lines([
        `${n(data.unreferencedMedia.length)} trong ${n(data.registeredMedia)} tệp ảnh/video đã đăng ký mà không sản phẩm, menu, bài viết hay đoạn mã nào nhắc tới đường dẫn — vẫn được giữ lại. (Tệp có thể vẫn được dùng nếu mã ghép tên động; vì vậy đây chỉ là danh sách để xem xét, đừng xóa hàng loạt.)`,
      ]),
    ].join("\n"),
    after: "Khóa dịch mồ côi và tệp tạm bị bỏ; ảnh không dùng vẫn được giữ và đăng ký để quản trị viên xem.",
    recommendation: "Đồng ý. Việc xóa ảnh không dùng làm sau, trong trang quản lý ảnh, khi đã chắc chắn.",
  };
}

function dormantFields(data: ReportData): DecisionContent {
  const { dormant } = data;
  return {
    title: "Giá, công tắc «ép kim / hai mặt» và huy hiệu: có hiển thị trên website không?",
    today: "Mã website có chỗ cho giá, công tắc ẩn ép kim/in hai mặt và huy hiệu của hình thức, nhưng không trang nào hiển thị chúng.",
    facts: lines([
      `Lựa chọn có nhập giá: ${n(dormant.optionsWithPrice)}/${n(dormant.options)}; có công tắc ẩn ép kim/hai mặt: ${n(dormant.optionsWithSwitch)}/${n(dormant.options)}.`,
      `Hình thức có huy hiệu: ${n(dormant.shapesWithBadge)}.`,
    ]),
    after: "Các trường này được giữ trong cơ sở dữ liệu (huy hiệu theo từng ngôn ngữ) nhưng website chưa hiển thị.",
    recommendation: "Giữ nguyên. Nếu muốn website hiển thị giá hoặc huy hiệu, báo để làm trong giai đoạn đọc dữ liệu từ cơ sở dữ liệu.",
  };
}

/** The decisions for Vietnamese and English, numbered in the order they are asked. */
export function renderMasterDecisions(data: ReportData): { text: string; count: number } {
  const { notes, stats } = data.outcome;
  const decisions = [urlSystem(data), sizesAndSpecs(data), menuDifferences(stats), icons(data), duplicateUrls(notes), droppedUrls(stats), leftovers(data), dormantFields(data)];
  return { text: decisions.map((content, index) => renderDecision({ number: index + 1, ...content })).join("\n\n---\n\n"), count: decisions.length };
}
