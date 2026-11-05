import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  locale: "en" as "en" | "vi",
}));

vi.mock("@pte/ui", () => ({
  useLocale: () => ({
    locale: hoisted.locale,
    t: (_key: string, fallback?: string, values?: Record<string, string | number>) => {
      let str = fallback ?? _key;
      if (values) {
        for (const [k, v] of Object.entries(values)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
  }),
}));

import { useProgramDetailText } from "../../../../features/programs/hooks/useProgramDetailText";
import {
  PROGRAM_DETAIL_EN,
  PROGRAM_DETAIL_VI,
} from "../../../../features/programs/constants/detailMessages";

beforeEach(() => {
  hoisted.locale = "en";
});

describe("useProgramDetailText", () => {
  it("resolves English copy and archiveImpact helper", () => {
    let text!: ReturnType<typeof useProgramDetailText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useProgramDetailText();
        return null;
      }),
    );

    expect(text.locale).toBe("en");
    expect(text.classes).toBe(PROGRAM_DETAIL_EN.classes);
    expect(text.classList).toBe(PROGRAM_DETAIL_EN.classList);

    const impact = text.archiveImpact(3, 10);
    expect(impact).toContain("3");
    expect(impact).toContain("10");
  });

  it("resolves Vietnamese copy when locale is vi", () => {
    hoisted.locale = "vi";
    let text!: ReturnType<typeof useProgramDetailText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useProgramDetailText();
        return null;
      }),
    );

    expect(text.locale).toBe("vi");
    expect(text.classes).toBe(PROGRAM_DETAIL_VI.classes);
    expect(text.classList).toBe(PROGRAM_DETAIL_VI.classList);
  });
});

