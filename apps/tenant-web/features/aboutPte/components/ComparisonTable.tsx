"use client";

import type { ReactElement } from "react";
import { DataTable, type DataTableColumn } from "@pte/ui";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

type ComparisonRow = readonly string[];

export const ComparisonTable = (): ReactElement => {
  const copy = useAboutPteCopy();
  const columns: DataTableColumn<ComparisonRow>[] = copy.comparison.headers.map((header, index) => ({
    key: `col-${index}`,
    header,
    sortable: false,
    filterable: false,
    cell: (row) => row[index],
    cellClassName: index === 0 ? "font-semibold text-slate-900" : index === 1 ? "bg-action/5 font-medium" : undefined,
  }));
  return (
    <AboutSection id="comparison" title={copy.comparison.title}>
      <p className={`mb-4 ${ABOUT_PTE_LAYOUT.muted}`}>
        {copy.comparison.caption}
        <SourceRefs ids={copy.comparison.src} label={copy.sourceLabel} />
      </p>
      <DataTable
        columns={columns}
        rows={[...copy.comparison.rows]}
        getRowKey={(row) => row[0]}
        showSearch={false}
        clientSideFiltering={false}
        clientSideSorting={false}
        clientSidePagination={false}
      />
    </AboutSection>
  );
};
