import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// React's cache() memoises per server request; outside one it would pin the first result for the whole run.
vi.mock("react", async (importOriginal) => ({ ...(await importOriginal<typeof import("react")>()), cache: <T>(fn: T) => fn }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }));

import { DELETE, GET, POST } from "@/app/api/admin/content/media/route";
import { GET as serve, HEAD as serveHead } from "@/app/uploads/[...key]/route";
import { discardDraft, openDraft, saveDraft } from "@/lib/content/drafts";
import type { ProductDocument } from "@/lib/content/schemas";
import { getPool } from "@/lib/db";
import { auditRows, createUser, login, ORIGIN, uniqueEmail } from "@/tests/helpers/auth";
import { editAndPublish, liveDocument } from "@/tests/helpers/content-lifecycle";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";

// The media library end to end: real handlers, real sessions, a seeded database, a real folder standing in for the volume.

let seeded: SeededDatabase;
let volume: string;
let editor: { cookie: string; email: string; id: string };
let admin: { cookie: string; email: string };

const MEGABYTE = 1024 * 1024;

beforeAll(async () => {
  seeded = await createSeededDatabase("media-api");
  volume = mkdtempSync(join(tmpdir(), "vd-uploads-"));
  // The app's own connection and volume must point at the scratch ones: nothing has called them yet, so this is early enough.
  process.env.DATABASE_URL = seeded.scratch.url;
  process.env.UPLOADS_DIR = volume;
  const editorEmail = uniqueEmail("editor");
  await createUser(editorEmail, "editor");
  editor = { cookie: await login(editorEmail), email: editorEmail, id: "" };
  const adminEmail = uniqueEmail("admin");
  await createUser(adminEmail, "admin");
  admin = { cookie: await login(adminEmail), email: adminEmail };
  editor.id = (await getPool().query<{ id: string }>("select id from app_user where email = $1", [editorEmail])).rows[0].id;
}, 180_000);

afterAll(async () => {
  await getPool().end();
  await seeded.close();
  rmSync(volume, { recursive: true, force: true });
});

const filesOnVolume = (): string[] => (existsSync(volume) ? readdirSync(volume, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => join(entry.parentPath, entry.name)) : []);
const mediaRows = async () => (await getPool().query<{ n: number }>("select count(*)::int n from media where source = 'upload'")).rows[0].n;

beforeEach(async () => {
  // Each test starts with an empty volume, no uploads and no open drafts; the static rows of the seed stay.
  rmSync(volume, { recursive: true, force: true });
  mkdirSync(volume, { recursive: true });
  await getPool().query("delete from content_draft");
  await getPool().query("delete from media where source = 'upload' or storage_key like 'uploads/2026/lookalike-%'");
});

// ───────────── plumbing ─────────────

