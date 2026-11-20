export const ABOUT_PTE_ROUTE = "/about-pte";

export const ABOUT_PTE_SECTION_IDS = [
  "overview",
  "basics",
  "history",
  "recognition",
  "vietnam",
  "comparison",
  "scoring",
  "simulation",
  "sources",
] as const;

export const ABOUT_PTE_LAYOUT = {
  container: "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10",
  section: "scroll-mt-28 border-t border-slate-200 py-12 lg:py-16",
  heading: "text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl",
  card: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
  muted: "text-sm leading-7 text-slate-600",
} as const;

/** Colour classes per skill, shared by the flow diagram, chart and trace. */
export const SKILL_TONES = {
  speaking: { stroke: "stroke-sky-500", fill: "fill-sky-500", bg: "bg-sky-500", text: "text-sky-700" },
  writing: { stroke: "stroke-violet-500", fill: "fill-violet-500", bg: "bg-violet-500", text: "text-violet-700" },
  reading: { stroke: "stroke-emerald-500", fill: "fill-emerald-500", bg: "bg-emerald-500", text: "text-emerald-700" },
  listening: { stroke: "stroke-amber-500", fill: "fill-amber-500", bg: "bg-amber-500", text: "text-amber-700" },
} as const;
