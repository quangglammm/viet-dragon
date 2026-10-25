import { describe, expect, it } from "vitest";
import { isUploadKey, parseUploadPath, rejectionReason, slugOfName, sniffImage, uploadKey } from "./formats";

const bytes = (...values: number[]): Uint8Array => Uint8Array.from(values);
const text = (value: string): Uint8Array => new TextEncoder().encode(value);
const withBytes = (head: number[], length = 32): Uint8Array => Uint8Array.from({ length }, (_, index) => head[index] ?? 0);

/** An ISO-BMFF `ftyp` box: size, "ftyp", the major brand and the compatible brands. */
function ftyp(major: string, ...compatible: string[]): Uint8Array {
  const body = [...text("ftyp"), ...text(major), 0, 0, 0, 0, ...compatible.flatMap((brand) => [...text(brand)])];
  const size = body.length + 4;
  return Uint8Array.from([0, 0, 0, size, ...body]);
}

describe("sniffImage", () => {
  const cases: [string, Uint8Array, ReturnType<typeof sniffImage>][] = [
    ["a JPEG", withBytes([0xff, 0xd8, 0xff, 0xe0]), "jpeg"],
    ["a PNG", withBytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "png"],
    ["a GIF87a", text("GIF87a\0\0\0\0"), "gif"],
    ["a GIF89a", text("GIF89a\0\0\0\0"), "gif"],
    ["a WebP", Uint8Array.from([...text("RIFF"), 1, 2, 3, 4, ...text("WEBPVP8 ")]), "webp"],
    ["an AVIF (major brand)", ftyp("avif", "mif1", "miaf"), "avif"],
    ["an AVIF sequence", ftyp("avis", "msf1"), "avif"],
    ["an AVIF named only as a compatible brand", ftyp("mif1", "miaf", "avif"), "avif"],
  ];
  it.each(cases)("recognises %s", (_name, input, expected) => {
    expect(sniffImage(input)).toBe(expected);
  });

  const refused: [string, Uint8Array][] = [
    ["an SVG", text('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')],
    ["an HTML page", text("<!doctype html><script>alert(1)</script>")],
    ["a Windows program", withBytes([0x4d, 0x5a, 0x90, 0x00])],
    ["a PDF", text("%PDF-1.7\n")],
    ["a zip", withBytes([0x50, 0x4b, 0x03, 0x04])],
    ["a HEIC photo (same container as AVIF, not AVIF)", ftyp("heic", "mif1", "heix")],
    ["an MP4 video", ftyp("isom", "iso2", "mp41")],
    ["a RIFF file that is not WebP (a WAV)", Uint8Array.from([...text("RIFF"), 1, 2, 3, 4, ...text("WAVEfmt ")])],
    ["JPEG bytes cut to two", bytes(0xff, 0xd8)],
    ["nothing at all", new Uint8Array(0)],
    ["plain text", text("hello")],
  ];
  it.each(refused)("refuses %s", (_name, input) => {
    expect(sniffImage(input)).toBeNull();
  });

  it("is not fooled by an image signature that follows other content, or by a lying name (it only reads bytes)", () => {
    expect(sniffImage(Uint8Array.from([...text("MZ"), 0xff, 0xd8, 0xff]))).toBeNull();
    expect(sniffImage(Uint8Array.from([0x20, 0xff, 0xd8, 0xff]))).toBeNull();
  });
});

describe("rejectionReason", () => {
  it("names the kinds of file people actually try, in Vietnamese", () => {
    expect(rejectionReason(text("<svg></svg>"))).toContain("SVG");
    expect(rejectionReason(text("<?xml version='1.0'?><svg></svg>"))).toContain("SVG");
    expect(rejectionReason(Uint8Array.from([0xef, 0xbb, 0xbf, ...text("  <SVG>")]))).toContain("SVG");
    expect(rejectionReason(text("<html></html>"))).toContain("HTML");
    expect(rejectionReason(withBytes([0x4d, 0x5a]))).toContain(".exe");
    expect(rejectionReason(text("%PDF-1.4"))).toContain("PDF");
    expect(rejectionReason(withBytes([0x50, 0x4b, 0x03, 0x04]))).toContain("zip");
    expect(rejectionReason(ftyp("isom"))).toContain("MP4");
    expect(rejectionReason(new Uint8Array(0))).toBe("Tệp trống.");
    expect(rejectionReason(text("who knows"))).toContain("không phải ảnh");
  });
});

