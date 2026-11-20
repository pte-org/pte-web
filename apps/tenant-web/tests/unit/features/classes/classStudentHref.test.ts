import { describe, expect, it } from "vitest";
import { classDetailHref, classStudentHref } from "../../../../features/classes/utils/classStudentHref";

describe("learner page opened from a class", () => {
  it("nests the learner under the class so the breadcrumb leads back to it", () => {
    expect(classStudentHref("org", "prog", "cls", "stu")).toBe(
      "/host/programs/prog/classes/cls/students/stu?organizationPublicId=org",
    );
    expect(classDetailHref("org", "prog", "cls")).toBe("/host/programs/prog/classes/cls?organizationPublicId=org");
  });
});
