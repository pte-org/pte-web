import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node environment, not jsdom: this package is pure contract code —
    // request builders and types, no React, no DOM. See the package's own
    // rule that hooks belong in each app's `features/*/api.ts`, not here.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
