"use client";

import type { ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Badge, Chip, InfoPanel, Input, useLocale } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";
import { formatTemplateTimestamp } from "../templateInfo";

interface TemplateInfoPanelProps {
  template: ScoreTemplateResponse;
  /** Whether the panel starts open; a draft keeps it closed so the task types stay in view. */
  defaultOpen: boolean;
  /** The draft's name as typed so far; leave out on a locked template, whose name is only shown. */
  name?: string;
  nameError?: string;
  onNameChange?: (name: string) => void;
}

/**
 * The details of an exam template for the admin: its name (editable on a draft), its version and status, who
 * made it and when. An invalid name opens the panel so the error is seen.
 */
export const TemplateInfoPanel = ({
  template,
  defaultOpen,
  name,
  nameError,
  onNameChange,
}: TemplateInfoPanelProps): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const { locale } = useLocale();
  const author = template.authorName;

  return (
    <InfoPanel
      title={T.INFO_TITLE}
      defaultOpen={defaultOpen}
      forceOpen={Boolean(nameError)}
      rows={[
        {
          label: T.INFO_CREATED_BY,
          value: author ? (
            <span className="flex items-center justify-end gap-1.5">
              <span
                aria-hidden="true"
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--brand-tint)] text-[10px] font-semibold text-[var(--brand-ink)]"
              >
                {author.trim().charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{author}</span>
            </span>
          ) : (
            <span className="font-normal text-[var(--ink-muted)]">{T.INFO_UNKNOWN}</span>
          ),
        },
        { label: T.INFO_CREATED_AT, value: formatTemplateTimestamp(template.createdAt, locale) },
        { label: T.INFO_UPDATED_AT, value: formatTemplateTimestamp(template.updatedAt, locale) },
      ]}
    >
      {onNameChange ? (
        <Input
          id="score-template-name"
          label={T.NAME_LABEL}
          error={nameError}
          value={name ?? template.name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      ) : (
        <p className="text-sm font-semibold leading-snug text-[var(--ink-primary)]">
          {template.name}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip tone="neutral" outlined size="sm">
          v{template.version}
        </Chip>
        <Badge variant={template.status === "ACTIVE" ? "success" : "warning"}>
          {template.status}
        </Badge>
      </div>
    </InfoPanel>
  );
};
