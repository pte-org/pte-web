"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Badge, Chip, Input, PencilIcon, useLocale } from "@pte/ui";
import { useEditorText, useListText } from "../hooks/useTemplateText";

interface HostTemplateHeaderProps {
  template: ScoreTemplateResponse;
  /** Only a draft's name can be changed; it is saved with the rest of the draft. */
  editable: boolean;
  name: string;
  onNameChange: (name: string) => void;
  /** Save and the other template actions, at the right end of the header. */
  actions?: ReactNode;
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

interface TemplateNameProps {
  editable: boolean;
  name: string;
  onNameChange: (name: string) => void;
}

/** The template's name as the page title; on a draft a pencil turns it into a field. */
const TemplateName = ({ editable, name, onNameChange }: TemplateNameProps): ReactElement => {
  const text = useEditorText();
  const [isEditing, setIsEditing] = useState(false);

  if (editable && isEditing) {
    return (
      <Input
        id="host-template-name"
        aria-label={text.NAME_LABEL}
        value={name}
        maxLength={200}
        autoFocus
        onChange={(event) => onNameChange(event.target.value)}
        onBlur={() => setIsEditing(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "Escape") setIsEditing(false);
        }}
        className="min-w-64"
      />
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-1">
      <h1 className="min-w-0 truncate text-2xl font-medium tracking-[-0.02em] text-[var(--ink-primary)]">
        {name || text.NAME_LABEL}
      </h1>
      {editable && (
        <button
          type="button"
          aria-label={text.EDIT_NAME}
          title={text.EDIT_NAME}
          onClick={() => setIsEditing(true)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--ink-muted)] outline-none transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

/** The top of a centre's template page: name, status, kind, the actions, and one line of version and dates. */
export const HostTemplateHeader = ({
  template,
  editable,
  name,
  onNameChange,
  actions,
}: HostTemplateHeaderProps): ReactElement => {
  const text = useEditorText();
  const listText = useListText();
  const { locale } = useLocale();
  const statusLabel =
    {
      DRAFT: listText.STATUS_DRAFT,
      ACTIVE: listText.STATUS_ACTIVE,
      RETIRED: listText.STATUS_RETIRED,
      PENDING_APPROVAL: listText.STATUS_PENDING_APPROVAL,
    }[template.status] ?? template.status;

  return (
    <header className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <TemplateName editable={editable} name={name} onNameChange={onNameChange} />
          <Badge variant={template.status === "DRAFT" ? "warning" : "success"}>{statusLabel}</Badge>
          {typeof template.pearsonStandard === "boolean" && (
            <Chip tone={template.pearsonStandard ? "mint" : "cream"} size="sm">
              {template.pearsonStandard ? listText.STANDARD_BADGE : listText.CUSTOMISED_BADGE}
            </Chip>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <p className="text-xs text-[var(--ink-muted)]">
        {`v${template.version} · ${text.INFO_CREATED} ${formatTimestamp(template.createdAt, locale)} · ${text.INFO_UPDATED} ${formatTimestamp(template.updatedAt, locale)}`}
      </p>
    </header>
  );
};
