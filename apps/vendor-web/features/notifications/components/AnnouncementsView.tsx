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
  PageHeader,
  PaginationControls,
  PencilIcon,
  TrashIcon,
  useToast,
} from "@pte/ui";
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
      showToast("Announcement draft saved.");
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
      showToast(kind === "publish" ? "Announcement published." : "Draft deleted.");
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict")
        setConflict(announcement.publicId);
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    }
  };

  const rows = announcements.data?.data ?? [];
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Announcements"
        actions={<Button onClick={() => setComposer(null)}>New announcement</Button>}
      />
      {announcements.error && (
        <Alert tone="error">{getUserFacingApiErrorMessage(announcements.error)}</Alert>
      )}
      {conflict && (
        <Alert tone="warning" title="Draft changed elsewhere">
          Reload the latest draft before editing or publishing it.
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setConflict(null);
              void announcements.refetch();
            }}
          >
            Reload list
          </Button>
        </Alert>
      )}
      <DataTable
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (row: AnnouncementResponse) => (
              <div>
                <p className="font-medium text-slate-900">{row.title}</p>
                <p className="mt-1 text-xs text-slate-500">{row.category.replaceAll("_", " ")}</p>
              </div>
            ),
          },
          {
            key: "importance",
            header: "Importance",
            cell: (row: AnnouncementResponse) => row.importance,
          },
          {
            key: "status",
            header: "Status",
            cell: (row: AnnouncementResponse) =>
              row.published ? (
                <span className="text-green-700">Published</span>
              ) : (
                <span className="text-amber-700">Draft</span>
              ),
          },
          {
            key: "audience",
            header: "Recipients",
            cell: (row: AnnouncementResponse) =>
              row.delivery
                ? `${row.delivery.deliveredCount}/${row.delivery.audienceCount} delivered`
                : "Not published",
          },
          {
            key: "updated",
            header: "Updated",
            cell: (row: AnnouncementResponse) => new Date(row.updatedAt).toLocaleString(),
          },
        ]}
        rows={rows}
        getRowKey={(row) => row.publicId}
        isLoading={announcements.isLoading}
        emptyTitle="No announcement drafts"
        emptyDescription="Create a draft when the platform needs to communicate a global notice."
        rowActions={(row) => (
          <ActionMenu
            items={[
              {
                label: "View",
                icon: EyeIcon,
                onSelect: () => router.push(`/admin/announcements/${row.publicId}`),
              },
              ...(!row.published
                ? [
                    { label: "Edit draft", icon: PencilIcon, onSelect: () => setComposer(row) },
                    {
                      label: "Publish now",
                      icon: CheckCircleIcon,
                      onSelect: () => setConfirmation({ kind: "publish", announcement: row }),
                    },
                    {
                      label: "Delete draft",
                      icon: TrashIcon,
                      onSelect: () => setConfirmation({ kind: "delete", announcement: row }),
                    },
                  ]
                : [
                    {
                      label: "Retry failed delivery",
                      icon: CheckCircleIcon,
                      onSelect: () =>
                        void retry
                          .mutateAsync(row.publicId)
                          .then(() => showToast("Delivery retry queued."))
                          .catch((error: unknown) =>
                            showToast(getUserFacingApiErrorMessage(error), { tone: "error" }),
                          ),
                    },
                  ]),
            ]}
          />
        )}
        rowActionsHeader=""
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
              {confirmation.kind === "publish" ? "Publish announcement?" : "Delete draft?"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {confirmation.kind === "publish"
                ? "This publishes immutable content to the eligible host audience immediately."
                : "This draft will be removed and cannot be restored."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmation(null)}>
                Cancel
              </Button>
              <Button
                variant={confirmation.kind === "delete" ? "danger" : "primary"}
                isLoading={publish.isPending || remove.isPending}
                onClick={() => void confirmAction()}
              >
                {confirmation.kind === "publish" ? "Publish" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
