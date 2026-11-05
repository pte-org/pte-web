import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  locale: "en" as "en" | "vi",
}));

vi.mock("@pte/ui", () => ({
  useLocale: () => ({ locale: hoisted.locale }),
}));

import { useHomeCopy } from "@/features/public/useHomeCopy";

describe("features/public/useHomeCopy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.locale = "en";
  });

  it("returns English copy when locale is en", () => {
    let copy!: ReturnType<typeof useHomeCopy>;
    renderToStaticMarkup(createElement(() => {
      copy = useHomeCopy();
      return null;
    }));

    expect(copy.locale).toBe("en");
    expect(copy.HOME_TEXT).toBeDefined();
    expect(copy.HOME_PREVIEW).toBeDefined();
    expect(copy.HOME_STEPS).toBeDefined();
  });

  it("returns Vietnamese copy when locale is vi", () => {
    hoisted.locale = "vi";
    let copy!: ReturnType<typeof useHomeCopy>;
    renderToStaticMarkup(createElement(() => {
      copy = useHomeCopy();
      return null;
    }));

    expect(copy.locale).toBe("vi");
    expect(copy.HOME_TEXT).toBeDefined();
    expect(copy.HOME_PREVIEW).toBeDefined();
    expect(copy.HOME_STEPS).toBeDefined();
  });
});

