"use client";

import type { ReactElement } from "react";
import { DashboardCard, Input, Select } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";
import type { ScoreTemplatePolicy } from "../types";

interface TemplateInfoPanelProps {
  name: string;
  nameError?: string;
  onNameChange: (name: string) => void;
  policy: ScoreTemplatePolicy;
  onPolicyChange: (policy: ScoreTemplatePolicy) => void;
}

/**
 * The template's own details (name and policy) as a compact box. Sized and styled like the
 * skill tab rail it sits under, so the two read as one side column.
 */
export const TemplateInfoPanel = ({
  name,
  nameError,
  onNameChange,
  policy,
  onPolicyChange,
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
        <div>
          <Select
            id="score-template-policy"
            label={T.POLICY_LABEL}
            value={policy}
            onChange={(event) => onPolicyChange(event.target.value as ScoreTemplatePolicy)}
            options={[
              { value: "STANDARD_PTE", label: T.STANDARD_POLICY },
              { value: "CUSTOM", label: T.CUSTOM_POLICY },
            ]}
          />
          {policy === "CUSTOM" && (
            <p className="mt-1 text-xs text-[var(--ink-muted)]">{T.CUSTOM_POLICY_NOTICE}</p>
          )}
        </div>
      </section>
    </DashboardCard>
  );
};
