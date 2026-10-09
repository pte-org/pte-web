"use client";

import { type ReactElement } from "react";
import type { QuotaTransactionResponse } from "@pte/api-client";
import { DataTable, Modal } from "@pte/ui";
import {
  QUOTA_ACTION_TYPE_LABELS,
  QUOTA_HISTORY_TABLE_HEADERS,
  QUOTA_HISTORY_TEXT,
} from "../constants";
import { useQuotaHistory } from "../api";

interface QuotaHistoryModalProps {
  tenantPublicId: string | null;
  tenantName?: string;
  onClose: () => void;
}

const T = QUOTA_HISTORY_TEXT;
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
            label: QUOTA_HISTORY_TABLE_HEADERS.DATE,
            header: QUOTA_HISTORY_TABLE_HEADERS.DATE,
            filterAccessor: (transaction: QuotaTransactionResponse) => transaction.createdAt,
            cell: (transaction: QuotaTransactionResponse) => formatDate(transaction.createdAt),
          },
          {
            key: "action",
            label: QUOTA_HISTORY_TABLE_HEADERS.ACTION,
            header: QUOTA_HISTORY_TABLE_HEADERS.ACTION,
            filterOptions: [
              { value: "", label: "All actions" },
              ...Object.entries(QUOTA_ACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
            ],
            filterAccessor: (transaction: QuotaTransactionResponse) => transaction.actionType,
            cell: (transaction: QuotaTransactionResponse) =>
              QUOTA_ACTION_TYPE_LABELS[transaction.actionType],
          },
          {
            key: "package",
            label: QUOTA_HISTORY_TABLE_HEADERS.PACKAGE,
            header: QUOTA_HISTORY_TABLE_HEADERS.PACKAGE,
            filterAccessor: (transaction: QuotaTransactionResponse) => transaction.packageName,
            cell: (transaction: QuotaTransactionResponse) => transaction.packageName,
          },
          {
            key: "amount",
            label: QUOTA_HISTORY_TABLE_HEADERS.AMOUNT,
            header: QUOTA_HISTORY_TABLE_HEADERS.AMOUNT,
            filterAccessor: (transaction: QuotaTransactionResponse) => transaction.amount,
            cell: (transaction: QuotaTransactionResponse) => (
              <span className="font-medium">{formatAmount(transaction.amount)}</span>
            ),
          },
          {
            key: "note",
            label: QUOTA_HISTORY_TABLE_HEADERS.NOTE,
            header: QUOTA_HISTORY_TABLE_HEADERS.NOTE,
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
