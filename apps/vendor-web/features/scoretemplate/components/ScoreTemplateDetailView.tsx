"use client";

import { useState, type ReactElement } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Alert, Badge, Button, LoadingState, useDashboardBreadcrumbLabel } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { getScoreTemplateErrorMessage } from "../errorMessage";
import { useActivateScoreTemplate, useCloneScoreTemplate, useScoreTemplate } from "../api";
import {
  EXAM_TEMPLATE_BASE_PATH,
  SCORE_TEMPLATE_STATUS_LABELS as RAW_SCORE_TEMPLATE_STATUS_LABELS,
  SCORE_TEMPLATE_STATUS_VARIANT,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
} from "../constants";
import type { ScoreTemplateStatusFilter } from "../types";
import { ActivateTemplateModal } from "./ActivateTemplateModal";
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
  const activateMutation = useActivateScoreTemplate();
  const [isActivateOpen, setIsActivateOpen] = useState(false);

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
      {/* The template name is already the breadcrumb's last segment, so this row only
          carries what the breadcrumb does not: code/version, status and the actions. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={SCORE_TEMPLATE_STATUS_VARIANT[status] ?? "neutral"}>
            {SCORE_TEMPLATE_STATUS_LABELS[status] ?? template.status}
          </Badge>
          <span className="text-sm text-[var(--ink-muted)]">
            {template.code} v{template.version}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status === "RETIRED" && (
            <Button variant="primary" onClick={() => setIsActivateOpen(true)}>
              {SCORE_TEMPLATE_TEXT.ACTIVATE_ACTION}
            </Button>
          )}
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

      <ActivateTemplateModal
        template={isActivateOpen ? template : null}
        isActivating={activateMutation.isPending}
        errorMessage={
          activateMutation.isError
            ? getScoreTemplateErrorMessage(
                activateMutation.error,
                SCORE_TEMPLATE_TEXT.CONCURRENT_MODIFICATION_ERROR,
              )
            : undefined
        }
        onCancel={() => {
          activateMutation.reset();
          setIsActivateOpen(false);
        }}
        onConfirm={(target) =>
          activateMutation.mutate(target.publicId, { onSuccess: () => setIsActivateOpen(false) })
        }
      />
    </div>
  );
};
