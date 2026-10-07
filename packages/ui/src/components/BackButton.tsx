import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { ChevronLeftIcon } from "./icons";

export interface BackButtonProps {
  /** Destination URL used by the underlying anchor. */
  href: string;
  /** Visible label. Keep it action-oriented: "Back to Programs". */
  label: string;
  /** Optional leading content shown before the label (icon by default). */
  icon?: ReactNode;
  /** Visually hide the label while keeping it accessible to screen readers. */
  iconOnly?: boolean;
  /** Optional click handler. Useful when a parent wants to short-circuit navigation. */
  onClick?: () => void;
  /** Extra classes appended to the root element. */
  className?: string;
  /**
   * Accessible name override. Defaults to `label` so it matches the visible
   * text in most cases.
   */
  ariaLabel?: string;
}

// Bordered "outlined" treatment: a 1px border around the chip and a
// transparent fill make the back affordance read as a distinct,
// navigational control — not body text. The hover state still darkens
// the surface so the click affordance stays obvious.
const BASE_CLASSES =
  "group inline-flex items-center gap-1.5 self-start rounded-md border border-gray-300 " +
  "bg-transparent px-3 py-1.5 text-sm font-medium text-slate-600 " +
  "transition-colors duration-150 ease-out " +
  "hover:bg-gray-50 hover:text-slate-900 active:text-slate-700 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white";

/**
 * BackButton — secondary navigation control.
 *
 * Use this for "Back to <parent>" affordances on detail pages. It renders a
 * left-aligned link with a chevron icon, a visible label, and predictable
 * spacing. BackButton always points to a stable `href` — never `router.back()`
 * (which can eject the user out of the app when the page is opened directly
 * via URL).
 *
 * Implementation note: rendered as a native `<a>` (not `next/link`) so the
 * `@pte/ui` package stays framework-agnostic. Next.js intercepts same-origin
 * anchor clicks and performs client-side navigation automatically.
 */
export const BackButton = ({
  href,
  label,
  icon,
  iconOnly = false,
  onClick,
  className,
  ariaLabel,
}: BackButtonProps): ReactElement => {
  const content = (
    <>
      {icon ?? (
        <ChevronLeftIcon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-150 ease-out",
            "group-hover:-translate-x-0.5",
            iconOnly ? "" : "-ml-0.5",
          )}
        />
      )}
      <span className={cn(iconOnly && "sr-only")}>{label}</span>
    </>
  );

  return (
    <a
      href={href}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className={cn(BASE_CLASSES, iconOnly && "h-9 w-9 justify-center p-0", className)}
    >
      {content}
    </a>
  );
};
