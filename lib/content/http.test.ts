import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Conflict, Invalid, NotFound } from "./errors";
import type { Draft } from "./drafts";
import { MAX_BODY_BYTES, HttpError, draftBody, entityFromParams, errorResponse, json, optionalIfMatch, readJson, requireIfMatch, typeFromParams, versionFromParam } from "./http";
import { saveDraftBody } from "./requests";

const UID = "11111111-1111-4111-8111-111111111111";
const withHeaders = (headers: Record<string, string>) => new Request("http://localhost/x", { method: "PUT", headers });
const post = (body: BodyInit | null, headers: Record<string, string> = {}) => new Request("http://localhost/x", { method: "POST", headers: { "content-type": "application/json", ...headers }, body });
const thrown = async (fn: () => unknown) => {
  try {
    await fn();
    return null;
  } catch (error) {
    return error;
  }
};
const bodyOf = async (response: Response) => (await response.json()) as { error: string; code: string; issues?: unknown[]; changes?: unknown[] };

describe("If-Match", () => {
  it.each([['"3"', 3], ["3", 3], ['W/"3"', 3], ['  "12" ', 12]])("reads %s as version %d", (header, version) => {
    expect(requireIfMatch(withHeaders({ "if-match": header }))).toBe(version);
    expect(optionalIfMatch(withHeaders({ "if-match": header }))).toBe(version);
  });

  it("is required for saving and publishing: 428 when missing", async () => {
    const error = await thrown(() => requireIfMatch(withHeaders({})));
    expect(error).toMatchObject({ status: 428, code: "PRECONDITION_REQUIRED" });
    expect(optionalIfMatch(withHeaders({}))).toBeUndefined();
  });

  it.each(["abc", '"x"', "*", "-1", "1.5", ""])("rejects %j with 400", async (header) => {
    expect(await thrown(() => requireIfMatch(withHeaders({ "if-match": header })))).toMatchObject({ status: 400, code: "INVALID_IF_MATCH" });
  });
});

describe("the URL", () => {
  it("resolves a type and an id, including a spec item's dotted key", async () => {
    expect(await typeFromParams(Promise.resolve({ type: "fast-print-item" }))).toBe("fast_print_item");
    expect(await entityFromParams(Promise.resolve({ type: "product", id: UID.toUpperCase() }))).toEqual({ type: "product", id: UID });
    expect(await entityFromParams(Promise.resolve({ type: "spec-item", id: "technique.offset" }))).toEqual({ type: "spec_item", id: "technique/offset" });
  });

  it("answers 404 for a type or id that cannot exist", async () => {
    for (const params of [{ type: "products", id: UID }, { type: "product", id: "to-roi" }, { type: "spec-item", id: "offset" }]) {
      expect(await thrown(() => entityFromParams(Promise.resolve(params)))).toBeInstanceOf(NotFound);
    }
    expect(await thrown(() => typeFromParams(Promise.resolve({ type: "nope" })))).toBeInstanceOf(NotFound);
  });

  it("accepts a positive whole number as a revision", async () => {
    expect(versionFromParam("12")).toBe(12);
    for (const raw of ["0", "-1", "1.5", "x", "01"]) expect(() => versionFromParam(raw)).toThrow(NotFound);
  });
});

