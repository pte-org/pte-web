import type { ScoreTemplateResponse } from "@pte/api-client";

export function downloadScoreTemplateJson(template: ScoreTemplateResponse): void {
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${template.code}-v${template.version}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
