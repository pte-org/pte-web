import type { ScoreTemplateResponse } from "@pte/api-client";
import { downloadJson } from "@pte/ui";

export function downloadScoreTemplateJson(template: ScoreTemplateResponse): void {
  downloadJson(`${template.code}-v${template.version}.json`, template);
}
