"use client";

import { useEffect, useRef, type ReactElement, type ReactNode } from "react";
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

/** The card never gets shorter than this, however little room the screen leaves below the page header. */
const MIN_CARD_HEIGHT = 360;

/** Space kept under the card when the page is not in a dashboard shell. */
const WINDOW_BOTTOM_GAP = 24;

/**
 * The area the page content scrolls in, which the dashboard shell marks with `data-scroll-area`; the window
 * itself when the card sits outside a shell.
 */
const scrollAreaOf = (element: HTMLElement): HTMLElement | null =>
  element.closest<HTMLElement>("[data-scroll-area]");

/**
 * A card with a vertical tab rail on the left and the selected tab's content on the right.
 * A side panel widens the rail so its fields fit; without one the rail shrinks to its labels.
 *
 * On a wide screen the card takes the height left under the page header, and its two sides are separate scroll
 * containers: the wheel over the rail scrolls the rail, and over the content scrolls the content. The height is
 * measured from where the card starts in the page, so it does not change as either side scrolls. On a narrow
 * screen the sides stack and the page scrolls as usual.
 */
export const TabRailCard = ({
  id,
  items,
  value,
  onChange,
  sidePanel,
  children,
}: TabRailCardProps): ReactElement => {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const area = scrollAreaOf(frame);
    const measure = (): void => {
      const start = frame.getBoundingClientRect().top;
      let height: number;
      if (area) {
        // Where the card starts inside the scrolled content, and the padding the area keeps under it.
        const inContent = start - area.getBoundingClientRect().top + area.scrollTop;
        const bottomPadding = Number.parseFloat(getComputedStyle(area).paddingBottom) || 0;
        height = area.clientHeight - inContent - bottomPadding;
      } else {
        height = window.innerHeight - (start + window.scrollY) - WINDOW_BOTTOM_GAP;
      }
      frame.style.setProperty(
        "--rail-card-height",
        `${Math.max(Math.round(height), MIN_CARD_HEIGHT)}px`,
      );
    };
    let pending = 0;
    const queue = (): void => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(measure);
    };
    // What is above the card moving it, or the area changing size, are the only things that change the height.
    const resizes = new ResizeObserver(queue);
    if (area) {
      resizes.observe(area);
      if (area.firstElementChild) resizes.observe(area.firstElementChild);
    }
    window.addEventListener("resize", queue);
    queue();
    return () => {
      cancelAnimationFrame(pending);
      resizes.disconnect();
      window.removeEventListener("resize", queue);
    };
  }, []);

  return (
    <div ref={frameRef} className="lg:h-[var(--rail-card-height)]">
      <DashboardCard
        className={cn(
          "grid gap-6 lg:h-full lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden",
          sidePanel ? "lg:grid-cols-[15rem_minmax(0,1fr)]" : "lg:grid-cols-[auto_minmax(0,1fr)]",
        )}
      >
        <div className="-mx-1 flex flex-col gap-4 px-1 py-0.5 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden [&>*]:shrink-0">
          <Tabs id={id} orientation="vertical" items={items} value={value} onChange={onChange} />
          {sidePanel}
        </div>
        <div
          role="tabpanel"
          id={`${id}-panel-${value}`}
          aria-labelledby={`${id}-tab-${value}`}
          className="min-w-0 lg:-m-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden lg:p-1"
        >
          {children}
        </div>
      </DashboardCard>
    </div>
  );
};
