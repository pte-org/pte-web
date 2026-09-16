"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { DataTable, PageHeader } from "@pte/ui";
import { DEMO_ORDERS } from "../data";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";

export const OrdersView = (): ReactElement => (
  <div className="flex flex-col gap-5">
    <PageHeader
      title="Order history"
      subtitle="Review payments and purchased packages."
      actions={
        <Link href="/host/billing" className="text-sm font-semibold text-action hover:underline">
          Browse plans
        </Link>
      }
    />
    <BillingPanel title="Orders" subtitle="Payment status is updated from PayOS webhook events.">
      <DataTable
        columns={[
          {
            key: "id",
            header: "Order",
            cell: (row: Order) => (
              <span className="font-mono text-xs font-semibold text-slate-900">{row.id}</span>
            ),
          },
          { key: "plan", header: "Package", cell: (row: Order) => row.plan },
          {
            key: "amount",
            header: "Amount",
            cell: (row: Order) => <span className="font-semibold">{row.amount}</span>,
          },
          { key: "date", header: "Date", cell: (row: Order) => row.date },
          {
            key: "status",
            header: "Status",
            cell: (row: Order) => <BillingStatusBadge status={row.status} />,
          },
        ]}
        rows={[...DEMO_ORDERS]}
        getRowKey={(row) => row.id}
        rowActions={() => (
          <Link
            href="/host/payment-status"
            className="text-sm font-semibold text-action hover:underline"
          >
            View
          </Link>
        )}
        rowActionsHeader=""
      />
    </BillingPanel>
  </div>
);

type Order = (typeof DEMO_ORDERS)[number];
