/**
 * One fixed accent per trait position, so a trait keeps the same colour on every tab of the rubric detail page.
 * Each entry pairs the top stripe of a card with the dot used in chips and level lists.
 */
const TRAIT_TONES = [
  { stripe: "border-t-indigo-500", dot: "bg-indigo-500", soft: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" },
  { stripe: "border-t-teal-500", dot: "bg-teal-500", soft: "bg-teal-500/10 text-teal-700 dark:text-teal-300" },
  { stripe: "border-t-amber-500", dot: "bg-amber-500", soft: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { stripe: "border-t-violet-500", dot: "bg-violet-500", soft: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  { stripe: "border-t-rose-500", dot: "bg-rose-500", soft: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  { stripe: "border-t-sky-500", dot: "bg-sky-500", soft: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { stripe: "border-t-lime-600", dot: "bg-lime-600", soft: "bg-lime-600/10 text-lime-700 dark:text-lime-300" },
] as const;

export type TraitTone = (typeof TRAIT_TONES)[number];

export const traitTone = (index: number): TraitTone => TRAIT_TONES[index % TRAIT_TONES.length];

/** Level dots run from red (0) to green (top level), so a level list reads at a glance. */
export const levelDotClass = (level: number, maxLevel: number): string => {
  const ratio = maxLevel <= 0 ? 0 : level / maxLevel;
  if (ratio >= 0.8) return "bg-emerald-500";
  if (ratio >= 0.5) return "bg-lime-500";
  if (ratio > 0) return "bg-amber-500";
  return "bg-rose-500";
};
