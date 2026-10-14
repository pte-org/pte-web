"use client";

import type { ReactElement } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Alert, Badge, Button, DashboardCard, LoadingState, useDashboardBreadcrumbLabel } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { getScoreTemplateErrorMessage } from "../errorMessage";
import { useCloneScoreTemplate, useScoreTemplate } from "../api";
import {
  EXAM_TEMPLATE_BASE_PATH,
  SCORE_TEMPLATE_STATUS_LABELS as RAW_SCORE_TEMPLATE_STATUS_LABELS,
  SCORE_TEMPLATE_STATUS_VARIANT,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
} from "../constants";
import type { ScoreTemplateStatusFilter } from "../types";
import { ScoreTemplateItemTable } from "./_ScoreTemplateItemTable";

interface ScoreTemplateDetailViewProps {
  publicId: string;
}

/** Read-only — shown for ACTIVE/RETIRED templates. A DRAFT is only ever reached through the editor route. */
export const ScoreTemplateDetailView = ({
  publicId,
}: ScoreTemplateDetailViewProps): ReactElement => {
  const SCORE_TEMPLATE_TEXT = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const SCORE_TEMPLATE_STATUS_LABELS = useAdminCopy(RAW_SCORE_TEMPLATE_STATUS_LABELS);
  const router = useRouter();
  const { data: template, isLoading, isError, error } = useScoreTemplate(publicId);
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, template ? `${template.name || template.code} v${template.version}` : undefined);
  const cloneMutation = useCloneScoreTemplate();

  if (isLoading) {
    return <LoadingState rows={6} />;
  }
  if (isError || !template) {
    return (
      <Alert tone="error">
        {getScoreTemplateErrorMessage(error, SCORE_TEMPLATE_TEXT.LOAD_ERROR)}
      </Alert>
    );
  }

  const status = template.status as ScoreTemplateStatusFilter;

  return (
    <div className="space-y-6">
      <DashboardCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--ink-primary)]">{template.name}</p>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">{template.code} v{template.version}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={SCORE_TEMPLATE_STATUS_VARIANT[status] ?? "neutral"}>
              {SCORE_TEMPLATE_STATUS_LABELS[status] ?? template.status}
            </Badge>
            <Button
              variant="secondary"
              isLoading={cloneMutation.isPending}
              onClick={() =>
                cloneMutation.mutate(template.publicId, {
                  onSuccess: (draft) =>
                    router.push(`${EXAM_TEMPLATE_BASE_PATH}/${draft.publicId}/edit`),
                })
              }
            >
              {SCORE_TEMPLATE_TEXT.CLONE_ACTION}
            </Button>
          </div>
        </div>
      </DashboardCard>

      {template.rejectionReason && (
        <Alert tone="warning" title={SCORE_TEMPLATE_TEXT.REJECTION_FEEDBACK_LABEL}>
          {template.rejectionReason}
        </Alert>
      )}

      {cloneMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(cloneMutation.error, SCORE_TEMPLATE_TEXT.CLONE_ERROR)}
        </Alert>
      )}

      <ScoreTemplateItemTable editable={false} items={template.items} />
    </div>
  );
};
