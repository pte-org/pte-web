export type BoardTone = "neutral" | "warning" | "success" | "info";

/**
 * A column is a very light wash of its stage colour with a hairline edge of the same hue, so the white cards
 * stand out of it on a light page and the column stays soft on a dark one. The dot in the header names the
 * stage in a stronger tone.
 */
export const BOARD_TONE: Record<BoardTone, { column: string; dot: string }> = {
  neutral: {
    column:
      "bg-[color-mix(in_srgb,#6366f1_5%,var(--surface-card))] border-[color-mix(in_srgb,#6366f1_14%,var(--shell-border))]",
    dot: "bg-indigo-500",
  },
  warning: {
    column:
      "bg-[color-mix(in_srgb,#f97316_6%,var(--surface-card))] border-[color-mix(in_srgb,#f97316_16%,var(--shell-border))]",
    dot: "bg-orange-500",
  },
  success: {
    column:
      "bg-[color-mix(in_srgb,#22c55e_6%,var(--surface-card))] border-[color-mix(in_srgb,#22c55e_16%,var(--shell-border))]",
    dot: "bg-green-500",
  },
  info: {
    column:
      "bg-[color-mix(in_srgb,#0ea5e9_6%,var(--surface-card))] border-[color-mix(in_srgb,#0ea5e9_16%,var(--shell-border))]",
    dot: "bg-sky-500",
  },
};

/** What every column shares. */
export const BOARD_COLUMN_FRAME = "rounded-2xl border p-3";

/** The header of a column: the stage dot, the title, then the count in brackets and muted. */
export const BOARD_HEADER_CLASS =
  "flex items-center gap-2 px-1 text-sm font-semibold text-[var(--ink-primary)]";
export const BOARD_COUNT_CLASS = "font-normal text-[var(--ink-muted)]";
