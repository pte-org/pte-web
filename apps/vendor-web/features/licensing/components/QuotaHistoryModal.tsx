"use client";

import { type ReactElement } from "react";
import type { QuotaTransactionResponse } from "@pte/api-client";
import { DataTable, Modal } from "@pte/ui";
import {
  QUOTA_ACTION_TYPE_LABELS as RAW_QUOTA_ACTION_TYPE_LABELS,
  QUOTA_HISTORY_TABLE_HEADERS as RAW_QUOTA_HISTORY_TABLE_HEADERS,
  QUOTA_HISTORY_TEXT as RAW_QUOTA_HISTORY_TEXT,
} from "../constants";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useQuotaHistory } from "../api";

interface QuotaHistoryModalProps {
  tenantPublicId: string | null;
  tenantName?: string;
  onClose: () => void;
}

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB").format(date);
};

const formatAmount = (amount: number): string => (amount >= 0 ? `+${amount}` : String(amount));

export const QuotaHistoryModal = ({
  tenantPublicId,
  tenantName,
  onClose,
}: QuotaHistoryModalProps): ReactElement => {
  const T = useAdminCopy(RAW_QUOTA_HISTORY_TEXT);
  const H = useAdminCopy(RAW_QUOTA_HISTORY_TABLE_HEADERS);
  const actionLabels = useAdminCopy(RAW_QUOTA_ACTION_TYPE_LABELS);
  const dateRangeLabel = useAdminCopy("Date range");
  const actionFilterOptions = useAdminCopy([
    { value: "", label: "All actions" },
    ...Object.entries(RAW_QUOTA_ACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ]);
  const { data: transactions, isLoading } = useQuotaHistory(tenantPublicId ?? "");

  return (
    <Modal
      open={tenantPublicId !== null}
      onClose={onClose}
      size="xl"
      title={tenantName ? `${T.TITLE} — ${tenantName}` : T.TITLE}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {T.CLOSE}
        </button>
      }
    >
      <DataTable
        columns={[
          {
            key: "date",
            label: H.DATE,
            header: H.DATE,
            filterType: "date-range",
            filterAccessor: (transaction: QuotaTransactionResponse) => transaction.createdAt,
            filterPlaceholder: dateRangeLabel,
            cell: (transaction: QuotaTransactionResponse) => formatDate(transaction.createdAt),
          },
          {
            key: "action",
            label: H.ACTION,
            header: H.ACTION,
            filterOptions: actionFilterOptions,
            filterAccessor: (transaction: QuotaTransactionResponse) => transaction.actionType,
            cell: (transaction: QuotaTransactionResponse) => actionLabels[transaction.actionType],
          },
          {
            key: "package",
            label: H.PACKAGE,
            header: H.PACKAGE,
            filterAccessor: (transaction: QuotaTransactionResponse) => transaction.packageName,
            cell: (transaction: QuotaTransactionResponse) => transaction.packageName,
          },
          {
            key: "amount",
            label: H.AMOUNT,
            header: H.AMOUNT,
            filterAccessor: (transaction: QuotaTransactionResponse) => transaction.amount,
            cell: (transaction: QuotaTransactionResponse) => (
              <span className="font-medium">{formatAmount(transaction.amount)}</span>
            ),
          },
          {
            key: "note",
            label: H.NOTE,
            header: H.NOTE,
            filterAccessor: (transaction: QuotaTransactionResponse) => transaction.note,
            cell: (transaction: QuotaTransactionResponse) => transaction.note ?? T.EMPTY_VALUE,
          },
        ]}
        rows={transactions ?? []}
        getRowKey={(transaction) => transaction.publicId}
        isLoading={isLoading}
        emptyTitle={T.EMPTY}
        tableClassName="min-w-[650px]"
      />
    </Modal>
  );
};
