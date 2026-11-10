import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { DisclosureChevron } from "./DisclosureChevron";

interface DisclosureProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  className?: string;
  titleClassName?: string;
}

/** Native keyboard-accessible disclosure with the same header treatment as CollapsibleSection. */
export function Disclosure({
  title,
  children,
  defaultOpen = false,
  forceOpen = false,
  className,
  titleClassName,
}: DisclosureProps): ReactElement {
  return (
    <details
      open={defaultOpen || forceOpen}
      className={cn("[&[open]>summary>span:last-child>svg]:rotate-180", className)}
    >
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-1 rounded-lg px-2 text-left marker:hidden transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] [&::-webkit-details-marker]:hidden">
        <span
          className={cn("min-w-0 text-sm font-semibold text-[var(--ink-primary)]", titleClassName)}
        >
          {title}
        </span>
        <DisclosureChevron />
      </summary>
      {children}
    </details>
  );
}
