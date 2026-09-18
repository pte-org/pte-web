"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, LoadingState, PageHeader } from "@pte/ui";
import { useCloneScoreTemplate, useScoreTemplates } from "../api";
import {
  SCORE_TEMPLATE_LIST_HEADERS,
  SCORE_TEMPLATE_STATUS_LABELS,
  SCORE_TEMPLATE_STATUS_VARIANT,
  SCORE_TEMPLATE_TEXT,
} from "../constants";
import type { ScoreTemplateResponse, ScoreTemplateStatusFilter } from "../types";

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

function detailHref(template: ScoreTemplateResponse): string {
  return template.status === "DRAFT"
    ? `/admin/score-template/${template.publicId}/edit`
    : `/admin/score-template/${template.publicId}`;
}

export const ScoreTemplateListView = (): ReactElement => {
  const router = useRouter();
  const { data: templates, isLoading, isError } = useScoreTemplates();
  const cloneMutation = useCloneScoreTemplate();

  const handleClone = (publicId: string): void => {
    cloneMutation.mutate(publicId, {
      onSuccess: (draft) => router.push(`/admin/score-template/${draft.publicId}/edit`),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={SCORE_TEMPLATE_TEXT.LIST_TITLE} subtitle={SCORE_TEMPLATE_TEXT.LIST_SUBTITLE} />

      {isError && (
        <Alert tone="error">Could not load score templates. Please refresh.</Alert>
      )}
      {cloneMutation.isError && (
        <Alert tone="error">Could not clone this template. Please try again.</Alert>
      )}

      {isLoading ? (
        <LoadingState rows={4} />
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className={HEADER_CLASS}>{SCORE_TEMPLATE_LIST_HEADERS.CODE}</th>
                  <th className={HEADER_CLASS}>{SCORE_TEMPLATE_LIST_HEADERS.VERSION}</th>
                  <th className={HEADER_CLASS}>{SCORE_TEMPLATE_LIST_HEADERS.NAME}</th>
                  <th className={HEADER_CLASS}>{SCORE_TEMPLATE_LIST_HEADERS.STATUS}</th>
                  <th className={HEADER_CLASS}>{SCORE_TEMPLATE_LIST_HEADERS.ITEMS}</th>
                  <th className={HEADER_CLASS}>{SCORE_TEMPLATE_LIST_HEADERS.ACTIONS}</th>
                </tr>
              </thead>
              <tbody>
                {(templates ?? []).map((template) => {
                  const status = template.status as ScoreTemplateStatusFilter;
                  return (
                    <tr key={template.publicId} className="border-t border-gray-100 hover:bg-slate-50/70">
                      <td className={`${CELL_CLASS} font-mono text-xs text-gray-900`}>{template.code}</td>
                      <td className={CELL_CLASS}>{template.version}</td>
                      <td className={CELL_CLASS}>{template.name}</td>
                      <td className={CELL_CLASS}>
                        <Badge variant={SCORE_TEMPLATE_STATUS_VARIANT[status] ?? "neutral"}>
                          {SCORE_TEMPLATE_STATUS_LABELS[status] ?? template.status}
                        </Badge>
                      </td>
                      <td className={CELL_CLASS}>{template.items.length}</td>
                      <td className={CELL_CLASS}>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(detailHref(template))}>
                            {template.status === "DRAFT" ? SCORE_TEMPLATE_TEXT.EDIT_ACTION : SCORE_TEMPLATE_TEXT.VIEW_ACTION}
                          </Button>
                          {template.status !== "DRAFT" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              isLoading={cloneMutation.isPending && cloneMutation.variables === template.publicId}
                              onClick={() => handleClone(template.publicId)}
                            >
                              {SCORE_TEMPLATE_TEXT.CLONE_ACTION}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
