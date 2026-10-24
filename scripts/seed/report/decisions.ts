import type { SeedStats } from "../context";
import type { Notes } from "../notes";
import type { ReportData } from "./collect";
import { counted, lines, n, percent, renderDecision, type Decision } from "./format";

// The eleven places where today's data is inconsistent and the owner must choose (docs/data-model.md §8).
// Each states what visitors see today, what the import did, and a recommendation — every figure comes from the run.

const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);

function sizesAndSpecs(data: ReportData): Decision {
  const { replay } = data;
  const { stats } = data.outcome;
  return {
    number: 1,
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

function materialNames(notes: Notes): Decision {
  const conflicts = notes.get("material-name-conflict");
  return {
    number: 2,
    title: "Cùng một loại giấy nhưng tên khác nhau giữa các sản phẩm (tiếng Trung / Nhật / Hàn)",
    today: "Một loại giấy dùng chung ở nhiều sản phẩm đang được dịch bằng những cách gọi khác nhau.",
    facts: counted(`${n(conflicts.length)} cặp (loại giấy × ngôn ngữ) bị lệch.`, conflicts),
    after: "Tên được dùng nhiều nhất trở thành tên chung của loại giấy. Tên riêng của từng sản phẩm vẫn được giữ làm tiêu đề thẻ, nên website hiển thị y như cũ.",
    recommendation: "Giữ nguyên lúc này; muốn thống nhất thì sửa một lần trong thư viện chất liệu khi trang quản trị hoàn thành.",
  };
}

function sharedTranslations(data: ReportData): Decision {
  const { stats } = data.outcome;
  const shared = Object.entries(stats.sharedListings);
  const conflicts = data.outcome.notes.get("title-precedence-differs");
  return {
    number: 3,
    title: "Sản phẩm xuất hiện ở hai danh mục dùng chung một bản dịch; tiêu đề có hai nguồn khác nhau",
    today: "Một số sản phẩm (ví dụ tờ rơi, lịch) có ở cả danh mục thường và danh mục Tết nhưng chỉ có một bản dịch tiếng Trung/Nhật/Hàn cho cả hai. Ngoài ra tiêu đề zh/ja/ko có hai nơi lưu và hai trang lấy theo thứ tự khác nhau.",
    facts: lines([
      `${n(shared.length)} sản phẩm nằm ở nhiều danh mục: ${shared.map(([id, categories]) => `${id} (${categories.join(", ")})`).join("; ")}.`,
      `${n(conflicts.length)} trường hợp (sản phẩm × ngôn ngữ) có tiêu đề ở hai nơi khác nhau.`,
    ]),
    after: "Cả hai bản dùng chung bản dịch hiện có; khi tiêu đề có hai nguồn, nguồn nằm trong chính sản phẩm được ưu tiên (đúng như trang chi tiết đang làm).",
    recommendation: "Viết nội dung riêng cho phiên bản Tết khi có thời gian, và chọn một tiêu đề đúng cho các trường hợp bị lệch.",
  };
}

function specPhrases(notes: Notes): Decision {
  const dup = notes.get("spec-same-vi-different-translation");
  return {
    number: 4,
    title: "Cùng một cụm tiếng Việt nhưng bản dịch tiếng Nhật/Hàn khác nhau",
    today: "Một số cụm thông số tiếng Việt giống hệt nhau ở các danh sách khác nhau nhưng được dịch khác nhau sang tiếng Nhật hoặc tiếng Hàn.",
    facts: counted(`${n(dup.length)} cụm.`, dup),
    after: "Mỗi bản dịch là một mục thông số riêng, nên website hiển thị y như cũ.",
    recommendation: "Gộp thành một bản dịch khi có thời gian.",
  };
}

function menuDifferences(stats: SeedStats): Decision {
  const { menu } = stats;
  return {
    number: 5,
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

function summarizingBullets(notes: Notes): Decision {
  const diffs = notes.get("bullet-count-differs-by-locale");
  return {
    number: 6,
    title: "Gạch đầu dòng tiếng Trung/Nhật/Hàn ít hơn hoặc gộp lại so với tiếng Việt",
    today: "Một số lựa chọn có ít gạch đầu dòng hơn trong tiếng Trung/Nhật/Hàn; có chỗ một dòng tóm tắt cả ba ý của bản tiếng Việt.",
    facts: counted(`${n(diffs.length)} danh sách bị lệch số dòng giữa các ngôn ngữ.`, diffs),
    after: "Mỗi ngôn ngữ giữ đúng các dòng nó có. Với dòng thiếu, website tạm hiện bản tiếng Anh cho đến khi được viết lại.",
    recommendation: "Viết lại các dòng còn thiếu hoặc gộp lại cho khớp tiếng Việt.",
  };
}

function icons(data: ReportData): Decision {
  const missing = data.icons.filter((icon) => !icon.cardCanDraw);
  const affected = sum(missing.map((icon) => icon.options));
  const total = sum(data.icons.map((icon) => icon.options));
  return {
    number: 7,
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

function duplicateUrls(notes: Notes): Decision {
  const collisions = notes.get("option-slug-collision");
  return {
    number: 8,
    title: "Hai lựa chọn có cùng đường dẫn",
    today: "Trong cùng một sản phẩm, có lựa chọn trùng đường dẫn nên chỉ một trong hai truy cập được.",
    facts: counted(`${n(collisions.length)} trường hợp.`, collisions),
    after: "Lựa chọn thứ hai được thêm hậu tố «-2» để cả hai đều truy cập được.",
    recommendation: "Đặt tên khác cho lựa chọn thứ hai (đường dẫn tự cập nhật, đường dẫn cũ vẫn hoạt động).",
  };
}

function droppedUrls(stats: SeedStats): Decision {
  return {
    number: 9,
    title: "Đường dẫn «tự suy ra» giữa các danh mục sẽ không còn hoạt động",
    today: "Mã website hiện cố gắng đoán sản phẩm cho mọi tổ hợp danh mục + tên (ví dụ /products/office/lich-tet hiện ra sản phẩm của danh mục Tết). Không có liên kết nào trên website trỏ tới các đường dẫn đoán này.",
    facts: [
      `- Giữ lại ${n(stats.productAliasRows)} đường dẫn cũ/đường dẫn khác của sản phẩm trong đúng danh mục của nó, và ${n(stats.segmentAliasRows)} đường dẫn cũ của hình thức/chất liệu — các liên kết hiện có (kể cả banner trang chủ) đều vẫn hoạt động.`,
      counted(`Không nhập ${n(stats.droppedCrossCategoryAliases.length)} đường dẫn đoán giữa các danh mục; chúng sẽ trả về «không tìm thấy».`, stats.droppedCrossCategoryAliases, 4),
    ].join("\n"),
    after: "Các đường dẫn đoán này không còn hoạt động.",
    recommendation: "Đồng ý. Chỉ cần giữ lại nếu bạn biết có website khác hoặc kết quả Google đang trỏ tới một đường dẫn trong danh sách (xem Phụ lục).",
  };
}

function leftovers(data: ReportData): Decision {
  const { notes, stats } = data.outcome;
  const orphans = sum(Object.values(stats.unusedTranslationKeys).map((keys) => keys.length));
  const strays = notes.get("media-stray");
  return {
    number: 10,
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

function dormantFields(data: ReportData): Decision {
  const { dormant } = data;
  return {
    number: 11,
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

export function renderDecisions(data: ReportData): string {
  const { notes, stats } = data.outcome;
  return [
    sizesAndSpecs(data), materialNames(notes), sharedTranslations(data), specPhrases(notes), menuDifferences(stats), summarizingBullets(notes),
    icons(data), duplicateUrls(notes), droppedUrls(stats), leftovers(data), dormantFields(data),
  ]
    .map(renderDecision)
    .join("\n\n---\n\n");
}
