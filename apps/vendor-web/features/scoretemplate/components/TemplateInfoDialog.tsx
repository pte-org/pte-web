"use client";

import type { ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Badge, Button, Chip, Input, Modal, useLocale } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";
import { formatTemplateTimestamp } from "../templateInfo";

interface TemplateInfoDialogProps {
  open: boolean;
  onClose: () => void;
  template: ScoreTemplateResponse;
  /** The draft's name as typed so far; it is saved with the rest of the draft. */
  name: string;
  nameError?: string;
  onNameChange: (name: string) => void;
}

/** The template's own details: its name (editable) and who made it, when, and under which policy. */
export const TemplateInfoDialog = ({
  open,
  onClose,
  template,
  name,
  nameError,
  onNameChange,
}: TemplateInfoDialogProps): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const { locale } = useLocale();

  const rows = [
    { label: T.INFO_CREATED_BY, value: template.authorName ?? T.INFO_UNKNOWN },
    { label: T.INFO_CREATED_AT, value: formatTemplateTimestamp(template.createdAt, locale) },
    { label: T.INFO_UPDATED_AT, value: formatTemplateTimestamp(template.updatedAt, locale) },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.INFO_TITLE}
      footer={<Button onClick={onClose}>{T.INFO_DONE}</Button>}
    >
      <div className="space-y-5">
        <Input
          id="score-template-name"
          label={T.NAME_LABEL}
          error={nameError}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="neutral" outlined>
            v{template.version}
          </Chip>
          <Badge variant="warning">{template.status}</Badge>
        </div>
        <dl className="divide-y divide-[var(--shell-border)] rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] px-4">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-sm text-[var(--ink-muted)]">{row.label}</dt>
              <dd className="text-right text-sm font-medium text-[var(--ink-primary)]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Modal>
  );
};
