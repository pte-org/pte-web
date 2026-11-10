import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    // Node environment: the code under test is pure parsing/workbook logic, no DOM.
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}", "tests/**/*.spec.{ts,tsx}"],
    // The hygiene tests read the source tree; give them room when many files run in parallel.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
