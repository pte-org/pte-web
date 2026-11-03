"use client";

import type { ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Badge, Button, Chip, Input, Modal, useLocale } from "@pte/ui";
import { useEditorText, useListText } from "../hooks/useTemplateText";

interface HostTemplateInfoDialogProps {
  open: boolean;
  onClose: () => void;
  template: ScoreTemplateResponse;
  /** Only a draft's name can be changed; it is saved with the rest of the draft. */
  editable: boolean;
  name: string;
  onNameChange: (name: string) => void;
}

const formatTimestamp = (instant: string | null | undefined, locale: string): string => {
  if (!instant) return "—";
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

/** A template's own details: its name (editable on a draft) and its status, version and dates. */
export const HostTemplateInfoDialog = ({
  open,
  onClose,
  template,
  editable,
  name,
  onNameChange,
}: HostTemplateInfoDialogProps): ReactElement => {
  const text = useEditorText();
  const listText = useListText();
  const { locale } = useLocale();
  const rows = [
    { label: text.INFO_VERSION, value: `v${template.version}` },
    { label: text.INFO_CREATED, value: formatTimestamp(template.createdAt, locale) },
    { label: text.INFO_UPDATED, value: formatTimestamp(template.updatedAt, locale) },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={text.INFO_TITLE}
      footer={<Button onClick={onClose}>{text.INFO_DONE}</Button>}
    >
      <div className="space-y-5">
        <Input
          id="host-template-name"
          label={text.NAME_LABEL}
          value={name}
          maxLength={200}
          disabled={!editable}
          onChange={(event) => onNameChange(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{template.status}</Badge>
          {typeof template.pearsonStandard === "boolean" && (
            <Chip tone={template.pearsonStandard ? "mint" : "cream"} size="sm">
              {template.pearsonStandard ? listText.STANDARD_BADGE : listText.CUSTOMISED_BADGE}
            </Chip>
          )}
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
