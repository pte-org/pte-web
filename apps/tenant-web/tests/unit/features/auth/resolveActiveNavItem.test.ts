import { describe, expect, it } from "vitest";
import { resolveActiveNavItem } from "../../../../features/auth/utils/resolveActiveNavItem";
import type { NavItem } from "../../../../features/auth/components/DashboardChrome";

const nav = (...hrefs: string[]): NavItem[] => hrefs.map((href) => ({ label: href, href }));
const query = (value: string) => new URLSearchParams(value);

describe("resolveActiveNavItem", () => {
  it("returns null when there is no pathname", () => {
    expect(resolveActiveNavItem(nav("/host/dashboard"), null, null)).toBeNull();
  });

  it("returns null when no item matches the path", () => {
    expect(resolveActiveNavItem(nav("/host/dashboard"), "/unknown", null)).toBeNull();
  });

  it("highlights Classes, not Programs, for a program classes page", () => {
    const items = nav("/host/programs", "/host/classes");

    expect(resolveActiveNavItem(items, "/host/programs/p1/classes", null)).toBe("/host/classes");
    expect(resolveActiveNavItem(items, "/host/programs/p1/classes/c1", null)).toBe("/host/classes");
  });

  it("highlights nothing for a classes page when only Programs exists", () => {
    expect(resolveActiveNavItem(nav("/host/programs"), "/host/programs/p1/classes", null)).toBeNull();
  });

  it("maps proctor attendance, incidents and audit-log pages to their own items", () => {
    const items = nav("/proctor/attendance", "/proctor/incidents", "/proctor/audit-log", "/proctor/sessions");

    expect(resolveActiveNavItem(items, "/proctor/attendance/s1", null)).toBe("/proctor/attendance");
    expect(resolveActiveNavItem(items, "/proctor/incidents/s1", null)).toBe("/proctor/incidents");
    expect(resolveActiveNavItem(items, "/proctor/audit-log", null)).toBe("/proctor/audit-log");
  });

  it("maps a session detail page to the accessible-sessions item when present, otherwise to overview", () => {
    expect(resolveActiveNavItem(nav("/proctor/sessions", "/proctor/sessions?scope=ACCESSIBLE"), "/proctor/sessions/s1", null))
      .toBe("/proctor/sessions?scope=ACCESSIBLE");
    expect(resolveActiveNavItem(nav("/proctor/sessions"), "/proctor/sessions/s1", null)).toBe("/proctor/sessions");
  });

  it("selects the accessible-sessions item on the list page only when the scope says so", () => {
    const items = nav("/proctor/sessions", "/proctor/sessions?scope=ACCESSIBLE");

    expect(resolveActiveNavItem(items, "/proctor/sessions", query("scope=ACCESSIBLE"))).toBe("/proctor/sessions?scope=ACCESSIBLE");
    expect(resolveActiveNavItem(items, "/proctor/sessions", query("scope=MINE"))).toBe("/proctor/sessions");
    expect(resolveActiveNavItem(items, "/proctor/sessions", null)).toBe("/proctor/sessions");
  });

  it("keeps the examiner queue item for a work detail opened from a status filter", () => {
    const items = nav("/examiner/work", "/examiner/work?status=ALL");

    expect(resolveActiveNavItem(items, "/examiner/work/w1", query("fromStatus=PENDING"))).toBe("/examiner/work?status=ALL");
    expect(resolveActiveNavItem(items, "/examiner/work/w1", null)).toBe("/examiner/work");
  });

  it("selects the examiner queue item on the work list when a status filter is set", () => {
    const items = nav("/examiner/work", "/examiner/work?status=ALL");

    expect(resolveActiveNavItem(items, "/examiner/work", query("status=PENDING"))).toBe("/examiner/work?status=ALL");
    expect(resolveActiveNavItem(items, "/examiner/work", null)).toBe("/examiner/work");
  });

  it("prefers the longest matching prefix and ignores query strings in hrefs", () => {
    const items = nav("/host", "/host/exams", "/host/exams/templates?tab=1");

    expect(resolveActiveNavItem(items, "/host/exams/e1", null)).toBe("/host/exams");
    expect(resolveActiveNavItem(items, "/host/exams/templates/x", null)).toBe("/host/exams/templates?tab=1");
  });

  it("matches the root item only on the root path", () => {
    const items = nav("/", "/host/dashboard");

    expect(resolveActiveNavItem(items, "/", null)).toBe("/");
    expect(resolveActiveNavItem(items, "/host/dashboard", null)).toBe("/host/dashboard");
    expect(resolveActiveNavItem(nav("/"), "/host/dashboard", null)).toBeNull();
  });
});
