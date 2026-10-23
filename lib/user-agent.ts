// A rough "Chrome trên macOS" label for the sessions list. Not a parser: the point is that a person can
// tell their own devices apart, so unknown agents simply read as "Thiết bị không xác định".

// Order matters: Edge and Opera also say "Chrome", Chrome also says "Safari".
const BROWSERS: ReadonlyArray<readonly [RegExp, string]> = [
  [/Edg(e|A|iOS)?\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Safari\//, "Safari"],
];

// iOS before macOS: iPad/iPhone user agents contain "like Mac OS X".
const SYSTEMS: ReadonlyArray<readonly [RegExp, string]> = [
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Linux|X11/, "Linux"],
];

function firstMatch(table: ReadonlyArray<readonly [RegExp, string]>, userAgent: string): string | null {
  return table.find(([pattern]) => pattern.test(userAgent))?.[1] ?? null;
}

export function describeUserAgent(userAgent: string | null | undefined): string {
  if (!userAgent) return "Thiết bị không xác định";
  const browser = firstMatch(BROWSERS, userAgent);
  const system = firstMatch(SYSTEMS, userAgent);
  if (browser && system) return `${browser} trên ${system}`;
  return browser ?? system ?? "Thiết bị không xác định";
}
