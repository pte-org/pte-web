"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, LoadingState, PageHeader } from "@pte/ui";
import { useCloneScoreTemplate, useScoreTemplate } from "../api";
import { SCORE_TEMPLATE_STATUS_LABELS, SCORE_TEMPLATE_STATUS_VARIANT, SCORE_TEMPLATE_TEXT } from "../constants";
import type { ScoreTemplateStatusFilter } from "../types";
import { ScoreTemplateItemTable } from "./_ScoreTemplateItemTable";

interface ScoreTemplateDetailViewProps {
  publicId: string;
}

/** Read-only — shown for ACTIVE/RETIRED templates. A DRAFT is only ever reached through the editor route. */
export const ScoreTemplateDetailView = ({ publicId }: ScoreTemplateDetailViewProps): ReactElement => {
  const router = useRouter();
  const { data: template, isLoading, isError } = useScoreTemplate(publicId);
  const cloneMutation = useCloneScoreTemplate();

  if (isLoading) {
    return <LoadingState rows={6} />;
  }
  if (isError || !template) {
    return <Alert tone="error">Could not load this score template.</Alert>;
  }

  const status = template.status as ScoreTemplateStatusFilter;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${template.code} v${template.version}`}
        subtitle={template.name}
        actions={
          <>
            <Badge variant={SCORE_TEMPLATE_STATUS_VARIANT[status] ?? "neutral"}>
              {SCORE_TEMPLATE_STATUS_LABELS[status] ?? template.status}
            </Badge>
            <Button
              variant="secondary"
              isLoading={cloneMutation.isPending}
              onClick={() =>
                cloneMutation.mutate(template.publicId, {
                  onSuccess: (draft) => router.push(`/admin/score-template/${draft.publicId}/edit`),
                })
              }
            >
              {SCORE_TEMPLATE_TEXT.CLONE_ACTION}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/admin/score-template")}>
              {SCORE_TEMPLATE_TEXT.DETAIL_BACK}
            </Button>
          </>
        }
      />

      {cloneMutation.isError && <Alert tone="error">Could not clone this template. Please try again.</Alert>}

      <ScoreTemplateItemTable editable={false} items={template.items} />
    </div>
  );
};