const jpegWithGps = (width = 800, height = 600) =>
  sharp({ create: { width, height, channels: 3, background: { r: 200, g: 60, b: 30 } } })
    .jpeg()
    .withExif({ IFD0: { Make: "SecretCam" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "10/1 46/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "106/1 42/1 0/1" } })
    .toBuffer();

type Init = { cookie?: string; origin?: string | null; file?: { bytes: Uint8Array | Buffer; name: string; type?: string }; form?: FormData; json?: unknown; contentType?: string };

function post(init: Init = {}): Promise<Response> {
  const headers = new Headers();
  if (init.cookie) headers.set("cookie", init.cookie);
  if (init.origin !== null) headers.set("origin", init.origin ?? ORIGIN);
  let body: BodyInit | undefined;
  if (init.json !== undefined) {
    headers.set("content-type", init.contentType ?? "application/json");
    body = JSON.stringify(init.json);
  } else {
    const form = init.form ?? new FormData();
    if (init.file) form.append("file", new File([new Uint8Array(init.file.bytes)], init.file.name, { type: init.file.type ?? "image/jpeg" }));
    body = form;
  }
  return POST(new Request(`${ORIGIN}/api/admin/content/media`, { method: "POST", headers, body }));
}

function remove(key: unknown, init: { cookie?: string; origin?: string | null } = {}): Promise<Response> {
  const headers = new Headers({ "content-type": "application/json" });
  if (init.cookie) headers.set("cookie", init.cookie);
  if (init.origin !== null) headers.set("origin", init.origin ?? ORIGIN);
  return DELETE(new Request(`${ORIGIN}/api/admin/content/media`, { method: "DELETE", headers, body: JSON.stringify({ key }) }));
}

const list = (cookie: string, search = ""): Promise<Response> => GET(new Request(`${ORIGIN}/api/admin/content/media${search}`, { headers: { cookie } }));

type Uploaded = { item: { key: string; source: string; kind: string; mime: string; width: number; height: number; bytes: number; createdAt: string }; existing: boolean };
const read = async <T>(response: Response) => (await response.json()) as T;
type ErrorBody = { error: string; code: string; issues?: { path: string; message: string }[] };

async function uploadOk(name = "Poster Tết.jpg", bytes?: Uint8Array): Promise<Uploaded> {
  const response = await post({ cookie: editor.cookie, file: { bytes: bytes ?? (await jpegWithGps()), name } });
  expect([200, 201]).toContain(response.status);
  return read<Uploaded>(response);
}

const get = (path: string, headers: Record<string, string> = {}) => serve(new Request(`${ORIGIN}/${path}`, { headers }), { params: Promise.resolve({ key: path.split("/").slice(1) }) });
const getSegments = (segments: string[], method: "GET" | "HEAD" = "GET", headers: Record<string, string> = {}) =>
  (method === "GET" ? serve : serveHead)(new Request(`${ORIGIN}/uploads/${segments.join("/")}`, { method, headers }), { params: Promise.resolve({ key: segments }) });

// ───────────── who may upload, and what a request may look like ─────────────

describe("POST /api/admin/content/media — the request", () => {
  it("answers 401 without a session, 403 from another origin, 415 for a body that is not multipart", async () => {
    const file = { bytes: await jpegWithGps(), name: "a.jpg" };
    expect((await post({ file })).status).toBe(401);
    const cross = await post({ cookie: editor.cookie, file, origin: "https://evil.example" });
    expect(cross.status).toBe(403);
    expect((await read<ErrorBody>(cross)).code).toBe("CROSS_ORIGIN");
    const json = await post({ cookie: editor.cookie, json: { file: "x" } });
    expect(json.status).toBe(415);
    expect(filesOnVolume()).toEqual([]);
  });

  it("refuses an account that still has its temporary password", async () => {
    const email = uniqueEmail("temp");
    await createUser(email, "editor", { mustChangePassword: true });
    const response = await post({ cookie: await login(email), file: { bytes: await jpegWithGps(), name: "a.jpg" } });
    expect(response.status).toBe(403);
    expect(filesOnVolume()).toEqual([]);
  });

  it("answers 413 for a body over the cap — by its declared length, and by counting when there is none", async () => {
    const big = Buffer.alloc(11 * MEGABYTE, 1);
    const declared = await post({ cookie: editor.cookie, file: { bytes: big, name: "big.jpg" } });
    expect(declared.status).toBe(413);
    expect((await read<ErrorBody>(declared)).code).toBe("PAYLOAD_TOO_LARGE");

    // A client that declares nothing (or lies): the stream itself is counted and cut off.
    const boundary = "----vdtest";
    const head = Buffer.from(`--${boundary}\r\ncontent-disposition: form-data; name="file"; filename="big.jpg"\r\ncontent-type: image/jpeg\r\n\r\n`);
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(head);
        for (let sent = 0; sent < 11 * MEGABYTE; sent += MEGABYTE) controller.enqueue(Buffer.alloc(MEGABYTE, 1));
        controller.enqueue(tail);
        controller.close();
      },
    });
    const chunked = await POST(new Request(`${ORIGIN}/api/admin/content/media`, { method: "POST", headers: { cookie: editor.cookie, origin: ORIGIN, "content-type": `multipart/form-data; boundary=${boundary}` }, body: stream, duplex: "half" } as RequestInit));
    expect(chunked.status).toBe(413);
    expect(filesOnVolume()).toEqual([]);
  });

  it("takes exactly one `file` part and nothing else", async () => {
    const file = { bytes: await jpegWithGps(), name: "a.jpg" };
    const none = await post({ cookie: editor.cookie });
    expect(none.status).toBe(422);
    const two = new FormData();
    two.append("file", new File([new Uint8Array(file.bytes)], "a.jpg"));
    const second = await post({ cookie: editor.cookie, form: two, file: { ...file, name: "b.jpg" } });
    expect(second.status).toBe(422);
    const extra = new FormData();
    extra.append("alt", "tên ảnh");
    expect((await post({ cookie: editor.cookie, form: extra, file })).status).toBe(422);
    const text = new FormData();
    text.append("file", "not a file");
    expect((await post({ cookie: editor.cookie, form: text })).status).toBe(422);
    expect(filesOnVolume()).toEqual([]);
    expect(await mediaRows()).toBe(0);
  });
});

