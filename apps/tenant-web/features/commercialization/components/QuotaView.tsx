"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Alert, DataTable, PageHeader, ProgressBar, StatCard, UsersIcon } from "@pte/ui";
import { BillingPanel } from "./BillingPanel";

export const QuotaView = (): ReactElement => (
  <div className="flex flex-col gap-5">
    <PageHeader
      title="Student capacity"
      subtitle="Check capacity before importing a roster."
      actions={
        <Link href="/host/billing" className="text-sm font-semibold text-action hover:underline">
          Add capacity
        </Link>
      }
    />
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Students in tenant"
        value="86"
        footnote="of 600 total capacity"
        icon={<UsersIcon />}
        progress={14}
        accent="blue"
      />
      <StatCard label="Free capacity" value="14" footnote="students remaining" accent="mint" />
      <StatCard label="Exam cap" value="2,000" footnote="from Exam Growth" accent="sky" />
    </div>
    <BillingPanel title="Current capacity" subtitle="Free limit plus permanent capacity add-ons.">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900">86 of 600 students</span>
        <span className="text-slate-500">14% used</span>
      </div>
      <ProgressBar value={14} max={100} className="mt-3" label="Student capacity used" />
      <Alert className="mt-5" tone="info">
        Roster imports are checked before new students are added.
      </Alert>
    </BillingPanel>
    <BillingPanel title="Import preview" subtitle="Example result for a roster with 18 rows.">
      <DataTable
        columns={[
          { key: "current", header: "Current", cell: () => "86" },
          { key: "adding", header: "Adding", cell: () => "18" },
          { key: "remaining", header: "Remaining", cell: () => "14" },
          {
            key: "allowed",
            header: "Result",
            cell: () => (
              <span className="font-semibold text-emerald-700">Allowed with warning</span>
            ),
          },
        ]}
        rows={[{ id: "preview" }]}
        getRowKey={(row) => row.id}
      />
    </BillingPanel>
  </div>
);
