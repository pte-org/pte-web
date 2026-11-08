import type { BadgeVariant } from "@pte/ui";
import type { RubricEditText } from "./versionTypes";

export const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  DRAFT: "warning", PENDING: "info", ACTIVE: "success", REJECTED: "danger", RETIRED: "neutral",
};

export const statusVariant = (status: string): BadgeVariant => STATUS_VARIANTS[status] ?? "neutral";

/** The status in words; a status the copy does not know is shown as it is. */
export const statusLabel = (status: string, text: RubricEditText): string =>
  (text as Record<string, string>)[`status${status}`] ?? status;
