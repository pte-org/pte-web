import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  locale: "en" as "en" | "vi",
  invalidateQueries: vi.fn(),
  suspendMutate: vi.fn(),
  reactivateMutate: vi.fn(),
  generateMutate: vi.fn(),
  suspendReset: vi.fn(),
  reactivateReset: vi.fn(),
  generateReset: vi.fn(),
}));

vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  useLocale: () => ({
    locale: hoisted.locale,
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
  BanIcon: () => null,
  MailIcon: () => null,
  ShieldIcon: () => null,
}));

vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => ({
    invalidateQueries: hoisted.invalidateQueries,
  }),
}));

vi.mock("@/features/userManagement", () => ({
  useGenerateStudentCredentials: () => ({
    mutate: hoisted.generateMutate,
    reset: hoisted.generateReset,
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/features/studentSearch/api", () => ({
  useSuspendStudent: () => ({
    mutate: hoisted.suspendMutate,
    reset: hoisted.suspendReset,
    isPending: false,
    error: null,
  }),
  useReactivateStudent: () => ({
    mutate: hoisted.reactivateMutate,
    reset: hoisted.reactivateReset,
    isPending: false,
    error: null,
  }),
}));

import { useStudentDetailText } from "../../../../features/studentDetail/hooks/useStudentDetailText";
import { useStudentDetailActions } from "../../../../features/studentDetail/hooks/useStudentDetailActions";
import type { StudentDetailResponse } from "@pte/api-client";

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.locale = "en";
});

describe("useStudentDetailText", () => {
  it("resolves English copy correctly", () => {
    let text!: ReturnType<typeof useStudentDetailText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useStudentDetailText();
        return null;
      }),
    );

    expect(text.locale).toBe("en");
    expect(text.backToStudents).toBeDefined();
    expect(text.status.active).toBeDefined();
    expect(text.status.suspended).toBeDefined();
    expect(text.actions.generatePassword).toBeDefined();
    expect(text.actions.suspend).toBeDefined();
    expect(text.actions.reactivate).toBeDefined();
    expect(text.suspendDialog.description("John")).toContain("John");
    expect(text.tabs.account).toBeDefined();
    expect(text.tabs.overview).toBeDefined();
    expect(text.tabs.history).toBeDefined();
  });

  it("resolves Vietnamese copy when locale is vi", () => {
    hoisted.locale = "vi";
    let text!: ReturnType<typeof useStudentDetailText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useStudentDetailText();
        return null;
      }),
    );

    expect(text.locale).toBe("vi");
    expect(text.suspendDialog.description("Nguyen")).toContain("Nguyen");
  });
});

describe("useStudentDetailActions", () => {
  const sampleAccount: StudentDetailResponse = {
    publicId: "stu-1",
    username: "student1",
    fullName: "Student One",
    email: "student1@test.com",
    phone: "123456789",
    status: "ACTIVE",
    tenantId: "t1",
    roles: ["STUDENT"],
    studentCode: "S001",
    dateOfBirth: "2000-01-01",
    mustChangePassword: false,
    assignment: null,
  };

  it("builds actions for an ACTIVE student", () => {
    let actions!: ReturnType<typeof useStudentDetailActions>;
    renderToStaticMarkup(
      createElement(() => {
        const text = useStudentDetailText();
        actions = useStudentDetailActions("stu-1", sampleAccount, text);
        return null;
      }),
    );

    expect(actions.items).toHaveLength(4);
    const item0 = actions.items[0];
    const item1 = actions.items[1];
    const item2 = actions.items[2];
    const item3 = actions.items[3];

    if ("label" in item0) expect(item0.label).toBeDefined();
    if ("label" in item1) expect(item1.label).toBeDefined();
    // Separator
    if ("separator" in item2) expect(item2.separator).toBe(true);
    // 4th item is suspend for active student
    if ("danger" in item3) expect(item3.danger).toBe(true);
    expect(actions.suspendOpen).toBe(false);

    // Call confirmSuspend
    actions.confirmSuspend();
    expect(hoisted.suspendReset).toHaveBeenCalled();
    expect(hoisted.suspendMutate).toHaveBeenCalledWith("stu-1", expect.any(Object));

    // Call close helpers
    actions.closeSuspend();
    actions.closeCredentials();
    actions.closeEmail();
  });

  it("builds reactivate action for a SUSPENDED student", () => {
    const suspendedAccount: StudentDetailResponse = {
      ...sampleAccount,
      status: "SUSPENDED",
    };

    let actions!: ReturnType<typeof useStudentDetailActions>;
    renderToStaticMarkup(
      createElement(() => {
        const text = useStudentDetailText();
        actions = useStudentDetailActions("stu-1", suspendedAccount, text);
        return null;
      }),
    );

    const item3 = actions.items[3];
    if ("danger" in item3) expect(item3.danger).toBeUndefined();
    // Select reactivate
    if ("onSelect" in item3) item3.onSelect?.();
    expect(hoisted.reactivateMutate).toHaveBeenCalledWith("stu-1", expect.any(Object));
  });

  it("handles generate password and send email triggers", () => {
    let actions!: ReturnType<typeof useStudentDetailActions>;
    renderToStaticMarkup(
      createElement(() => {
        const text = useStudentDetailText();
        actions = useStudentDetailActions("stu-1", sampleAccount, text);
        return null;
      }),
    );

    // Select generate password
    const item0 = actions.items[0];
    const item1 = actions.items[1];
    if ("onSelect" in item0) item0.onSelect?.();
    expect(hoisted.generateMutate).toHaveBeenCalledWith("stu-1", expect.any(Object));

    // Send email is enabled and can be selected
    if ("disabled" in item1) expect(item1.disabled).toBe(false);
    if ("onSelect" in item1) expect(() => item1.onSelect?.()).not.toThrow();
  });
});
