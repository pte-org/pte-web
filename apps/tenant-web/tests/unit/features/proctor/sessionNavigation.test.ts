import { describe, expect, it } from "vitest";
import { getProctorSessionRoute, proctorSessionTabHref } from "../../../../features/proctor/sessionNavigation";

describe("session workspace navigation", () => {
  it("keeps the selected session across each tool and incident details", () => {
    for (const tab of ["attendance", "incidents"] as const) {
      expect(getProctorSessionRoute(proctorSessionTabHref("session-1", tab))).toEqual({
        sessionPublicId: "session-1",
        tab,
      });
    }
    expect(getProctorSessionRoute("/proctor/incidents/session-1/incident-2")).toEqual({
      sessionPublicId: "session-1",
      tab: "incidents",
    });
  });
  it("does not mount a session frame on overview, list, legacy pickers or profile", () => {
    for (const path of [
      "/proctor/sessions",
      "/proctor/attendance",
      "/proctor/incidents",
      "/proctor/profile",
    ])
      expect(getProctorSessionRoute(path)).toBeNull();
  });
  it("treats the old live-monitoring link as no session tab", () => {
    expect(getProctorSessionRoute("/proctor/sessions/session-1")).toBeNull();
  });
  it("no longer recognises the removed audit-log tab", () => {
    expect(getProctorSessionRoute("/proctor/audit-log/session-1")).toBeNull();
  });
});
