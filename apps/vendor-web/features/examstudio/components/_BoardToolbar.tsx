"use client";

import type { ReactElement, ReactNode } from "react";
import { TableSearchControl } from "@pte/ui";

interface BoardToolbarProps {
  searchLabel: string;
  /** The hint in the box; it follows the list of the same content, so it can differ from the label. */
  placeholder?: string;
  search: string;
  onSearch: (value: string) => void;
  /** The filters and choices after the search box, in the common table filter style. */
  children?: ReactNode;
  /** Sits at the far end of the row, apart from the filters. */
  end?: ReactNode;
}

/** The toolbar every board shares: the search box first, then the dropdowns, as on the common tables. */
export const BoardToolbar = ({
  searchLabel,
  placeholder,
  search,
  onSearch,
  children,
  end,
}: BoardToolbarProps): ReactElement => (
  <div className="flex min-w-0 flex-wrap items-center gap-3">
    <TableSearchControl
      ariaLabel={searchLabel}
      placeholder={placeholder ?? searchLabel}
      value={search}
      onChange={onSearch}
      variant="table"
      className="w-full sm:max-w-[400px]"
    />
    {children}
    {end && <div className="sm:ml-auto">{end}</div>}
  </div>
);
