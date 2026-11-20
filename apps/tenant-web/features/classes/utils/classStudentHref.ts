/** A learner opened from a class roster stays under that class, so the breadcrumb leads back to it. */
export function classStudentHref(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
  studentPublicId: string,
): string {
  const query = new URLSearchParams({ organizationPublicId });
  return `/host/programs/${programPublicId}/classes/${classPublicId}/students/${studentPublicId}?${query}`;
}

/** The class page a learner page leads back to. */
export function classDetailHref(organizationPublicId: string, programPublicId: string, classPublicId: string): string {
  return `/host/programs/${programPublicId}/classes/${classPublicId}?${new URLSearchParams({ organizationPublicId })}`;
}
