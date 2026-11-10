import { expect, it } from "vitest";
import { HOST_INCIDENT_TRANSITIONS } from "../../../../features/exams/constants/incidents";

it("defines receipt, handling, escalation and resolution before immutable closure", () => {
  expect(HOST_INCIDENT_TRANSITIONS.NEW).toEqual(["IN_PROGRESS", "ESCALATED"]);
  expect(HOST_INCIDENT_TRANSITIONS.IN_PROGRESS).toEqual(["RESOLVED", "ESCALATED"]);
  expect(HOST_INCIDENT_TRANSITIONS.RESOLVED).toEqual(["CLOSED", "IN_PROGRESS"]);
  expect(HOST_INCIDENT_TRANSITIONS.CLOSED).toEqual([]);
});

it("allows Host to explicitly reclaim or resolve an escalated incident", () => {
  expect(HOST_INCIDENT_TRANSITIONS.ESCALATED).toEqual(["IN_PROGRESS", "RESOLVED"]);
  for (const transitions of Object.values(HOST_INCIDENT_TRANSITIONS)) expect(transitions).not.toContain("NEW");
});
