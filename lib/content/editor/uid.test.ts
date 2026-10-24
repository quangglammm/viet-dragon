import { afterEach, describe, expect, it, vi } from "vitest";
import { newUid } from "./uid";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("newUid", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("makes a v4 UUID, a different one each time", () => {
    const ids = new Set(Array.from({ length: 50 }, newUid));
    expect(ids.size).toBe(50);
    for (const id of ids) expect(id).toMatch(UUID_V4);
  });

  it("still works where randomUUID does not exist (plain http)", () => {
    const real = globalThis.crypto;
    vi.stubGlobal("crypto", { getRandomValues: (bytes: Uint8Array) => real.getRandomValues(bytes) });
    expect(newUid()).toMatch(UUID_V4);
  });
});
