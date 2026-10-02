export interface AssignStudentsContext {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
}

/**
 * Builds the deeplink URL for the Assign Students flow.
 *
 * Produces: /host/students?organizationPublicId={o}&programPublicId={p}&classPublicId={c}&modal=add
 *
 * @param basePath  Always "/host/students" — provided explicitly for clarity.
 * @param ctx       The three required IDs.
 * @returns         Full search-param URL string.
 */
export function buildAssignStudentsUrl(
  basePath: "/host/students",
  ctx: AssignStudentsContext,
): string {
  const params = new URLSearchParams({
    organizationPublicId: ctx.organizationPublicId,
    programPublicId: ctx.programPublicId,
    classPublicId: ctx.classPublicId,
    modal: "add",
  });
  return `${basePath}?${params.toString()}`;
}
