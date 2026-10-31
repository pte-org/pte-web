"use client";

import type { ReactElement } from "react";
import type { OrganizationResponse } from "@pte/api-client";
import { Button, DataTable } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { GRANT_TEXT, MIN_TENANT_SEARCH_LENGTH } from "../constants";
import type { GrantLicenseFlow } from "../types";

interface GrantTenantSearchStepProps {
  flow: GrantLicenseFlow;
}

/** Step 1: look the organization up by code, tax code or contact email and pick exactly one. */
export const GrantTenantSearchStep = ({ flow }: GrantTenantSearchStepProps): ReactElement => {
  const T = useAdminCopy(GRANT_TEXT);
  const tooShort = flow.search.trim().length < MIN_TENANT_SEARCH_LENGTH;
  const rows = tooShort ? [] : flow.tenantSearch.data ?? [];
  const emptyTitle = tooShort
    ? T.SEARCH_HINT
    : flow.tenantSearch.isFetching
      ? T.SEARCHING
      : T.SEARCH_EMPTY;

  return (
    <DataTable
      searchPlaceholder={T.SEARCH_PLACEHOLDER}
      searchAriaLabel={T.SEARCH_LABEL}
      searchValue={flow.search}
      onSearchChange={flow.setSearch}
      columns={[
        {
          key: "name",
          header: T.ORGANIZATION_NAME,
          cell: (row: OrganizationResponse) => row.name,
        },
        {
          key: "code",
          header: T.ORGANIZATION_CODE,
          cell: (row: OrganizationResponse) => row.code,
        },
        {
          key: "taxCode",
          header: T.TAX_CODE,
          cell: (row: OrganizationResponse) => row.taxCode ?? T.EMPTY_VALUE,
        },
      ]}
      rows={rows}
      getRowKey={(row) => row.publicId}
      isLoading={!tooShort && flow.tenantSearch.isLoading}
      rowActionsHeader=""
      rowActions={(row) => (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={row.status !== "ACTIVE"}
          title={row.status !== "ACTIVE" ? T.SEARCH_INACTIVE : undefined}
          onClick={() => flow.selectTenant(row)}
        >
          {T.SELECT}
        </Button>
      )}
      emptyTitle={emptyTitle}
      clientSideFiltering={false}
      clientSidePagination={false}
    />
  );
};
