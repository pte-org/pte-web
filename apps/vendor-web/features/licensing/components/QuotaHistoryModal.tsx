"use client";

import { useState, type ReactElement } from "react";
import type { QuotaTransactionResponse } from "@aptis/api-client";
import { Modal } from "@aptis/ui";
import {
  QUOTA_ACTION_TYPE_FILTER_OPTIONS,
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
const HEADER_CLASS =
  "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-4 py-3 text-sm text-gray-700 align-middle";

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
  const [actionFilter, setActionFilter] = useState("all");
  const { data: transactions } = useQuotaHistory(tenantPublicId ?? "");

  const visible = (transactions ?? []).filter(
    (transaction) => actionFilter === "all" || transaction.actionType === actionFilter,
  );

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
      <div className="mb-3 flex justify-end">
        <select
          aria-label={QUOTA_ACTION_TYPE_FILTER_OPTIONS[0].label}
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500"
        >
          {QUOTA_ACTION_TYPE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {visible.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className={HEADER_CLASS}>{QUOTA_HISTORY_TABLE_HEADERS.DATE}</th>
                <th className={HEADER_CLASS}>{QUOTA_HISTORY_TABLE_HEADERS.ACTION}</th>
                <th className={HEADER_CLASS}>{QUOTA_HISTORY_TABLE_HEADERS.PACKAGE}</th>
                <th className={HEADER_CLASS}>{QUOTA_HISTORY_TABLE_HEADERS.AMOUNT}</th>
                <th className={HEADER_CLASS}>{QUOTA_HISTORY_TABLE_HEADERS.NOTE}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((transaction: QuotaTransactionResponse) => (
                <tr key={transaction.publicId} className="border-t border-gray-100">
                  <td className={`${CELL_CLASS} text-gray-500`}>{formatDate(transaction.createdAt)}</td>
                  <td className={CELL_CLASS}>{QUOTA_ACTION_TYPE_LABELS[transaction.actionType]}</td>
                  <td className={CELL_CLASS}>{transaction.packageName}</td>
                  <td className={`${CELL_CLASS} font-medium text-gray-900`}>
                    {formatAmount(transaction.amount)}
                  </td>
                  <td className={`${CELL_CLASS} text-gray-500`}>{transaction.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-500">{T.EMPTY}</p>
      )}
    </Modal>
  );
};
