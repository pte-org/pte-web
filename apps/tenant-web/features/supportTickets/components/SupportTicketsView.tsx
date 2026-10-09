"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PAGE_SIZE } from "@pte/api-client";
import {
  ActionMenu,
  Alert,
  BanIcon,
  Button,
  ConfirmDialog,
  DataTable,
  EyeIcon,
  PaginationControls,
  useLocale,
  useToast,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  SUPPORT_TICKET_TABLE_HEADERS as H,
  SUPPORT_TICKETS_TEXT as T,
  TICKET_ACTIONS_TEXT as A,
  CREATE_TICKET_TEXT,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "../constants";
import { useCloseTicket, useSupportTickets, useSubmitTicket } from "../api";
import type { CreateTicketInput, SupportTicket } from "../types";
import { TicketCategoryBadge } from "./_TicketCategoryBadge";
import { TicketStatusBadge } from "./_TicketStatusBadge";
import { CreateTicketModal } from "./CreateTicketModal";

export const SupportTicketsView = (): ReactElement => {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const text = {
    category: t("tenant.support.category", H.CATEGORY),
    status: t("tenant.support.status", H.STATUS),
    description: t("tenant.support.description", H.DESCRIPTION),
    submitted: t("tenant.support.submitted", H.SUBMITTED),
    actions: t("tenant.support.actions", H.ACTIONS),
    allCategories: t("tenant.support.allCategories", T.FILTER_ALL_CATEGORY),
    allStatuses: t("tenant.support.allStatuses", T.FILTER_ALL_STATUS),
    dateRange: t("tenant.support.dateRange", "Date range"),
    empty: t("tenant.support.empty", T.EMPTY_TITLE),
    emptyDescription: t("tenant.support.emptyDescription", T.EMPTY_TEXT),
    newTicket: t("tenant.support.new", T.CREATE_BUTTON),
    ticketActions: t("tenant.support.ticketActions", A.ACTIONS),
    viewDetail: t("tenant.support.viewDetail", A.VIEW_DETAIL),
    close: t("tenant.support.close", A.CLOSE),
    closeConfirmTitle: t("tenant.support.closeConfirmTitle", A.CONFIRM_CLOSE_TITLE),
    closeConfirmDescription: t(
      "tenant.support.closeConfirmDescription",
      A.CONFIRM_CLOSE_DESCRIPTION,
    ),
    cancel: t("tenant.support.cancel", A.CANCEL),
    closeSuccess: t("tenant.support.closeSuccess", A.CLOSE_SUCCESS_TOAST),
    loadFailed: t("tenant.support.loadFailed", "Failed to load support tickets."),
  };
  const categoryLabels = {
    BUG: t("tenant.support.category.bug", CATEGORY_LABELS.BUG),
    CONTENT_COMPLAINT: t(
      "tenant.support.category.contentComplaint",
      CATEGORY_LABELS.CONTENT_COMPLAINT,
    ),
    GENERAL_FEEDBACK: t(
      "tenant.support.category.generalFeedback",
      CATEGORY_LABELS.GENERAL_FEEDBACK,
    ),
  };
  const statusLabels = {
    OPEN: t("tenant.support.status.open", STATUS_LABELS.OPEN),
    IN_PROGRESS: t("tenant.support.status.inProgress", STATUS_LABELS.IN_PROGRESS),
    RESOLVED: t("tenant.support.status.resolved", STATUS_LABELS.RESOLVED),
    CLOSED: t("tenant.support.status.closed", STATUS_LABELS.CLOSED),
  };

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [createOpen, setCreateOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState<SupportTicket | null>(null);

  const { data, isLoading, isError } = useSupportTickets(undefined, undefined, page, size);
  const submit = useSubmitTicket();
  const close = useCloseTicket();

  const handleCreate = (input: CreateTicketInput): void => {
    submit.mutate(input, {
      onSuccess: () => {
        setCreateOpen(false);
        submit.reset();
        showToast(t("tenant.support.createSuccess", CREATE_TICKET_TEXT.SUCCESS_TOAST), {
          tone: "success",
        });
      },
    });
  };

  const handleClose = (): void => {
    if (!closeTarget) return;
    close.mutate(closeTarget.publicId, {
      onSuccess: () => showToast(text.closeSuccess, { tone: "success" }),
      onError: (err) =>
        showToast(errorMessage(err) ?? t("tenant.support.closeFailed", A.CLOSE_FAILED), {
          tone: "error",
        }),
      onSettled: () => setCloseTarget(null),
    });
  };

  const columns: DataTableColumn<SupportTicket>[] = [
    {
      key: "category",
      header: text.category,
      filterOptions: [
        { value: "", label: text.allCategories },
        ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
      ],
      filterAccessor: (t) => t.category,
      cell: (t) => <TicketCategoryBadge category={t.category} />,
    },
    {
      key: "status",
      header: text.status,
      filterOptions: [
        { value: "", label: text.allStatuses },
        ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
      ],
      filterAccessor: (t) => t.status,
      cell: (t) => <TicketStatusBadge status={t.status} />,
    },
    {
      key: "description",
      header: text.description,
      filterAccessor: (t) => t.description,
      cell: (t) => (
        <span className="text-gray-700">
          {t.description.length > 80 ? `${t.description.slice(0, 80)}…` : t.description}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: text.submitted,
      filterType: "date-range",
      filterAccessor: (t) => t.createdAt,
      filterPlaceholder: text.dateRange,
      cell: (ticket) =>
        new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB").format(
          new Date(ticket.createdAt),
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {isError && <Alert tone="error">{text.loadFailed}</Alert>}

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        getRowKey={(t) => t.publicId}
        isLoading={isLoading}
        emptyTitle={text.empty}
        emptyDescription={text.emptyDescription}
        rowActionsHeader={text.actions}
        clientSidePagination={false}
        toolbarActions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            + {text.newTicket}
          </Button>
        }
        rowActions={(t) => (
          <ActionMenu
            label={text.ticketActions}
            items={[
              {
                label: text.viewDetail,
                icon: EyeIcon,
                onSelect: () => router.push(`/host/support-tickets/${t.publicId}`),
              },
              {
                label: text.close,
                icon: BanIcon,
                danger: true,
                // Only an OPEN ticket can be withdrawn; once an admin picks it up it stays.
                disabled: t.status !== "OPEN" || close.isPending,
                onSelect: () => setCloseTarget(t),
              },
            ]}
          />
        )}
        pagination={
          data ? (
            <PaginationControls
              meta={data.meta}
              onPageChange={setPage}
              disabled={isLoading}
              showPageSizeInput
              onPageSizeChange={(nextSize) => {
                setSize(nextSize);
                setPage(0);
              }}
              totalItemsLabel={T.TOTAL_ITEMS(data.meta.totalElements)}
            />
          ) : undefined
        }
      />

      <CreateTicketModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          submit.reset();
        }}
        onSubmit={handleCreate}
        error={submit.error?.message}
        isSubmitting={submit.isPending}
      />

      <ConfirmDialog
        open={closeTarget !== null}
        title={text.closeConfirmTitle}
        description={text.closeConfirmDescription}
        confirmLabel={text.close}
        cancelLabel={text.cancel}
        tone="danger"
        isConfirming={close.isPending}
        onConfirm={handleClose}
        onClose={() => setCloseTarget(null)}
      />
    </div>
  );
};
