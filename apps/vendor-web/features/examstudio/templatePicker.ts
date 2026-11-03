import type { ScoreTemplateResponse } from "@pte/api-client";

/** How many templates the picker lists before "show more", so a long list stays quick to scan. */
export const PICKER_PAGE_SIZE = 20;

const STATUS_RANK: Record<string, number> = { ACTIVE: 0, DRAFT: 1 };

/** The templates whose name, code, version or status contain every word of the query; best first. */
export function filterPickerTemplates(
  templates: readonly ScoreTemplateResponse[],
  query: string,
): ScoreTemplateResponse[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return templates
    .filter((template) => {
      const haystack =
        `${template.name} ${template.code} v${template.version} ${template.status}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    })
    .sort(
      (a, b) =>
        (STATUS_RANK[a.status] ?? 2) - (STATUS_RANK[b.status] ?? 2) || b.version - a.version,
    );
}
