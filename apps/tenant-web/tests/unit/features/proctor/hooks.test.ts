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

import {
  useClientTimezone,
  useMidnightBoundaryRefresh,
} from "../../../../features/proctor/hooks/useClientTimezone";
import { usePollingInterval } from "../../../../features/proctor/hooks/usePollingInterval";
import { useProctorWorkspaceText } from "../../../../features/proctor/hooks/useProctorWorkspaceText";
import {
  PROCTOR_WORKSPACE_EN,
} from "../../../../features/proctor/messages/en";
import {
  PROCTOR_WORKSPACE_VI,
} from "../../../../features/proctor/messages/vi";

beforeEach(() => {
  hoisted.locale = "en";
});

describe("useClientTimezone and useMidnightBoundaryRefresh", () => {
  it("resolves client timezone", () => {
    let result!: ReturnType<typeof useClientTimezone>;
    renderToStaticMarkup(
      createElement(() => {
        result = useClientTimezone();
        return null;
      }),
    );

    expect(result.timezone).toBeDefined();
    expect(result.isResolved).toBe(true);
  });

  it("sets up midnight boundary refresh hook without errors", () => {
    const onMidnight = vi.fn();
    renderToStaticMarkup(
      createElement(() => {
        useMidnightBoundaryRefresh({
          dayEnd: "2026-11-05T23:59:59Z",
          timezone: "UTC",
          onMidnight,
        });
        return null;
      }),
    );

    expect(onMidnight).not.toHaveBeenCalled();
  });
});

describe("usePollingInterval", () => {
  it("disables polling when intervalMs is 0 or negative", () => {
    let result!: ReturnType<typeof usePollingInterval>;
    renderToStaticMarkup(
      createElement(() => {
        result = usePollingInterval({ intervalMs: 0 });
        return null;
      }),
    );

    expect(result.refetchInterval).toBe(false);
    expect(result.refetchIntervalInBackground).toBe(false);
  });

  it("enables background polling when whenHidden is true", () => {
    let result!: ReturnType<typeof usePollingInterval>;
    renderToStaticMarkup(
      createElement(() => {
        result = usePollingInterval({ intervalMs: 5000, whenHidden: true });
        return null;
      }),
    );

    expect(result.refetchInterval).toBe(5000);
    expect(result.refetchIntervalInBackground).toBe(true);
  });

  it("returns intervalMs when visible", () => {
    let result!: ReturnType<typeof usePollingInterval>;
    renderToStaticMarkup(
      createElement(() => {
        result = usePollingInterval({ intervalMs: 10000 });
        return null;
      }),
    );

    expect(result.refetchInterval).toBe(10000);
    expect(result.refetchIntervalInBackground).toBe(false);
  });
});

describe("useProctorWorkspaceText", () => {
  it("resolves English copy by default", () => {
    let text!: ReturnType<typeof useProctorWorkspaceText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useProctorWorkspaceText();
        return null;
      }),
    );

    expect(text.locale).toBe("en");
    expect(text.pageTitle).toBe(PROCTOR_WORKSPACE_EN.pageTitle);
    expect(typeof text.format).toBe("function");
  });

  it("resolves Vietnamese copy when locale is vi", () => {
    hoisted.locale = "vi";
    let text!: ReturnType<typeof useProctorWorkspaceText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useProctorWorkspaceText();
        return null;
      }),
    );

    expect(text.locale).toBe("vi");
    expect(typeof text.format).toBe("function");
  });
});

