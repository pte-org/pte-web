"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ActionMenu,
  Alert,
  Badge,
  BanIcon,
  Button,
  CheckCircleIcon,
  CopyIcon,
  DataTable,
  DocumentIcon,
  EyeIcon,
  Input,
  Modal,
  PencilIcon,
  Select,
  TrashIcon,
  UploadIcon,
  type ActionMenuItem,
} from "@pte/ui";
import { getScoreTemplateErrorMessage } from "../errorMessage";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
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
  SCORE_TEMPLATE_LIST_HEADERS as RAW_SCORE_TEMPLATE_LIST_HEADERS,
  SCORE_TEMPLATE_STATUS_LABELS as RAW_SCORE_TEMPLATE_STATUS_LABELS,
  SCORE_TEMPLATE_STATUS_VARIANT,
  SCORE_TEMPLATE_POLICY_LABELS as RAW_SCORE_TEMPLATE_POLICY_LABELS,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
  EXAM_TEMPLATE_BASE_PATH,
} from "../constants";
import type {
  ScoreTemplatePolicy,
  ScoreTemplateResponse,
  ScoreTemplateStatusFilter,
} from "../types";
import { downloadScoreTemplateJson } from "../serialization";

function detailHref(template: ScoreTemplateResponse): string {
  return template.status === "DRAFT"
    ? `${EXAM_TEMPLATE_BASE_PATH}/${template.publicId}/edit`
    : `${EXAM_TEMPLATE_BASE_PATH}/${template.publicId}`;
}

