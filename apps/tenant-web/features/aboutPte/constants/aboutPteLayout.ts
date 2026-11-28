export const ABOUT_PTE_ROUTE = "/about-pte";

/** Id of the hero section, watched so the section bar can show its score-lab button once the hero is behind. */
export const ABOUT_PTE_HERO_ID = "about-hero";

/** Fired by a citation link so the collapsed sources list opens before the browser scrolls to the entry. */
export const OPEN_SOURCES_EVENT = "about-pte:open-sources";

export const ABOUT_PTE_LAYOUT = {
  container: "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10",
} as const;

/** Colour classes per skill, shared by the flow diagram, chart and trace. */
export const SKILL_TONES = {
  speaking: { stroke: "stroke-sky-500", fill: "fill-sky-500", bg: "bg-sky-500", text: "text-sky-700", bar: "[&::-webkit-progress-value]:bg-sky-500! [&::-moz-progress-bar]:bg-sky-500!" },
  writing: { stroke: "stroke-violet-500", fill: "fill-violet-500", bg: "bg-violet-500", text: "text-violet-700", bar: "[&::-webkit-progress-value]:bg-violet-500! [&::-moz-progress-bar]:bg-violet-500!" },
  reading: { stroke: "stroke-emerald-500", fill: "fill-emerald-500", bg: "bg-emerald-500", text: "text-emerald-700", bar: "[&::-webkit-progress-value]:bg-emerald-500! [&::-moz-progress-bar]:bg-emerald-500!" },
  listening: { stroke: "stroke-amber-500", fill: "fill-amber-500", bg: "bg-amber-500", text: "text-amber-700", bar: "[&::-webkit-progress-value]:bg-amber-500! [&::-moz-progress-bar]:bg-amber-500!" },
} as const;

/** Same theme-aware tokens as @pte/ui Badge, so answer chips stay readable in light and dark mode. */
export const OUTCOME_TONES = {
  correct: "border-[var(--mint-action)] bg-[var(--mint-tint)] text-[var(--mint-action)]",
  partial: "border-[var(--cream-action)] bg-[var(--cream-tint)] text-[var(--cream-action)]",
  wrong: "border-[var(--blush-action)] bg-[var(--blush-tint)] text-[var(--blush-action)]",
} as const;

/** Theme-aware skill chips (tint background + action text), readable in light and dark mode. */
export const SKILL_CHIPS = {
  speaking: "bg-[var(--sky-tint)] text-[var(--sky-action)]",
  writing: "bg-[var(--brand-tint)] text-[var(--brand-ink)]",
  reading: "bg-[var(--mint-tint)] text-[var(--mint-action)]",
  listening: "bg-[var(--cream-tint)] text-[var(--cream-action)]",
} as const;

/** Theme-aware card surface used by the guide cards. */
export const THEMED_CARD =
  "rounded-2xl border border-[var(--shell-border)] bg-[var(--surface-card)] text-[var(--ink-primary)]";
