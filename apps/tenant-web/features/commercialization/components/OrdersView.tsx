"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionMenu, Alert, DataTable, EyeIcon, PageHeader, PaginationControls } from "@pte/ui";
import { DEFAULT_PAGE_SIZE, type OrderResponse } from "@pte/api-client";
import { useOrdersPage } from "../api";
import { BILLING_TEXT as T } from "../constants";
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
      <PageHeader
        title={T.ORDERS_TITLE}
        subtitle={T.ORDERS_SUBTITLE}
        actions={
          <Link href="/host/billing" className="text-sm font-semibold text-action hover:underline">
            {T.BROWSE_PLANS_ACTION}
          </Link>
        }
      />
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
              cell: (row: OrderResponse) => formatDate(row.createdAt),
            },
            {
              key: "status",
              header: T.STATUS_COLUMN,
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
          emptyTitle={isLoading ? T.LOADING_ORDERS : T.NO_ORDERS}
        />
        {data && (
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
        )}
      </BillingPanel>
    </div>
  );
};
