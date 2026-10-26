import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// SMTP is "configured" for this suite: the route reads the env once, so it is set before anything imports it.
vi.hoisted(() => {
  process.env.SMTP_HOST = "smtp.test.invalid";
  process.env.SMTP_USER = "bot@test.invalid";
  process.env.SMTP_PASS = "not-a-real-password";
});

const sendMail = vi.hoisted(() => vi.fn<(message: unknown) => Promise<{ messageId: string }>>(async () => ({ messageId: "test" })));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail }) } }));
vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/rate-limit")>();
  return { ...original, consumeLimit: vi.fn(original.consumeLimit) };
});

import { POST } from "@/app/api/consult/route";
import { getPool } from "@/lib/db";
import { consumeLimit } from "@/lib/rate-limit";
import { uniqueIp } from "@/tests/helpers/auth";

// The consult endpoint end to end: real counters in Postgres, the mail mocked. What matters is what a stranger can and cannot make it do.

const URL_ = "http://localhost:3000/api/consult";
let phoneCounter = 0;
/** A valid, never-before-seen phone number (each test counts its own). */
const freshPhone = () => `09${String(10_000_000 + ((Date.now() + phoneCounter++) % 90_000_000)).padStart(8, "0")}`;

function ask(body: unknown, { ip = uniqueIp(), raw, headers = {} }: { ip?: string; raw?: BodyInit; headers?: Record<string, string> } = {}): Promise<Response> {
  return POST(new Request(URL_, { method: "POST", headers: { "content-type": "application/json", "x-real-ip": ip, ...headers }, body: raw ?? JSON.stringify(body) }));
}
const read = async (response: Response) => (await response.json()) as Record<string, unknown>;
const lastMail = () => sendMail.mock.calls.at(-1)?.[0] as { to: string; subject: string; text: string; html: string };

beforeEach(() => {
  sendMail.mockClear();
  vi.mocked(consumeLimit).mockClear();
});
afterAll(async () => {
  await getPool().query("delete from rate_limit where key like 'vd:consult-%'");
  await getPool().end();
});

describe("a good request", () => {
  it("emails the owner once and answers with the Zalo link", async () => {
    const phone = freshPhone();
    const response = await ask({ phone, productName: "Tờ rơi A5", materialName: "Giấy C250", sizeLabel: "A5", sizeDims: "148 × 210 mm", productUrl: "http://localhost:3000/san-pham/tiep-thi/to-roi" });
    expect(response.status).toBe(200);
    expect(await read(response)).toMatchObject({ success: true, zaloChatLink: expect.stringMatching(/^https:\/\/zalo\.me\/84\d{9}$/) });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(lastMail()).toMatchObject({ to: "contact@vietdragon.vn", subject: `[Gấp] ${phone} quan tâm sản phẩm Tờ rơi A5` });
    expect(lastMail().html).toContain("Giấy C250");
    expect(lastMail().html).toContain("http://localhost:3000/san-pham/tiep-thi/to-roi");
  });

  it("takes a phone number written the way people write it", async () => {
    const response = await ask({ phone: "090 144 83 77" });
    expect(response.status).toBe(200);
    expect(lastMail().subject).toContain("0901448377");
  });
});

