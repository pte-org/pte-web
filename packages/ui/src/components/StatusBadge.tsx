import type { ReactElement } from "react";
import { Badge, type BadgeVariant } from "./Badge";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export const StatusBadge = ({
  label,
  variant = "neutral",
}: StatusBadgeProps): ReactElement => <Badge variant={variant}>{label}</Badge>;
