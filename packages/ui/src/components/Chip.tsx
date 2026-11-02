import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

export type ChipTone = "sky" | "mint" | "cream" | "blush" | "brand" | "action" | "neutral";
export type ChipSize = "sm" | "md";

interface ChipProps {
  tone?: ChipTone;
  /** Only an outline in the tone's colour, for a fact that should sit quieter than a filled chip. */
  outlined?: boolean;
  size?: ChipSize;
  children: ReactNode;
  className?: string;
}

// Class names are written out in full so Tailwind can see them.
const FILLED: Record<ChipTone, string> = {
  sky: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
  mint: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
  cream: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
  blush: "bg-[var(--blush-tint)] text-[var(--blush-action)]",
  brand: "bg-[var(--brand-tint)] text-[var(--brand-ink)]",
  action: "bg-[var(--action-tint)] text-[var(--action)]",
  neutral: "bg-[var(--surface-subtle)] text-[var(--ink-secondary)]",
};

const OUTLINED: Record<ChipTone, string> = {
  sky: "border border-[var(--sky-action)]/40 text-[var(--sky-action)]",
  mint: "border border-[var(--mint-action)]/40 text-[var(--mint-action)]",
  cream: "border border-[var(--cream-action)]/40 text-[var(--cream-action)]",
  blush: "border border-[var(--blush-action)]/40 text-[var(--blush-action)]",
  brand: "border border-[var(--brand)]/40 text-[var(--brand-ink)]",
  action: "border border-[var(--action)]/40 text-[var(--action)]",
  neutral: "border border-[var(--shell-border)] text-[var(--ink-secondary)]",
};

const SIZE: Record<ChipSize, string> = {
  sm: "px-2 py-0 text-xs",
  md: "px-2.5 py-0.5 text-sm",
};

/** A rounded, coloured label for a category (a section, a pool, a type), as opposed to a status. */
export const Chip = ({
  tone = "neutral",
  outlined = false,
  size = "md",
  children,
  className,
}: ChipProps): ReactElement => (
  <span
    className={cn(
      "inline-flex items-center whitespace-nowrap rounded-full font-medium",
      SIZE[size],
      outlined ? OUTLINED[tone] : FILLED[tone],
      className,
    )}
  >
    {children}
  </span>
);
