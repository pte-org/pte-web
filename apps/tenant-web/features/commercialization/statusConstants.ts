export const BILLING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  ACTIVE: "Active",
  EXPIRING: "Expiring soon",
};

export const BILLING_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.entries(BILLING_STATUS_LABELS).map(([value, label]) => ({ value, label })),
] as const;