describe("what a stranger sends", () => {
  it("never gets his text into the mail as markup, nor a link to his own site", async () => {
    const evil = '"><script>alert(1)</script><img src=x onerror=alert(1)>';
    const response = await ask({ phone: freshPhone(), productName: evil, materialName: evil, sizeLabel: evil, productUrl: "https://evil.example/zalo-reply?phone=1" });
    expect(response.status).toBe(200);
    const { html, text } = lastMail();
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toContain("<img");
    expect(html).not.toContain("evil.example");
    expect(html).toContain("&lt;script&gt;");
    // The Zalo button goes to this site, never to the origin the request named.
    expect(html).toMatch(/href="http:\/\/localhost:3000\/zalo-reply\?phone=84\d{9}&amp;product=/);
    expect(text).not.toContain("evil.example");
  });

  it("cannot add a header to the mail through the product name", async () => {
    await ask({ phone: freshPhone(), productName: "Tờ rơi\r\nBcc: attacker@example.com\r\n\r\nbody" });
    expect(lastMail().subject).not.toMatch(/[\r\n]/);
  });

  it("is answered like a success, and nothing is sent, when the honeypot is filled", async () => {
    const response = await ask({ phone: freshPhone(), website: "http://spam.example" });
    expect(response.status).toBe(200);
    expect(await read(response)).toEqual({ success: true, message: "Yêu cầu tư vấn đã được gửi thành công!" });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it.each([
    ["no phone", {}],
    ["a bad phone", { phone: "12345" }],
    ["the old pattern's hole", { phone: "0|01448377" }],
    ["a field over its cap", { phone: "0901448377", productName: "x".repeat(201) }],
    ["a field of the wrong type", { phone: "0901448377", productName: ["a"] }],
  ])("answers 400 for %s", async (_name, body) => {
    const response = await ask(body);
    expect(response.status).toBe(400);
    expect(await read(response)).toMatchObject({ code: "INVALID", error: expect.any(String) });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("answers 400 — not 500 — for a body that is not JSON, or not an object", async () => {
    for (const raw of ["not json", "", "[1,2]", "null", '"text"']) {
      const response = await ask(undefined, { raw });
      expect(response.status, raw).toBe(400);
    }
  });

  it("answers 413 for a body over 8 KB, declared or streamed", async () => {
    const big = JSON.stringify({ phone: freshPhone(), productName: "x".repeat(9000) });
    const declared = await ask(undefined, { raw: big, headers: { "content-length": String(big.length) } });
    expect(declared.status).toBe(413);
    expect(await read(declared)).toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(big));
        controller.close();
      },
    });
    const streamed = await POST(new Request(URL_, { method: "POST", headers: { "x-real-ip": uniqueIp() }, body: stream, duplex: "half" } as RequestInit));
    expect(streamed.status).toBe(413);
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe("how often", () => {
  it("lets one address ask 5 times in ten minutes, then answers 429 with Retry-After — and counts junk and honeypots too", async () => {
    const ip = uniqueIp();
    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1) statuses.push((await ask(i === 1 ? { phone: "nope" } : i === 2 ? { phone: freshPhone(), website: "x" } : { phone: freshPhone() }, { ip })).status);
    expect(statuses).toEqual([200, 400, 200, 200, 200]);
    const sixth = await ask({ phone: freshPhone() }, { ip });
    expect(sixth.status).toBe(429);
    expect(Number(sixth.headers.get("retry-after"))).toBeGreaterThan(590);
    expect(sixth.headers.get("cache-control")).toBe("no-store");
    expect(await read(sixth)).toMatchObject({ code: "RATE_LIMITED", error: expect.stringContaining("quá nhiều") });
    expect(sendMail).toHaveBeenCalledTimes(3);
    // Another address is unaffected.
    expect((await ask({ phone: freshPhone() })).status).toBe(200);
  });

  it("lets one phone number ask 3 times an hour, from wherever", async () => {
    const phone = freshPhone();
    const statuses: number[] = [];
    for (let i = 0; i < 4; i += 1) statuses.push((await ask({ phone })).status);
    expect(statuses).toEqual([200, 200, 200, 429]);
    // Written differently, it is the same number.
    expect((await ask({ phone: `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}` })).status).toBe(429);
    expect(sendMail).toHaveBeenCalledTimes(3);
  });

  it("stops the whole form at 100 an hour, whoever asks", async () => {
    await getPool().query("delete from rate_limit where key = 'vd:consult-all:all'");
    await getPool().query("insert into rate_limit (id, key, count, last_request) values (gen_random_uuid()::text, 'vd:consult-all:all', 100, (extract(epoch from clock_timestamp()) * 1000)::bigint)");
    const response = await ask({ phone: freshPhone() });
    expect(response.status).toBe(429);
    expect(sendMail).not.toHaveBeenCalled();
    await getPool().query("delete from rate_limit where key = 'vd:consult-all:all'");
    expect((await ask({ phone: freshPhone() })).status).toBe(200);
  });

  it("does not keep the phone number itself in the counter table", async () => {
    const phone = freshPhone();
    await ask({ phone });
    const keys = (await getPool().query("select key from rate_limit where key like 'vd:consult-phone:%'")).rows.map((row: { key: string }) => row.key);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.some((key: string) => key.includes(phone))).toBe(false);
  });

  it("lets the request through, and says so in the log, when the counter cannot be asked", async () => {
    vi.mocked(consumeLimit).mockRejectedValueOnce(new Error("the database is down"));
    const response = await ask({ phone: freshPhone() });
    expect(response.status).toBe(200);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
});

describe("when the mail cannot be sent", () => {
  it("answers 500 in the app's error shape, without the reason", async () => {
    sendMail.mockRejectedValueOnce(new Error("535 authentication failed for bot@test.invalid"));
    const response = await ask({ phone: freshPhone() });
    expect(response.status).toBe(500);
    const body = await read(response);
    expect(body).toMatchObject({ code: "ERROR" });
    expect(JSON.stringify(body)).not.toContain("535");
  });
});

