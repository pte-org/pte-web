"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { ActionMenu, Alert, DataTable, EyeIcon, PaginationControls } from "@pte/ui";
import { DEFAULT_PAGE_SIZE, type OrderResponse } from "@pte/api-client";
import { useOrdersPage } from "../api";
import { BILLING_TEXT as T } from "../constants";
import { BILLING_STATUS_FILTER_OPTIONS } from "../statusConstants";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";

const formatDate = (value: string): string => new Date(value).toLocaleString();

export const OrdersView = (): ReactElement => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const { data, isLoading, isError } = useOrdersPage(page, size);
  const orders = data?.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      {isError && <Alert tone="error">{T.ORDERS_LOAD_ERROR}</Alert>}
      <BillingPanel title={T.ORDERS_PANEL_TITLE} subtitle={T.ORDERS_PANEL_SUBTITLE}>
        <DataTable
          columns={[
            {
              key: "id",
              header: T.ORDER_COLUMN,
              cell: (row: OrderResponse) => (
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {row.orderCode}
                </span>
              ),
            },
            {
              key: "plan",
              header: T.PLAN_ID_COLUMN,
              cell: (row: OrderResponse) => <span className="font-mono text-xs">{row.planId}</span>,
            },
            {
              key: "amount",
              header: T.AMOUNT_COLUMN,
              cell: (row: OrderResponse) => (
                <span className="font-semibold">
                  {Number(row.amount).toLocaleString()} {row.currency}
                </span>
              ),
            },
            {
              key: "date",
              header: T.DATE_COLUMN,
              filterType: "date-range",
              filterAccessor: (row: OrderResponse) => row.createdAt,
              filterPlaceholder: "Date range",
              cell: (row: OrderResponse) => formatDate(row.createdAt),
            },
            {
              key: "status",
              header: T.STATUS_COLUMN,
              filterOptions: BILLING_STATUS_FILTER_OPTIONS,
              filterAccessor: (row: OrderResponse) => row.status,
              cell: (row: OrderResponse) => <BillingStatusBadge status={row.status} />,
            },
          ]}
          rows={orders}
          getRowKey={(row) => row.publicId}
          rowActions={(row) => (
            <ActionMenu
              items={[
                {
                  label: T.VIEW_DETAILS,
                  icon: EyeIcon,
                  onSelect: () =>
                    router.push(`/host/payment-status?orderId=${encodeURIComponent(row.publicId)}`),
                },
              ]}
            />
          )}
          rowActionsHeader=""
          isLoading={isLoading}
          emptyTitle={T.NO_ORDERS}
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
                totalItemsLabel={T.TOTAL_ORDERS(data.meta.totalElements)}
              />
            ) : undefined
          }
        />
      </BillingPanel>
    </div>
  );
};
