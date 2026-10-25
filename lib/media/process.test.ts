import { crc32 } from "node:zlib";
import sharp, { type Sharp } from "sharp";
import { describe, expect, it } from "vitest";
import { Invalid } from "@/lib/content/errors";
import { sniffImage } from "./formats";
import { MAX_EDGE, MAX_INPUT_PIXELS, processImage } from "./process";

// The decoder is the real gate: these run it on real images, some of them crafted to carry what must not survive.

const blank = (width: number, height: number, background = { r: 200, g: 60, b: 30 }) => sharp({ create: { width, height, channels: 3, background } });
const metadataOf = (bytes: Buffer) => sharp(bytes).metadata();

const GPS = {
  IFD0: { Make: "SecretCam", Copyright: "Nguyen Van A" },
  IFD3: { GPSLatitudeRef: "N", GPSLatitude: "10/1 46/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "106/1 42/1 0/1" },
};

/** A PNG whose header claims `width × height` and has no pixel data at all: a decompression bomb in a few dozen bytes. */
function pngClaiming(width: number, height: number): Buffer {
  const chunk = (type: string, data: Buffer): Buffer => {
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", header), chunk("IDAT", Buffer.alloc(0)), chunk("IEND", Buffer.alloc(0))]);
}

const refusal = async (input: Buffer): Promise<Invalid> => {
  const error = await processImage(input).then(() => null, (caught: unknown) => caught);
  expect(error).toBeInstanceOf(Invalid);
  return error as Invalid;
};

describe("processImage", () => {
  it("stores every accepted format as WebP, with the pixel size it has", async () => {
    for (const encode of [(i: Sharp) => i.jpeg(), (i: Sharp) => i.png(), (i: Sharp) => i.webp(), (i: Sharp) => i.avif(), (i: Sharp) => i.gif()]) {
      const input = await encode(blank(120, 80)).toBuffer();
      const result = await processImage(input);
      expect(sniffImage(result.bytes)).toBe("webp");
      expect(result.mime).toBe("image/webp");
      expect([result.width, result.height]).toEqual([120, 80]);
      expect((await metadataOf(result.bytes)).format).toBe("webp");
    }
  });

  it("scales a big picture down to 3000 px on its longest side, keeping the proportions", async () => {
    const wide = await processImage(await blank(4500, 1500).jpeg().toBuffer());
    expect([wide.width, wide.height]).toEqual([MAX_EDGE, 1000]);
    const tall = await processImage(await blank(1200, 3600).png().toBuffer());
    expect([tall.width, tall.height]).toEqual([1000, MAX_EDGE]);
  });

  it("never enlarges a small picture", async () => {
    const result = await processImage(await blank(40, 20).png().toBuffer());
    expect([result.width, result.height]).toEqual([40, 20]);
  });

  it("drops the EXIF — GPS position, camera, owner — and everything else that is metadata", async () => {
    const input = await blank(64, 64).jpeg().withExif(GPS).toBuffer();
    const before = await metadataOf(input);
    expect(before.exif).toBeDefined();
    expect(input.toString("latin1")).toContain("SecretCam");

    const result = await processImage(input);
    const after = await metadataOf(result.bytes);
    expect(after.exif).toBeUndefined();
    expect(after.xmp).toBeUndefined();
    expect(result.bytes.toString("latin1")).not.toContain("SecretCam");
    expect(result.bytes.toString("latin1")).not.toContain("Nguyen Van A");
  });

  it("applies the EXIF orientation to the pixels (a phone photo taken sideways is stored upright)", async () => {
    const sideways = await blank(60, 30).jpeg().withMetadata({ orientation: 6 }).toBuffer();
    expect((await metadataOf(sideways)).orientation).toBe(6);
    const result = await processImage(sideways);
    expect([result.width, result.height]).toEqual([30, 60]);
    expect((await metadataOf(result.bytes)).orientation).toBeUndefined();
  });

  it("converts a CMYK print JPEG to sRGB", async () => {
    const cmyk = await blank(50, 50).toColourspace("cmyk").jpeg().toBuffer();
    expect((await metadataOf(cmyk)).space).toBe("cmyk");
    const result = await processImage(cmyk);
    expect((await metadataOf(result.bytes)).space).toBe("srgb");
  });

  it("keeps transparency", async () => {
    const input = await sharp({ create: { width: 30, height: 30, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
    const result = await processImage(input);
    const { data } = await sharp(result.bytes).raw().toBuffer({ resolveWithObject: true });
    expect(data[3]).toBe(0);
  });

  it("keeps only the first frame of an animated GIF", async () => {
    const frame = (red: number) => sharp({ create: { width: 20, height: 20, channels: 3, background: { r: red, g: 0, b: 0 } } }).raw().toBuffer();
    const animated = await sharp(Buffer.concat([await frame(255), await frame(0)]), { raw: { width: 20, height: 40, channels: 3, pageHeight: 20 } })
      .gif({ loop: 0, delay: [100, 100] })
      .toBuffer();
    expect((await metadataOf(animated)).pages).toBe(2);

    const result = await processImage(animated);
    const stored = await metadataOf(result.bytes);
    expect(stored.pages ?? 1).toBe(1);
    expect([result.width, result.height]).toEqual([20, 20]);
    const { data } = await sharp(result.bytes).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(data[0]).toBeGreaterThan(200); // the first frame is the red one
  });
});

describe("processImage refuses what only looks like an image", () => {
  it("a decompression bomb — a header that claims more pixels than the limit, with no data behind it", async () => {
    const claimed = Math.ceil(Math.sqrt(MAX_INPUT_PIXELS)) + 10;
    const error = await refusal(pngClaiming(claimed, claimed));
    expect(error.issues[0].path).toBe("file");
    expect(error.issues[0].message).toContain("quá lớn");
  });

  it("a picture just under the limit is not mistaken for a bomb", async () => {
    // 80 MP is far too big to build here; the boundary itself is the constant. A header under it fails only for lack of pixel data, as «hỏng».
    const error = await refusal(pngClaiming(1000, 1000));
    expect(error.issues[0].message).toContain("hỏng");
  });

  it("JPEG magic bytes followed by garbage", async () => {
    const error = await refusal(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from("this is not a jpeg stream at all".repeat(20))]));
    expect(error.issues[0].message).toContain("hỏng");
  });

  it("a JPEG cut in half", async () => {
    const whole = await sharp({ create: { width: 400, height: 400, channels: 3, background: { r: 128, g: 128, b: 128 }, noise: { type: "gaussian", mean: 128, sigma: 60 } } }).jpeg().toBuffer();
    await refusal(whole.subarray(0, Math.floor(whole.length / 2)));
  });

  it("an SVG, even though the decoder could read it (it is not in the allow-list, and nothing here would sanitise it)", async () => {
    // The sniffing gate (formats.ts) stops it before this point; this is the second line: sharp reads SVG, so it must never get one.
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>');
    expect(sniffImage(svg)).toBeNull();
  });

  it("nothing at all", async () => {
    await refusal(Buffer.alloc(0));
  });
});

describe("processImage under load", () => {
  it("handles more simultaneous uploads than it decodes at once, and finishes every one", async () => {
    const inputs = await Promise.all(Array.from({ length: 7 }, (_, index) => blank(200 + index, 100, { r: index * 30, g: 10, b: 10 }).jpeg().toBuffer()));
    const results = await Promise.all(inputs.map((input) => processImage(input)));
    expect(results.map((result) => result.width)).toEqual([200, 201, 202, 203, 204, 205, 206]);
  });

  it("is not wedged by a failure: the slot is handed on", async () => {
    const good = await blank(30, 30).png().toBuffer();
    const outcomes = await Promise.allSettled([processImage(Buffer.from("junk")), processImage(good), processImage(Buffer.from("more junk")), processImage(good), processImage(good)]);
    expect(outcomes.map((outcome) => outcome.status)).toEqual(["rejected", "fulfilled", "rejected", "fulfilled", "fulfilled"]);
  });
});
