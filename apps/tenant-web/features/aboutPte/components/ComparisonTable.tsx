"use client";

import type { ReactElement } from "react";
import { Alert, DataTable, GlobeIcon, type DataTableColumn } from "@pte/ui";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

type ComparisonRow = readonly string[];

/** Column of PTE Academic, highlighted as the test this project is about. */
const FEATURED_COLUMN = 1;
const FEATURED_CELL = "bg-[var(--action-tint)] font-semibold text-[var(--home-navy)]";

const VietnamCard = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { vietnam } = useAboutPteLanding();
  return (
    <div id="vietnam" className={`${THEMED_CARD} scroll-mt-24 bg-[var(--action-tint)] p-6`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-action shadow-sm">
        <GlobeIcon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-[var(--home-navy)]">{copy.vietnam.title}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {vietnam.cities.map((city) => (
          <li key={city} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--home-navy)] shadow-sm">
            {city}
          </li>
        ))}
      </ul>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--ink-secondary)]">
        {copy.vietnam.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <SourceRefs ids={copy.vietnam.src} label={copy.sourceLabel} />
      <div className="mt-4">
        <Alert tone="warning">{copy.vietnam.caveat}</Alert>
      </div>
    </div>
  );
};

export const ComparisonTable = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { compare } = useAboutPteLanding();
  const { headers, rows, caption, src } = copy.comparison;
  const columns: DataTableColumn<ComparisonRow>[] = headers.map((header, index) => ({
    key: `col-${index}`,
    header,
    sortable: false,
    filterable: false,
    cell: (row) => row[index],
    headerClassName: index === FEATURED_COLUMN ? FEATURED_CELL : undefined,
    cellClassName: index === 0 ? "font-semibold" : index === FEATURED_COLUMN ? FEATURED_CELL : undefined,
  }));
  return (
    <AboutSection
      id="comparison"
      eyebrow={compare.pill}
      title={compare.title}
      tone="tint"
      intro={
        <>
          {`${compare.intro} ${caption}`}
          <SourceRefs ids={src} label={copy.sourceLabel} />
        </>
      }
    >
      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <DataTable
          columns={columns}
          rows={[...rows]}
          getRowKey={(row) => row[0]}
          showSearch={false}
          clientSideFiltering={false}
          clientSideSorting={false}
          clientSidePagination={false}
          density="compact"
        />
        <VietnamCard />
      </div>
    </AboutSection>
  );
};
