import type { DashboardSection, DashboardSectionStatus } from "@pte/api-client";

/** Presence of a section's data: `ok` has data, `error` failed to compute, `forbidden` is hidden. */
export type SectionAvailability = "ok" | "error" | "forbidden";

/**
 * Takes any section (only the status is read), so sections of different data types can be mapped
 * together. The contract says every section is present, but a payload from an older backend may
 * omit one: a missing section is treated as hidden rather than throwing.
 */
export function sectionAvailability(section: { status: DashboardSectionStatus } | null | undefined): SectionAvailability {
  if (!section) return "forbidden";
  if (section.status === "OK") return "ok";
  return section.status === "ERROR" ? "error" : "forbidden";
}

/** Data of an OK section; undefined for ERROR, FORBIDDEN and a missing section. */
export function sectionData<T>(section: DashboardSection<T> | null | undefined): T | undefined {
  return section?.status === "OK" ? section.data : undefined;
}
