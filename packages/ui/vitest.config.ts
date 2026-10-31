import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node environment on purpose: components are rendered with react-dom/server
    // (renderToStaticMarkup) and asserted on the HTML string, so no DOM library is needed.
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}", "tests/**/*.spec.{ts,tsx}"],
  },
});