describe("slugOfName", () => {
  it.each([
    ["Poster Tết 2026 (bản cuối).JPG", "poster-tet-2026-ban-cuoi"],
    ["đồng phục.png", "dong-phuc"],
    ["C:\\Users\\me\\Desktop\\IMG_0042.HEIC.webp", "img-0042-heic"],
    ["../../etc/passwd", "passwd"],
    ["   ", "anh"],
    ["%%%.jpg", "anh"],
    ["日本語.png", "anh"],
    ["UPPER_snake_case.PNG", "upper-snake-case"],
  ])("%s → %s", (name, expected) => {
    expect(slugOfName(name)).toBe(expected);
  });

  it("cuts a long name at a word boundary, within 40 characters", () => {
    const slug = slugOfName(`${"tem-nhan-san-pham ".repeat(10)}.png`);
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(slug.startsWith("tem-nhan-san-pham")).toBe(true);
    expect(slugOfName(`${"a".repeat(80)}.png`)).toBe("a".repeat(40));
  });
});

describe("uploadKey", () => {
  const hash = "1a2b3c4d5e6f".padEnd(64, "0");
  it("is year / readable name / 8 hex characters of the hash, always .webp", () => {
    expect(uploadKey({ year: 2026, name: "Poster Tết.png", hash })).toBe("uploads/2026/poster-tet-1a2b3c4d.webp");
  });

  it("only ever produces a key the serving route accepts", () => {
    for (const name of ["a.png", "../../x.png", "Đ.jpg", "%00.gif", "".padEnd(300, "é"), ".htaccess", "con.png"]) {
      expect(isUploadKey(uploadKey({ year: 2026, name, hash }))).toBe(true);
    }
  });
});

describe("parseUploadPath — what a URL may name", () => {
  const good = ["uploads", "2026", "poster-tet-1a2b3c4d.webp"];
  it("accepts exactly the shape uploadKey writes", () => {
    expect(parseUploadPath(good)).toBe("uploads/2026/poster-tet-1a2b3c4d.webp");
    expect(isUploadKey("uploads/2026/a-00000000.webp")).toBe(true);
  });

  const refused: [string, string[]][] = [
    ["a dot-dot segment", ["uploads", "..", "poster-tet-1a2b3c4d.webp"]],
    ["a dot-dot in the year slot", ["uploads", "2026", "..", "x"]],
    ["an encoded dot-dot that was decoded", ["uploads", "2026", "../../etc/passwd"]],
    ["a separator inside a segment (decoded %2f)", ["uploads", "2026", "a/b-1a2b3c4d.webp"]],
    ["a backslash", ["uploads", "2026", "a\\b-1a2b3c4d.webp"]],
    ["an absolute path in a segment", ["uploads", "2026", "/etc/passwd"]],
    ["an empty segment", ["uploads", "", "poster-tet-1a2b3c4d.webp"]],
    ["upper case", ["uploads", "2026", "Poster-Tet-1A2B3C4D.webp"]],
    ["a year that is not four digits", ["uploads", "26", "poster-tet-1a2b3c4d.webp"]],
    ["a second level too deep", ["uploads", "2026", "x", "poster-tet-1a2b3c4d.webp"]],
    ["one level too shallow", ["uploads", "poster-tet-1a2b3c4d.webp"]],
    ["another extension", ["uploads", "2026", "poster-tet-1a2b3c4d.php"]],
    ["a double extension", ["uploads", "2026", "poster-tet-1a2b3c4d.webp.php"]],
    ["no hash", ["uploads", "2026", "poster.webp"]],
    ["a hidden file", ["uploads", "2026", ".poster-1a2b3c4d.webp"]],
    ["the wrong root", ["images", "2026", "poster-tet-1a2b3c4d.webp"]],
    ["a NUL byte", ["uploads", "2026", "poster\0-1a2b3c4d.webp"]],
    ["nothing", []],
  ];
  it.each(refused)("refuses %s", (_name, segments) => {
    expect(parseUploadPath(segments)).toBeNull();
  });
});
