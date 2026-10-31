import type { ScoreTemplateItemDraft } from "./types";

/**
 * Applies the row order of a table (every row shown, after a drop) to the items. Each
 * section takes the relative order its own rows now have, so a row dropped among another
 * section's rows only moves within its own section. A section whose rows are not all
 * present in `orderedTaskTypeKeys` is left as it was.
 */
export function applyVisibleOrder(
  items: ScoreTemplateItemDraft[],
  orderedTaskTypeKeys: string[],
): ScoreTemplateItemDraft[] {
  const sections = [...new Set(items.map((item) => item.section))];
  return sections.reduce((current, section) => {
    const inSection = new Set(
      current.filter((item) => item.section === section).map((item) => item.taskTypeKey),
    );
    const keysInSection = orderedTaskTypeKeys.filter((key) => inSection.has(key));
    return keysInSection.length === 0
      ? current
      : reorderSectionItems(current, section, keysInSection);
  }, items);
}

/**
 * Applies a drag-and-drop order to one section's items. Items of other sections keep
 * their positions, so reordering Speaking never shifts a Writing row, and `sequence`
 * is renumbered 1..n to follow the new array order.
 *
 * Returns the input untouched when `orderedTaskTypeKeys` is not exactly the set of
 * that section's task types (a stale drop), instead of dropping or duplicating rows.
 */
export function reorderSectionItems(
  items: ScoreTemplateItemDraft[],
  section: string,
  orderedTaskTypeKeys: string[],
): ScoreTemplateItemDraft[] {
  const sectionItems = items.filter((item) => item.section === section);
  const byKey = new Map(sectionItems.map((item) => [item.taskTypeKey, item]));
  const reordered = orderedTaskTypeKeys
    .map((key) => byKey.get(key))
    .filter((item): item is ScoreTemplateItemDraft => item !== undefined);
  const isExactPermutation =
    orderedTaskTypeKeys.length === sectionItems.length &&
    new Set(orderedTaskTypeKeys).size === orderedTaskTypeKeys.length &&
    reordered.length === sectionItems.length &&
    byKey.size === sectionItems.length;
  if (!isExactPermutation) return items;

  let nextInSection = 0;
  return items
    .map((item) => (item.section === section ? reordered[nextInSection++] : item))
    .map((item, index) => ({ ...item, sequence: index + 1 }));
}
