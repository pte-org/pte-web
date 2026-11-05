"use client";

import type { ReactElement } from "react";
import { Alert, Select, type SelectOption } from "@pte/ui";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import type { RubricVersionResponse, ScoreTemplateResponse } from "../types";

interface TemplatePickerProps {
  templates: ScoreTemplateResponse[];
  selected: ScoreTemplateResponse | null;
  versions: RubricVersionResponse[];
  templatesFailed: boolean;
  onSelect: (publicId: string) => void;
}

/** Chooses the exam template whose pinned rubric version and skill weights the page shows. */
export const TemplatePicker = ({
  templates,
  selected,
  versions,
  templatesFailed,
  onSelect,
}: TemplatePickerProps): ReactElement => {
  const { messages: M, format } = useScoringRubricText();

  const options: SelectOption[] = [
    { value: "", label: M.templateNone },
    ...templates.map((template) => ({
      value: template.publicId,
      label: format("templateOption", {
        code: template.code,
        version: template.version,
        status: template.status,
      }),
    })),
  ];

  const pinnedId = selected?.rubricVersionPublicId ?? null;
  const pinnedVersion = pinnedId
    ? versions.find((version) => version.publicId === pinnedId)
    : undefined;
  const pinNote = !selected
    ? null
    : !pinnedId
      ? M.templateNotPinned
      : pinnedVersion
        ? format("templatePinned", {
            versionNo: pinnedVersion.versionNo,
            status: pinnedVersion.status,
          })
        : format("templatePinnedUnknown", { versionId: pinnedId });

  return (
    <div className="space-y-2">
      {templatesFailed && <Alert tone="warning">{M.templatesError}</Alert>}
      <Select
        id="scoring-rubric-template"
        label={M.templateLabel}
        options={options}
        value={selected?.publicId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
        className="max-w-xl"
        searchable
      />
      {pinNote && <p className="text-sm text-[var(--ink-secondary)]">{pinNote}</p>}
    </div>
  );
};