describe("readJson", () => {
  const schema = z.strictObject({ a: z.number() });

  it("returns the validated body", async () => {
    expect(await readJson(post('{"a":1}'), schema)).toEqual({ a: 1 });
  });

  it("answers 400 for text that is not JSON, and for no body unless it is optional", async () => {
    expect(await thrown(() => readJson(post("{nope"), schema))).toMatchObject({ status: 400, code: "INVALID_JSON" });
    expect(await thrown(() => readJson(post(""), schema))).toMatchObject({ status: 400, code: "EMPTY_BODY" });
    expect(await readJson(post(""), z.strictObject({}), { optional: true })).toEqual({});
  });

  it("answers 422 with the field when the shape is wrong, and refuses unknown fields", async () => {
    const error = await thrown(() => readJson(post('{"a":"x"}'), schema));
    expect(error).toBeInstanceOf(Invalid);
    expect((error as Invalid).issues[0].path).toBe("a");
    expect(await thrown(() => readJson(post('{"a":1,"b":2}'), schema))).toBeInstanceOf(Invalid);
  });

  it("answers 413 above 2 MB — by the declared length, and by counting a body that declares nothing", async () => {
    expect(await thrown(() => readJson(post("{}", { "content-length": String(MAX_BODY_BYTES + 1) }), z.object({})))).toMatchObject({ status: 413, code: "PAYLOAD_TOO_LARGE" });
    const big = JSON.stringify({ snapshot: { pad: "x".repeat(MAX_BODY_BYTES) } });
    expect(await thrown(() => readJson(post(big), saveDraftBody))).toMatchObject({ status: 413 });
  });

  it("reads a body just under the limit", async () => {
    const body = JSON.stringify({ snapshot: { pad: "x".repeat(MAX_BODY_BYTES - 100) } });
    expect(Object.keys((await readJson(post(body), saveDraftBody)).snapshot)).toEqual(["pad"]);
  });

  it("reads multi-byte text intact", async () => {
    expect((await readJson(post('{"snapshot":{"t":"Tờ rơi 日本語"}}'), saveDraftBody)).snapshot).toEqual({ t: "Tờ rơi 日本語" });
  });
});

describe("errorResponse", () => {
  it("maps each domain error to its status and the one error shape", async () => {
    const notFound = errorResponse(new NotFound("không có"));
    expect(notFound.status).toBe(404);
    expect(await bodyOf(notFound)).toEqual({ error: "không có", code: "NOT_FOUND" });

    const invalid = errorResponse(new Invalid([{ path: "a.b", message: "sai" }]));
    expect(invalid.status).toBe(422);
    expect(await bodyOf(invalid)).toMatchObject({ error: "sai", code: "INVALID", issues: [{ path: "a.b", message: "sai" }] });

    const conflict = errorResponse(new Conflict("STALE_BASE", "cũ", [{ path: "x", kind: "changed", before: 1, after: 2 }]));
    expect(conflict.status).toBe(409);
    expect(await bodyOf(conflict)).toMatchObject({ error: "cũ", code: "STALE_BASE", changes: [{ path: "x" }] });
    expect(await bodyOf(errorResponse(new Conflict("GONE", "mất")))).not.toHaveProperty("changes");

    expect(errorResponse(new HttpError(428, "PRECONDITION_REQUIRED", "thiếu")).status).toBe(428);
  });

  it("answers anything unexpected with 500 and no detail", async () => {
    const response = errorResponse(new Error("relation product_secret does not exist"));
    expect(response.status).toBe(500);
    const text = JSON.stringify(await bodyOf(response));
    expect(text).toContain("INTERNAL");
    expect(text).not.toContain("product_secret");
  });
});

describe("responses", () => {
  it("are never cached and carry the version as an ETag", () => {
    const response = json({ ok: true }, { etag: 7 });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("etag")).toBe('"7"');
    expect(json({}).headers.get("etag")).toBeNull();
  });

  it("describe a draft with the revision it was restored from", () => {
    const draft: Draft = {
      id: 1,
      ref: { type: "product", id: UID },
      baseVersion: 2,
      draftVersion: 4,
      snapshot: { uid: UID },
      note: "restore:1",
      createdBy: "u1",
      updatedBy: "u2",
      createdAt: new Date(0),
      updatedAt: new Date(1),
    };
    const { draft: described, issues } = draftBody(draft, [{ path: "x", message: "y" }]);
    expect(described).toMatchObject({ baseVersion: 2, draftVersion: 4, restoredFrom: 1 });
    expect(described).not.toHaveProperty("note");
    expect(issues).toEqual([{ path: "x", message: "y" }]);
    expect(draftBody({ ...draft, note: null }, []).draft.restoredFrom).toBeNull();
  });
});
