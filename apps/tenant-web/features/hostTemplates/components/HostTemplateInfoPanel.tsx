"use client";

import type { ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { InfoPanel, Input, useLocale } from "@pte/ui";
import { useEditorText } from "../hooks/useTemplateText";

interface HostTemplateInfoPanelProps {
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

/** The details of a centre's template: its name (editable on a draft), version and dates. */
export const HostTemplateInfoPanel = ({
  template,
  editable,
  name,
  onNameChange,
}: HostTemplateInfoPanelProps): ReactElement => {
  const text = useEditorText();
  const { locale } = useLocale();

  return (
    <InfoPanel
      title={text.INFO_TITLE}
      rows={[
        { label: text.INFO_VERSION, value: `v${template.version}` },
        { label: text.INFO_CREATED, value: formatTimestamp(template.createdAt, locale) },
        { label: text.INFO_UPDATED, value: formatTimestamp(template.updatedAt, locale) },
      ]}
    >
      <Input
        id="host-template-name"
        label={text.NAME_LABEL}
        value={name}
        maxLength={200}
        disabled={!editable}
        onChange={(event) => onNameChange(event.target.value)}
      />
    </InfoPanel>
  );
};