describe("POST /api/admin/content/media — what is in the file", () => {
  const png = () => sharp({ create: { width: 10, height: 10, channels: 3, background: "white" } }).png().toBuffer();

  const disguises: [string, () => Promise<Buffer> | Buffer, string][] = [
    ["an SVG with a script", () => Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), "evil.svg"],
    // sharp can rasterise an SVG that states its size, so only the allow-list (formats.ts) keeps this one out.
    ["an SVG that states its size", () => Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="red"/></svg>'), "logo.svg"],
    ["a sized SVG renamed .png", () => Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40"/></svg>'), "logo.png"],
    ["an SVG renamed .png", () => Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), "logo.png"],
    ["an HTML page renamed .jpg", () => Buffer.from("<!doctype html><script>alert(1)</script>"), "photo.jpg"],
    ["a Windows program renamed .jpg", () => Buffer.concat([Buffer.from([0x4d, 0x5a, 0x90, 0x00]), Buffer.alloc(200, 7)]), "photo.jpg"],
    ["a PDF renamed .png", () => Buffer.from("%PDF-1.7\n%âãÏÓ\n1 0 obj"), "design.png"],
    ["a zip renamed .webp", () => Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(100)]), "a.webp"],
    ["JPEG bytes followed by garbage", () => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from("not really a picture ".repeat(40))]), "a.jpg"],
    ["a PNG cut short", async () => (await png()).subarray(0, 40), "a.png"],
    ["an empty file", () => Buffer.alloc(0), "a.jpg"],
  ];

  it.each(disguises)("refuses %s with 422 and stores nothing", async (_name, make, name) => {
    const before = await mediaRows();
    const response = await post({ cookie: editor.cookie, file: { bytes: await make(), name, type: "image/jpeg" } });
    expect(response.status).toBe(422);
    const body = await read<ErrorBody>(response);
    expect(body.code).toBe("INVALID");
    expect(body.issues?.[0]?.path).toBe("file");
    expect(filesOnVolume()).toEqual([]);
    expect(await mediaRows()).toBe(before);
  });

  it("stores a real photo as a WebP of its pixels — no EXIF, no GPS — and registers it", async () => {
    const original = await jpegWithGps();
    expect(original.toString("latin1")).toContain("SecretCam");
    const response = await post({ cookie: editor.cookie, file: { bytes: original, name: "Poster Tết (bản cuối).JPG" } });
    expect(response.status).toBe(201);
    const { item, existing } = await read<Uploaded>(response);
    expect(existing).toBe(false);
    expect(item).toMatchObject({ source: "upload", kind: "image", mime: "image/webp", width: 800, height: 600 });
    expect(item.key).toMatch(new RegExp(`^uploads/${new Date().getUTCFullYear()}/poster-tet-ban-cuoi-[0-9a-f]{8}\\.webp$`));

    const files = filesOnVolume();
    expect(files).toHaveLength(1);
    const stored = readFileSync(files[0]);
    expect(files[0]).toBe(join(volume, item.key.split("/").slice(1).join("/")));
    expect(stored.length).toBe(item.bytes);
    expect((await sharp(stored).metadata()).format).toBe("webp");
    expect((await sharp(stored).metadata()).exif).toBeUndefined();
    expect(stored.toString("latin1")).not.toContain("SecretCam");

    const [row] = (await getPool().query("select * from media where storage_key = $1", [item.key])).rows;
    expect(row).toMatchObject({ source: "upload", backend: "local", kind: "image", mime: "image/webp", width: 800, height: 600, created_by: editor.id });
    expect(row.sha256).toBe(createHash("sha256").update(stored).digest("hex"));
    expect(Number(row.bytes)).toBe(stored.length);
  });

  it("scales a big picture down and never reads the name as a path", async () => {
    const big = await sharp({ create: { width: 4200, height: 1400, channels: 3, background: "teal" } }).png().toBuffer();
    const { item } = await uploadOk("../../../etc/passwd.png", big);
    expect([item.width, item.height]).toEqual([3000, 1000]);
    expect(item.key).toMatch(/^uploads\/\d{4}\/passwd-[0-9a-f]{8}\.webp$/);
    expect(filesOnVolume().every((file) => file.startsWith(volume))).toBe(true);
  });

  it("does not store the same picture twice, whatever it is called", async () => {
    const first = await uploadOk("one.jpg");
    const again = await post({ cookie: editor.cookie, file: { bytes: await jpegWithGps(), name: "another name.jpg" } });
    expect(again.status).toBe(200);
    const body = await read<Uploaded>(again);
    expect(body.existing).toBe(true);
    expect(body.item.key).toBe(first.item.key);
    expect(filesOnVolume()).toHaveLength(1);
    expect(await mediaRows()).toBe(1);
  });

  it("two identical uploads at once make one file and one row", async () => {
    const bytes = await jpegWithGps(640, 480);
    const responses = await Promise.all([1, 2, 3].map((index) => post({ cookie: editor.cookie, file: { bytes, name: `same-${index}.jpg` } })));
    expect(responses.every((response) => response.status === 200 || response.status === 201)).toBe(true);
    const keys = new Set((await Promise.all(responses.map((response) => read<Uploaded>(response)))).map((body) => body.item.key));
    expect(keys.size).toBe(1);
    expect(filesOnVolume()).toHaveLength(1);
    expect(await mediaRows()).toBe(1);
  });

  it("writes an audit row for an upload, but not for the repeat of one", async () => {
    const { item } = await uploadOk("audit.jpg");
    await uploadOk("audit-again.jpg");
    const rows = await auditRows({ action: "media.uploaded", entityId: item.key });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ actor_label: editor.email, entity_type: "media" });
  });
});

