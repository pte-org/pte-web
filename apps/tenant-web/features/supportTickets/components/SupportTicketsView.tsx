"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PAGE_SIZE } from "@pte/api-client";
import {
  Alert,
  DataTable,
  LoadingState,
  PageHeader,
  PaginationControls,
  useToast,
  type DataTableColumn,
} from "@pte/ui";
import {
  SUPPORT_TICKET_TABLE_HEADERS as H,
  SUPPORT_TICKETS_TEXT as T,
  CREATE_TICKET_TEXT,
} from "../constants";
import { useSupportTickets, useSubmitTicket } from "../api";
import type { CreateTicketInput, SupportTicket, TicketCategory, TicketStatus } from "../types";
import { TicketCategoryBadge } from "./_TicketCategoryBadge";
import { TicketFilters } from "./_TicketFilters";
import { TicketStatusBadge } from "./_TicketStatusBadge";
import { CreateTicketModal } from "./CreateTicketModal";

export const SupportTicketsView = (): ReactElement => {
  const router = useRouter();
  const { showToast } = useToast();

  const [status, setStatus] = useState<TicketStatus | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError } = useSupportTickets(
    status || undefined,
    category || undefined,
    page,
    size,
  );
  const submit = useSubmitTicket();

  const handleCreate = (input: CreateTicketInput): void => {
    submit.mutate(input, {
      onSuccess: () => {
        setCreateOpen(false);
        submit.reset();
        showToast(CREATE_TICKET_TEXT.SUCCESS_TOAST, { tone: "success" });
      },
    });
  };

  const columns: DataTableColumn<SupportTicket>[] = [
    {
      key: "category",
      header: H.CATEGORY,
      cell: (t) => <TicketCategoryBadge category={t.category} />,
    },
    {
      key: "status",
      header: H.STATUS,
      cell: (t) => <TicketStatusBadge status={t.status} />,
    },
    {
      key: "description",
      header: H.DESCRIPTION,
      cell: (t) => (
        <span className="text-gray-700">
          {t.description.length > 80 ? `${t.description.slice(0, 80)}…` : t.description}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: H.SUBMITTED,
      cell: (t) => new Date(t.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: H.ACTIONS,
      cell: (t) => (
        <button
          type="button"
          onClick={() => router.push(`/host/support-tickets/${t.publicId}`)}
          className="text-sm font-medium text-action hover:underline"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={T.TITLE}
        subtitle={T.SUBTITLE}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-action px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-action/25 hover:bg-action-hover"
          >
            + {T.CREATE_BUTTON}
          </button>
        }
      />

      <TicketFilters
        status={status}
        category={category}
        onStatusChange={(v) => { setStatus(v); setPage(0); }}
        onCategoryChange={(v) => { setCategory(v); setPage(0); }}
      />

      {isError && <Alert tone="error">Failed to load support tickets.</Alert>}

      {isLoading ? (
        <LoadingState rows={5} />
      ) : (
        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          getRowKey={(t) => t.publicId}
          emptyTitle={T.EMPTY_TITLE}
          emptyDescription={T.EMPTY_TEXT}
        />
      )}

      {data && (
        <PaginationControls
          meta={data.meta}
          onPageChange={setPage}
          disabled={isLoading}
          showPageSizeInput
          onPageSizeChange={(nextSize) => { setSize(nextSize); setPage(0); }}
          totalItemsLabel={T.TOTAL_ITEMS(data.meta.totalElements)}
        />
      )}

      <CreateTicketModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); submit.reset(); }}
        onSubmit={handleCreate}
        error={submit.error?.message}
        isSubmitting={submit.isPending}
      />
    </div>
  );
};
