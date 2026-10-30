import type { ClassMembershipResponse, UserResponse } from "@pte/api-client";
import type { ClassRosterEntry } from "../types";

export const buildClassRoster = (
  memberships: ClassMembershipResponse[],
  students: UserResponse[],
  classPublicId: string,
): ClassRosterEntry[] => {
  const byId = new Map(students.map((student) => [student.publicId, student]));
  return memberships.flatMap((membership) => {
    if (membership.classPublicId !== classPublicId) return [];
    const student = byId.get(membership.studentPublicId);
    return student ? [{ membership, student }] : [];
  });
};
