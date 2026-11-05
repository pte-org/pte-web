import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  user: { organizationType: "UNIVERSITY" } as { organizationType?: string } | null,
  isLoading: false,
}));

vi.mock("@/features/auth/api", () => ({
  useCurrentUser: () => ({ data: hoisted.user, isLoading: hoisted.isLoading }),
}));

import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import {
  DEFAULT_ORG_TYPE_FAMILY,
  ORG_LABEL_DICTIONARY,
  pluralize,
} from "@/features/orgLabels/constants";

describe("features/orgLabels/useOrgLabels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.user = { organizationType: "UNIVERSITY" };
    hoisted.isLoading = false;
  });

  it("resolves university organization labels", () => {
    let labels!: ReturnType<typeof useOrgLabels>;
    renderToStaticMarkup(createElement(() => {
      labels = useOrgLabels();
      return null;
    }));

    expect(labels.isLoading).toBe(false);
    expect(labels.program).toBe("Program");
    expect(labels.class).toBe("Class");
  });

  it("resolves training center organization labels", () => {
    hoisted.user = { organizationType: "TRAINING_CENTER" };
    let labels!: ReturnType<typeof useOrgLabels>;
    renderToStaticMarkup(createElement(() => {
      labels = useOrgLabels();
      return null;
    }));

    expect(labels.program).toBe("Program");
    expect(labels.class).toBe("Class");
  });

  it("falls back to DEFAULT_ORG_TYPE_FAMILY when user has no organizationType", () => {
    hoisted.user = null;
    let labels!: ReturnType<typeof useOrgLabels>;
    renderToStaticMarkup(createElement(() => {
      labels = useOrgLabels();
      return null;
    }));

    const defaultDict = ORG_LABEL_DICTIONARY[DEFAULT_ORG_TYPE_FAMILY];
    expect(labels.program).toBe(defaultDict.program);
    expect(labels.class).toBe(defaultDict.class);
  });

  it("pluralize handles regular words, y-endings, and count formatting", () => {
    expect(pluralize("Class")).toBe("Classes");
    expect(pluralize("Course")).toBe("Courses");
    expect(pluralize("Category")).toBe("Categories");
    expect(pluralize("Class", 1)).toBe("1 Class");
    expect(pluralize("Class", 5)).toBe("5 Classes");
  });
});
