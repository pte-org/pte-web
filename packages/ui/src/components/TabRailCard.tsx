import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { DashboardCard } from "./DashboardCard";
import { Tabs, type TabItem } from "./Tabs";

export interface TabRailCardProps {
  /** Prefix of the tab and panel ids; must be unique on the page. */
  id: string;
  items: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  /** Shown under the tab rail, in the same side column (e.g. a details panel). */
  sidePanel?: ReactNode;
  children: ReactNode;
}

/**
 * A card with a vertical tab rail on the left and the selected tab's content on the right.
 * A side panel widens the rail so its fields fit; without one the rail shrinks to its labels.
 */
export const TabRailCard = ({
  id,
  items,
  value,
  onChange,
  sidePanel,
  children,
}: TabRailCardProps): ReactElement => (
  <DashboardCard
    className={cn(
      "grid gap-6 lg:items-start",
      sidePanel ? "lg:grid-cols-[15rem_minmax(0,1fr)]" : "lg:grid-cols-[auto_minmax(0,1fr)]",
    )}
  >
    <div className="flex flex-col gap-4 lg:sticky lg:top-4">
      <Tabs id={id} orientation="vertical" items={items} value={value} onChange={onChange} />
      {sidePanel}
    </div>
    <div
      role="tabpanel"
      id={`${id}-panel-${value}`}
      aria-labelledby={`${id}-tab-${value}`}
      className="min-w-0"
    >
      {children}
    </div>
  </DashboardCard>
);
