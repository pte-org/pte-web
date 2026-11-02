"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Badge, Button, CircularProgressChart, DashboardCard, Select } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT, STUDIO_PERCENT_SCALE } from "../constants";
import { nextAction } from "../nextAction";
import type { StudioModel } from "../types";
import { templateHref } from "../workingTemplate";

interface StudioReadinessProps {
  model: StudioModel;
  template: ScoreTemplateResponse;
  /** The versions that can be shown: the active one and the drafts. */
  templates: ScoreTemplateResponse[];
  editable: boolean;
  isCreatingDraft: boolean;
  onSelectTemplate: (publicId: string) => void;
  onCreateDraft: () => void;
  onOpenCompose: () => void;
}

const fill = (message: string, values: Record<string, number>): string =>
  Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`{${name}}`, String(value)),
    message,
  );

export const StudioReadiness = ({
  model,
  template,
  templates,
  editable,
  isCreatingDraft,
  onSelectTemplate,
  onCreateDraft,
  onOpenCompose,
}: StudioReadinessProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const router = useRouter();
  const percent = model.totalCount
    ? Math.round((model.readyCount / model.totalCount) * STUDIO_PERCENT_SCALE)
    : 0;
  const reasons = [
    model.outsideCount > 0 ? fill(text.OUTSIDE_TEMPLATE, { count: model.outsideCount }) : null,
    model.missingQuestions > 0
      ? fill(text.MISSING_QUESTIONS, { count: model.missingQuestions })
      : null,
  ].filter((reason): reason is string => reason !== null);
  const otherDraft = templates.find(
    (candidate) => candidate.status === "DRAFT" && candidate.publicId !== template.publicId,
  );
  const action = nextAction({
    editable,
    isReady: model.isReady,
    missingQuestions: model.missingQuestions,
    hasOtherDraft: otherDraft !== undefined,
  });

  return (
    <DashboardCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <CircularProgressChart
          value={model.readyCount}
          max={Math.max(model.totalCount, 1)}
          valueLabel={`${percent}%`}
          ariaLabel={fill(text.READY_TITLE, { ready: model.readyCount, total: model.totalCount })}
          tone={model.isReady ? "success" : "warning"}
          className="h-20 w-20 shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-base font-semibold text-[var(--ink-primary)]">
            {model.isReady
              ? text.ALL_READY_TITLE
              : fill(text.READY_TITLE, { ready: model.readyCount, total: model.totalCount })}
          </h2>
          <p className="text-sm text-[var(--ink-secondary)]">
            {reasons.length > 0 ? reasons.join(" · ") : text.ALL_READY_BODY}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)]">
            {text.TEMPLATE_LABEL}:
            <Link
              href={templateHref(template)}
              className="font-medium text-[var(--brand-ink)] hover:underline"
            >
              {template.code} v{template.version}
            </Link>
            <Badge variant={editable ? "warning" : "success"}>{template.status}</Badge>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {templates.length > 1 && (
            <Select
              id="studio-template-version"
              label={text.TEMPLATE_VERSION}
              value={template.publicId}
              onChange={(event) => onSelectTemplate(event.target.value)}
              options={templates.map((candidate) => ({
                value: candidate.publicId,
                label: `v${candidate.version} · ${candidate.status}`,
              }))}
            />
          )}
          {action === "write-questions" && (
            <Button size="sm" onClick={onOpenCompose}>
              {text.WRITE_MISSING}
            </Button>
          )}
          {action === "activate" && (
            <Button size="sm" onClick={() => router.push(templateHref(template))}>
              {text.ACTIVATE_ON_TEMPLATE_PAGE}
            </Button>
          )}
          {action === "switch-to-draft" && otherDraft && (
            <>
              <p className="max-w-xs text-xs text-[var(--ink-muted)] sm:text-right">
                {text.LOCKED_HAS_DRAFT}
              </p>
              <Button size="sm" onClick={() => onSelectTemplate(otherDraft.publicId)}>
                {text.SWITCH_TO_DRAFT}
              </Button>
            </>
          )}
          {action === "create-draft" && (
            <>
              <p className="max-w-xs text-xs text-[var(--ink-muted)] sm:text-right">
                {text.READ_ONLY_NOTICE}
              </p>
              <Button size="sm" isLoading={isCreatingDraft} onClick={onCreateDraft}>
                {text.CREATE_DRAFT}
              </Button>
            </>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};
