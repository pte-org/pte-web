import type { ReactElement } from "react";
import { cn } from "../utils/cn";
import { ChevronDownIcon } from "./icons";

interface DisclosureChevronProps {
  expanded?: boolean;
}

/** Native disclosures style their direct summary chevron; controlled sections pass their state. */
export function DisclosureChevron({ expanded }: DisclosureChevronProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--ink-secondary)]"
    >
      <ChevronDownIcon
        className={cn(
          "h-4 w-4 motion-safe:transition-transform motion-safe:duration-200",
          expanded && "rotate-180",
        )}
      />
    </span>
  );
}
