import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, type ExamStaffAccountResponse } from "@pte/api-client";

const hoisted = vi.hoisted(() => ({
  locale: "en" as "en" | "vi",
  t: vi.fn((key: string, fallback?: string, values?: Record<string, string | number>) => {
    const text = fallback ?? key;
    if (!values) return text;
    return Object.entries(values).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      text,
    );
  }),
  routerPush: vi.fn(),
  sendMutate: vi.fn(),
  sendReset: vi.fn(),
  suspendMutate: vi.fn(),
  suspendReset: vi.fn(),
  reactivateMutate: vi.fn(),
  reactivateReset: vi.fn(),
  updateMutate: vi.fn(),
  updateReset: vi.fn(),
  isPending: false,
  sendError: null as unknown,
  suspendError: null as unknown,
  updateError: null as unknown,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: hoisted.routerPush }),
}));

vi.mock("@pte/ui", () => ({
  useLocale: () => ({ locale: hoisted.locale, t: hoisted.t }),
  BanIcon: () => null,
  MailIcon: () => null,
  ShieldIcon: () => null,
}));

vi.mock("@/features/userManagement", () => ({
  useSendUserCredentials: () => ({
    mutate: hoisted.sendMutate,
    reset: hoisted.sendReset,
    isPending: hoisted.isPending,
    error: hoisted.sendError,
  }),
}));

vi.mock("@/features/examStaff/api", () => ({
  useSuspendExamStaff: () => ({
    mutate: hoisted.suspendMutate,
    reset: hoisted.suspendReset,
    isPending: hoisted.isPending,
    error: hoisted.suspendError,
  }),
  useReactivateExamStaff: () => ({
    mutate: hoisted.reactivateMutate,
    reset: hoisted.reactivateReset,
    isPending: hoisted.isPending,
    error: null,
  }),
}));

vi.mock("@/features/examStaff/detail/api", () => ({
  useUpdateStaffProfile: () => ({
    mutate: hoisted.updateMutate,
    reset: hoisted.updateReset,
    isPending: hoisted.isPending,
    error: hoisted.updateError,
  }),
}));

import { useStaffAccountActions } from "@/features/examStaff/detail/hooks/useStaffAccountActions";
import { useStaffAccountForm } from "@/features/examStaff/detail/hooks/useStaffAccountForm";
import { useStaffDetailText } from "@/features/examStaff/detail/hooks/useStaffDetailText";
import { useStaffEditGuard } from "@/features/examStaff/detail/hooks/useStaffEditGuard";
import { useStaffWorkspaceFilters } from "@/features/examStaff/detail/hooks/useStaffWorkspaceFilters";

const dummyAccount: ExamStaffAccountResponse = {
  publicId: "staff-1",
  fullName: "Alice Smith",
  username: "alicesmith",
  email: "alice@example.com",
  phone: "1234567890",
  dateOfBirth: "1990-01-01",
  status: "ACTIVE",
  roles: ["EXAMINER"],
  mustChangePassword: false,
  canSendCredentials: true,
};

