import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { CATEGORY_LABELS, CATEGORY_VARIANTS } from "../constants";
import type { TicketCategory } from "../types";

interface TicketCategoryBadgeProps {
  category: TicketCategory;
}

export const TicketCategoryBadge = ({ category }: TicketCategoryBadgeProps): ReactElement => (
  <Badge variant={CATEGORY_VARIANTS[category]}>{CATEGORY_LABELS[category]}</Badge>
);
