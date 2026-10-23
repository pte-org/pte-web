"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ActionMenu,
  Alert,
  Badge,
  BanIcon,
  Button,
  CopyIcon,
  DataTable,
  EyeIcon,
  Input,
  Modal,
  Pagination,
  PencilIcon,
  Select,
  UploadIcon,
  useToast,
  type ActionMenuItem,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import {
  useClonePracticeRubric,
  useCreatePracticeRubric,
  usePracticeRubrics,
  useRejectPracticeRubric,
  useSubmitPracticeRubricApproval,
} from "../api";
import {
  PRACTICE_RUBRIC_BASE_PATH,
  PRACTICE_RUBRIC_STATUS_LABELS as RAW_STATUS_LABELS,
  PRACTICE_RUBRIC_STATUS_VARIANT,
  PRACTICE_RUBRIC_ERROR_MESSAGES,
  PRACTICE_RUBRIC_TEXT as RAW_TEXT,
} from "../constants";
import { getPracticeRubricErrorMessage } from "../errorMessage";
import { createRubricDocument, serializeRubricDocument } from "../types";
import type { PracticeRubricResponse } from "@pte/api-client";

function detailHref(rubric: PracticeRubricResponse): string {
  return rubric.status === "DRAFT"
    ? `${PRACTICE_RUBRIC_BASE_PATH}/${rubric.publicId}/edit`
    : `${PRACTICE_RUBRIC_BASE_PATH}/${rubric.publicId}`;
}

