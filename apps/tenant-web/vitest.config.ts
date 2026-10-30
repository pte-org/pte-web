import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node environment: the code under test is pure parsing/workbook logic, no DOM.
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}", "tests/**/*.spec.{ts,tsx}"],
  },
});