describe("the library listing", () => {
  it("says where each file comes from, and can show only the uploads", async () => {
    const { item } = await uploadOk("listed.jpg");
    const all = await read<{ items: { key: string; source: string; createdAt: string }[] }>(await list(editor.cookie, "?limit=100"));
    expect(all.items.some((entry) => entry.source === "static")).toBe(true);
    const uploads = await read<{ items: { key: string; source: string; createdAt: string }[] }>(await list(editor.cookie, "?source=upload"));
    expect(uploads.items.map((entry) => entry.key)).toEqual([item.key]);
    expect(uploads.items[0]).toMatchObject({ source: "upload", createdAt: expect.any(String) });
    expect((await list(editor.cookie, "?source=nope")).status).toBe(422);
  });

  it("tells the UI the largest upload it may send", async () => {
    const body = await read<{ maxUploadBytes: number }>(await list(editor.cookie));
    expect(body.maxUploadBytes).toBe(10 * MEGABYTE);
  });

  it("can list the latest uploads first, or by name", async () => {
    const first = await uploadOk("zzz-first.jpg", await jpegWithGps(300, 200));
    await new Promise((resolve) => setTimeout(resolve, 15));
    const second = await uploadOk("aaa-second.jpg", await jpegWithGps(310, 200));
    const keys = async (search: string) => (await read<{ items: { key: string }[] }>(await list(editor.cookie, search))).items.map((item) => item.key);
    expect(await keys("?source=upload&order=newest")).toEqual([second.item.key, first.item.key]);
    expect(await keys("?source=upload&order=name")).toEqual([second.item.key, first.item.key].sort());
    expect(await keys("?source=upload")).toEqual([second.item.key, first.item.key].sort());
    expect((await list(editor.cookie, "?order=sideways")).status).toBe(422);
  });
});

// ───────────── serving ─────────────