export function PracticeRubricListView(): ReactElement {
  const T = useAdminCopy(RAW_TEXT);
  const errorMessages = useAdminCopy(PRACTICE_RUBRIC_ERROR_MESSAGES);
  const statusLabels = useAdminCopy(RAW_STATUS_LABELS);
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ rubricKey: "", taskTypeKey: "", status: "", authorUserPublicId: "", version: "" });
  const { data, isLoading, isError, error } = usePracticeRubrics({
    page, size: 20, rubricKey: filters.rubricKey || undefined, taskTypeKey: filters.taskTypeKey || undefined,
    status: filters.status || undefined, authorUserPublicId: filters.authorUserPublicId || undefined,
    version: filters.version.trim() ? Number(filters.version) : undefined,
  });
  const { data: currentUser } = useCurrentUser();
  const canReview = canReviewAcademic(currentUser?.roles);
  const { showToast } = useToast();
  const createMutation = useCreatePracticeRubric();
  const cloneMutation = useClonePracticeRubric();
  const submitMutation = useSubmitPracticeRubricApproval();
  const rejectMutation = useRejectPracticeRubric();
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ rubricKey: "", taskTypeKey: "WRITE_ESSAY", name: "" });
  const [rejectTarget, setRejectTarget] = useState<PracticeRubricResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleCreate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setCreateError(null);
    try {
      const draft = await createMutation.mutateAsync({
        rubricKey: createForm.rubricKey.trim(),
        taskTypeKey: createForm.taskTypeKey.trim().toUpperCase(),
        name: createForm.name.trim(),
        documentJson: serializeRubricDocument(
          createRubricDocument(createForm.taskTypeKey.trim().toUpperCase(), createForm.rubricKey.trim()),
        ),
        changeReason: "Initial rubric draft",
      });
      setCreateOpen(false);
      setCreateForm({ rubricKey: "", taskTypeKey: "WRITE_ESSAY", name: "" });
      router.push(`${PRACTICE_RUBRIC_BASE_PATH}/${draft.publicId}/edit`);
    } catch (caught) {
    setCreateError(getPracticeRubricErrorMessage(caught, T.CREATE_ERROR, errorMessages));
    }
  };

  const buildActions = (rubric: PracticeRubricResponse): ActionMenuItem[] => {
    const actions: ActionMenuItem[] = [{
      label: rubric.status === "DRAFT" ? T.EDIT : T.VIEW,
      icon: rubric.status === "DRAFT" ? PencilIcon : EyeIcon,
      onSelect: () => router.push(detailHref(rubric)),
    }];
    if (rubric.status !== "DRAFT") {
      actions.push({ label: T.CLONE, icon: CopyIcon, onSelect: () => cloneMutation.mutate(rubric.publicId, {
        onSuccess: (draft) => router.push(`${PRACTICE_RUBRIC_BASE_PATH}/${draft.publicId}/edit`),
      }) });
    }
    if (rubric.status === "DRAFT") {
      actions.push({ label: T.SUBMIT, icon: UploadIcon, onSelect: () => submitMutation.mutate(rubric.publicId, {
        onSuccess: () => showToast(T.SUBMITTED, { tone: "success" }),
      }) });
    }
    if (rubric.status === "PENDING_APPROVAL" && canReview) {
      actions.push({ label: T.REJECT, icon: BanIcon, danger: true, onSelect: () => {
        setRejectTarget(rubric);
        setRejectReason("");
      } });
    }
    return actions;
  };

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {isError && <Alert tone="error">{getPracticeRubricErrorMessage(error, T.LOAD_ERROR, errorMessages)}</Alert>}
      {cloneMutation.isError && <Alert tone="error">{getPracticeRubricErrorMessage(cloneMutation.error, T.ACTION_ERROR, errorMessages)}</Alert>}
      {submitMutation.isError && <Alert tone="error">{getPracticeRubricErrorMessage(submitMutation.error, T.ACTION_ERROR, errorMessages)}</Alert>}
      {rejectMutation.isError && <Alert tone="error">{getPracticeRubricErrorMessage(rejectMutation.error, T.ACTION_ERROR, errorMessages)}</Alert>}
      <DataTable
        columns={[
          { key: "rubricKey", header: T.RUBRIC_KEY, cell: (rubric: PracticeRubricResponse) => <span className="font-mono text-xs">{rubric.rubricKey}</span>, filterAccessor: (rubric) => rubric.rubricKey },
          { key: "name", header: T.NAME, cell: (rubric: PracticeRubricResponse) => rubric.name, filterAccessor: (rubric) => rubric.name },
          { key: "taskTypeKey", header: T.TASK_TYPE, cell: (rubric: PracticeRubricResponse) => rubric.taskTypeKey, filterAccessor: (rubric) => rubric.taskTypeKey },
          { key: "version", header: T.VERSION, cell: (rubric: PracticeRubricResponse) => rubric.version, filterAccessor: (rubric) => rubric.version },
          { key: "author", header: T.AUTHOR, cell: (rubric: PracticeRubricResponse) => rubric.authorUserPublicId ?? "—", filterAccessor: (rubric) => rubric.authorUserPublicId ?? "" },
          { key: "status", header: T.STATUS, cell: (rubric: PracticeRubricResponse) => <Badge variant={PRACTICE_RUBRIC_STATUS_VARIANT[rubric.status] ?? "neutral"}>{statusLabels[rubric.status] ?? rubric.status}</Badge>, filterAccessor: (rubric) => rubric.status },
        ]}
        rows={rows}
        getRowKey={(rubric) => rubric.publicId}
        isLoading={isLoading}
        emptyTitle={T.NO_RUBRICS}
        toolbarActions={<div className="flex flex-wrap items-end gap-3"><Input label={T.RUBRIC_KEY} value={filters.rubricKey} onChange={(event) => { setPage(0); setFilters((current) => ({ ...current, rubricKey: event.target.value })); }} /><Input label={T.TASK_TYPE} value={filters.taskTypeKey} onChange={(event) => { setPage(0); setFilters((current) => ({ ...current, taskTypeKey: event.target.value })); }} /><Input label={T.AUTHOR} value={filters.authorUserPublicId} onChange={(event) => { setPage(0); setFilters((current) => ({ ...current, authorUserPublicId: event.target.value })); }} /><Input label={T.VERSION} type="number" min={1} value={filters.version} onChange={(event) => { setPage(0); setFilters((current) => ({ ...current, version: event.target.value })); }} /><Select label={T.STATUS} value={filters.status} onChange={(event) => { setPage(0); setFilters((current) => ({ ...current, status: event.target.value })); }} options={[{ value: "", label: T.STATUS }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))]} /><Button onClick={() => setCreateOpen(true)}>{T.CREATE_ACTION}</Button></div>}
        rowActionsHeader={T.ACTIONS}
        rowActions={(rubric) => <ActionMenu items={buildActions(rubric)} />}
        clientSidePagination={false}
        pagination={meta ? <Pagination currentPage={meta.page + 1} totalPages={meta.totalPages} onPageChange={(next) => setPage(next - 1)} disabled={isLoading} /> : undefined}
        tableClassName="min-w-[850px]"
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={T.CREATE_MODAL_TITLE} footer={
        <><Button variant="ghost" onClick={() => setCreateOpen(false)}>{T.CANCEL}</Button><Button type="submit" form="create-practice-rubric" isLoading={createMutation.isPending}>{T.CREATE}</Button></>
      }>
        <form id="create-practice-rubric" className="space-y-4" onSubmit={(event) => void handleCreate(event)}>
          <Input id="rubric-key" label={T.RUBRIC_KEY} value={createForm.rubricKey} onChange={(event) => setCreateForm((current) => ({ ...current, rubricKey: event.target.value }))} required maxLength={128} />
          <Input id="task-type-key" label={T.TASK_TYPE} value={createForm.taskTypeKey} onChange={(event) => setCreateForm((current) => ({ ...current, taskTypeKey: event.target.value }))} required maxLength={64} />
          <Input id="rubric-name" label={T.NAME} value={createForm.name} onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))} required maxLength={255} />
          {createError && <Alert tone="error">{createError}</Alert>}
        </form>
      </Modal>

      <Modal open={rejectTarget !== null} onClose={() => setRejectTarget(null)} title={T.REJECT_MODAL_TITLE} footer={
        <><Button variant="ghost" onClick={() => setRejectTarget(null)}>{T.CANCEL}</Button><Button type="submit" form="reject-practice-rubric" isLoading={rejectMutation.isPending}>{T.REJECT}</Button></>
      }>
        <form id="reject-practice-rubric" className="space-y-4" onSubmit={(event) => {
          event.preventDefault();
          if (!rejectTarget || !rejectReason.trim()) return;
          rejectMutation.mutate({ publicId: rejectTarget.publicId, payload: { reason: rejectReason.trim() } }, { onSuccess: () => setRejectTarget(null) });
        }}>
          <Input label={T.REJECT_REASON} value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} required maxLength={1000} />
        </form>
      </Modal>
    </div>
  );
}
