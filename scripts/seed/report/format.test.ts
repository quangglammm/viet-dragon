import { describe, expect, it } from "vitest";
import { bullets, counted, lines, n, percent, renderDecision, table } from "./format";

describe("report formatting", () => {
  it("writes numbers the Vietnamese way", () => {
    expect(n(4045)).toBe("4.045");
    expect(n(0)).toBe("0");
    expect(percent(2163, 4045)).toBe("53%");
    expect(percent(1, 0)).toBe("0%");
  });

  it("limits examples, clips long ones, and points at the appendix for the rest", () => {
    const text = bullets(Array.from({ length: 12 }, (_, i) => `mục ${i + 1}`), 3);
    expect(text.split("\n")).toEqual(["- mục 1", "- mục 2", "- mục 3", "- … và 9 mục khác (xem Phụ lục)"]);
    expect(bullets(["x".repeat(500)])).toBe(`- ${"x".repeat(180)}…`);
  });

  it("never clips or drops full sentences", () => {
    const sentence = "câu dài ".repeat(60);
    expect(lines([sentence, "hai"])).toBe(`- ${sentence}\n- hai`);
  });

  it("nests examples under a count, or says there are none", () => {
    expect(counted("2 trường hợp.", ["a", "b"])).toBe("- 2 trường hợp.\n  - a\n  - b");
    expect(counted("Không nhập gì.", [])).toBe("- Không nhập gì. Không có.");
  });

  it("renders a table and a decision with its answer line", () => {
    expect(table(["A", "B"], [["1", "2"]])).toBe("| A | B |\n| --- | --- |\n| 1 | 2 |");
    const decision = renderDecision({ number: 3, title: "T", today: "H", after: "S", recommendation: "Đ", facts: "- f" });
    expect(decision).toContain("### Quyết định 3 — T");
    expect(decision).toContain("**Số liệu:**\n- f");
    expect(decision).toContain("☐ Đồng ý với đề xuất");
    expect(renderDecision({ number: 1, title: "T", today: "H", after: "S", recommendation: "Đ" })).not.toContain("Số liệu");
  });
});
