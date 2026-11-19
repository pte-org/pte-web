import type { BreadcrumbItem } from "@pte/ui";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Breadcrumb step back to the AI batch a question was opened from; only a well-formed batch id counts. */
export function batchReturnTrail(batchId: string | null, label: string): BreadcrumbItem[] | undefined {
  return batchId && UUID_PATTERN.test(batchId)
    ? [{ label, href: `/admin/questions/ai-batches/${batchId}` }]
    : undefined;
}
