import { describe, expect, it } from "vitest";
import {
  getStaffProctorBoardColumn,
  STAFF_BOARD_PAGE_SIZE,
  STAFF_BOARD_STATUSES,
  STAFF_DETAIL_ROUTES,
  STAFF_PREVIEW_PAGE_SIZE,
  STAFF_PROCTOR_BOARD_COLUMNS,
  STAFF_SESSION_STATUSES,
  STAFF_WORK_STATUSES,
  STAFF_WORKSPACE_DATE_ERROR,
  STAFF_WORKSPACE_PAGE_SIZE,
  STAFF_WORKSPACE_QUERY_KEY,
  STAFF_WORKSPACE_TIMEZONE,
  STAFF_WORKSPACE_UTC_OFFSET_MINUTES,
} from "@/features/examStaff/detail/constants";
import {
  formatStaffDate,
  staffFilterQuery,
  staffProfileForm,
  staffScheduleDay,
} from "@/features/examStaff/detail/utils";
import type { ExamStaffAccountResponse } from "@pte/api-client";

describe("features/examStaff/detail/utils and constants", () => {
  it("exports expected constants", () => {
    expect(STAFF_WORKSPACE_QUERY_KEY).toEqual(["examStaff", "detail"]);
    expect(STAFF_WORKSPACE_PAGE_SIZE).toBe(20);
    expect(STAFF_BOARD_PAGE_SIZE).toBe(5);
    expect(STAFF_PREVIEW_PAGE_SIZE).toBe(3);
    expect(STAFF_WORKSPACE_TIMEZONE).toBe("Asia/Ho_Chi_Minh");
    expect(STAFF_WORKSPACE_UTC_OFFSET_MINUTES).toBe(420);
    expect(STAFF_BOARD_STATUSES).toEqual(["PENDING", "IN_PROGRESS", "COMPLETED"]);
    expect(STAFF_WORK_STATUSES).toEqual(["PENDING", "IN_PROGRESS", "COMPLETED"]);
    expect(STAFF_SESSION_STATUSES).toContain("SCHEDULED");
    expect(STAFF_PROCTOR_BOARD_COLUMNS).toHaveLength(4);
  });

  describe("staffFilterQuery", () => {
    it("converts valid fromDate and toDate correctly", () => {
      const query = staffFilterQuery({
        fromDate: "2026-05-10",
        toDate: "2026-05-12",
        sessionPublicId: "sess-1",
        sessionStatus: "OPEN",
        publicationStatus: "PUBLISHED",
      });

      expect(query.sessionPublicId).toBe("sess-1");
      expect(query.sessionStatus).toBe("OPEN");
      expect(query.publicationStatus).toBe("PUBLISHED");
      expect(query.from).toBeDefined();
      expect(query.to).toBeDefined();
      expect(new Date(query.from!).getTime()).toBeLessThan(new Date(query.to!).getTime());
    });

    it("handles ALL session status as undefined", () => {
      const query = staffFilterQuery({
        fromDate: "",
        toDate: "",
        sessionPublicId: "",
        sessionStatus: "ALL",
        publicationStatus: "ALL",
      });

      expect(query.from).toBeUndefined();
      expect(query.to).toBeUndefined();
      expect(query.sessionPublicId).toBeUndefined();
      expect(query.sessionStatus).toBeUndefined();
      expect(query.publicationStatus).toBe("ALL");
    });

    it("throws STAFF_WORKSPACE_DATE_ERROR when from >= to", () => {
      expect(() =>
        staffFilterQuery({
          fromDate: "2026-05-15",
          toDate: "2026-05-10",
          sessionPublicId: "",
          sessionStatus: "ALL",
          publicationStatus: "ALL",
        }),
      ).toThrow(STAFF_WORKSPACE_DATE_ERROR);
    });

    it("throws STAFF_WORKSPACE_DATE_ERROR for malformed or impossible dates", () => {
      expect(() =>
        staffFilterQuery({
          fromDate: "not-a-date",
          toDate: "",
          sessionPublicId: "",
          sessionStatus: "ALL",
          publicationStatus: "ALL",
        }),
      ).toThrow(STAFF_WORKSPACE_DATE_ERROR);

      expect(() =>
        staffFilterQuery({
          fromDate: "2026-02-30", // Feb 30 does not exist
          toDate: "",
          sessionPublicId: "",
          sessionStatus: "ALL",
          publicationStatus: "ALL",
        }),
      ).toThrow(STAFF_WORKSPACE_DATE_ERROR);

      expect(() =>
        staffFilterQuery({
          fromDate: "0999-01-01", // year < 1000
          toDate: "",
          sessionPublicId: "",
          sessionStatus: "ALL",
          publicationStatus: "ALL",
        }),
      ).toThrow(STAFF_WORKSPACE_DATE_ERROR);
    });
  });

  describe("formatStaffDate and staffScheduleDay", () => {
    const iso = "2026-06-15T08:30:00.000Z";

    it("formats staff date for english and vietnamese locale", () => {
      const en = formatStaffDate(iso, "en", "empty");
      const vi = formatStaffDate(iso, "vi", "trống");

      expect(en).not.toBe("empty");
      expect(vi).not.toBe("trống");
      expect(formatStaffDate(null, "en", "fallback-empty")).toBe("fallback-empty");
    });

    it("formats staff schedule day for english and vietnamese locale", () => {
      const en = staffScheduleDay(iso, "en", "empty");
      const vi = staffScheduleDay(iso, "vi", "trống");

      expect(en).not.toBe("empty");
      expect(vi).not.toBe("trống");
      expect(staffScheduleDay(null, "vi", "fallback-empty")).toBe("fallback-empty");
    });
  });

  describe("staffProfileForm", () => {
    it("maps account response to form state with fallbacks", () => {
      const account: ExamStaffAccountResponse = {
        publicId: "staff-1",
        fullName: "Nguyen Van A",
        username: "nguyenvana",
        email: "a@example.com",
        phone: "0123456789",
        dateOfBirth: "1995-01-01",
        status: "ACTIVE",
        roles: ["EXAMINER"],
        mustChangePassword: false,
        canSendCredentials: true,
      };

      expect(staffProfileForm(account)).toEqual({
        fullName: "Nguyen Van A",
        email: "a@example.com",
        phone: "0123456789",
        dateOfBirth: "1995-01-01",
      });

      const emptyAccount: ExamStaffAccountResponse = {
        publicId: "staff-2",
        fullName: "",
        username: "staff2",
        email: "",
        phone: null,
        dateOfBirth: null,
        status: "ACTIVE",
        roles: ["PROCTOR"],
        mustChangePassword: false,
        canSendCredentials: false,
      };

      expect(staffProfileForm(emptyAccount)).toEqual({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
      });
    });
  });

  describe("getStaffProctorBoardColumn", () => {
    it("maps statuses to corresponding board column keys", () => {
      expect(getStaffProctorBoardColumn("DRAFT")).toBe("upcoming");
      expect(getStaffProctorBoardColumn("READY")).toBe("upcoming");
      expect(getStaffProctorBoardColumn("SCHEDULED")).toBe("upcoming");
      expect(getStaffProctorBoardColumn("OPEN")).toBe("ongoing");
      expect(getStaffProctorBoardColumn("CLOSED")).toBe("proctored");
      expect(getStaffProctorBoardColumn("CANCELLED")).toBe("cancelled");
    });
  });

  describe("STAFF_DETAIL_ROUTES", () => {
    it("generates correct routes", () => {
      expect(STAFF_DETAIL_ROUTES.list).toBe("/host/exam-staff");
      expect(STAFF_DETAIL_ROUTES.detail("id 123")).toBe("/host/exam-staff/id%20123");
      expect(STAFF_DETAIL_ROUTES.session("sess 456")).toBe("/host/exams/sess%20456");
    });
  });
});