export const ScoreTemplateListView = (): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const H = useAdminCopy(RAW_SCORE_TEMPLATE_LIST_HEADERS);
  const statusLabels = useAdminCopy(RAW_SCORE_TEMPLATE_STATUS_LABELS);
  const policyLabels = useAdminCopy(RAW_SCORE_TEMPLATE_POLICY_LABELS);
  const statusFilterOptions = useAdminCopy([
    { value: "", label: "All statuses" },
    ...Object.entries(RAW_SCORE_TEMPLATE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ]);
  const policyFilterOptions = useAdminCopy([
    { value: "", label: "All policies" },
    ...Object.entries(RAW_SCORE_TEMPLATE_POLICY_LABELS).map(([value, label]) => ({ value, label })),
  ]);
  const emptyTitle = useAdminCopy("No exam templates found");
  const router = useRouter();
  const { data: templates, isLoading, isError } = useScoreTemplates();
  const cloneMutation = useCloneScoreTemplate();
  const createMutation = useCreateScoreTemplate();
  const deleteMutation = useDeleteScoreTemplate();
  const submitApprovalMutation = useSubmitScoreTemplateApproval();
  const approveMutation = useApproveScoreTemplate();
  const rejectMutation = useRejectScoreTemplate();
  const { data: currentUser } = useCurrentUser();
  const canReview = canReviewAcademic(currentUser?.roles);
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
      setCreateError(getScoreTemplateErrorMessage(error, T.CREATE_ERROR));
    }
  };

  const handleSubmitApproval = (publicId: string): void => {
    setNotice(null);
    submitApprovalMutation.mutate(publicId, {
      onSuccess: () => setNotice(T.APPROVAL_SUBMITTED),
    });
  };

  const handleApprove = (publicId: string): void => {
    setNotice(null);
    approveMutation.mutate(publicId, {
      onSuccess: () => setNotice(T.APPROVAL_APPROVED),
    });
  };

  const handleReject = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError(T.REJECT_REASON_REQUIRED);
      return;
    }
    setRejectError(null);
    rejectMutation.mutate(
      { publicId: rejectTarget.publicId, payload: { reason } },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setRejectReason("");
          setNotice(T.APPROVAL_REJECTED);
        },
      },
    );
  };

  const handleDelete = (template: ScoreTemplateResponse): void => {
    if (template.status !== "DRAFT" || !window.confirm(T.DELETE_CONFIRM)) return;
    deleteMutation.mutate(template.publicId);
  };

  const handleClone = (publicId: string): void => {
    cloneMutation.mutate(publicId, {
      onSuccess: (draft) => router.push(`${EXAM_TEMPLATE_BASE_PATH}/${draft.publicId}/edit`),
    });
  };

  const buildActions = (template: ScoreTemplateResponse): ActionMenuItem[] => {
    const isDraft = template.status === "DRAFT";
    const actions: ActionMenuItem[] = [
      {
        label: isDraft ? T.EDIT_ACTION : T.VIEW_ACTION,
        icon: isDraft ? PencilIcon : EyeIcon,
        onSelect: () => router.push(detailHref(template)),
      },
      {
        label: T.EXPORT_ACTION,
        icon: DocumentIcon,
        onSelect: () => downloadScoreTemplateJson(template),
      },
    ];

    if (!isDraft) {
      actions.push({
        label: T.CLONE_ACTION,
        icon: CopyIcon,
        disabled: cloneMutation.isPending && cloneMutation.variables === template.publicId,
        onSelect: () => handleClone(template.publicId),
      });
    }

    if (isDraft) {
      actions.push({
        label: T.SUBMIT_APPROVAL_ACTION,
        icon: UploadIcon,
        disabled:
          submitApprovalMutation.isPending &&
          submitApprovalMutation.variables === template.publicId,
        onSelect: () => handleSubmitApproval(template.publicId),
      });
      actions.push({
        label: T.DELETE_ACTION,
        icon: TrashIcon,
        danger: true,
        disabled: deleteMutation.isPending && deleteMutation.variables === template.publicId,
        onSelect: () => handleDelete(template),
      });
    }

    if (template.status === "PENDING_APPROVAL" && canReview) {
      actions.push({
        label: T.APPROVE_ACTION,
        icon: CheckCircleIcon,
        disabled: approveMutation.isPending && approveMutation.variables === template.publicId,
        onSelect: () => handleApprove(template.publicId),
      });
      actions.push({
        label: T.REJECT_ACTION,
        icon: BanIcon,
        disabled: rejectMutation.isPending,
        onSelect: () => {
          setRejectTarget(template);
          setRejectReason("");
          setRejectError(null);
        },
      });
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      {notice && <Alert tone="success">{notice}</Alert>}
      {isError && <Alert tone="error">{T.LOAD_ERROR}</Alert>}
      {createError && <Alert tone="error">{createError}</Alert>}
      {createMutation.isError && !createError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(createMutation.error, T.CREATE_ERROR)}
        </Alert>
      )}
      {deleteMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(deleteMutation.error, T.DELETE_ERROR)}
        </Alert>
      )}
      {cloneMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(cloneMutation.error, T.CLONE_ERROR)}
        </Alert>
      )}
      {submitApprovalMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(submitApprovalMutation.error, T.NOT_DRAFT_ERROR)}
        </Alert>
      )}
      {approveMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(approveMutation.error, T.CONCURRENT_MODIFICATION_ERROR)}
        </Alert>
      )}
      {rejectMutation.isError && (
        <Alert tone="error">
          {getScoreTemplateErrorMessage(rejectMutation.error, T.CONCURRENT_MODIFICATION_ERROR)}
        </Alert>
      )}

      <DataTable
        columns={[
          {
            key: "code",
            label: H.CODE,
            header: H.CODE,
            filterAccessor: (template: ScoreTemplateResponse) => template.code,
            cell: (template: ScoreTemplateResponse) => (
              <span className="font-mono text-xs">{template.code}</span>
            ),
          },
          {
            key: "version",
            label: H.VERSION,
            header: H.VERSION,
            filterAccessor: (template: ScoreTemplateResponse) => template.version,
            cell: (template: ScoreTemplateResponse) => template.version,
          },
          {
            key: "name",
            label: H.NAME,
            header: H.NAME,
            filterAccessor: (template: ScoreTemplateResponse) => template.name,
            cell: (template: ScoreTemplateResponse) => template.name,
          },
          {
            key: "status",
            label: H.STATUS,
            header: H.STATUS,
            filterOptions: statusFilterOptions,
            filterAccessor: (template: ScoreTemplateResponse) => template.status,
            cell: (template: ScoreTemplateResponse) => {
              const status = template.status as ScoreTemplateStatusFilter;
              return (
                <Badge variant={SCORE_TEMPLATE_STATUS_VARIANT[status] ?? "neutral"}>
                  {statusLabels[status] ?? template.status}
                </Badge>
              );
            },
          },
          {
            key: "items",
            label: H.ITEMS,
            header: H.ITEMS,
            filterAccessor: (template: ScoreTemplateResponse) => template.items.length,
            cell: (template: ScoreTemplateResponse) => template.items.length,
          },
          {
            key: "policy",
            label: H.POLICY,
            header: H.POLICY,
            filterOptions: policyFilterOptions,
            filterAccessor: (template: ScoreTemplateResponse) => template.templatePolicy,
            cell: (template: ScoreTemplateResponse) =>
              policyLabels[template.templatePolicy as keyof typeof policyLabels] ??
              template.templatePolicy,
          },
        ]}
        rows={templates ?? []}
        getRowKey={(template) => template.publicId}
        isLoading={isLoading}
        emptyTitle={emptyTitle}
        toolbarActions={<Button onClick={() => setIsCreateOpen(true)}>{T.CREATE_ACTION}</Button>}
        tableClassName="min-w-[720px]"
        rowActionsHeader={H.ACTIONS}
        rowActions={(template) => <ActionMenu items={buildActions(template)} />}
      />

      <Modal
        open={isCreateOpen}
        onClose={closeCreate}
        title={T.CREATE_MODAL_TITLE}
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate} disabled={createMutation.isPending}>
              {T.CANCEL_ACTION}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="create-exam-template-form"
              isLoading={createMutation.isPending}
            >
              {T.CREATE_ACTION}
            </Button>
          </>
        }
      >
        <form
          id="create-exam-template-form"
          className="space-y-4"
          onSubmit={(event) => void handleCreate(event)}
        >
          <Input
            id="create-exam-template-code"
            label={T.CODE_LABEL}
            value={createCode}
            onChange={(event) => setCreateCode(event.target.value)}
            required
            maxLength={64}
          />
          <Input
            id="create-exam-template-name"
            label={T.NAME_LABEL}
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            required
            maxLength={255}
          />
          <div>
            <Select
              id="create-exam-template-policy"
              label={T.POLICY_LABEL}
              value={createPolicy}
              onChange={(event) => setCreatePolicy(event.target.value as ScoreTemplatePolicy)}
              options={[
                { value: "STANDARD_PTE", label: T.STANDARD_POLICY },
                { value: "CUSTOM", label: T.CUSTOM_POLICY },
              ]}
            />
            {createPolicy === "CUSTOM" && (
              <p className="mt-1 text-xs text-gray-500">{T.CUSTOM_POLICY_NOTICE}</p>
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
        title={T.REJECT_MODAL_TITLE}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setRejectTarget(null)}
              disabled={rejectMutation.isPending}
            >
              {T.REJECT_CANCEL}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="reject-score-template-form"
              isLoading={rejectMutation.isPending}
            >
              {T.REJECT_CONFIRM}
            </Button>
          </>
        }
      >
        <form id="reject-score-template-form" className="space-y-4" onSubmit={handleReject}>
          <Input
            label={T.REJECT_REASON_LABEL}
            placeholder={T.REJECT_REASON_PLACEHOLDER}
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
