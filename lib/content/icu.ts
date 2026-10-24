// The `{placeholders}` of an ICU message, the format next-intl reads the site's texts in. A translation may only use the variables the
// Vietnamese text of the same line uses (the code supplies exactly those), and its braces must balance — otherwise the page throws when
// the text is rendered. Pure and import-free: the document schema and the editor both use it.

const NAME = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*([,}])/;
const COMPLEX_TYPE = /^\s*,\s*(plural|select|selectordinal)\s*,/;

type Frame = "argument" | "complex" | "branch";

/** Skips an apostrophe-quoted stretch (`'{'`, `''`) starting at `index`; returns the index to continue from. */
function afterQuote(text: string, index: number): number {
  if (text[index + 1] === "'") return index + 2; // '' is one literal apostrophe
  if (text[index + 1] !== "{" && text[index + 1] !== "}") return index + 1; // a plain apostrophe in running text
  const end = text.indexOf("'", index + 1);
  return end === -1 ? text.length : end + 1;
}

/**
 * The names of the arguments the message uses (`{count}`, `{name, number}`, `{n, plural, one {…} other {…}}` → count, name, n), or
 * null when it is not well formed: unbalanced braces, or `{` with no argument name.
 */
export function icuArguments(text: string): Set<string> | null {
  const names = new Set<string>();
  const stack: Frame[] = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (char === "'") {
      i = afterQuote(text, i);
    } else if (char === "{") {
      if (stack.at(-1) === "complex") {
        stack.push("branch"); // `one {…}`: the text of one case
        i += 1;
      } else {
        const match = NAME.exec(text.slice(i + 1));
        if (!match) return null;
        names.add(match[1]);
        const rest = text.slice(i + 1 + match[1].length);
        stack.push(COMPLEX_TYPE.test(rest) ? "complex" : "argument");
        i += 1 + match[0].length - (match[2] === "}" ? 1 : 0); // stay on the `}` of `{name}` so it closes the frame
      }
    } else if (char === "}") {
      if (stack.pop() === undefined) return null;
      i += 1;
    } else {
      i += 1;
    }
  }
  return stack.length === 0 ? names : null;
}
