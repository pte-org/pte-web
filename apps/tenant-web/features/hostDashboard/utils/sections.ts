import type { DashboardSection, DashboardSectionStatus } from "@pte/api-client";

/** Presence of a section's data: `ok` has data, `error` failed to compute, `forbidden` is hidden. */
export type SectionAvailability = "ok" | "error" | "forbidden";

/** Takes any section (only the status is read), so sections of different data types can be mapped together. */
export function sectionAvailability(section: { status: DashboardSectionStatus }): SectionAvailability {
  if (section.status === "OK") return "ok";
  return section.status === "ERROR" ? "error" : "forbidden";
}

/** Data of an OK section; undefined for ERROR and FORBIDDEN. */
export function sectionData<T>(section: DashboardSection<T>): T | undefined {
  return section.status === "OK" ? section.data : undefined;
}
