export const REPORT_TEXT = {
  TITLE: "My results",
  SUBTITLE: "Published exam reports from your organization.",
  LEGACY_WARNING:
    "Some earlier results were published before immutable snapshots existed. They retain the previous live-scoring behavior and may change; reports published with the current workflow are frozen.",
  LOAD_ERROR: "Unable to load your published results. Please try again.",
  EMPTY_TITLE: "No published results yet",
  EMPTY_TEXT: "Your results will appear here after your Host publishes them.",
  EXAM_REPORT: "Exam report",
  SESSION: "Session",
  LEGACY_RESULT: "Legacy result · not frozen",
  PUBLISHED: "Published",
  OVERALL: "Overall",
  INSUFFICIENT_DATA: "Insufficient data",
  EMPTY_VALUE: "—",
  APPLIED_WEIGHT: "Applied weight",
  WEIGHT_SNAPSHOT_NOTE: "Weights shown here come from the immutable report snapshot.",
} as const;

export function formatWeightBreakdown(appliedWeight: number): string {
  const normalized = appliedWeight / 100;
  const percentage = new Intl.NumberFormat("en-GB", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(normalized);
  return `${appliedWeight.toLocaleString("en-GB")} / 100 (${percentage})`;
}
