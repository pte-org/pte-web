"use client";

import type { ReactElement } from "react";
import { DashboardCard, Input } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";

interface TemplateInfoPanelProps {
  name: string;
  nameError?: string;
  onNameChange: (name: string) => void;
}

/**
 * The template's own details (its name) as a compact box. Sized and styled like the
 * skill tab rail it sits under, so the two read as one side column.
 */
export const TemplateInfoPanel = ({
  name,
  nameError,
  onNameChange,
}: TemplateInfoPanelProps): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);

  return (
    <DashboardCard className="border p-3">
      <section aria-label={T.INFO_TITLE} className="space-y-4 rounded-lg bg-[var(--surface-subtle)] p-3">
        <h2 className="text-sm font-semibold text-[var(--ink-primary)]">{T.INFO_TITLE}</h2>
        <Input
          id="score-template-name"
          label={T.NAME_LABEL}
          error={nameError}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </section>
    </DashboardCard>
  );
};
