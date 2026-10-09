import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { CATEGORY_LABELS as RAW_CATEGORY_LABELS, CATEGORY_VARIANTS } from "../constants";
import type { TicketCategory } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface TicketCategoryBadgeProps {
  category: TicketCategory;
}

export const TicketCategoryBadge = ({ category }: TicketCategoryBadgeProps): ReactElement => {
  const labels = useAdminCopy(RAW_CATEGORY_LABELS);
  return <Badge variant={CATEGORY_VARIANTS[category]}>{labels[category]}</Badge>;
};