describe("GET /uploads/<year>/<file>", () => {
  it("serves the stored bytes with the headers an image should have", async () => {
    const { item } = await uploadOk("served.jpg");
    const stored = readFileSync(filesOnVolume()[0]);
    const response = await get(item.key);
    expect(response.status).toBe(200);
    expect(Buffer.from(await response.arrayBuffer()).equals(stored)).toBe(true);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("content-length")).toBe(String(stored.length));
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toBe("default-src 'none'; sandbox");
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(response.headers.get("content-disposition")).toBe("inline");
    expect(response.headers.get("etag")).toBe(`"${createHash("sha256").update(stored).digest("hex")}"`);
  });

  it("answers HEAD without a body, and 304 to a matching If-None-Match (weak or listed too)", async () => {
    const { item } = await uploadOk("conditional.jpg");
    const segments = item.key.split("/").slice(1);
    const head = await getSegments(segments, "HEAD");
    expect(head.status).toBe(200);
    expect((await head.arrayBuffer()).byteLength).toBe(0);
    expect(Number(head.headers.get("content-length"))).toBe(item.bytes);

    const etag = head.headers.get("etag")!;
    for (const header of [etag, `W/${etag}`, `"other", ${etag}`]) {
      const cached = await getSegments(segments, "GET", { "if-none-match": header });
      expect(cached.status).toBe(304);
      expect((await cached.arrayBuffer()).byteLength).toBe(0);
    }
    expect((await getSegments(segments, "GET", { "if-none-match": '"something-else"' })).status).toBe(200);
  });

  const traversal: [string, string[]][] = [
    ["a dot-dot in the year slot", ["..", "etc", "passwd"]],
    ["a dot-dot before the file", ["2026", "..", "x.webp"]],
    ["an encoded dot-dot that arrived decoded", ["2026", "../../../etc/passwd"]],
    ["a separator decoded inside a segment", ["2026", "a/b-1a2b3c4d.webp"]],
    ["a backslash", ["2026", "..\\..\\x-1a2b3c4d.webp"]],
    ["an absolute path", ["2026", "/etc/passwd"]],
    ["a NUL byte", ["2026", "x\0-1a2b3c4d.webp"]],
    ["an empty segment", ["", "x-1a2b3c4d.webp"]],
    ["a built-in file", ["bieumau.webp"]],
    ["too deep", ["2026", "a", "x-1a2b3c4d.webp"]],
    ["not a key of ours (wrong extension)", ["2026", "x-1a2b3c4d.php"]],
  ];
  it.each(traversal)("answers 404 for %s — and never reads outside the volume", async (_name, segments) => {
    // A decoy outside the volume that a successful traversal would reach.
    writeFileSync(join(volume, "..", "vd-decoy.txt"), "secret");
    const response = await getSegments(segments);
    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("secret");
    rmSync(join(volume, "..", "vd-decoy.txt"), { force: true });
  });

  it("answers 404 for a key nobody uploaded, for a row that is not an upload, and for a row whose file is gone", async () => {
    expect((await get("uploads/2026/nothing-here-0badc0de.webp")).status).toBe(404);

    // A built-in row and a file that LOOK like an upload: the serving route needs source = 'upload'.
    const key = "uploads/2026/lookalike-aabbccdd.webp";
    mkdirSync(join(volume, "2026"), { recursive: true });
    writeFileSync(join(volume, "2026", "lookalike-aabbccdd.webp"), "bytes");
    await getPool().query("insert into media (source, backend, storage_key, kind, mime, bytes, sha256) values ('static', 'local', $1, 'image', 'image/webp', 5, 'aa')", [key]);
    expect((await get(key)).status).toBe(404);

    const { item } = await uploadOk("vanished.jpg");
    for (const file of filesOnVolume()) if (file.includes("vanished")) rmSync(file);
    expect((await get(item.key)).status).toBe(404);
    await getPool().query("delete from media where storage_key = $1", [key]);
  });

  it("does not serve a file whose row was deleted, even if the file is still there", async () => {
    const { item } = await uploadOk("orphan.jpg");
    await getPool().query("delete from media where storage_key = $1", [item.key]);
    expect(filesOnVolume()).toHaveLength(1);
    expect((await get(item.key)).status).toBe(404);
  });
});

// ───────────── delete ─────────────

