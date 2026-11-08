import { describe, expect, it } from "vitest";
import { createContentApi, type Fetcher } from "./api";

const UID = "11111111-1111-4111-8111-111111111111";
const product = { type: "product", id: UID } as const;

type Call = { url: string; init: RequestInit };

function fakeFetch(respond: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fetcher: Fetcher = async (url, init = {}) => {
    const call = { url, init };
    calls.push(call);
    return respond(call);
  };
  return { fetcher, calls };
}

const jsonResponse = (body: unknown, init: ResponseInit = {}) => Response.json(body, init);

describe("requests", () => {
  it("builds the URLs of the content API, with a spec item's key dotted", async () => {
    const { fetcher, calls } = fakeFetch(() => jsonResponse({}));
    const api = createContentApi(fetcher);
    await api.live(product);
    await api.diff({ type: "spec_item", id: "technique/offset" });
    await api.revision({ type: "fast_print_item", id: UID }, 3);
    expect(calls.map((c) => c.url)).toEqual([
      `/api/admin/content/product/${UID}`,
      "/api/admin/content/spec-item/technique.offset/draft/diff",
      `/api/admin/content/fast-print-item/${UID}/revisions/3`,
    ]);
  });

  it("sends If-Match with the draft version on save, publish and (when given) discard", async () => {
    const { fetcher, calls } = fakeFetch(() => jsonResponse({}));
    const api = createContentApi(fetcher);
    await api.saveDraft(product, { uid: UID }, 4);
    await api.publish(product, 5, "ghi chú");
    await api.discardDraft(product, 6);
    await api.discardDraft(product);
    expect(calls.map((c) => (c.init.headers as Record<string, string>)["if-match"])).toEqual(['"4"', '"5"', '"6"', undefined]);
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ snapshot: { uid: UID } });
    expect(JSON.parse(calls[1].init.body as string)).toEqual({ comment: "ghi chú" });
  });

  it("declares JSON on every mutation (the server refuses anything else) and none on reads", async () => {
    const { fetcher, calls } = fakeFetch(() => jsonResponse({}));
    const api = createContentApi(fetcher);
    await api.getDraft(product);
    await api.openDraft(product);
    await api.deleteEntity(product);
    const types = calls.map((c) => (c.init.headers as Record<string, string>)["content-type"]);
    expect(types).toEqual([undefined, "application/json", "application/json"]);
    expect(calls.every((c) => c.init.credentials === "same-origin")).toBe(true);
  });

  it("puts only the given media filters in the query string", async () => {
    const { fetcher, calls } = fakeFetch(() => jsonResponse({ items: [], hasMore: false, folders: [] }));
    await createContentApi(fetcher).media({ q: "a b", kind: "image", offset: 60 });
    expect(calls[0].url).toBe("/api/admin/content/media?q=a+b&kind=image&offset=60");
    await createContentApi(fetcher).media({});
    expect(calls[1].url).toBe("/api/admin/content/media");
    await createContentApi(fetcher).media({ source: "upload", order: "newest" });
    expect(calls[2].url).toBe("/api/admin/content/media?source=upload&order=newest");
  });

  it("uploads a file as a form: one `file` part, and NO content type (the browser adds its own, with the boundary)", async () => {
    const { fetcher, calls } = fakeFetch(() => jsonResponse({ item: { key: "uploads/2026/a-00000000.webp" }, existing: false }, { status: 201 }));
    const result = await createContentApi(fetcher).uploadMedia(new File([new Uint8Array([1, 2, 3])], "ảnh.jpg", { type: "image/jpeg" }));
    expect(result).toMatchObject({ ok: true, data: { existing: false } });
    expect(calls[0].url).toBe("/api/admin/content/media");
    expect(calls[0].init.method).toBe("POST");
    expect((calls[0].init.headers as Record<string, string>)["content-type"]).toBeUndefined();
    const form = calls[0].init.body as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect([...form.keys()]).toEqual(["file"]);
    expect((form.get("file") as File).name).toBe("ảnh.jpg");
    expect(calls[0].init.credentials).toBe("same-origin");
  });

  it("deletes an upload by its key, in a JSON body", async () => {
    const { fetcher, calls } = fakeFetch(() => new Response(null, { status: 204 }));
    expect(await createContentApi(fetcher).deleteMedia("uploads/2026/a-00000000.webp")).toEqual({ ok: true, data: undefined });
    expect(calls[0].init.method).toBe("DELETE");
    expect((calls[0].init.headers as Record<string, string>)["content-type"]).toBe("application/json");
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ key: "uploads/2026/a-00000000.webp" });
  });

  it("hands back the server's refusal of an upload or a delete, with its code", async () => {
    const { fetcher } = fakeFetch(() => jsonResponse({ error: "Ảnh này đang được dùng (1 mục đang hiển thị, 0 bản nháp).", code: "IN_USE" }, { status: 409 }));
    const result = await createContentApi(fetcher).deleteMedia("uploads/2026/a-00000000.webp");
    expect(result).toMatchObject({ ok: false, problem: { status: 409, code: "IN_USE" } });
  });
});

describe("answers", () => {
  it("returns the data and the ETag as a number", async () => {
    const { fetcher } = fakeFetch(() => jsonResponse({ ok: 1 }, { headers: { etag: '"7"' } }));
    expect(await createContentApi(fetcher).getDraft(product)).toEqual({ ok: true, data: { ok: 1 }, etag: 7 });
  });

  it("treats 204 as success without a body", async () => {
    const { fetcher } = fakeFetch(() => new Response(null, { status: 204 }));
    expect(await createContentApi(fetcher).discardDraft(product)).toEqual({ ok: true, data: undefined });
  });

  it("turns the API's error shape into a problem, keeping issues and changes", async () => {
    const issues = [{ path: "a", message: "sai" }];
    const changes = [{ path: "b", kind: "changed", before: 1, after: 2 }];
    const { fetcher } = fakeFetch(() => jsonResponse({ error: "cũ rồi", code: "STALE_BASE", issues, changes }, { status: 409 }));
    expect(await createContentApi(fetcher).publish(product, 1)).toEqual({ ok: false, problem: { status: 409, code: "STALE_BASE", message: "cũ rồi", issues, changes } });
  });

  it("gives a plain problem for an answer that is not our error shape", async () => {
    const { fetcher } = fakeFetch(() => new Response("<html>502</html>", { status: 502 }));
    const result = await createContentApi(fetcher).live(product);
    expect(result).toMatchObject({ ok: false, problem: { status: 502, code: "ERROR" } });
  });

  it("never throws when the network is down", async () => {
    const result = await createContentApi(async () => {
      throw new TypeError("Failed to fetch");
    }).saveDraft(product, {}, 1);
    expect(result).toEqual({ ok: false, problem: { status: 0, code: "NETWORK", message: expect.stringContaining("kết nối") } });
  });

  it("reports a success body that is not JSON as a problem", async () => {
    const { fetcher } = fakeFetch(() => new Response("not json", { status: 200 }));
    expect(await createContentApi(fetcher).live(product)).toMatchObject({ ok: false, problem: { code: "BAD_RESPONSE" } });
  });
});
