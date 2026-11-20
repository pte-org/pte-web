/** The part of a learner the "pick existing" list needs. */
export interface PickableStudent {
  publicId: string;
  fullName: string;
  email: string;
}

/** Learners not yet in any class, narrowed by a name/email search (case-insensitive). */
export function pickableStudents(
  students: readonly PickableStudent[],
  assignedIds: ReadonlySet<string>,
  search: string,
): PickableStudent[] {
  const needle = search.trim().toLocaleLowerCase();
  return students.filter(
    (student) =>
      !assignedIds.has(student.publicId) &&
      (needle === "" || `${student.fullName} ${student.email}`.toLocaleLowerCase().includes(needle)),
  );
}

/** Ticks or unticks one learner; a new set, never a mutation. */
export function toggleStudent(selected: ReadonlySet<string>, publicId: string): Set<string> {
  const next = new Set(selected);
  if (next.has(publicId)) next.delete(publicId);
  else next.add(publicId);
  return next;
}

/** "Select all shown": ticks every shown learner, or unticks them all when they are already all ticked. */
export function toggleAllShown(selected: ReadonlySet<string>, shown: readonly PickableStudent[]): Set<string> {
  const allTicked = shown.length > 0 && shown.every((student) => selected.has(student.publicId));
  const next = new Set(selected);
  shown.forEach((student) => (allTicked ? next.delete(student.publicId) : next.add(student.publicId)));
  return next;
}
