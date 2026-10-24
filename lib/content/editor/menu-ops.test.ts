import { describe, expect, it } from "vitest";
import { menuDocument, UID } from "@/tests/fixtures/documents";
import { addColumn, addGroup, addItem, groupAtPath, locateGroup, moveColumn, moveGroup, moveGroupItem, moveGroupToColumn, nextTarget, productTargets, removeColumn, removeGroup, removeItem, setItemTarget, targetFromKey, targetKey, unusedProducts, type Menu } from "./menu-ops";
import type { Vocabulary } from "./vocabulary";

const P2 = "22222222-2222-4222-8222-222222222222";
const P3 = "33333333-3333-4333-8333-333333333333";
const numbers = (menu: Menu) => menu.columns.map((column) => column.column);
const products = (menu: Menu) => menu.columns.map((column) => column.groups.map((group) => group.product));

/** Three columns: [A, B] [C] [] — product uids A = the fixture's, B, C. */
function menu(): Menu {
  const base = menuDocument();
  const group = (product: string) => ({ product, image: null, i18n: {}, items: [] });
  return { ...base, columns: [{ column: 1, groups: [base.columns[0].groups[0], group(P2)] }, { column: 2, groups: [group(P3)] }, { column: 3, groups: [] }] };
}

describe("columns", () => {
  it("adds one at the end, numbered by place", () => {
    expect(numbers(addColumn(menu()))).toEqual([1, 2, 3, 4]);
  });

  it("renumbers after a removal, so the numbers stay 1…n", () => {
    const next = removeColumn(menu(), 0);
    expect(numbers(next)).toEqual([1, 2]);
    expect(products(next)).toEqual([[P3], []]);
  });

  it("swaps with a neighbour and renumbers; a step off the end does nothing", () => {
    const next = moveColumn(menu(), 1, -1);
    expect(products(next)).toEqual([[P3], [UID.product, P2], []]);
    expect(numbers(next)).toEqual([1, 2, 3]);
    expect(moveColumn(menu(), 0, -1)).toEqual(menu());
  });
});

describe("groups", () => {
  it("adds a product's group at the end of the column chosen", () => {
    const P4 = "44444444-4444-4444-8444-444444444444";
    expect(products(addGroup(menu(), 2, P4))).toEqual([[UID.product, P2], [P3], [P4]]);
  });

  it("never adds a product twice: it appears once in a menu", () => {
    expect(addGroup(menu(), 2, P2)).toEqual(menu());
  });

  it("removes a group wherever it is", () => {
    expect(products(removeGroup(menu(), P3))).toEqual([[UID.product, P2], [], []]);
  });

  it("moves a group up or down inside its column only", () => {
    expect(products(moveGroup(menu(), P2, -1))).toEqual([[P2, UID.product], [P3], []]);
    expect(products(moveGroup(menu(), P2, 1))).toEqual([[UID.product, P2], [P3], []]);
    expect(products(moveGroup(menu(), P3, -1))).toEqual([[UID.product, P2], [P3], []]);
  });

  it("moves a group to the end of another column, with everything it holds", () => {
    const next = moveGroupToColumn(menu(), UID.product, 2);
    expect(products(next)).toEqual([[P2], [P3], [UID.product]]);
    expect(next.columns[2].groups[0].items).toHaveLength(2);
    expect(locateGroup(next, UID.product)).toEqual({ column: 2, index: 0 });
  });

  it("ignores a move to its own column or to a column that does not exist", () => {
    expect(moveGroupToColumn(menu(), P2, 0)).toEqual(menu());
    expect(moveGroupToColumn(menu(), P2, 9)).toEqual(menu());
  });
});

describe("items", () => {
  const item = (menuOf: Menu) => menuOf.columns[0].groups[0].items;

  it("adds an item for a target at the end of the group, as a plain link", () => {
    const next = addItem(menu(), UID.product, { shape: "s9" });
    expect(item(next)).toHaveLength(3);
    expect(item(next)[2]).toEqual({ target: { shape: "s9" }, isFast: false, image: null, i18n: {} });
  });

  it("removes, moves and retargets one item", () => {
    expect(item(removeItem(menu(), UID.product, 0))).toHaveLength(1);
    expect(item(moveGroupItem(menu(), UID.product, 1, -1)).map((entry) => targetKey(entry.target))).toEqual([`option:${UID.option}`, `shape:${UID.shapeA5}`]);
    expect(item(setItemTarget(menu(), UID.product, 0, { option: "o9" }))[0].target).toEqual({ option: "o9" });
  });

  it("changes only the group asked for and leaves the document it was given alone", () => {
    const before = menu();
    const next = addItem(before, P2, { shape: "s1" });
    expect(next.columns[0].groups[0]).toBe(before.columns[0].groups[0]);
    expect(before.columns[0].groups[1].items).toHaveLength(0);
  });
});

describe("targets", () => {
  it("round-trips a target through its select value", () => {
    expect(targetFromKey(targetKey({ shape: "abc" }))).toEqual({ shape: "abc" });
    expect(targetFromKey(targetKey({ option: "x:y" }))).toEqual({ option: "x:y" });
    expect(targetFromKey("nonsense")).toBeNull();
    expect(targetFromKey("shape:")).toBeNull();
  });

  const vocab: Vocabulary = {
    product: [{ value: UID.product, label: "A" }, { value: P2, label: "B" }, { value: "p9", label: "Z" }],
    shape: [{ value: UID.shapeA5, label: "A5", group: UID.product }, { value: "s2", label: "A4", group: UID.product }, { value: "s3", label: "Other", group: P2 }],
    option: [{ value: UID.option, label: "Giấy C", group: UID.product }, { value: "o2", label: "Kraft", group: P2 }],
  };

  it("offers the products that have no group yet", () => {
    expect(unusedProducts(menu(), vocab.product!).map((product) => product.label)).toEqual(["Z"]);
  });

  it("offers one product's own shapes and options and no other's", () => {
    const { shapes, options } = productTargets(vocab, UID.product);
    expect(shapes.map((shape) => shape.label)).toEqual(["A5", "A4"]);
    expect(options.map((option) => option.label)).toEqual(["Giấy C"]);
  });

  it("picks the first target of the product that the group does not link yet", () => {
    expect(nextTarget(menu(), vocab, UID.product)).toEqual({ shape: "s2" }); // A5 and Giấy C are already linked
    expect(nextTarget(menu(), vocab, P2)).toEqual({ shape: "s3" });
    expect(nextTarget(menu(), { ...vocab, shape: [], option: [] }, P2)).toBeNull();
  });
});

describe("groupAtPath", () => {
  it("finds the group a path is inside, at any depth", () => {
    expect(groupAtPath(menu(), "columns[0].groups[1]")).toBe(P2);
    expect(groupAtPath(menu(), "columns[1].groups[0].items[2].image")).toBe(P3);
    expect(groupAtPath(menu(), "columns[0].groups[1].i18n.vi.label")).toBe(P2);
  });

  it("answers nothing for a path outside any group or past the end of a list", () => {
    expect(groupAtPath(menu(), "columns[0].column")).toBeUndefined();
    expect(groupAtPath(menu(), "columns[2].groups[0]")).toBeUndefined();
    expect(groupAtPath(menu(), "category")).toBeUndefined();
  });
});
