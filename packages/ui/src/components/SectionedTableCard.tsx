"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { TabRailCard } from "./TabRailCard";
import { Tabs, type TabItem } from "./Tabs";

export interface SectionedTableSection {
  id: string;
  label: string;
}

export interface SectionedTableView<TView extends string> {
  id: TView;
  label: string;
}

/** What the screen needs to draw its table for the selected tab and view. */
export interface SectionedTableContext<TView extends string> {
  /** The selected tab: `allTabId` or a section id. */
  activeTab: string;
  /** True on the "All" tab, where each row has to name its own section. */
  showSection: boolean;
  view: TView;
  /** The switch between views, to put in the table's toolbar. */
  viewTabs: ReactNode;
}

interface SectionedTableCardProps<TView extends string> {
  /** Prefix of the tab ids; must be unique on the page. */
  id: string;
  sections: readonly SectionedTableSection[];
  allTabId: string;
  allLabel: string;
  /** How many rows a tab holds: `null` for the "All" tab. */
  countOf: (sectionId: string | null) => number;
  views: readonly SectionedTableView<TView>[];
  defaultView: TView;
  viewAriaLabel: string;
  /** Shown under the tab rail; it can follow the selected tab. */
  sidePanel?: (context: SectionedTableContext<TView>) => ReactNode;
  children: (context: SectionedTableContext<TView>) => ReactNode;
}

/**
 * The frame of a table that is split by section: a vertical tab rail ("All" plus one tab per section, each with
 * its count) on the left and the selected tab's table on the right, with a switch between views of the rows.
 * The screen draws the table itself, so it keeps its own columns and actions.
 */
export const SectionedTableCard = <TView extends string>({
  id,
  sections,
  allTabId,
  allLabel,
  countOf,
  views,
  defaultView,
  viewAriaLabel,
  sidePanel,
  children,
}: SectionedTableCardProps<TView>): ReactElement => {
  const [activeTab, setActiveTab] = useState(allTabId);
  const [view, setView] = useState<TView>(defaultView);
  const tabItems: TabItem[] = [
    { id: allTabId, label: allLabel, count: countOf(null) },
    ...sections.map((section) => ({
      id: section.id,
      label: section.label,
      count: countOf(section.id),
    })),
  ];
  const context: SectionedTableContext<TView> = {
    activeTab,
    showSection: activeTab === allTabId,
    view,
    viewTabs: (
      <Tabs
        id={`${id}-views`}
        items={views.map((entry) => ({ id: entry.id, label: entry.label }))}
        value={view}
        onChange={(value) => setView(views.find((entry) => entry.id === value)?.id ?? defaultView)}
        variant="minimal"
        ariaLabel={viewAriaLabel}
      />
    ),
  };

  return (
    <TabRailCard
      id={id}
      items={tabItems}
      value={activeTab}
      onChange={setActiveTab}
      sidePanel={sidePanel?.(context)}
    >
      {children(context)}
    </TabRailCard>
  );
};
