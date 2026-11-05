import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ClassResponse } from "@pte/api-client";
import { useAssignStudentsDeeplink } from "@/features/studentSearch/components/useAssignStudentsDeeplink";

const dummyClasses: ClassResponse[] = [
  {
    publicId: "cls-active",
    name: "Class 10A",
    status: "ACTIVE",
    programPublicId: "prog-1",
  },
  {
    publicId: "cls-inactive",
    name: "Class 10B",
    status: "INACTIVE",
    programPublicId: "prog-1",
  },
];

describe("features/studentSearch/useAssignStudentsDeeplink", () => {
  it("initializes with empty state when prefill params are missing", () => {
    let state!: ReturnType<typeof useAssignStudentsDeeplink>;
    renderToStaticMarkup(createElement(() => {
      state = useAssignStudentsDeeplink("", "", "", "", dummyClasses);
      return null;
    }));

    expect(state.wasPrefilledByDeeplink).toBe(false);
    expect(state.classFilterLocked).toBe(false);
    expect(state.prefilledClassName).toBeNull();
    expect(state.classBlockedReason).toBeNull();
    expect(state.shouldAutoOpenModal).toBe(false);
  });

  it("detects valid active class deeplink and triggers auto-modal", () => {
    let state!: ReturnType<typeof useAssignStudentsDeeplink>;
    renderToStaticMarkup(createElement(() => {
      state = useAssignStudentsDeeplink("org-1", "prog-1", "cls-active", "add", dummyClasses);
      return null;
    }));

    expect(state.wasPrefilledByDeeplink).toBe(true);
    expect(state.prefilledClassName).toBe("Class 10A");
    expect(state.classBlockedReason).toBeNull();
    expect(state.shouldAutoOpenModal).toBe(true);

    // Test setters
    state.setClassFilterLocked(true);
    state.setAutoOpenFired(true);
    state.setPersistedClassName("Custom Class");
    state.setPersistedBlockedReason("BLOCKED");
    state.setWasPrefilledByDeeplink(false);
  });

  it("detects inactive class deeplink and does not auto-open modal", () => {
    let state!: ReturnType<typeof useAssignStudentsDeeplink>;
    renderToStaticMarkup(createElement(() => {
      state = useAssignStudentsDeeplink("org-1", "prog-1", "cls-inactive", "add", dummyClasses);
      return null;
    }));

    expect(state.wasPrefilledByDeeplink).toBe(true);
    expect(state.prefilledClassName).toBe("Class 10B");
    expect(state.classBlockedReason).toBe("INACTIVE");
    expect(state.shouldAutoOpenModal).toBe(false);
  });
});

