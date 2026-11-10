"use client";

import { useRouter } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Badge, Button, CircularProgressChart, EyeIcon } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT, STUDIO_PERCENT_SCALE } from "../constants";
import { nextAction } from "../nextAction";
import type { StudioModel } from "../types";
import { templateHref } from "../workingTemplate";
import { StudioTemplatePicker } from "./_StudioTemplatePicker";

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
  /** Shown at the foot of the card, such as the colour legend. */
  footer?: ReactNode;
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
  footer,
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
    <div className="space-y-4 rounded-xl border border-[var(--shell-border)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <CircularProgressChart
          value={model.readyCount}
          max={Math.max(model.totalCount, 1)}
          valueLabel={`${percent}%`}
          ariaLabel={fill(text.READY_TITLE, { ready: model.readyCount, total: model.totalCount })}
          tone={model.isReady ? "success" : "warning"}
          className="h-16 w-16 shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="text-base font-semibold text-[var(--ink-primary)]">
            {model.isReady
              ? text.ALL_READY_TITLE
              : fill(text.READY_TITLE, { ready: model.readyCount, total: model.totalCount })}
          </h2>
          <p className="text-sm text-[var(--ink-secondary)]">
            {reasons.length > 0 ? reasons.join(" · ") : text.ALL_READY_BODY}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-sm font-medium text-[var(--ink-primary)]">
              {template.name} v{template.version}
            </span>
            <Badge variant={editable ? "warning" : "success"}>{template.status}</Badge>
            <Button
              size="sm"
              variant="primary"
              appearance="ghost"
              iconOnly
              aria-label={text.VIEW_TEMPLATE}
              title={text.VIEW_TEMPLATE}
              onClick={() => router.push(templateHref(template))}
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StudioTemplatePicker
            template={template}
            templates={templates}
            onSelect={onSelectTemplate}
            onCreateDraft={action === "create-draft" ? onCreateDraft : undefined}
            isCreatingDraft={isCreatingDraft}
          />
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
        </div>
      </div>
      {footer}
    </div>
  );
};
