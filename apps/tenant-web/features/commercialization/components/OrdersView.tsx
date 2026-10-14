"use client";

import { useMemo, useState, type ReactElement } from "react";
import {
  Alert,
  DataTable,
  PaginationControls,
  useLocale,
  type DateRangeValue,
  type Locale,
} from "@pte/ui";
import {
  DEFAULT_PAGE_SIZE,
  type OrderListFilters,
  type OrderResponse,
  type OrderStatus,
} from "@pte/api-client";
import { useOrdersPage, useTenantPlansQuery } from "../api";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import { useDebouncedSearch } from "@/features/search/useDebouncedSearch";
import { BILLING_TEXT as T } from "../constants";
import { BILLING_STATUS_LABELS } from "../statusConstants";
import { BillingPanel } from "./BillingPanel";
import { BillingStatusBadge } from "./BillingStatusBadge";
import { OrdersFilters } from "./OrdersFilters";

const formatDate = (value: string | null, locale: Locale, emptyValue: string): string => {
  if (!value) return emptyValue;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatAmount = (value: string, locale: Locale): string => {
  const amount = Number(value);
  return Number.isNaN(amount) ? value : amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US");
};

export const OrdersView = (): ReactElement => {
  const { locale, t } = useLocale();
  const searchText = useTenantSearchText("orders");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const debouncedSearch = useDebouncedSearch(search);
  const orderFilters = useMemo<OrderListFilters>(
    () => ({
      status: statusFilter || undefined,
      createdFrom: dateRange.from || undefined,
      createdTo: dateRange.to || undefined,
    }),
    [dateRange.from, dateRange.to, statusFilter],
  );
  const { data, isLoading, isError } = useOrdersPage(page, size, debouncedSearch, orderFilters);
  const { data: plans = [] } = useTenantPlansQuery();
  const planNames = useMemo(
    () => new Map(plans.map((plan) => [plan.publicId, plan.name])),
    [plans],
  );
  const orders = data?.data ?? [];
  const emptyValue = t("common.emptyValue", T.EMPTY_VALUE);
  const statusLabel = (status: string): string =>
    t(`tenant.billing.status.${status.toLowerCase()}`, BILLING_STATUS_LABELS[status] ?? status);
  const text = {
    loadError: t("tenant.billing.ordersLoadError", T.ORDERS_LOAD_ERROR),
    panelTitle: t("tenant.billing.transactionHistoryTitle", T.ORDERS_PANEL_TITLE),
    panelSubtitle: t("tenant.billing.transactionHistorySubtitle", T.TRANSACTION_HISTORY_SUBTITLE),
    orderColumn: t("tenant.billing.orderColumn", T.ORDER_COLUMN),
    planColumn: t("tenant.billing.planColumn", T.PLAN_COLUMN),
    amountColumn: t("tenant.billing.amountColumn", T.AMOUNT_COLUMN),
    dateColumn: t("tenant.billing.dateColumn", T.DATE_COLUMN),
    paidAtColumn: t("tenant.billing.paidAtColumn", T.PAID_AT_COLUMN),
    statusColumn: t("tenant.billing.statusColumn", T.STATUS_COLUMN),
    dateRange: t("tenant.billing.dateRange", T.DATE_RANGE),
    allStatuses: t("tenant.billing.allStatuses", T.ALL_STATUSES),
    noOrders: t("tenant.billing.noOrders", T.NO_ORDERS),
    totalOrders: (count: number): string =>
      t("tenant.billing.totalOrders", T.TOTAL_ORDERS(count), { count }),
  };
  return (
    <div className="flex flex-col gap-5">
      {isError && <Alert tone="error">{text.loadError}</Alert>}
      <BillingPanel title={text.panelTitle} subtitle={text.panelSubtitle}>
        <DataTable
          columns={[
            {
              key: "id",
              header: text.orderColumn,
              cell: (row: OrderResponse) => (
                <span className="font-mono text-xs font-semibold text-[var(--ink-primary)]">
                  {row.orderCode}
                </span>
              ),
            },
            {
              key: "plan",
              header: text.planColumn,
              cell: (row: OrderResponse) => (
                <span className="font-semibold text-[var(--ink-primary)]">
                  {planNames.get(row.planId) ?? T.EXAM_PACKAGES}
                </span>
              ),
            },
            {
              key: "amount",
              header: text.amountColumn,
              cell: (row: OrderResponse) => (
                <span className="font-semibold">
                  {formatAmount(row.amount, locale)} {row.currency}
                </span>
              ),
            },
            {
              key: "date",
              header: text.dateColumn,
              filterable: false,
              cell: (row: OrderResponse) => formatDate(row.createdAt, locale, emptyValue),
            },
            {
              key: "paidAt",
              header: text.paidAtColumn,
              filterable: false,
              cell: (row: OrderResponse) => formatDate(row.paidAt, locale, emptyValue),
            },
            {
              key: "status",
              header: text.statusColumn,
              filterable: false,
              cell: (row: OrderResponse) => (
                <BillingStatusBadge status={row.status} label={statusLabel(row.status)} />
              ),
            },
          ]}
          rows={orders}
          getRowKey={(row) => row.publicId}
          isLoading={isLoading}
          emptyTitle={text.noOrders}
          searchPlaceholder={searchText.placeholder}
          searchAriaLabel={searchText.ariaLabel}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          filters={
            <OrdersFilters
              dateRange={dateRange}
              status={statusFilter}
              dateRangeLabel={text.dateRange}
              statusFilterLabel={text.statusColumn}
              statusLabel={statusLabel}
              allStatusesLabel={text.allStatuses}
              onDateRangeChange={(value) => {
                setDateRange(value);
                setPage(0);
              }}
              onStatusChange={(value) => {
                setStatusFilter(value);
                setPage(0);
              }}
            />
          }
          clientSideFiltering={false}
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
                totalItemsLabel={text.totalOrders(data.meta.totalElements)}
              />
            ) : undefined
          }
        />
      </BillingPanel>
    </div>
  );
};