describe("features/examStaff/detail/hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.locale = "en";
    hoisted.isPending = false;
    hoisted.sendError = null;
    hoisted.suspendError = null;
    hoisted.updateError = null;
  });

  describe("useStaffDetailText", () => {
    it("returns translated messages and format function in English and Vietnamese", () => {
      let text!: ReturnType<typeof useStaffDetailText>;
      renderToStaticMarkup(createElement(() => {
        text = useStaffDetailText();
        return null;
      }));

      expect(text.locale).toBe("en");
      expect(typeof text.title).toBe("string");
      expect(text.format("sendDescription", { name: "Alice" })).toContain("Alice");

      hoisted.locale = "vi";
      renderToStaticMarkup(createElement(() => {
        text = useStaffDetailText();
        return null;
      }));
      expect(text.locale).toBe("vi");
    });
  });

  describe("useStaffWorkspaceFilters", () => {
    it("initializes filters and allows changing filters and page", () => {
      let filters!: ReturnType<typeof useStaffWorkspaceFilters>;
      renderToStaticMarkup(createElement(() => {
        filters = useStaffWorkspaceFilters();
        return null;
      }));

      expect(filters.page).toBe(0);
      expect(filters.revision).toBe(0);
      expect(filters.invalidDates).toBe(false);
      expect(filters.draft.sessionStatus).toBe("ALL");

      expect(() => {
        filters.change({ fromDate: "2026-06-01", toDate: "2026-06-05" });
        filters.setPage(2);
      }).not.toThrow();
    });
  });

  describe("useStaffEditGuard", () => {
    it("executes continuation immediately if not dirty", () => {
      let guard!: ReturnType<typeof useStaffEditGuard>;
      renderToStaticMarkup(createElement(() => {
        guard = useStaffEditGuard(false, false);
        return null;
      }));

      const callback = vi.fn();
      guard.request(callback);
      expect(callback).toHaveBeenCalled();
      expect(guard.open).toBe(false);
    });

    it("opens confirmation dialog when dirty", () => {
      let guard!: ReturnType<typeof useStaffEditGuard>;
      renderToStaticMarkup(createElement(() => {
        guard = useStaffEditGuard(true, false);
        return null;
      }));

      const callback = vi.fn();
      guard.request(callback);
      expect(callback).not.toHaveBeenCalled();

      guard.confirm();
      guard.close();
    });
  });

  describe("useStaffAccountActions", () => {
    it("provides menu items and selection triggers for ACTIVE account", () => {
      let actions!: ReturnType<typeof useStaffAccountActions>;
      let text!: ReturnType<typeof useStaffDetailText>;

      renderToStaticMarkup(createElement(() => {
        text = useStaffDetailText();
        actions = useStaffAccountActions(dummyAccount, text);
        return null;
      }));

      expect(actions.items).toHaveLength(3);
      expect(actions.command).toBeNull();
      expect(actions.pending).toBe(false);
      expect(actions.error).toBeNull();

      const sendItem = actions.items[0];
      if ("onSelect" in sendItem && sendItem.onSelect) sendItem.onSelect();
      expect(hoisted.sendReset).toHaveBeenCalled();

      const suspendItem = actions.items[2];
      if ("onSelect" in suspendItem && suspendItem.onSelect) suspendItem.onSelect();
      expect(hoisted.suspendReset).toHaveBeenCalled();

      actions.close();
      actions.closeCredentials();
    });

    it("renders reactivate option when account is SUSPENDED", () => {
      const suspendedAccount: ExamStaffAccountResponse = {
        ...dummyAccount,
        status: "SUSPENDED",
      };
      let actions!: ReturnType<typeof useStaffAccountActions>;
      let text!: ReturnType<typeof useStaffDetailText>;

      renderToStaticMarkup(createElement(() => {
        text = useStaffDetailText();
        actions = useStaffAccountActions(suspendedAccount, text);
        return null;
      }));

      const reactivateItem = actions.items[2];
      if ("onSelect" in reactivateItem && reactivateItem.onSelect) {
        reactivateItem.onSelect();
      }
      expect(hoisted.reactivateReset).toHaveBeenCalled();
    });

    it("maps send and suspend errors to localized error messages", () => {
      hoisted.sendError = new Error("Failed");
      let actions!: ReturnType<typeof useStaffAccountActions>;
      let text!: ReturnType<typeof useStaffDetailText>;

      renderToStaticMarkup(createElement(() => {
        text = useStaffDetailText();
        actions = useStaffAccountActions(dummyAccount, text);
        return null;
      }));
      expect(actions.error).toBe(text.credentialsFailed);

      hoisted.sendError = null;
      hoisted.suspendError = new Error("Failed");
      renderToStaticMarkup(createElement(() => {
        actions = useStaffAccountActions(dummyAccount, text);
        return null;
      }));
      expect(actions.error).toBe(text.genericError);
    });
  });

  describe("useStaffAccountForm", () => {
    it("initializes form with account profile and controls editing state", () => {
      let formHandler!: ReturnType<typeof useStaffAccountForm>;
      let text!: ReturnType<typeof useStaffDetailText>;

      renderToStaticMarkup(createElement(() => {
        text = useStaffDetailText();
        formHandler = useStaffAccountForm(dummyAccount, text);
        return null;
      }));

      expect(formHandler.editing).toBe(false);
      expect(formHandler.form.fullName).toBe("Alice Smith");
      expect(formHandler.form.email).toBe("alice@example.com");

      formHandler.start();
      formHandler.change("fullName", "Alice Updated");
      formHandler.cancel();
      formHandler.save();
    });

    it("maps ApiError conflict to emailConflict message", () => {
      hoisted.updateError = new ApiError("conflict", 409, "Email exists");
      let formHandler!: ReturnType<typeof useStaffAccountForm>;
      let text!: ReturnType<typeof useStaffDetailText>;

      renderToStaticMarkup(createElement(() => {
        text = useStaffDetailText();
        formHandler = useStaffAccountForm(dummyAccount, text);
        return null;
      }));

      expect(formHandler.error).toBe(text.emailConflict);

      hoisted.updateError = new Error("Generic");
      renderToStaticMarkup(createElement(() => {
        formHandler = useStaffAccountForm(dummyAccount, text);
        return null;
      }));
      expect(formHandler.error).toBe(text.genericError);
    });
  });
});
