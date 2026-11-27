"use client";

import { useState, type ReactElement } from "react";
import { useDebouncedSearch } from "@/features/search/useDebouncedSearch";
import { EyeIcon, Button, DataTable, ErrorState, PaginationControls, Select } from "@pte/ui";
import type { IncidentStatus } from "@pte/api-client";
import { useIncidentColumns } from "../hooks/useIncidentColumns";
import { useIncidentsList, useMyProctorAssignment } from "../api";
import { IncidentDetailModal } from "./IncidentDetailModal";
import { IncidentReportModal } from "./IncidentReportModal";
import { useIncidentText } from "../hooks/useIncidentText";

interface IncidentListViewProps {
  sessionPublicId: string;
  initialIncidentPublicId?: string;
  audience?: "proctor" | "host";
  renderDetail?: (incidentPublicId: string, onClose: () => void) => ReactElement;
}

export const IncidentListView = ({
  sessionPublicId,
  initialIncidentPublicId,
  audience = "proctor",
  renderDetail,
}: IncidentListViewProps): ReactElement => {
  const text = useIncidentText();
  const [selectedIncident, setSelectedIncident] = useState<string | null>(
    initialIncidentPublicId ?? null,
  );
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useIncidentsList(sessionPublicId, {
    search: debouncedSearch.trim() || undefined,
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    page,
    size: 20,
  });

  const incidents = data?.data ?? [];
  const meta = data?.meta;
  if (meta && page >= Math.max(1, meta.totalPages)) {
    setPage(Math.max(0, meta.totalPages - 1));
  }

  const columns = useIncidentColumns();
  // The host view passes an empty id, which keeps this assignment query disabled.
  const assignment = useMyProctorAssignment(audience === "proctor" ? sessionPublicId : "");
  const isSessionClosed = assignment.data?.status === "CLOSED";

  return (
    <div
      className={audience === "host" ? "w-full space-y-4" : "w-full space-y-6 p-4 sm:p-6 lg:p-8"}
    >
      {isError ? (
        <ErrorState
          title={text.listErrorTitle}
          description={text.listErrorBody}
          action={
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              {text.retry}
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={incidents}
          getRowKey={(row) => row.incidentPublicId}
          isLoading={isLoading}
          emptyTitle={text.listEmpty}
          rowActions={(row) => (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<EyeIcon className="h-4 w-4" />}
              className="whitespace-nowrap hover:bg-[var(--sky-tint)] hover:text-[var(--sky-action)]"
              onClick={() => setSelectedIncident(row.incidentPublicId)}
            >
              {text.viewButton}
            </Button>
          )}
          clientSideFiltering={false}
          clientSideSorting={false}
          clientSidePagination={false}
          showSearch
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          searchPlaceholder={text.listSearchPlaceholder}
          searchAriaLabel={text.listSearchPlaceholder}
          filters={
            <Select
              aria-label={text.listFilterStatus}
              value={selectedStatus}
              options={text.statusTabs.map((tab) => ({
                value: tab.id,
                label: tab.label,
              }))}
              onChange={(event) => {
                const selected = text.statusTabs.find(
                  (tab) => tab.id === event.target.value,
                );
                if (selected) {
                  setSelectedStatus(selected.id);
                  setPage(0);
                }
              }}
            />
          }
          toolbarActions={
            audience === "proctor" ? (
              <Button
                variant="primary"
                size="sm"
                disabled={isSessionClosed}
                title={isSessionClosed ? text.listReportClosedHint : undefined}
                onClick={() => setIsReportModalOpen(true)}
              >
                {text.listReportNew}
              </Button>
            ) : undefined
          }
          pagination={
            meta && meta.totalPages > 1 ? (
              <PaginationControls meta={meta} onPageChange={setPage} disabled={isLoading} />
            ) : null
          }
        />
      )}

      {selectedIncident &&
        (renderDetail ? (
          renderDetail(selectedIncident, () => setSelectedIncident(null))
        ) : (
          <IncidentDetailModal
            key={selectedIncident}
            sessionPublicId={sessionPublicId}
            incidentPublicId={selectedIncident}
            onClose={() => setSelectedIncident(null)}
          />
        ))}
      {audience === "proctor" && (
        <IncidentReportModal
          open={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          sessionPublicId={sessionPublicId}
          onSuccess={() => void refetch()}
        />
      )}
    </div>
  );
};
