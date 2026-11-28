/** The last section, in page order, inside the reading band: when two overlap it, the one coming into view wins. */
export function pickActiveSection(order: readonly string[], visible: ReadonlySet<string>): string | null {
  return [...order].reverse().find((id) => visible.has(id)) ?? null;
}
