import { describe, expect, it } from "vitest";
import { moveItem, moveWithinGroup, nextPosition, renumber } from "./lists";

type Item = { id: string; scope: string; position: number };
const item = (id: string, scope: string, position: number): Item => ({ id, scope, position });
const scope = (i: Item) => i.scope;
const ids = (list: Item[]) => list.map((i) => i.id);

describe("moveItem", () => {
  it("moves one element and leaves the input alone", () => {
    const list = ["a", "b", "c"];
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a"]);
    expect(list).toEqual(["a", "b", "c"]);
  });
  it("ignores moves that go nowhere", () => {
    expect(moveItem(["a", "b"], 1, 1)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 0, 5)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], -1, 0)).toEqual(["a", "b"]);
  });
});

describe("renumber", () => {
  it("numbers from 0 in array order, separately per group", () => {
    const list = [item("a", "x", 9), item("b", "y", 9), item("c", "x", 9), item("d", "y", 3)];
    expect(renumber(list, scope).map((i) => [i.id, i.position])).toEqual([["a", 0], ["b", 0], ["c", 1], ["d", 1]]);
  });
  it("keeps the objects that are already right (so React can skip them)", () => {
    const list = [item("a", "x", 0), item("b", "x", 5)];
    const result = renumber(list, scope);
    expect(result[0]).toBe(list[0]);
    expect(result[1]).not.toBe(list[1]);
  });
});

describe("moveWithinGroup", () => {
  const list = [item("a", "x", 0), item("n", "y", 0), item("b", "x", 1), item("c", "x", 2)];
  it("swaps with the neighbour of the SAME group, skipping other groups, and renumbers", () => {
    const moved = moveWithinGroup(list, 2, -1, scope);
    expect(ids(moved)).toEqual(["b", "n", "a", "c"]);
    expect(moved.filter((i) => i.scope === "x").map((i) => [i.id, i.position])).toEqual([["b", 0], ["a", 1], ["c", 2]]);
    expect(moved.find((i) => i.id === "n")?.position).toBe(0);
  });
  it("does nothing at the end of the group", () => {
    expect(ids(moveWithinGroup(list, 0, -1, scope))).toEqual(ids(list));
    expect(ids(moveWithinGroup(list, 3, 1, scope))).toEqual(ids(list));
    expect(ids(moveWithinGroup(list, 1, 1, scope))).toEqual(ids(list)); // "n" is alone in its group
  });
});

describe("nextPosition", () => {
  it("is one past the highest position of the group", () => {
    const list = [item("a", "x", 0), item("b", "x", 4), item("c", "y", 9)];
    expect(nextPosition(list, (i) => i.scope === "x")).toBe(5);
    expect(nextPosition(list, (i) => i.scope === "none")).toBe(0);
  });
});
