import { describe, expect, it } from "vitest";
import { BodyTooLarge, readBodyCapped } from "./body";

const post = (body: BodyInit | null, headers: Record<string, string> = {}) => new Request("http://localhost/x", { method: "POST", headers, body });
const streamOf = (...chunks: Uint8Array[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });

describe("readBodyCapped", () => {
  it("reads a body up to and including the limit", async () => {
    expect(new TextDecoder().decode(await readBodyCapped(post("12345"), 5))).toBe("12345");
  });

  it("treats a missing body as empty", async () => {
    expect((await readBodyCapped(new Request("http://localhost/x", { method: "POST" }), 10)).byteLength).toBe(0);
  });

  it("refuses one byte more, by its declared length before reading anything", async () => {
    await expect(readBodyCapped(post("123456", { "content-length": "6" }), 5)).rejects.toBeInstanceOf(BodyTooLarge);
  });

  it("counts the stream when the declared length is absent or false, and stops there", async () => {
    const big = new Uint8Array(4).fill(1);
    const request = new Request("http://localhost/x", { method: "POST", body: streamOf(big, big, big), duplex: "half" } as RequestInit);
    await expect(readBodyCapped(request, 10)).rejects.toMatchObject({ name: "BodyTooLarge", limit: 10 });
    const liar = new Request("http://localhost/x", { method: "POST", headers: { "content-length": "3" }, body: streamOf(big, big, big), duplex: "half" } as RequestInit);
    await expect(readBodyCapped(liar, 10)).rejects.toBeInstanceOf(BodyTooLarge);
  });

  it("joins the chunks in order", async () => {
    const request = new Request("http://localhost/x", { method: "POST", body: streamOf(new TextEncoder().encode("ab"), new TextEncoder().encode("cd")), duplex: "half" } as RequestInit);
    expect(new TextDecoder().decode(await readBodyCapped(request, 10))).toBe("abcd");
  });
});
