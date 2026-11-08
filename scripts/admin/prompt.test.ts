import { describe, expect, it } from "vitest";
import { applyInput } from "./prompt";

const type = (text: string, start = "") => applyInput(start, text);

describe("applyInput", () => {
  it("accumulates typed characters one keystroke at a time", () => {
    let state = type("a");
    state = applyInput(state.buffer, "b");
    state = applyInput(state.buffer, "c");
    expect(state).toEqual({ buffer: "abc", done: false, aborted: false });
  });

  it("takes a whole paste in one chunk", () => {
    expect(type("correct horse battery staple")).toMatchObject({ buffer: "correct horse battery staple", done: false });
  });

  it.each(["\r", "\n"])("finishes on Enter (%j) and ignores anything after it", (enter) => {
    expect(type(`secret${enter}ignored`)).toEqual({ buffer: "secret", done: true, aborted: false });
  });

  it("backspace removes one character, and one whole character for multi-byte input", () => {
    expect(type("abc\u007f").buffer).toBe("ab");
    expect(type("ab\b\b\b").buffer).toBe("");
    expect(type("Nguyễn\u007f").buffer).toBe("Nguyễ");
    expect(type("a😀\u007f").buffer).toBe("a");
  });

  it("aborts on Ctrl-C, and on Ctrl-D only when nothing has been typed", () => {
    expect(type("abc\u0003")).toMatchObject({ aborted: true });
    expect(type("\u0004")).toMatchObject({ aborted: true });
    expect(type("\u0004", "abc")).toMatchObject({ buffer: "abc", aborted: false });
  });

  it("ignores arrow keys and other escape sequences instead of putting them in the password", () => {
    expect(type("ab\u001b[Acd\u001b[1;5Cef").buffer).toBe("abcdef");
    expect(type("\u001b[3~x").buffer).toBe("x");
  });

  it("drops stray control characters but keeps spaces and punctuation", () => {
    expect(type("a\u0000b\tc d!").buffer).toBe("abc d!");
  });

  it("builds on what is already in the buffer", () => {
    expect(applyInput("pass", "word\r")).toEqual({ buffer: "password", done: true, aborted: false });
  });
});
