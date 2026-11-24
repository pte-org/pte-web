import { expect, it } from "vitest";
import { HOST_INCIDENT_TRANSITIONS } from "../../../../features/exams/constants/incidents";

it("defines receipt, handling and resolution before immutable closure, without escalating", () => {
  expect(HOST_INCIDENT_TRANSITIONS.NEW).toEqual(["IN_PROGRESS"]);
  expect(HOST_INCIDENT_TRANSITIONS.IN_PROGRESS).toEqual(["RESOLVED"]);
  expect(HOST_INCIDENT_TRANSITIONS.RESOLVED).toEqual(["CLOSED", "IN_PROGRESS"]);
  expect(HOST_INCIDENT_TRANSITIONS.CLOSED).toEqual([]);
});

it("still lets Host reclaim or resolve a legacy escalated incident, but never offers escalation", () => {
  expect(HOST_INCIDENT_TRANSITIONS.ESCALATED).toEqual(["IN_PROGRESS", "RESOLVED"]);
  for (const transitions of Object.values(HOST_INCIDENT_TRANSITIONS)) {
    expect(transitions).not.toContain("NEW");
    expect(transitions).not.toContain("ESCALATED");
  }
});
