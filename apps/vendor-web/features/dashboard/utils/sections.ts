import type { DashboardSection, DashboardSectionStatus } from "@pte/api-client";

export type SectionAvailability = "ok" | "error" | "forbidden";

/**
 * Checks section availability safely. A missing or null section (payload drift) is treated
 * as hidden (forbidden) rather than throwing.
 */
export function sectionAvailability(
  section: { status: DashboardSectionStatus } | null | undefined,
): SectionAvailability {
  if (!section) return "forbidden";
  if (section.status === "OK") return "ok";
  return section.status === "ERROR" ? "error" : "forbidden";
}

/** Returns data of an OK section; undefined for ERROR, FORBIDDEN or missing sections. */
export function sectionData<T>(section: DashboardSection<T> | null | undefined): T | undefined {
  return section?.status === "OK" ? section.data : undefined;
}
