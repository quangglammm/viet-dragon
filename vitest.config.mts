import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests: pure logic, no database, no network. `pnpm test`.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    // next-intl's ESM build imports "next/server" without an extension, which Node's native
    // resolution refuses; inlining lets Vite resolve it (needed by proxy.test.ts).
    server: { deps: { inline: [/next-intl/] } },
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "dist/**"],
  },
});
