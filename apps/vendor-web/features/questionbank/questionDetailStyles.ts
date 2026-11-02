export interface SectionAccent {
  /** Soft background of a label in the section's colour. */
  tint: string;
  /** Text colour that reads on that background. */
  text: string;
}

const NEUTRAL_ACCENT: SectionAccent = {
  tint: "bg-[var(--surface-subtle)]",
  text: "text-[var(--ink-secondary)]",
};

// Class names are written out in full so Tailwind can see them.
const SECTION_ACCENTS: Record<string, SectionAccent> = {
  SPEAKING: { tint: "bg-[var(--sky-tint)]", text: "text-[var(--sky-action)]" },
  WRITING: { tint: "bg-[var(--mint-tint)]", text: "text-[var(--mint-action)]" },
  READING: { tint: "bg-[var(--cream-tint)]", text: "text-[var(--cream-action)]" },
  LISTENING: { tint: "bg-[var(--blush-tint)]", text: "text-[var(--blush-action)]" },
};

/** The colours of an exam section (Speaking, Writing, Reading, Listening); neutral for anything else. */
export const accentOf = (section: string | null | undefined): SectionAccent =>
  SECTION_ACCENTS[(section ?? "").toUpperCase()] ?? NEUTRAL_ACCENT;

/** A small rounded label, e.g. the section, pool or revision of a question. */
export const DETAIL_CHIP_CLASS = "rounded-full px-2.5 py-0.5 text-xs font-medium";

/** The label colours for a fact that has no section colour (pool, revision). */
export const NEUTRAL_CHIP_CLASS = "bg-[var(--surface-subtle)] text-[var(--ink-secondary)]";
