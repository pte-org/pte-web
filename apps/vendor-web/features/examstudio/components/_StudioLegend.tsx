"use client";

import type { ReactElement } from "react";
import { Badge, type BadgeVariant } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT } from "../constants";

export const StudioLegend = (): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const entries: readonly [BadgeVariant, string][] = [
    ["success", text.LEGEND_READY],
    ["warning", text.LEGEND_SHORT],
    ["danger", text.LEGEND_MISSING],
    ["neutral", text.LEGEND_OUTSIDE],
  ];

  return (
    <ul className="flex flex-wrap gap-2">
      {entries.map(([variant, label]) => (
        <li key={label}>
          <Badge variant={variant}>{label}</Badge>
        </li>
      ))}
    </ul>
  );
};
