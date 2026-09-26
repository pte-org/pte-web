"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Input, LoadingState, Modal, PageHeader, Select } from "@pte/ui";
import { getScoreTemplateErrorMessage } from "../errorMessage";
import { useCurrentUser } from "@/features/auth/api";
import {
  useApproveScoreTemplate,
  useCloneScoreTemplate,
  useCreateScoreTemplate,
  useDeleteScoreTemplate,
  useRejectScoreTemplate,
  useScoreTemplates,
  useSubmitScoreTemplateApproval,
} from "../api";
import {
  SCORE_TEMPLATE_LIST_HEADERS,
  SCORE_TEMPLATE_STATUS_LABELS,
  SCORE_TEMPLATE_STATUS_VARIANT,
  SCORE_TEMPLATE_POLICY_LABELS,
  SCORE_TEMPLATE_TEXT,
  EXAM_TEMPLATE_BASE_PATH,
} from "../constants";
import type { ScoreTemplatePolicy, ScoreTemplateResponse, ScoreTemplateStatusFilter } from "../types";
import { downloadScoreTemplateJson } from "../serialization";

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

function detailHref(template: ScoreTemplateResponse): string {
  return template.status === "DRAFT"
    ? `${EXAM_TEMPLATE_BASE_PATH}/${template.publicId}/edit`
    : `${EXAM_TEMPLATE_BASE_PATH}/${template.publicId}`;
}

