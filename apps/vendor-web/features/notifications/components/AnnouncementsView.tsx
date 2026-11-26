"use client";

import { useState, type ReactElement } from "react";
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
  ConfirmDialog,
  DataTable,
  EyeIcon,
  PaginationControls,
  PencilIcon,
  TrashIcon,
  useToast,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useAdminSearchText } from "@/features/i18n/adminSearchCopy";
import { useDebouncedSearch } from "@/features/i18n/useDebouncedSearch";
import {
  useAnnouncementsQuery,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useRetryAnnouncementDelivery,
  useUpdateAnnouncement,
} from "../announcementsApi";
import { AnnouncementDrawer } from "./AnnouncementDrawer";
import { AnnouncementFormModal } from "./AnnouncementFormModal";
import { useAnnouncementColumns } from "./useAnnouncementColumns";

type Confirmation = { kind: "publish" | "delete"; announcement: AnnouncementResponse } | null;

export function AnnouncementsView(): ReactElement {
  const searchText = useAdminSearchText("announcements");
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
    EMPTY_TITLE: "No announcement drafts",
    EMPTY_DESCRIPTION: "Create a draft when the platform needs to communicate a global notice.",
    NEW: "New announcement",
    VIEW: "View",
    EDIT: "Edit draft",
    PUBLISH_NOW: "Publish now",
    DELETE_DRAFT: "Delete draft",
    RETRY_DELIVERY: "Retry failed deliveries",
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
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const [composer, setComposer] = useState<AnnouncementResponse | null | undefined>(undefined);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  // The announcement shown in the drawer, by id so it follows the list when the list refreshes.
  const [openedId, setOpenedId] = useState<string | null>(null);
  const announcements = useAnnouncementsQuery(page, debouncedSearch);
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
      if (kind === "delete") setOpenedId(null);
      showToast(kind === "publish" ? T.ANNOUNCEMENT_PUBLISHED : T.DRAFT_DELETED);
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict")
        setConflict(announcement.publicId);
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    }
  };

  const rows = announcements.data?.data ?? [];
  const opened = rows.find((row) => row.publicId === openedId) ?? null;
  const columns = useAnnouncementColumns((row) => setOpenedId(row.publicId));
  const retryDelivery = (row: AnnouncementResponse): void =>
    void retry
      .mutateAsync(row.publicId)
      .then(() => showToast(T.RETRY_QUEUED))
      .catch((error: unknown) => showToast(getUserFacingApiErrorMessage(error), { tone: "error" }));
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
        searchPlaceholder={searchText.placeholder}
        searchAriaLabel={searchText.ariaLabel}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        clientSideFiltering={false}
        columns={columns}
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
                onSelect: () => setOpenedId(row.publicId),
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
                : // Only worth offering when something failed to reach an organization.
                  (row.delivery?.failedCount ?? 0) > 0
                  ? [
                      {
                        label: T.RETRY_DELIVERY,
                        icon: CheckCircleIcon,
                        onSelect: () => retryDelivery(row),
                      },
                    ]
                  : []),
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
      <AnnouncementDrawer
        // The drawer sits above dialogs, so it steps aside while one is open and returns if the person cancels.
        announcement={confirmation ? null : opened}
        onClose={() => setOpenedId(null)}
        onEdit={(row) => {
          setOpenedId(null);
          setComposer(row);
        }}
        onPublish={(row) => setConfirmation({ kind: "publish", announcement: row })}
        onDelete={(row) => setConfirmation({ kind: "delete", announcement: row })}
        onRetry={retryDelivery}
        isRetrying={retry.isPending}
      />
      <ConfirmDialog
        open={confirmation !== null}
        title={confirmation?.kind === "publish" ? T.PUBLISH_CONFIRM : T.DELETE_CONFIRM}
        description={confirmation?.kind === "publish" ? T.PUBLISH_DESCRIPTION : T.DELETE_DESCRIPTION}
        confirmLabel={confirmation?.kind === "publish" ? T.PUBLISH : T.DELETE}
        cancelLabel={T.CANCEL}
        tone={confirmation?.kind === "delete" ? "danger" : "primary"}
        isConfirming={publish.isPending || remove.isPending}
        onConfirm={() => void confirmAction()}
        onClose={() => setConfirmation(null)}
      />
    </div>
  );
}
