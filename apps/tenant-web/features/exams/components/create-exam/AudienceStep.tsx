import Link from "next/link";
import type { ReactElement } from "react";
import type { AudienceSourceRequest } from "@pte/api-client";
import { Input, Select } from "@pte/ui";
import { CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import type { CreateExamWorkflowInput } from "../../types";
import type { CreateExamAudienceOption } from "../../hooks/useCreateExamAudience";
import type { CreateExamWorkflowErrors } from "../../utils/validateCreateExamWorkflow";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;
type SourceTypeOption = { value: AudienceSourceRequest["sourceType"]; label: string };

export interface AudienceStepProps {
  sources: readonly CreateExamWorkflowInput["sources"][number][];
  errors: CreateExamWorkflowErrors;
  wizardText: WizardText;
  localizedSourceTypeOptions: SourceTypeOption[];
  sourceType: AudienceSourceRequest["sourceType"];
  sourcePublicId: string;
  sourceSearch: string;
  sourceOptions: CreateExamAudienceOption[];
  sourceLabels: ReadonlyMap<string, string>;
  sourceTypeLabels: ReadonlyMap<string, string>;
  sourceLoading: boolean;
  onSourceTypeChange: (sourceType: AudienceSourceRequest["sourceType"]) => void;
  onSourcePublicIdChange: (sourcePublicId: string) => void;
  onSourceSearchChange: (sourceSearch: string) => void;
  addSource: () => void;
  removeSource: (index: number) => void;
  localizeError: (message?: string) => string | undefined;
}

export function AudienceStep({
  sources,
  errors,
  wizardText,
  localizedSourceTypeOptions,
  sourceType,
  sourcePublicId,
  sourceSearch,
  sourceOptions,
  sourceLabels,
  sourceTypeLabels,
  sourceLoading,
  onSourceTypeChange,
  onSourcePublicIdChange,
  onSourceSearchChange,
  addSource,
  removeSource,
  localizeError,
}: AudienceStepProps): ReactElement {
  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
        {wizardText.STEP_AUDIENCE}
      </div>
      <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="text-sm font-semibold text-[var(--ink-primary)]">
            {wizardText.SOURCES_TITLE}
          </div>
          {sourceType === "CLASS" && (
            <Link
              href="/host/programs"
              className="text-xs font-medium text-[var(--brand-ink)] hover:underline"
            >
              {wizardText.MANAGE_CLASSES}
            </Link>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label={wizardText.SOURCE_TYPE_LABEL}
            value={sourceType}
            onChange={(event) =>
              onSourceTypeChange(event.target.value as AudienceSourceRequest["sourceType"])
            }
            options={localizedSourceTypeOptions}
          />
          <Input
            label={wizardText.SOURCE_SEARCH_LABEL}
            placeholder={wizardText.SOURCE_SEARCH_PLACEHOLDER}
            value={sourceSearch}
            onChange={(event) => onSourceSearchChange(event.target.value)}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Select
            label={wizardText.SOURCE_OPTION_LABEL}
            placeholder={
              sourceLoading
                ? wizardText.SOURCE_LOADING
                : sourceOptions.length === 0
                  ? wizardText.SOURCE_EMPTY
                  : wizardText.SOURCE_PLACEHOLDER
            }
            value={sourcePublicId}
            disabled={sourceLoading || sourceOptions.length === 0}
            onChange={(event) => onSourcePublicIdChange(event.target.value)}
            options={sourceOptions}
          />
          <button
            type="button"
            onClick={addSource}
            disabled={!sourcePublicId}
            className="rounded-lg border border-action px-3 py-2.5 text-sm font-medium text-action transition-colors hover:bg-[var(--action-tint)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {wizardText.ADD_SOURCE}
          </button>
        </div>
        {errors.sources && (
          <p className="mt-2 text-sm text-[var(--blush-action)]">{localizeError(errors.sources)}</p>
        )}
        {sources.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ink-muted)]">{wizardText.NO_SOURCES}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {sources.map((source, index) => (
              <li
                key={`${source.sourceType}-${source.sourcePublicId}`}
                className="flex items-center justify-between rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--ink-primary)]">
                  {sourceTypeLabels.get(source.sourceType) ?? source.sourceType}:{" "}
                  {sourceLabels.get(`${source.sourceType}:${source.sourcePublicId}`) ??
                    source.sourcePublicId}
                </span>
                <button
                  type="button"
                  onClick={() => removeSource(index)}
                  className="text-[var(--blush-action)] hover:underline"
                >
                  {wizardText.REMOVE_SOURCE}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
