import type { ReactElement } from "react";
import { Badge, useLocale } from "@pte/ui";
import { CATEGORY_LABELS, CATEGORY_VARIANTS } from "../constants";
import type { TicketCategory } from "../types";

export const TicketCategoryBadge = ({ category }: { category: TicketCategory }): ReactElement => {
  const { t } = useLocale();
  const labels: Record<TicketCategory, string> = {
    BUG: t("tenant.support.category.bug", CATEGORY_LABELS.BUG),
    CONTENT_COMPLAINT: t(
      "tenant.support.category.contentComplaint",
      CATEGORY_LABELS.CONTENT_COMPLAINT,
    ),
    GENERAL_FEEDBACK: t(
      "tenant.support.category.generalFeedback",
      CATEGORY_LABELS.GENERAL_FEEDBACK,
    ),
  };
  return <Badge variant={CATEGORY_VARIANTS[category]}>{labels[category]}</Badge>;
};
