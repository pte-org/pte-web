"use client";

import { type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { listTenants } from "@pte/api-client";
import { Select } from "@pte/ui";
import { apiClient } from "@/lib/apiClient";
import {
  ADMIN_SUPPORT_TICKETS_TEXT as RAW_ADMIN_SUPPORT_TICKETS_TEXT,
  CATEGORY_LABELS as RAW_CATEGORY_LABELS,
  STATUS_LABELS as RAW_STATUS_LABELS,
} from "../constants";
import type { TicketCategory, TicketStatus } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface AdminTicketFiltersProps {
  status: TicketStatus | "";
  category: TicketCategory | "";
  tenantId: string;
  onStatusChange: (value: TicketStatus | "") => void;
  onCategoryChange: (value: TicketCategory | "") => void;
  onTenantIdChange: (value: string) => void;
}

export const AdminTicketFilters = ({
  status,
  category,
  tenantId,
  onStatusChange,
  onCategoryChange,
  onTenantIdChange,
}: AdminTicketFiltersProps): ReactElement => {
  const T = useAdminCopy(RAW_ADMIN_SUPPORT_TICKETS_TEXT);
  const categoryLabels = useAdminCopy(RAW_CATEGORY_LABELS);
  const statusLabels = useAdminCopy(RAW_STATUS_LABELS);
  const statusOptions = [
    { value: "", label: T.FILTER_ALL_STATUS },
    ...(Object.entries(statusLabels) as [TicketStatus, string][]).map(([value, label]) => ({
      value,
      label,
    })),
  ];
  const categoryOptions: { value: string; label: string }[] = [
    { value: "", label: T.FILTER_ALL_CATEGORY },
    ...(Object.entries(categoryLabels) as [TicketCategory, string][]).map(([value, label]) => ({
      value,
      label,
    })),
  ];
  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => listTenants(apiClient),
  });

  const tenantOptions = [
    { value: "", label: T.FILTER_ALL_TENANTS },
    ...tenants.map((t) => ({ value: t.publicId, label: t.name })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        id="ticket-status-filter"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as TicketStatus | "")}
        options={statusOptions}
      />
      <Select
        id="ticket-category-filter"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as TicketCategory | "")}
        options={categoryOptions}
      />
      <Select
        id="ticket-tenant-filter"
        value={tenantId}
        onChange={(e) => onTenantIdChange(e.target.value)}
        options={tenantOptions}
      />
    </div>
  );
};
