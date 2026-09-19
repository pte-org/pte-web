"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, DataTable, PageHeader, PaginationControls } from "@pte/ui";
import { type OrderResponse } from "@pte/api-client";
import { useOrdersPage } from "../api";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";

const formatDate = (value: string): string => new Date(value).toLocaleString();

export const OrdersView = (): ReactElement => {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useOrdersPage(page, 20);
  const orders = data?.data ?? [];
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Order history" subtitle="Review payments and purchased packages." actions={<Link href="/host/billing" className="text-sm font-semibold text-action hover:underline">Browse plans</Link>} />
      {isError && <Alert tone="error">Orders could not be loaded. Try again shortly.</Alert>}
      <BillingPanel title="Orders" subtitle="Payment status is updated from PayOS webhook events.">
        <DataTable
          columns={[
            { key: "id", header: "Order", cell: (row: OrderResponse) => <span className="font-mono text-xs font-semibold text-slate-900">{row.orderCode}</span> },
            { key: "plan", header: "Plan ID", cell: (row: OrderResponse) => <span className="font-mono text-xs">{row.planId}</span> },
            { key: "amount", header: "Amount", cell: (row: OrderResponse) => <span className="font-semibold">{Number(row.amount).toLocaleString()} {row.currency}</span> },
            { key: "date", header: "Date", cell: (row: OrderResponse) => formatDate(row.createdAt) },
            { key: "status", header: "Status", cell: (row: OrderResponse) => <BillingStatusBadge status={row.status} /> },
          ]}
          rows={orders}
          getRowKey={(row) => row.publicId}
          rowActions={(row) => <Link href={`/host/payment-status?orderId=${encodeURIComponent(row.publicId)}`} className="text-sm font-semibold text-action hover:underline">View</Link>}
          rowActionsHeader=""
          emptyTitle={isLoading ? "Loading orders..." : "No orders found"}
        />
        {data && (
          <PaginationControls
            meta={data.meta}
            onPageChange={setPage}
            disabled={isLoading}
            totalItemsLabel={`Showing ${data.meta.totalElements} order(s)`}
          />
        )}
      </BillingPanel>
    </div>
  );
};
