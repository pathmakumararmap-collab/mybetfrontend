import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: r("./src/") },
      // Next.js server-only modules: stubbed so pure logic can be unit-tested.
      { find: /^server-only$/, replacement: r("./tests/stubs/empty.ts") },
      { find: /^next\/cache$/, replacement: r("./tests/stubs/next-cache.ts") },
    ],
  },
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    restoreMocks: true,
  },
});
