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
  type DataTableColumn,
} from "@pte/ui";
import {
  ADMIN_TICKET_TABLE_HEADERS as H,
  ADMIN_SUPPORT_TICKETS_TEXT as T,
} from "../constants";
import { useAdminSupportTickets } from "../api";
import type { SupportTicket, TicketCategory, TicketStatus } from "../types";
import { AdminTicketFilters } from "./_AdminTicketFilters";
import { TicketCategoryBadge } from "./_TicketCategoryBadge";
import { TicketStatusBadge } from "./_TicketStatusBadge";

export const AdminSupportTicketsView = (): ReactElement => {
  const router = useRouter();

  const [status, setStatus] = useState<TicketStatus | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [tenantId, setTenantId] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isError } = useAdminSupportTickets(
    status || undefined,
    category || undefined,
    tenantId || undefined,
    page,
    size,
  );

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
          onClick={() => router.push(`/admin/support-tickets/${t.publicId}`)}
          className="text-sm font-medium text-action hover:underline"
        >
          {H.VIEW_ACTION}
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={T.TITLE} />

      <AdminTicketFilters
        status={status}
        category={category}
        tenantId={tenantId}
        onStatusChange={(v) => { setStatus(v); setPage(0); }}
        onCategoryChange={(v) => { setCategory(v); setPage(0); }}
        onTenantIdChange={(v) => { setTenantId(v); setPage(0); }}
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
    </div>
  );
};
