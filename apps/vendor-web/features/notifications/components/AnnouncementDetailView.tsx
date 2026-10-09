"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  getUserFacingApiErrorMessage,
  type AnnouncementCreateRequest,
} from "@pte/api-client";
import {
  Alert,
  Badge,
  Button,
  CheckCircleIcon,
  ConfirmDialog,
  LoadingState,
  PageHeader,
  TrashIcon,
  useToast,
} from "@pte/ui";
import {
  useAnnouncementAudiencePreview,
  useAnnouncementQuery,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useRetryAnnouncementDelivery,
  useUpdateAnnouncement,
} from "../announcementsApi";
import { AnnouncementFormModal } from "./AnnouncementFormModal";

export function AnnouncementDetailView({ publicId }: { publicId: string }): ReactElement {
  const router = useRouter();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [confirmation, setConfirmation] = useState<"publish" | "delete" | null>(null);
  const announcement = useAnnouncementQuery(publicId);
  const audience = useAnnouncementAudiencePreview(publicId);
  const update = useUpdateAnnouncement();
  const publish = usePublishAnnouncement();
  const remove = useDeleteAnnouncement();
  const retry = useRetryAnnouncementDelivery();

  if (announcement.isLoading) return <LoadingState rows={5} />;
  if (announcement.error)
    return <Alert tone="error">{getUserFacingApiErrorMessage(announcement.error)}</Alert>;
  if (!announcement.data)
    return <Alert tone="warning">This announcement is no longer available.</Alert>;
  const item = announcement.data;

  const confirmAction = (): void => {
    if (!confirmation) return;
    if (confirmation === "publish") {
      publish.mutate(
        { publicId, payload: { expectedDraftVersion: item.version } },
        {
          onSuccess: () => {
            setConfirmation(null);
            showToast("Announcement published.");
          },
          onError: (error: unknown) => {
            if (error instanceof ApiError && error.kind === "conflict") setConflict(true);
            showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
          },
        },
      );
      return;
    }
    remove.mutate(
      { publicId, payload: { expectedDraftVersion: item.version } },
      {
        onSuccess: () => {
          setConfirmation(null);
          showToast("Draft deleted.");
          router.push("/admin/announcements");
        },
        onError: (error: unknown) => {
          if (error instanceof ApiError && error.kind === "conflict") setConflict(true);
          showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
        },
      },
    );
  };

  const save = async (
    payload: AnnouncementCreateRequest,
    expectedDraftVersion?: number,
  ): Promise<void> => {
    if (expectedDraftVersion === undefined) return;
    try {
      await update.mutateAsync({
        publicId,
        payload: {
          title: payload.title,
          body: payload.body,
          category: payload.category,
          importance: payload.importance,
          affectedFrom: payload.affectedFrom,
          affectedUntil: payload.affectedUntil,
          expectedDraftVersion,
        },
      });
      setEditing(false);
      setConflict(false);
      showToast("Announcement draft saved.");
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict") setConflict(true);
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={item.title}
        subtitle={item.published ? "Published announcement" : `Draft version ${item.version}`}
      />
      {conflict && (
        <Alert tone="warning" title="Draft changed elsewhere">
          Reload the latest server version before trying again.
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setConflict(false);
              void announcement.refetch();
            }}
          >
            Reload
          </Button>
        </Alert>
      )}
      <article className="rounded-lg bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.importance === "IMPORTANT" ? "warning" : "info"}>
            {item.importance}
          </Badge>
          <Badge variant={item.published ? "success" : "warning"}>
            {item.published ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p>
        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Category</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {item.category.replaceAll("_", " ")}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Eligible tenants</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {audience.data?.eligibleTenantCount ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Delivered / audience</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {item.delivery
                ? `${item.delivery.deliveredCount} / ${item.delivery.audienceCount}`
                : "—"}
            </dd>
          </div>
        </dl>
        {!item.published && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit draft
            </Button>
            <Button
              leftIcon={<CheckCircleIcon className="h-4 w-4" />}
              onClick={() => setConfirmation("publish")}
              isLoading={publish.isPending}
            >
              Publish now
            </Button>
            <Button
              variant="danger"
              leftIcon={<TrashIcon className="h-4 w-4" />}
              onClick={() => setConfirmation("delete")}
              isLoading={remove.isPending}
            >
              Delete draft
            </Button>
          </div>
        )}
        {item.published && item.delivery && item.delivery.failedCount > 0 && (
          <div className="mt-6">
            <Button
              variant="secondary"
              onClick={() =>
                void retry
                  .mutateAsync(publicId)
                  .then(() => showToast("Delivery retry queued."))
                  .catch((error: unknown) =>
                    showToast(getUserFacingApiErrorMessage(error), { tone: "error" }),
                  )
              }
              isLoading={retry.isPending}
            >
              Retry failed delivery
            </Button>
          </div>
        )}
      </article>
      <AnnouncementFormModal
        open={editing}
        announcement={item}
        isSaving={update.isPending}
        onClose={() => setEditing(false)}
        onSubmit={save}
      />
      <ConfirmDialog
        open={confirmation !== null}
        title={confirmation === "publish" ? "Publish announcement?" : "Delete draft?"}
        description={
          confirmation === "publish"
            ? "This publishes immutable content to the eligible host audience immediately."
            : "This draft will be removed and cannot be restored."
        }
        confirmLabel={confirmation === "publish" ? "Publish" : "Delete"}
        tone={confirmation === "delete" ? "danger" : "primary"}
        isConfirming={publish.isPending || remove.isPending}
        onConfirm={confirmAction}
        onClose={() => setConfirmation(null)}
      />
    </div>
  );
}
