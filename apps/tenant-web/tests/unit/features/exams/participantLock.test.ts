import { describe, expect, it } from "vitest";
import { proctorAssignmentLock, studentRosterLock } from "@/features/exams/utils/participantLock";

describe("studentRosterLock", () => {
  it("is open only while the exam is scheduled", () => {
    expect(studentRosterLock("SCHEDULED")).toBeNull();
  });

  it("explains a started or ended exam", () => {
    expect(studentRosterLock("OPEN")).toBe("STARTED");
    expect(studentRosterLock("CLOSED")).toBe("ENDED");
  });

  it("keeps the generic notice for exams that are not published yet", () => {
    expect(studentRosterLock("DRAFT")).toBe("PREPARING");
    expect(studentRosterLock("READY")).toBe("PREPARING");
  });
});

describe("proctorAssignmentLock", () => {
  it("allows adding a proctor until the exam starts", () => {
    for (const status of ["DRAFT", "READY", "SCHEDULED"] as const) {
      expect(proctorAssignmentLock(status)).toBeNull();
    }
  });

  it("blocks adding a proctor once the exam has started or ended", () => {
    expect(proctorAssignmentLock("OPEN")).toBe("STARTED");
    expect(proctorAssignmentLock("CLOSED")).toBe("ENDED");
  });
});
