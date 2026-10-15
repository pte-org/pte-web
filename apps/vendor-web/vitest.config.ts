import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node environment: components are server-rendered with renderToStaticMarkup, no DOM library.
    environment: "node",
    include: ["features/**/*.test.ts"],
  },
});
