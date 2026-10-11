"use client";

import { useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE, type ExamStaffQuery } from "@pte/api-client";
import { Alert, Button, DataTable, PaginationControls, Select, useLocale } from "@pte/ui";
import { useExamStaff } from "../api";
import { EXAM_STAFF_TEXT } from "../constants";
import { useExamStaffListText } from "../hooks/useExamStaffListText";
import { useExamStaffListColumns } from "../hooks/useExamStaffListColumns";
import { AddExamStaffModal } from "./AddExamStaffModal";
import { ExamStaffRowActions } from "./ExamStaffRowActions";

export const ExamStaffView = (): ReactElement => {
  const text = useExamStaffListText();
  const { t } = useLocale();
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState<ExamStaffQuery>({ page: 0, size: DEFAULT_PAGE_SIZE });
  const staff = useExamStaff(query);
  const columns = useExamStaffListColumns(text).map((column) => ({
    ...column, sortable: false, filterable: false,
  }));
  const changeFilters = (patch: Partial<ExamStaffQuery>): void =>
    setQuery((current) => ({ ...current, ...patch, page: 0 }));
  return <div className="flex flex-col gap-6">
    {staff.isError && <Alert tone="error">{t("tenant.examStaff.loadFailed", EXAM_STAFF_TEXT.loadFailed)}</Alert>}
    {staff.isFetching && staff.data && <Alert tone="info">{text.syncing}</Alert>}
    <DataTable columns={columns} rows={staff.data?.data ?? []} getRowKey={(row) => row.publicId}
      isLoading={staff.isLoading} emptyTitle={text.emptyTitle} emptyDescription={text.emptyDescription}
      clientSideFiltering={false} clientSideSorting={false} clientSidePagination={false}
      showSearch searchValue={query.search ?? ""} onSearchChange={(search) => changeFilters({ search })}
      searchPlaceholder={t("tenant.examStaff.searchPlaceholder", EXAM_STAFF_TEXT.searchPlaceholder)}
      filters={<>
        <Select aria-label={text.role} value={query.role ?? "ALL"} options={[
          { label: text.allRoles, value: "ALL" }, { label: text.proctor, value: "PROCTOR" },
          { label: text.examiner, value: "EXAMINER" },
        ]} onChange={(event) => {
          const role = event.target.value;
          if (role === "ALL" || role === "PROCTOR" || role === "EXAMINER") changeFilters({ role });
        }} />
        <Select aria-label={text.status} value={query.status ?? "ALL"} options={[
          { label: text.allStatuses, value: "ALL" }, { label: text.active, value: "ACTIVE" },
          { label: text.suspended, value: "SUSPENDED" },
        ]} onChange={(event) => {
          const status = event.target.value;
          if (status === "ALL" || status === "ACTIVE" || status === "SUSPENDED") changeFilters({ status });
        }} />
      </>}
      rowActionsHeader={text.actions} rowActions={(user) => <ExamStaffRowActions user={user} text={text} />}
      toolbarActions={<Button onClick={() => setAddOpen(true)}>{text.addButton}</Button>}
      pagination={staff.data && <PaginationControls meta={staff.data.meta}
        disabled={staff.isFetching} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />}
    />
    <AddExamStaffModal key={addOpen ? "exam-staff-open" : "exam-staff-closed"} open={addOpen}
      onClose={() => setAddOpen(false)} />
  </div>;
};
