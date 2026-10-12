"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  getUserFacingApiErrorMessage,
  type AnnouncementCreateRequest,
  type AnnouncementResponse,
} from "@pte/api-client";
import {
  ActionMenu,
  Alert,
  Button,
  CheckCircleIcon,
  DataTable,
  EyeIcon,
  PaginationControls,
  PencilIcon,
  TrashIcon,
  useToast,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  useAnnouncementsQuery,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useRetryAnnouncementDelivery,
  useUpdateAnnouncement,
} from "../announcementsApi";
import { AnnouncementFormModal } from "./AnnouncementFormModal";

type Confirmation = { kind: "publish" | "delete"; announcement: AnnouncementResponse } | null;

export function AnnouncementsView(): ReactElement {
  const T = useAdminCopy({
    ALL_STATUSES: "All statuses",
    PUBLISHED: "Published",
    DRAFT: "Draft",
    SAVED: "Announcement draft saved.",
    ANNOUNCEMENT_PUBLISHED: "Announcement published.",
    DRAFT_DELETED: "Draft deleted.",
    CONFLICT_TITLE: "Draft changed elsewhere",
    CONFLICT_TEXT: "Reload the latest draft before editing or publishing it.",
    RELOAD_LIST: "Reload list",
    TITLE: "Title",
    IMPORTANCE: "Importance",
    STATUS: "Status",
    RECIPIENTS: "Recipients",
    DELIVERED: "delivered",
    NOT_PUBLISHED: "Not published",
    UPDATED: "Updated",
    DATE_RANGE: "Date range",
    EMPTY_TITLE: "No announcement drafts",
    EMPTY_DESCRIPTION: "Create a draft when the platform needs to communicate a global notice.",
    NEW: "New announcement",
    VIEW: "View",
    EDIT: "Edit draft",
    PUBLISH_NOW: "Publish now",
    DELETE_DRAFT: "Delete draft",
    RETRY_DELIVERY: "Retry failed delivery",
    RETRY_QUEUED: "Delivery retry queued.",
    PUBLISH_CONFIRM: "Publish announcement?",
    DELETE_CONFIRM: "Delete draft?",
    PUBLISH_DESCRIPTION:
      "This publishes immutable content to the eligible host audience immediately.",
    DELETE_DESCRIPTION: "This draft will be removed and cannot be restored.",
    CANCEL: "Cancel",
    PUBLISH: "Publish",
    DELETE: "Delete",
  });
  const categoryLabels = useAdminCopy({
    SYSTEM_NOTICE: "System notice",
    MAINTENANCE: "Maintenance",
    SESSION: "Session",
    APPLICATION: "Application",
    BILLING: "Billing",
  });
  const importanceLabels = useAdminCopy({ INFO: "Informational", IMPORTANT: "Important" });
  const announcementStatusFilterOptions = useAdminCopy([
    { value: "", label: T.ALL_STATUSES },
    { value: "PUBLISHED", label: T.PUBLISHED },
    { value: "DRAFT", label: T.DRAFT },
  ]);
  const router = useRouter();
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const [composer, setComposer] = useState<AnnouncementResponse | null | undefined>(undefined);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const announcements = useAnnouncementsQuery(page);
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const publish = usePublishAnnouncement();
  const remove = useDeleteAnnouncement();
  const retry = useRetryAnnouncementDelivery();

  const save = async (
    payload: AnnouncementCreateRequest,
    expectedDraftVersion?: number,
  ): Promise<void> => {
    try {
      if (expectedDraftVersion === undefined) await create.mutateAsync(payload);
      else if (composer) {
        const draftPayload = {
          title: payload.title,
          body: payload.body,
          category: payload.category,
          importance: payload.importance,
          affectedFrom: payload.affectedFrom,
          affectedUntil: payload.affectedUntil,
          expectedDraftVersion,
        };
        await update.mutateAsync({ publicId: composer.publicId, payload: draftPayload });
      }
      setComposer(undefined);
      setConflict(null);
      showToast(T.SAVED);
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict" && composer) {
        setComposer(undefined);
        setConflict(composer.publicId);
      }
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    }
  };

  const confirmAction = async (): Promise<void> => {
    if (!confirmation) return;
    const { kind, announcement } = confirmation;
    try {
      if (kind === "publish")
        await publish.mutateAsync({
          publicId: announcement.publicId,
          payload: { expectedDraftVersion: announcement.version },
        });
      else
        await remove.mutateAsync({
          publicId: announcement.publicId,
          payload: { expectedDraftVersion: announcement.version },
        });
      setConfirmation(null);
      showToast(kind === "publish" ? T.ANNOUNCEMENT_PUBLISHED : T.DRAFT_DELETED);
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict")
        setConflict(announcement.publicId);
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    }
  };

  const rows = announcements.data?.data ?? [];
  return (
    <div className="flex flex-col gap-5">
      {announcements.error && (
        <Alert tone="error">{getUserFacingApiErrorMessage(announcements.error)}</Alert>
      )}
      {conflict && (
        <Alert tone="warning" title={T.CONFLICT_TITLE}>
          {T.CONFLICT_TEXT}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setConflict(null);
              void announcements.refetch();
            }}
          >
            {T.RELOAD_LIST}
          </Button>
        </Alert>
      )}
      <DataTable
        columns={[
          {
            key: "title",
            header: T.TITLE,
            cell: (row: AnnouncementResponse) => (
              <div>
                <p className="font-medium text-slate-900">{row.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {categoryLabels[row.category as keyof typeof categoryLabels] ?? row.category}
                </p>
              </div>
            ),
          },
          {
            key: "importance",
            header: T.IMPORTANCE,
            cell: (row: AnnouncementResponse) =>
              importanceLabels[row.importance as keyof typeof importanceLabels] ?? row.importance,
          },
          {
            key: "status",
            header: T.STATUS,
            filterOptions: announcementStatusFilterOptions,
            filterAccessor: (row: AnnouncementResponse) => (row.published ? "PUBLISHED" : "DRAFT"),
            cell: (row: AnnouncementResponse) =>
              row.published ? (
                <span className="text-green-700">{T.PUBLISHED}</span>
              ) : (
                <span className="text-amber-700">{T.DRAFT}</span>
              ),
          },
          {
            key: "audience",
            header: T.RECIPIENTS,
            cell: (row: AnnouncementResponse) =>
              row.delivery
                ? `${row.delivery.deliveredCount}/${row.delivery.audienceCount} ${T.DELIVERED}`
                : T.NOT_PUBLISHED,
          },
          {
            key: "updated",
            header: T.UPDATED,
            filterType: "date-range",
            filterAccessor: (row: AnnouncementResponse) => row.updatedAt,
            filterPlaceholder: T.DATE_RANGE,
            cell: (row: AnnouncementResponse) => new Date(row.updatedAt).toLocaleString(),
          },
        ]}
        rows={rows}
        getRowKey={(row) => row.publicId}
        isLoading={announcements.isLoading}
        emptyTitle={T.EMPTY_TITLE}
        emptyDescription={T.EMPTY_DESCRIPTION}
        toolbarActions={<Button onClick={() => setComposer(null)}>{T.NEW}</Button>}
        rowActions={(row) => (
          <ActionMenu
            items={[
              {
                label: T.VIEW,
                icon: EyeIcon,
                onSelect: () => router.push(`/admin/announcements/${row.publicId}`),
              },
              ...(!row.published
                ? [
                    { label: T.EDIT, icon: PencilIcon, onSelect: () => setComposer(row) },
                    {
                      label: T.PUBLISH_NOW,
                      icon: CheckCircleIcon,
                      onSelect: () => setConfirmation({ kind: "publish", announcement: row }),
                    },
                    {
                      label: T.DELETE_DRAFT,
                      icon: TrashIcon,
                      onSelect: () => setConfirmation({ kind: "delete", announcement: row }),
                    },
                  ]
                : [
                    {
                      label: T.RETRY_DELIVERY,
                      icon: CheckCircleIcon,
                      onSelect: () =>
                        void retry
                          .mutateAsync(row.publicId)
                          .then(() => showToast(T.RETRY_QUEUED))
                          .catch((error: unknown) =>
                            showToast(getUserFacingApiErrorMessage(error), { tone: "error" }),
                          ),
                    },
                  ]),
            ]}
          />
        )}
        rowActionsHeader=""
        clientSidePagination={false}
        pagination={
          announcements.data ? (
            <PaginationControls
              meta={announcements.data.meta}
              onPageChange={setPage}
              disabled={announcements.isFetching}
            />
          ) : undefined
        }
      />
      <AnnouncementFormModal
        key={composer?.publicId ?? (composer === null ? "new" : "closed")}
        open={composer !== undefined}
        announcement={composer ?? null}
        isSaving={create.isPending || update.isPending}
        onClose={() => setComposer(undefined)}
        onSubmit={save}
      />
      {confirmation && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-slate-900">
              {confirmation.kind === "publish" ? T.PUBLISH_CONFIRM : T.DELETE_CONFIRM}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {confirmation.kind === "publish" ? T.PUBLISH_DESCRIPTION : T.DELETE_DESCRIPTION}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmation(null)}>
                {T.CANCEL}
              </Button>
              <Button
                variant={confirmation.kind === "delete" ? "danger" : "primary"}
                isLoading={publish.isPending || remove.isPending}
                onClick={() => void confirmAction()}
              >
                {confirmation.kind === "publish" ? T.PUBLISH : T.DELETE}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
