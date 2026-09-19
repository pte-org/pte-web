"use client";

import { useState, type ChangeEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, LoadingState, PageHeader } from "@pte/ui";
import { ApiError } from "@pte/api-client";
import { useCloneScoreTemplate, useImportScoreTemplate, useScoreTemplates } from "../api";
import {
  SCORE_TEMPLATE_LIST_HEADERS,
  SCORE_TEMPLATE_STATUS_LABELS,
  SCORE_TEMPLATE_STATUS_VARIANT,
  SCORE_TEMPLATE_TEXT,
  QUESTION_TEMPLATE_BASE_PATH,
} from "../constants";
import type { ScoreTemplateResponse, ScoreTemplateStatusFilter } from "../types";
import {
  downloadScoreTemplateJson,
  parseScoreTemplateExport,
  toScoreTemplateImportRequest,
} from "../serialization";

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

function detailHref(template: ScoreTemplateResponse): string {
  return template.status === "DRAFT"
    ? `${QUESTION_TEMPLATE_BASE_PATH}/${template.publicId}/edit`
    : `${QUESTION_TEMPLATE_BASE_PATH}/${template.publicId}`;
}

export const ScoreTemplateListView = (): ReactElement => {
  const router = useRouter();
  const { data: templates, isLoading, isError } = useScoreTemplates();
  const cloneMutation = useCloneScoreTemplate();
  const importMutation = useImportScoreTemplate();
  const [importError, setImportError] = useState<string | null>(null);

  const handleClone = (publicId: string): void => {
    cloneMutation.mutate(publicId, {
      onSuccess: (draft) => router.push(`${QUESTION_TEMPLATE_BASE_PATH}/${draft.publicId}/edit`),
    });
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImportError(null);
    if (!file) return;

    try {
      const document = parseScoreTemplateExport(JSON.parse(await file.text()));
      const draft = await importMutation.mutateAsync(toScoreTemplateImportRequest(document));
      router.push(`${QUESTION_TEMPLATE_BASE_PATH}/${draft.publicId}/edit`);
    } catch (error) {
      setImportError(error instanceof ApiError ? error.message : SCORE_TEMPLATE_TEXT.IMPORT_ERROR);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={SCORE_TEMPLATE_TEXT.LIST_TITLE}
        subtitle={SCORE_TEMPLATE_TEXT.LIST_SUBTITLE}
        actions={
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-action px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            {SCORE_TEMPLATE_TEXT.IMPORT_ACTION}
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => void handleImportFile(event)}
            />
          </label>
        }
      />

      {isError && <Alert tone="error">Could not load question templates. Please refresh.</Alert>}
      {importError && <Alert tone="error">{importError}</Alert>}
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
                    <tr
                      key={template.publicId}
                      className="border-t border-gray-100 hover:bg-slate-50/70"
                    >
                      <td className={`${CELL_CLASS} font-mono text-xs text-gray-900`}>
                        {template.code}
                      </td>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(detailHref(template))}
                          >
                            {template.status === "DRAFT"
                              ? SCORE_TEMPLATE_TEXT.EDIT_ACTION
                              : SCORE_TEMPLATE_TEXT.VIEW_ACTION}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadScoreTemplateJson(template)}
                          >
                            {SCORE_TEMPLATE_TEXT.EXPORT_ACTION}
                          </Button>
                          {template.status !== "DRAFT" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              isLoading={
                                cloneMutation.isPending &&
                                cloneMutation.variables === template.publicId
                              }
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
