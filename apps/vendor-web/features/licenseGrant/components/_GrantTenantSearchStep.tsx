"use client";

import type { ReactElement } from "react";
import type { OrganizationResponse } from "@pte/api-client";
import { Alert, Button, DataTable, PaginationControls } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { GRANT_TEXT } from "../constants";
import type { GrantLicenseFlow } from "../types";

interface GrantTenantSearchStepProps {
  flow: GrantLicenseFlow;
}

/** Step 1: look the organization up by code, tax code or contact email and pick exactly one. */
export const GrantTenantSearchStep = ({ flow }: GrantTenantSearchStepProps): ReactElement => {
  const T = useAdminCopy(GRANT_TEXT);
  const page = flow.tenantSearch.data;
  const busy = flow.searchPending || flow.tenantSearch.isFetching;
  const rows = flow.searchPending ? [] : (page?.data ?? []);
  const emptyTitle = busy ? T.SEARCHING : T.SEARCH_EMPTY;

  return (
    <div className="space-y-4">
      {flow.tenantSearch.isError && !flow.searchPending && (
        <Alert tone="error">
          <div className="flex items-center justify-between gap-3">
            <span>{T.SEARCH_ERROR}</span>
            <Button variant="ghost" onClick={() => void flow.tenantSearch.refetch()}>
              {T.RETRY}
            </Button>
          </div>
        </Alert>
      )}
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
        isLoading={flow.tenantSearch.isLoading || flow.searchPending}
        rowActionsHeader=""
        rowActions={(row) => (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={row.status !== "ACTIVE" || busy}
            title={row.status !== "ACTIVE" ? T.SEARCH_INACTIVE : undefined}
            onClick={() => flow.selectTenant(row)}
          >
            {T.SELECT}
          </Button>
        )}
        emptyTitle={emptyTitle}
        clientSideFiltering={false}
        clientSidePagination={false}
        pagination={
          page &&
          !flow.searchPending && (
            <PaginationControls
              meta={page.meta}
              onPageChange={flow.setTenantPage}
              disabled={busy}
            />
          )
        }
      />
    </div>
  );
};
