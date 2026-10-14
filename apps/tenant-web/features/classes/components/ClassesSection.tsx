"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, DataTable, DetailGroup, useLocale } from "@pte/ui";
import type { ClassResponse } from "@pte/api-client";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import {
  CLASS_TABLE_HEADERS,
  CLASSES_LIST_TEXT,
  CLASSES_SECTION_TEXT,
  MERGE_CLASSES_SELECTION_TEXT,
} from "../constants";
import { useClasses } from "../api";
import { useClassSectionColumns } from "../hooks/useClassSectionColumns";
import { ClassRowActions } from "./ClassRowActions";
import { MergeClassesModal } from "./MergeClassesModal";

interface ClassesSectionProps {
  organizationPublicId: string;
  programPublicId: string;
  classLabel: string;
  /**
   * Per-class student counts keyed by class publicId, read from the Program dashboard
   * query that is already cached on this screen. Optional so the section still renders
   * (with 0) wherever the dashboard is not mounted.
   */
  studentCountByClassPublicId?: ReadonlyMap<string, number>;
}

export const ClassesSection = ({
  organizationPublicId,
  programPublicId,
  classLabel,
  studentCountByClassPublicId,
}: ClassesSectionProps): ReactElement => {
  const router = useRouter();
  const { t } = useLocale();
  const columns = useClassSectionColumns(studentCountByClassPublicId);
  const searchText = useTenantSearchText("classSection");
  const createLabel = t("tenant.classes.create", CLASSES_LIST_TEXT.createClassButton);
  const { data: classes, isLoading, isError } = useClasses(organizationPublicId, programPublicId);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  const selectedClasses = (classes ?? []).filter((studentClass) =>
    selectedKeys.has(studentClass.publicId),
  );

  const exitMergeMode = (): void => {
    setMergeMode(false);
    setSelectedKeys(new Set());
  };

  const rowActions = (studentClass: ClassResponse): ReactElement => (
    <ClassRowActions
      organizationPublicId={organizationPublicId}
      programPublicId={programPublicId}
      studentCount={studentCountByClassPublicId?.get(studentClass.publicId) ?? 0}
      classLabel={classLabel}
      studentClass={studentClass}
    />
  );

  if (isError)
    return (
      <Alert tone="error">{t("tenant.classes.loadFailed", CLASSES_SECTION_TEXT.loadFailed)}</Alert>
    );

  return (
    <div className="flex flex-col gap-4">
      {mergeMode && (
        <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-4 py-2">
          <span className="text-sm text-blue-800">
            {MERGE_CLASSES_SELECTION_TEXT.selectedCount(selectedKeys.size)}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exitMergeMode}
              className="text-sm text-gray-600 hover:underline"
            >
              {MERGE_CLASSES_SELECTION_TEXT.cancelSelection}
            </button>
            <button
              type="button"
              disabled={selectedKeys.size < 2}
              onClick={() => setMergeModalOpen(true)}
              className="rounded-md bg-action px-3 py-1.5 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {MERGE_CLASSES_SELECTION_TEXT.confirmButton}
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={classes ?? []}
        getRowKey={(studentClass) => studentClass.publicId}
        isLoading={isLoading}
        emptyTitle={t(
          "tenant.classes.noClassesTitle",
          CLASSES_SECTION_TEXT.emptyInlineTitle(classLabel),
        )}
        searchPlaceholder={searchText.placeholder}
        searchAriaLabel={searchText.ariaLabel}
        rowActionsHeader={t("tenant.classes.actions", CLASS_TABLE_HEADERS.ACTIONS)}
        rowActions={rowActions}
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            {!mergeMode && (classes?.length ?? 0) >= 2 && (
              <Button variant="secondary" size="sm" onClick={() => setMergeMode(true)}>
                {MERGE_CLASSES_SELECTION_TEXT.startButton(classLabel)}
              </Button>
            )}
            <Button
              onClick={() =>
                router.push(
                  `/host/classes?${new URLSearchParams({
                    organizationPublicId,
                    programPublicId,
                    create: "1",
                  })}`,
                )
              }
            >
              {createLabel}
            </Button>
          </div>
        }
        renderMobileRow={
          mergeMode
            ? undefined
            : (studentClass) => (
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <DetailGroup
                      title={studentClass.name}
                      variant="inline"
                      items={columns
                        .slice(1)
                        .map((column) => ({
                          label: String(column.header),
                          value: column.cell(studentClass),
                        }))}
                    />
                  </div>
                  {rowActions(studentClass)}
                </div>
              )
        }
        selectable={mergeMode}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        selectRowLabel={(studentClass) => studentClass.name}
      />

      <MergeClassesModal
        key={mergeModalOpen ? "mergeClasses-open" : "mergeClasses-closed"}
        open={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        selectedClasses={selectedClasses}
        classLabel={classLabel}
        onMerged={() => {
          setMergeModalOpen(false);
          exitMergeMode();
        }}
      />
    </div>
  );
};
