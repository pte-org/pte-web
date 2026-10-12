"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PAGE_SIZE } from "@pte/api-client";
import { Alert, DataTable, PaginationControls, type DataTableColumn } from "@pte/ui";
import {
  ADMIN_TICKET_TABLE_HEADERS as RAW_ADMIN_TICKET_TABLE_HEADERS,
  ADMIN_SUPPORT_TICKETS_TEXT as RAW_ADMIN_SUPPORT_TICKETS_TEXT,
  CATEGORY_LABELS as RAW_CATEGORY_LABELS,
  STATUS_LABELS as RAW_STATUS_LABELS,
} from "../constants";
import { useAdminSupportTickets } from "../api";
import type { SupportTicket } from "../types";
import { TicketCategoryBadge } from "./_TicketCategoryBadge";
import { TicketStatusBadge } from "./_TicketStatusBadge";
import { useAdminCopy } from "@/features/i18n/adminCopy";

export const AdminSupportTicketsView = (): ReactElement => {
  const H = useAdminCopy(RAW_ADMIN_TICKET_TABLE_HEADERS);
  const T = useAdminCopy(RAW_ADMIN_SUPPORT_TICKETS_TEXT);
  const categoryLabels = useAdminCopy(RAW_CATEGORY_LABELS);
  const statusLabels = useAdminCopy(RAW_STATUS_LABELS);
  const dateRangeLabel = useAdminCopy("Date range");
  const loadError = useAdminCopy("Failed to load support tickets.");
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isError } = useAdminSupportTickets(
    undefined,
    undefined,
    undefined,
    page,
    size,
  );

  const columns: DataTableColumn<SupportTicket>[] = [
    {
      key: "category",
      header: H.CATEGORY,
      filterOptions: [
        { value: "", label: T.FILTER_ALL_CATEGORY },
        ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
      ],
      filterAccessor: (t) => t.category,
      cell: (t) => <TicketCategoryBadge category={t.category} />,
    },
    {
      key: "status",
      header: H.STATUS,
      filterOptions: [
        { value: "", label: T.FILTER_ALL_STATUS },
        ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
      ],
      filterAccessor: (t) => t.status,
      cell: (t) => <TicketStatusBadge status={t.status} />,
    },
    {
      key: "description",
      header: H.DESCRIPTION,
      filterAccessor: (t) => t.description,
      cell: (t) => (
        <span className="text-gray-700">
          {t.description.length > 80 ? `${t.description.slice(0, 80)}…` : t.description}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: H.SUBMITTED,
      filterType: "date-range",
      filterAccessor: (t) => t.createdAt,
      filterPlaceholder: dateRangeLabel,
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
      {isError && <Alert tone="error">{loadError}</Alert>}

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        getRowKey={(t) => t.publicId}
        isLoading={isLoading}
        emptyTitle={T.EMPTY_TITLE}
        emptyDescription={T.EMPTY_TEXT}
        clientSidePagination={false}
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
    </div>
  );
};
