import { describe, expect, it } from "vitest";
import {
  pickableStudents,
  toggleAllShown,
  toggleStudent,
} from "../../../../features/classes/utils/existingStudentPicker";

const STUDENTS = [
  { publicId: "a", fullName: "Tien Phat", email: "tienphat@gmail.com" },
  { publicId: "b", fullName: "Nguyen Thu Ha", email: "ha@test.local" },
  { publicId: "c", fullName: "Le Hoang Minh", email: "minh@test.local" },
];

describe("picking existing learners for a class", () => {
  it("offers only learners not in any class, filtered by name or email", () => {
    expect(pickableStudents(STUDENTS, new Set(["a"]), "").map((s) => s.publicId)).toEqual(["b", "c"]);
    expect(pickableStudents(STUDENTS, new Set(), "MINH").map((s) => s.publicId)).toEqual(["c"]);
    expect(pickableStudents(STUDENTS, new Set(), "test.local").map((s) => s.publicId)).toEqual(["b", "c"]);
  });

  it("ticks and unticks one learner without touching the others", () => {
    const once = toggleStudent(new Set(["b"]), "a");
    expect([...once].sort()).toEqual(["a", "b"]);
    expect([...toggleStudent(once, "a")]).toEqual(["b"]);
  });

  it("select-all ticks every shown learner, and clears them when all are already ticked", () => {
    const shown = STUDENTS.slice(1);
    const all = toggleAllShown(new Set(["a"]), shown);
    expect([...all].sort()).toEqual(["a", "b", "c"]);
    expect([...toggleAllShown(all, shown)]).toEqual(["a"]);
  });
});
