import "../testing/environment";
import { createElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { beforeAll, describe, expect, it } from "vitest";
import { forbidden } from "../testing/fixtures";
import { allForbiddenDashboard, richDashboard, zeroDashboard } from "../testing/scenarios";
import {
  installRenderHooks,
  panelTitles,
  renderHtml,
  textOf,
  useTestLocale,
  useTestOrgLabels,
} from "../testing/render";
import { HostDashboardGrid } from "../../../../../features/hostDashboard/components/HostDashboardGrid";

installRenderHooks();

const render = (dashboard: HostDashboardResponse): string =>
  renderHtml(createElement(HostDashboardGrid, { dashboard, onRetry: () => undefined, analysisDefaultExpanded: true }));

/** Sections whose absence hides one or more whole panels, with the headings that must disappear. */
const FORBIDDEN_CASES: Array<{ section: keyof HostDashboardResponse; panels: string[] }> = [
  { section: "learners", panels: ["Learner assignment"] },
  { section: "academics", panels: ["Academic structure"] },
  { section: "staff", panels: ["Staff coverage"] },
  { section: "exams", panels: ["Upcoming sessions", "Sessions by status"] },
  { section: "attempts", panels: ["Attempts submitted"] },
  { section: "grading", panels: ["Grading pipeline"] },
  { section: "billing", panels: ["Pending orders"] },
  { section: "support", panels: ["Support tickets"] },
  { section: "recentActivity", panels: ["Recent activity"] },
  { section: "quota", panels: [] },
  { section: "subscription", panels: [] },
];

describe("a forbidden section is hidden", () => {
  it.each(FORBIDDEN_CASES)("$section is not rendered and leaves no error behind", ({ section, panels }) => {
    const html = render({ ...richDashboard(), [section]: forbidden() });
    for (const title of panels) expect(panelTitles(html), title).not.toContain(title);
    expect(textOf(html)).not.toContain("This section is unavailable");
    expect(textOf(html)).not.toContain("Unavailable");
    expect(html).not.toContain('role="alert"');
  });

  it("forbidden learners drop both learner key figures and the donut but keep the others", () => {
    const text = textOf(render({ ...richDashboard(), learners: forbidden() }));
    expect(text).not.toContain("Active learners");
    expect(text).not.toContain("Learner assignment");
    expect(text).toContain("Exam sessions created");
    expect(text).toContain("Attempts submitted");
  });

  it("forbidden quota hides the seats half only; forbidden subscription hides the plans half only", () => {
    const noSeats = textOf(render({ ...richDashboard(), quota: forbidden() }));
    expect(noSeats).toContain("Subscriptions");
    expect(noSeats).not.toContain("seats remaining");
    const noPlans = textOf(render({ ...richDashboard(), subscription: forbidden() }));
    expect(noPlans).toContain("95 of 100 seats");
    expect(noPlans).not.toContain("Subscriptions");
  });

  it("both quota and subscription forbidden hide the whole usage panel", () => {
    const html = render({ ...richDashboard(), quota: forbidden(), subscription: forbidden() });
    expect(panelTitles(html)).not.toContain("Seats and subscription");
  });

  it("renders no widget at all when every section is forbidden", () => {
    const html = render(allForbiddenDashboard());
    expect(panelTitles(html)).toEqual([]);
    expect(textOf(html)).toBe("");
  });
});

describe("a tenant without data shows zeros and empty states, never blanks", () => {
  let html = "";
  let text = "";
  beforeAll(() => {
    html = render(zeroDashboard());
    text = textOf(html);
  });

  it("shows 0 in the key figures and a dash where there is no previous period", () => {
    expect(text).toMatch(/Learners 0 0 new in the last 30 days/);
    expect(text).toMatch(/Exam sessions created 0 – No previous period to compare/);
    expect(text).toMatch(/Attempts submitted 0 – No previous period to compare vs previous 30 days 0 in progress now/);
  });

  it("shows empty seats at 0 of the limit and no warning", () => {
    expect(text).toContain("0 of 100 seats");
    expect(text).toContain("0% used");
    expect(text).toContain("100 seats remaining");
    expect(text).not.toContain("close to your seat limit");
    expect(text).toContain("No active subscription.");
  });

  it("shows an explanation instead of an empty chart, table or timeline", () => {
    expect(text).toContain("No attempts have been submitted yet.");
    expect(text).toContain("No upcoming sessions");
    expect(text).toContain("Create an exam session and it will appear here.");
    expect(html).not.toContain("<table");
    expect(text).toContain("No activity has been recorded yet.");
    expect(text).toContain("No exam sessions yet.");
    expect(text).toContain("No learners yet.");
    expect(text).toContain("Nothing needs your attention right now.");
  });

  it("shows zero counts in the grading and compact cards", () => {
    expect(text).toContain("There is no grading backlog.");
    expect(text).toMatch(/Closed sessions awaiting finalization 0 Reports awaiting publication 0/);
    expect(text).toMatch(/Proctors 0 Examiners 0/);
    expect(text).toMatch(/Organizations 0 Programs 0 Active Classes 0/);
    expect(text).toMatch(/Open 0 In progress 0 Resolved, awaiting close 0/);
    expect(text).toMatch(/Awaiting payment 0/);
  });
});

describe("locale and organisation labels", () => {
  it("renders the whole dashboard in Vietnamese with no English copy left", () => {
    useTestLocale("vi");
    const html = render(richDashboard());
    const text = textOf(html);
    expect(panelTitles(html)).toEqual([
      "Cần xử lý",
      "Chỉ số chính",
      "Chỗ học viên và gói đăng ký",
      "Kỳ thi sắp tới",
      "Phân tích chi tiết",
      "Lượt thi đã nộp",
      "Hoạt động gần đây",
      "Kỳ thi theo trạng thái",
      "Phân lớp học viên",
      "Tiến trình chấm điểm",
      "Nhân sự coi thi và chấm thi",
      "Cấu trúc đào tạo",
      "Yêu cầu hỗ trợ",
      "Đơn hàng chờ thanh toán",
    ]);
    for (const english of ["Needs attention", "Key figures", "Upcoming sessions", "Try again", "Staff member"]) {
      expect(text).not.toContain(english);
    }
    expect(text).toContain("1.234"); // vi grouping of the attempts figure
    expect(text).toContain("Hết hạn sau 7 ngày");
  });

  it("uses the tenant's own nouns for program and class in English copy", () => {
    useTestOrgLabels({ program: "Course", class: "Cohort" });
    const text = textOf(render(richDashboard()));
    expect(text).toContain("Active Cohorts");
    expect(text).toMatch(/Courses 4/);
    expect(text).toContain("View Courses");
    expect(text).toContain("Learners placed in a cohort and those still waiting.");
    expect(text).not.toMatch(/\bProgram\b|\bClass\b/);
  });
});
