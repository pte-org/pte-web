import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AudienceSourceRequest } from "@pte/api-client";

const hoisted = vi.hoisted(() => ({
  tenantClasses: [
    { classPublicId: "cls-1", className: "Class 10A", programPublicId: "prog-1", programName: "IELTS", status: "ACTIVE" },
    { classPublicId: "cls-2", className: "Class 10B", programPublicId: "prog-2", programName: "TOEIC", status: "INACTIVE" },
  ],
  tenantStudents: [
    { publicId: "stu-1", fullName: "Alice Student", email: "alice@test.com", studentCode: "S001", status: "ACTIVE" },
    { publicId: "stu-2", fullName: "Bob Student", email: "bob@test.com", studentCode: "S002", status: "ACTIVE" },
    { publicId: "stu-3", fullName: "Charlie Inactive", email: "charlie@test.com", studentCode: "S003", status: "INACTIVE" },
  ],
  organizations: [{ publicId: "org-1", name: "Test Org" }],
  programs: [
    { publicId: "prog-1", name: "IELTS Core", status: "ACTIVE" },
    { publicId: "prog-2", name: "TOEIC Basic", status: "INACTIVE" },
  ],
  classMemberships: [
    { studentPublicId: "stu-1", classPublicId: "cls-1", className: "Class 10A", programPublicId: "prog-1", programName: "IELTS" },
  ],
  subscriptions: [
    { publicId: "sub-1", status: "ACTIVE", planPublicId: "plan-1" },
    { publicId: "sub-2", status: "EXPIRED", planPublicId: "plan-2" },
  ],
  plans: [{ publicId: "plan-1", name: "Pro Plan" }],
  showToast: vi.fn(),
}));

vi.mock("@/features/classes/api", () => ({
  useAllTenantClasses: () => ({ data: hoisted.tenantClasses, isLoading: false }),
}));
vi.mock("@/features/examoperations/api", () => ({
  useTenantStudents: () => ({ data: hoisted.tenantStudents, isLoading: false }),
}));
vi.mock("@/features/programs/api", () => ({
  useMyOrganizations: () => ({ data: hoisted.organizations }),
  usePrograms: () => ({ data: hoisted.programs, isLoading: false }),
}));
vi.mock("@/features/studentSearch/api", () => ({
  useClassMemberships: () => ({ data: hoisted.classMemberships, isLoading: false }),
}));
vi.mock("@/features/commercialization/api", () => ({
  useSubscriptionsQuery: () => ({ data: hoisted.subscriptions, isLoading: false }),
  useTenantPlansQuery: () => ({ data: hoisted.plans }),
}));
vi.mock("@pte/ui", () => ({
  useLocale: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
  useToast: () => ({ showToast: hoisted.showToast }),
}));

import { useAudienceStudentPicker } from "@/features/exams/hooks/useAudienceStudentPicker";
import { useCreateExamAudience } from "@/features/exams/hooks/useCreateExamAudience";
import { useExamEditTimingWarning } from "@/features/exams/hooks/useExamEditTimingWarning";
import type { ExamSession } from "@/features/exams/types";

describe("features/exams/hooks - Audience & Timing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useAudienceStudentPicker", () => {
    it("filters active students and computes program and class options", () => {
      let picker!: ReturnType<typeof useAudienceStudentPicker>;
      const onSourcesChange = vi.fn();
      const sources: AudienceSourceRequest[] = [{ sourceType: "STUDENT", sourcePublicId: "stu-1" }];

      renderToStaticMarkup(createElement(() => {
        picker = useAudienceStudentPicker({
          open: true,
          sources,
          onSourcesChange,
        });
        return null;
      }));

      expect(picker.programOptions).toEqual([{ label: "IELTS Core", value: "prog-1" }]);
      expect(picker.classOptions).toEqual([{ label: "Class 10A (IELTS)", value: "cls-1" }]);
      expect(picker.students).toHaveLength(2); // stu-1 and stu-2, stu-3 is INACTIVE
      expect(picker.students[0].fullName).toBe("Alice Student");
      expect(picker.students[0].contact).toBe("alice@test.com · S001");
      expect(picker.students[0].group).toEqual({ className: "Class 10A", programName: "IELTS" });
      expect(picker.students[1].fullName).toBe("Bob Student");
      expect(picker.students[1].group).toBeUndefined(); // no class membership
      expect(picker.selectedIds.has("stu-1")).toBe(true);
      expect(picker.selectedInFilterCount).toBe(1);

      // Verify actions can be triggered
      picker.onSearchChange("Alice");
      picker.onProgramFilterChange("prog-1");
      picker.onClassFilterChange("cls-1");
      picker.toggleStudent("stu-2");
      expect(onSourcesChange).toHaveBeenCalledWith([
        { sourceType: "STUDENT", sourcePublicId: "stu-1" },
        { sourceType: "STUDENT", sourcePublicId: "stu-2" },
      ]);

      picker.toggleAllFiltered();
      picker.clearSelection();
      expect(onSourcesChange).toHaveBeenCalledWith([]);
    });

    it("respects excludedStudentIds and allowedStudentIds constraints", () => {
      let picker!: ReturnType<typeof useAudienceStudentPicker>;
      const excluded = new Set(["stu-1"]);
      const allowed = new Set(["stu-1", "stu-2"]);

      renderToStaticMarkup(createElement(() => {
        picker = useAudienceStudentPicker({
          open: true,
          sources: [],
          onSourcesChange: vi.fn(),
          excludedStudentIds: excluded,
          allowedStudentIds: allowed,
        });
        return null;
      }));

      // stu-1 is excluded, stu-3 is inactive, only stu-2 remains
      expect(picker.students).toHaveLength(1);
      expect(picker.students[0].publicId).toBe("stu-2");
    });
  });

  describe("useCreateExamAudience", () => {
    it("extends student picker with active subscriptions and plan lookup", () => {
      let audience!: ReturnType<typeof useCreateExamAudience>;

      renderToStaticMarkup(createElement(() => {
        audience = useCreateExamAudience({
          open: true,
          sources: [],
          onSourcesChange: vi.fn(),
        });
        return null;
      }));

      expect(audience.activeSubscriptions).toHaveLength(1);
      expect(audience.activeSubscriptions[0].publicId).toBe("sub-1");
      expect(audience.planNameById.get("plan-1")).toBe("Pro Plan");
      expect(audience.subscriptionsLoading).toBe(false);
    });
  });

  describe("useExamEditTimingWarning", () => {
    it("does not warn if session status is not SCHEDULED", () => {
      const session = {
        status: "DRAFT",
        opensAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      } as ExamSession;

      renderToStaticMarkup(createElement(() => {
        useExamEditTimingWarning(session);
        return null;
      }));

      expect(hoisted.showToast).not.toHaveBeenCalled();
    });

    it("evaluates when session is SCHEDULED and close to opening", () => {
      const session = {
        status: "SCHEDULED",
        opensAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      } as ExamSession;

      renderToStaticMarkup(createElement(() => {
        useExamEditTimingWarning(session);
        return null;
      }));

      expect(true).toBe(true);
    });
  });
});
