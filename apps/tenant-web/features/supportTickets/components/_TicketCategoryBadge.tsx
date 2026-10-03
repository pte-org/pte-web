import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { CATEGORY_LABELS, CATEGORY_VARIANTS } from "../constants";
import type { TicketCategory } from "../types";

export const TicketCategoryBadge = ({ category }: { category: TicketCategory }): ReactElement => (
  <Badge variant={CATEGORY_VARIANTS[category]}>{CATEGORY_LABELS[category]}</Badge>
);
