import { describe, expect, it } from "vitest";
import { ACTIVITY_ACTIONS, SYSTEM_ACTOR_ID } from "../../../../../features/hostDashboard/constants";
import { buildActivityRows, describeActivityAction, isSystemActor } from "../../../../../features/hostDashboard/utils/activity";

const USER_ID = "99999999-9999-4999-8999-999999999999";

const item = (overrides: Partial<{ id: string; action: string; actorUserId: string; occurredAt: string }> = {}) => ({
  id: "a1",
  action: "ExamPublished",
  actorUserId: USER_ID,
  targetType: "ExamSession",
  occurredAt: "2026-10-12T08:30:00Z",
  ...overrides,
});

describe("describeActivityAction", () => {
  it("resolves a known action code", () => {
    expect(describeActivityAction("ExamPublished")).toEqual({ messageKey: "activityExamPublished", tone: "success" });
  });

  it("falls back to the generic label for an unknown code", () => {
    expect(describeActivityAction("SomethingNew")).toEqual({ messageKey: "activityGeneric", tone: "neutral" });
    expect(describeActivityAction("")).toEqual({ messageKey: "activityGeneric", tone: "neutral" });
  });

  it("does not resolve names that exist on the object prototype", () => {
    for (const code of ["constructor", "__proto__", "toString", "hasOwnProperty"]) {
      expect(describeActivityAction(code).messageKey).toBe("activityGeneric");
    }
  });

  it("is case sensitive: an unexpected casing is unknown, not a guess", () => {
    expect(describeActivityAction("exampublished").messageKey).toBe("activityGeneric");
  });

  it("maps every known code to a distinct, non-generic message key", () => {
    const keys = Object.values(ACTIVITY_ACTIONS).map((descriptor) => descriptor.messageKey);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).not.toContain("activityGeneric");
  });
});

describe("isSystemActor", () => {
  it("treats a missing id and the nil UUID as the system", () => {
    expect(isSystemActor(null)).toBe(true);
    expect(isSystemActor(undefined)).toBe(true);
    expect(isSystemActor("")).toBe(true);
    expect(isSystemActor(SYSTEM_ACTOR_ID)).toBe(true);
  });

  it("treats any other id as a staff member", () => {
    expect(isSystemActor(USER_ID)).toBe(false);
  });
});

describe("buildActivityRows", () => {
  it("never exposes the actor id or the raw action code", () => {
    const rows = buildActivityRows([item({ action: "WeirdMachineCode_42" })], "en");
    const text = JSON.stringify(rows);
    expect(text).not.toContain(USER_ID);
    expect(text).not.toContain("WeirdMachineCode_42");
    expect(rows[0]).toMatchObject({ titleKey: "activityGeneric", actorKey: "actorStaff" });
  });

  it("labels the nil UUID as the system", () => {
    expect(buildActivityRows([item({ actorUserId: SYSTEM_ACTOR_ID })], "en")[0].actorKey).toBe("actorSystem");
  });

  it("formats the time in the dashboard zone and leaves an invalid time empty", () => {
    const [valid, invalid] = buildActivityRows(
      [item(), item({ id: "a2", occurredAt: "nope" })],
      "en",
      "Asia/Ho_Chi_Minh",
    );
    expect(valid.when).toContain("2026");
    expect(invalid.when).toBe("");
  });

  it("limits the list and keeps order", () => {
    const items = Array.from({ length: 12 }, (_, index) => item({ id: `a${index}` }));
    const rows = buildActivityRows(items, "en");
    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.id)).toEqual(items.slice(0, 5).map((entry) => entry.id));
    expect(buildActivityRows(items, "en", undefined, 2)).toHaveLength(2);
  });

  it("returns an empty list for no activity", () => {
    expect(buildActivityRows([], "en")).toEqual([]);
  });
});
