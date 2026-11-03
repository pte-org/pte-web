import type { BadgeVariant } from "@pte/ui";
import type { QuestionStatus } from "@/features/questionbank/types";
import type { EXAM_STUDIO_TEXT } from "../constants";

export const STATUS_BADGE: Record<QuestionStatus, BadgeVariant> = {
  draft: "neutral",
  pending_approval: "warning",
  published: "success",
  archived: "neutral",
};

/** The status names, in the language of the copy passed in. */
export const statusLabelsOf = (
  text: Pick<
    typeof EXAM_STUDIO_TEXT,
    "STATUS_DRAFT" | "STATUS_PENDING" | "STATUS_PUBLISHED" | "STATUS_ARCHIVED"
  >,
): Record<QuestionStatus, string> => ({
  draft: text.STATUS_DRAFT,
  pending_approval: text.STATUS_PENDING,
  published: text.STATUS_PUBLISHED,
  archived: text.STATUS_ARCHIVED,
});

/** What the server calls each status it can filter by. */
export const SERVER_STATUS: Record<QuestionStatus, string> = {
  published: "APPROVED",
  pending_approval: "PENDING_APPROVAL",
  draft: "DRAFT",
  archived: "ARCHIVED",
};