export const ScoreTemplateListView = (): ReactElement => {
  const router = useRouter();
  const { data: templates, isLoading, isError } = useScoreTemplates();
  const cloneMutation = useCloneScoreTemplate();
  const createMutation = useCreateScoreTemplate();
  const deleteMutation = useDeleteScoreTemplate();
  const submitApprovalMutation = useSubmitScoreTemplateApproval();
  const approveMutation = useApproveScoreTemplate();
  const rejectMutation = useRejectScoreTemplate();
  const { data: currentUser } = useCurrentUser();
  const isPlatformAdmin = currentUser?.roles.includes("PLATFORM_ADMIN") ?? false;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createCode, setCreateCode] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPolicy, setCreatePolicy] = useState<ScoreTemplatePolicy>("STANDARD_PTE");
  const [createError, setCreateError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ScoreTemplateResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

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
        templatePolicy: createPolicy,
      });
      closeCreate();
      setCreateCode("");
      setCreateName("");
      setCreatePolicy("STANDARD_PTE");
      router.push(`${EXAM_TEMPLATE_BASE_PATH}/${draft.publicId}/edit`);
    } catch (error) {
      setCreateError(getScoreTemplateErrorMessage(error, SCORE_TEMPLATE_TEXT.CREATE_ERROR));
    }
  };

  const handleSubmitApproval = (publicId: string): void => {
    setNotice(null);
    submitApprovalMutation.mutate(publicId, {
      onSuccess: () => setNotice(SCORE_TEMPLATE_TEXT.APPROVAL_SUBMITTED),
    });
  };

  const handleApprove = (publicId: string): void => {
    setNotice(null);
    approveMutation.mutate(publicId, {
      onSuccess: () => setNotice(SCORE_TEMPLATE_TEXT.APPROVAL_APPROVED),
    });
  };

  const handleReject = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError(SCORE_TEMPLATE_TEXT.REJECT_REASON_REQUIRED);
      return;
    }
    setRejectError(null);
    rejectMutation.mutate(
      { publicId: rejectTarget.publicId, payload: { reason } },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setRejectReason("");
          setNotice(SCORE_TEMPLATE_TEXT.APPROVAL_REJECTED);
        },
      },
    );
  };

  const handleDelete = (template: ScoreTemplateResponse): void => {
    if (template.status !== "DRAFT" || !window.confirm(SCORE_TEMPLATE_TEXT.DELETE_CONFIRM)) return;
    deleteMutation.mutate(template.publicId);
  };

  const handleClone = (publicId: string): void => {
    cloneMutation.mutate(publicId, {
      onSuccess: (draft) => router.push(`${EXAM_TEMPLATE_BASE_PATH}/${draft.publicId}/edit`),
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

      {notice && <Alert tone="success">{notice}</Alert>}
      {isError && <Alert tone="error">{SCORE_TEMPLATE_TEXT.LOAD_ERROR}</Alert>}
      {createError && <Alert tone="error">{createError}</Alert>}
      {createMutation.isError && !createError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(createMutation.error, SCORE_TEMPLATE_TEXT.CREATE_ERROR)}
        </Alert>
      )}
      {deleteMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(deleteMutation.error, SCORE_TEMPLATE_TEXT.DELETE_ERROR)}
        </Alert>
      )}
      {cloneMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(cloneMutation.error, SCORE_TEMPLATE_TEXT.CLONE_ERROR)}
        </Alert>
      )}
      {submitApprovalMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(
            submitApprovalMutation.error,
            SCORE_TEMPLATE_TEXT.NOT_DRAFT_ERROR,
          )}
        </Alert>
      )}
      {approveMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(
            approveMutation.error,
            SCORE_TEMPLATE_TEXT.CONCURRENT_MODIFICATION_ERROR,
          )}
        </Alert>
      )}
      {rejectMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(
            rejectMutation.error,
            SCORE_TEMPLATE_TEXT.CONCURRENT_MODIFICATION_ERROR,
          )}
        </Alert>
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
                  <th className={HEADER_CLASS}>{SCORE_TEMPLATE_LIST_HEADERS.POLICY}</th>
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
                        {SCORE_TEMPLATE_POLICY_LABELS[
                          template.templatePolicy as keyof typeof SCORE_TEMPLATE_POLICY_LABELS
                        ] ?? template.templatePolicy}
                      </td>
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
                              variant="secondary"
                              size="sm"
                              isLoading={
                                submitApprovalMutation.isPending &&
                                submitApprovalMutation.variables === template.publicId
                              }
                              onClick={() => handleSubmitApproval(template.publicId)}
                            >
                              {SCORE_TEMPLATE_TEXT.SUBMIT_APPROVAL_ACTION}
                            </Button>
                          )}
                          {template.status === "PENDING_APPROVAL" && isPlatformAdmin && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                isLoading={
                                  approveMutation.isPending &&
                                  approveMutation.variables === template.publicId
                                }
                                onClick={() => handleApprove(template.publicId)}
                              >
                                {SCORE_TEMPLATE_TEXT.APPROVE_ACTION}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setRejectTarget(template);
                                  setRejectReason("");
                                  setRejectError(null);
                                }}
                              >
                                {SCORE_TEMPLATE_TEXT.REJECT_ACTION}
                              </Button>
                            </>
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
              {SCORE_TEMPLATE_TEXT.CANCEL_ACTION}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="create-exam-template-form"
              isLoading={createMutation.isPending}
            >
              {SCORE_TEMPLATE_TEXT.CREATE_ACTION}
            </Button>
          </>
        }
      >
        <form
          id="create-exam-template-form"
          className="space-y-4"
          onSubmit={(event) => void handleCreate(event)}
        >
          <p className="text-sm text-gray-600">{SCORE_TEMPLATE_TEXT.CREATE_MODAL_SUBTITLE}</p>
          <Input
            id="create-exam-template-code"
            label={SCORE_TEMPLATE_TEXT.CODE_LABEL}
            value={createCode}
            onChange={(event) => setCreateCode(event.target.value)}
            required
            maxLength={64}
          />
          <Input
            id="create-exam-template-name"
            label={SCORE_TEMPLATE_TEXT.NAME_LABEL}
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            required
            maxLength={255}
          />
          <div>
            <Select
              id="create-exam-template-policy"
              label={SCORE_TEMPLATE_TEXT.POLICY_LABEL}
              value={createPolicy}
              onChange={(event) => setCreatePolicy(event.target.value as ScoreTemplatePolicy)}
              options={[
                { value: "STANDARD_PTE", label: SCORE_TEMPLATE_TEXT.STANDARD_POLICY },
                { value: "CUSTOM", label: SCORE_TEMPLATE_TEXT.CUSTOM_POLICY },
              ]}
            />
            {createPolicy === "CUSTOM" && (
              <p className="mt-1 text-xs text-gray-500">{SCORE_TEMPLATE_TEXT.CUSTOM_POLICY_NOTICE}</p>
            )}
          </div>
          {createError && <Alert tone="error">{createError}</Alert>}
        </form>
      </Modal>

      <Modal
        open={rejectTarget !== null}
        onClose={() => {
          if (!rejectMutation.isPending) setRejectTarget(null);
        }}
        title={SCORE_TEMPLATE_TEXT.REJECT_MODAL_TITLE}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setRejectTarget(null)}
              disabled={rejectMutation.isPending}
            >
              {SCORE_TEMPLATE_TEXT.REJECT_CANCEL}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="reject-score-template-form"
              isLoading={rejectMutation.isPending}
            >
              {SCORE_TEMPLATE_TEXT.REJECT_CONFIRM}
            </Button>
          </>
        }
      >
        <form id="reject-score-template-form" className="space-y-4" onSubmit={handleReject}>
          <Input
            label={SCORE_TEMPLATE_TEXT.REJECT_REASON_LABEL}
            placeholder={SCORE_TEMPLATE_TEXT.REJECT_REASON_PLACEHOLDER}
            value={rejectReason}
            error={rejectError ?? undefined}
            onChange={(event) => setRejectReason(event.target.value)}
            maxLength={500}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