describe("DELETE /api/admin/content/media", () => {
  const productUid = () => seeded.outcome.products.values().next().value!.uid;
  const product = () => ({ type: "product" as const, id: productUid() });

  it("is for admins only, from our own pages, with a JSON body", async () => {
    const { item } = await uploadOk("protected.jpg");
    expect((await remove(item.key)).status).toBe(401);
    const forbidden = await remove(item.key, { cookie: editor.cookie });
    expect(forbidden.status).toBe(403);
    expect((await read<ErrorBody>(forbidden)).code).toBe("FORBIDDEN");
    expect((await remove(item.key, { cookie: admin.cookie, origin: "https://evil.example" })).status).toBe(403);
    expect((await remove({ not: "a string" }, { cookie: admin.cookie })).status).toBe(422);
    expect(await mediaRows()).toBe(1);
    expect(filesOnVolume()).toHaveLength(1);
  });

  it("removes an unused upload: the row, the file, and the address", async () => {
    const { item } = await uploadOk("unused.jpg");
    const response = await remove(item.key, { cookie: admin.cookie });
    expect(response.status).toBe(204);
    expect(await mediaRows()).toBe(0);
    expect(filesOnVolume()).toEqual([]);
    expect((await get(item.key)).status).toBe(404);
    const rows = await auditRows({ action: "media.deleted", entityId: item.key });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ actor_label: admin.email });
  });

  it("answers 404 for a file that is not in the library, and 409 READ_ONLY for one of the site's own", async () => {
    expect((await remove("uploads/2026/nothing-0badc0de.webp", { cookie: admin.cookie })).status).toBe(404);
    const staticKey = (await getPool().query<{ storage_key: string }>("select storage_key from media where source = 'static' limit 1")).rows[0].storage_key;
    const refused = await remove(staticKey, { cookie: admin.cookie });
    expect(refused.status).toBe(409);
    expect((await read<ErrorBody>(refused)).code).toBe("READ_ONLY");
    expect((await getPool().query("select 1 from media where storage_key = $1", [staticKey])).rowCount).toBe(1);
  });

  it("never removes a row that is labelled an upload but is not one of ours (a built-in file under public/uploads)", async () => {
    await getPool().query("insert into media (source, backend, storage_key, kind, mime, bytes, sha256) values ('upload', 'local', 'uploads/legacy.webp', 'image', 'image/webp', 5, 'bb')");
    const refused = await remove("uploads/legacy.webp", { cookie: admin.cookie });
    expect(refused.status).toBe(409);
    expect((await read<ErrorBody>(refused)).code).toBe("READ_ONLY");
    expect((await getPool().query("select 1 from media where storage_key = 'uploads/legacy.webp'")).rowCount).toBe(1);
    await getPool().query("delete from media where storage_key = 'uploads/legacy.webp'");
  });

  it("refuses to remove a picture a published product uses, and says how much it is used", async () => {
    const { item } = await uploadOk("cover.jpg");
    const before = (await liveDocument(seeded.db, product())).cover;
    await editAndPublish(seeded.db, product(), (document: ProductDocument) => void (document.cover = item.key));

    const refused = await remove(item.key, { cookie: admin.cookie });
    expect(refused.status).toBe(409);
    const body = await read<ErrorBody>(refused);
    expect(body.code).toBe("IN_USE");
    expect(body.error).toContain("1 mục đang hiển thị");
    expect(await mediaRows()).toBe(1);
    expect(filesOnVolume()).toHaveLength(1);
    expect((await get(item.key)).status).toBe(200);

    // Put the old cover back: now nothing uses it.
    await editAndPublish(seeded.db, product(), (document: ProductDocument) => void (document.cover = before));
    expect((await remove(item.key, { cookie: admin.cookie })).status).toBe(204);
    expect(filesOnVolume()).toEqual([]);
  });

  it("refuses while an open DRAFT uses it — the foreign keys cannot see a draft", async () => {
    const { item } = await uploadOk("draft-cover.jpg");
    const draft = await openDraft(seeded.db, product(), null);
    const edited = structuredClone(draft.snapshot) as unknown as ProductDocument;
    edited.cover = item.key;
    await saveDraft(seeded.db, product(), { snapshot: edited, expectDraftVersion: draft.draftVersion, author: null });

    const refused = await remove(item.key, { cookie: admin.cookie });
    expect(refused.status).toBe(409);
    expect((await read<ErrorBody>(refused)).error).toContain("1 bản nháp");
    expect(await mediaRows()).toBe(1);

    await discardDraft(seeded.db, product());
    expect((await remove(item.key, { cookie: admin.cookie })).status).toBe(204);
  });
});
