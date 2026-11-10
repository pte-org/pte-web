import { describe, expect, it } from "vitest";
import { PROCTOR_QUERY_KEYS } from "../../../../features/proctor/queryKeys";

describe("PROCTOR_QUERY_KEYS", () => {
  it("scopes keys by tenant, then actor, so one user cache never reaches another", () => {
    expect(PROCTOR_QUERY_KEYS.tenantScope("t1")).toEqual(["proctor", "t1"]);
    expect(PROCTOR_QUERY_KEYS.actorScope("t1", "u1")).toEqual(["proctor", "t1", "u1"]);
    expect(PROCTOR_QUERY_KEYS.actorScope("t1", "u1")).not.toEqual(PROCTOR_QUERY_KEYS.actorScope("t1", "u2"));
  });

  it("includes the timezone in the overview key", () => {
    expect(PROCTOR_QUERY_KEYS.overview("t1", "u1", "Asia/Ho_Chi_Minh")).toEqual([
      "proctor", "t1", "u1", "overview", "Asia/Ho_Chi_Minh",
    ]);
  });

  it("my assignments without params is exactly the invalidation prefix", () => {
    expect(PROCTOR_QUERY_KEYS.myAssignments("t1", "u1")).toEqual(PROCTOR_QUERY_KEYS.myAssignmentsPrefix("t1", "u1"));
  });

  it("my assignments with an empty params object also collapses to the prefix", () => {
    expect(PROCTOR_QUERY_KEYS.myAssignments("t1", "u1", {})).toEqual(PROCTOR_QUERY_KEYS.myAssignmentsPrefix("t1", "u1"));
  });

  it("my assignments keeps only the params that were provided, keeping a zero page", () => {
    expect(PROCTOR_QUERY_KEYS.myAssignments("t1", "u1", { page: 0, scope: "ACCESSIBLE" })).toEqual([
      "proctor", "t1", "u1", "assignments", "mine", { page: 0, scope: "ACCESSIBLE" },
    ]);
  });

  it("the assigned session is keyed by its id", () => {
    expect(PROCTOR_QUERY_KEYS.assignment("s1")).toEqual(["proctor", "assignment", "s1"]);
  });


  it("security audit adds the limit only when it is given, including zero", () => {
    expect(PROCTOR_QUERY_KEYS.securityAudit("s1")).toEqual(["proctor", "security-audit", "s1"]);
    expect(PROCTOR_QUERY_KEYS.securityAudit("s1", 0)).toEqual(["proctor", "security-audit", "s1", { limit: 0 }]);
  });

  it("attendance roster and incidents list append their params when present", () => {
    expect(PROCTOR_QUERY_KEYS.attendanceRoster("s1")).toEqual(["proctor", "attendance", "s1"]);
    expect(PROCTOR_QUERY_KEYS.attendanceRoster("s1", { status: "PRESENT" })).toEqual([
      "proctor", "attendance", "s1", { status: "PRESENT" },
    ]);
    expect(PROCTOR_QUERY_KEYS.incidentsList("s1")).toEqual(["proctor", "incidents", "s1"]);
    expect(PROCTOR_QUERY_KEYS.incidentsList("s1", { status: "OPEN", page: 2 })).toEqual([
      "proctor", "incidents", "s1", { status: "OPEN", page: 2 },
    ]);
  });

  it("attendance history is keyed per student and pages only when asked", () => {
    expect(PROCTOR_QUERY_KEYS.attendanceHistory("s1", "stu")).toEqual(["proctor", "attendance", "s1", "history", "stu"]);
    expect(PROCTOR_QUERY_KEYS.attendanceHistory("s1", "stu", 0, 10)).toEqual([
      "proctor", "attendance", "s1", "history", "stu", { page: 0, size: 10 },
    ]);
  });

  it("detail and history keys of one incident differ and both start with the incidents list prefix", () => {
    const prefix = PROCTOR_QUERY_KEYS.incidentsListPrefix("s1");
    const detail = PROCTOR_QUERY_KEYS.incidentDetail("s1", "i1");
    const history = PROCTOR_QUERY_KEYS.incidentHistory("s1", "i1");

    expect(detail.slice(0, prefix.length)).toEqual([...prefix]);
    expect(history.slice(0, detail.length)).toEqual([...detail]);
    expect(history).not.toEqual(detail);
  });

  it("receipt key identifies one attendance request of one session", () => {
    expect(PROCTOR_QUERY_KEYS.attendanceReceipt("s1", "r1")).toEqual(["proctor", "attendance", "s1", "receipt", "r1"]);
  });
});
