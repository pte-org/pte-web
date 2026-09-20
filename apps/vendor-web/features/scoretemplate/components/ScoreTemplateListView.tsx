"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Input, LoadingState, Modal, PageHeader } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import {
  useCloneScoreTemplate,
  useCreateScoreTemplate,
  useDeleteScoreTemplate,
  useScoreTemplates,
} from "../api";
import {
  SCORE_TEMPLATE_LIST_HEADERS,
  SCORE_TEMPLATE_STATUS_LABELS,
  SCORE_TEMPLATE_STATUS_VARIANT,
  SCORE_TEMPLATE_TEXT,
  QUESTION_TEMPLATE_BASE_PATH,
} from "../constants";
import type { ScoreTemplateResponse, ScoreTemplateStatusFilter } from "../types";
import { downloadScoreTemplateJson } from "../serialization";

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
  const createMutation = useCreateScoreTemplate();
  const deleteMutation = useDeleteScoreTemplate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createCode, setCreateCode] = useState("");
  const [createName, setCreateName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const closeCreate = (): void => {
    if (createMutation.isPending) return;
    setIsCreateOpen(false);
    setCreateError(null);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setCreateError(null);
    try {
      const draft = await createMutation.mutateAsync({
        code: createCode.trim(),
        name: createName.trim(),
      });
      closeCreate();
      setCreateCode("");
      setCreateName("");
      router.push(`${QUESTION_TEMPLATE_BASE_PATH}/${draft.publicId}/edit`);
    } catch (error) {
      setCreateError(getUserFacingApiErrorMessage(error, SCORE_TEMPLATE_TEXT.CREATE_ERROR));
    }
  };

  const handleDelete = (template: ScoreTemplateResponse): void => {
    if (template.status !== "DRAFT" || !window.confirm(SCORE_TEMPLATE_TEXT.DELETE_CONFIRM)) return;
    deleteMutation.mutate(template.publicId);
  };

  const handleClone = (publicId: string): void => {
    cloneMutation.mutate(publicId, {
      onSuccess: (draft) => router.push(`${QUESTION_TEMPLATE_BASE_PATH}/${draft.publicId}/edit`),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={SCORE_TEMPLATE_TEXT.LIST_TITLE}
        subtitle={SCORE_TEMPLATE_TEXT.LIST_SUBTITLE}
        actions={
          <Button variant="secondary" onClick={() => setIsCreateOpen(true)}>
            {SCORE_TEMPLATE_TEXT.CREATE_ACTION}
          </Button>
        }
      />

      {isError && <Alert tone="error">{SCORE_TEMPLATE_TEXT.LOAD_ERROR}</Alert>}
      {createError && <Alert tone="error">{createError}</Alert>}
      {createMutation.isError && !createError && (
        <Alert tone="error">{SCORE_TEMPLATE_TEXT.CREATE_ERROR}</Alert>
      )}
      {deleteMutation.isError && <Alert tone="error">{SCORE_TEMPLATE_TEXT.DELETE_ERROR}</Alert>}
      {cloneMutation.isError && (
        <Alert tone="error">{SCORE_TEMPLATE_TEXT.CLONE_ERROR}</Alert>
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
                          {template.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              isLoading={
                                deleteMutation.isPending &&
                                deleteMutation.variables === template.publicId
                              }
                              onClick={() => handleDelete(template)}
                            >
                              {SCORE_TEMPLATE_TEXT.DELETE_ACTION}
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

      <Modal
        open={isCreateOpen}
        onClose={closeCreate}
        title={SCORE_TEMPLATE_TEXT.CREATE_MODAL_TITLE}
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate} disabled={createMutation.isPending}>
              {SCORE_TEMPLATE_TEXT.CANCEL}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="create-question-template-form"
              isLoading={createMutation.isPending}
            >
              {SCORE_TEMPLATE_TEXT.CREATE_ACTION}
            </Button>
          </>
        }
      >
        <form
          id="create-question-template-form"
          className="space-y-4"
          onSubmit={(event) => void handleCreate(event)}
        >
          <p className="text-sm text-gray-600">{SCORE_TEMPLATE_TEXT.CREATE_MODAL_SUBTITLE}</p>
          <Input
            id="create-question-template-code"
            label={SCORE_TEMPLATE_TEXT.CODE_LABEL}
            value={createCode}
            onChange={(event) => setCreateCode(event.target.value)}
            required
            maxLength={64}
          />
          <Input
            id="create-question-template-name"
            label={SCORE_TEMPLATE_TEXT.NAME_LABEL}
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            required
            maxLength={255}
          />
          {createError && <Alert tone="error">{createError}</Alert>}
        </form>
      </Modal>
    </div>
  );
};
