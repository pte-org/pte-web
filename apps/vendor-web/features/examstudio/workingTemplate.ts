import type { ScoreTemplateResponse } from "@pte/api-client";
import { EXAM_TEMPLATE_BASE_PATH } from "../scoretemplate/constants";

const DRAFT_STATUS = "DRAFT";
const ACTIVE_STATUS = "ACTIVE";

/** The platform's own templates that are in play (the active one and drafts), newest version first. */
export function selectableTemplates(
  templates: readonly ScoreTemplateResponse[],
): ScoreTemplateResponse[] {
  return templates
    .filter(
      (template) =>
        !template.tenantId &&
        (template.status === ACTIVE_STATUS || template.status === DRAFT_STATUS),
    )
    .sort((a, b) => b.version - a.version);
}

/** What a tracking screen should show first: the template in effect, else the newest draft. */
export function pickDefaultTemplate(
  templates: readonly ScoreTemplateResponse[],
): ScoreTemplateResponse | undefined {
  const options = selectableTemplates(templates);
  return (
    options.find((template) => template.status === ACTIVE_STATUS) ??
    options.find((template) => template.status === DRAFT_STATUS)
  );
}

/** The template the hub shows: the one the user picked if it is still there, else the default. */
export function pickWorkingTemplate(
  templates: readonly ScoreTemplateResponse[],
  chosenPublicId: string | null = null,
): ScoreTemplateResponse | undefined {
  return (
    selectableTemplates(templates).find((template) => template.publicId === chosenPublicId) ??
    pickDefaultTemplate(templates)
  );
}

/** Where the template opens: the editor while it is a draft, the read-only page once it is locked. */
export const templateHref = (template: ScoreTemplateResponse): string =>
  template.status === DRAFT_STATUS
    ? `${EXAM_TEMPLATE_BASE_PATH}/${template.publicId}/edit`
    : `${EXAM_TEMPLATE_BASE_PATH}/${template.publicId}`;

export const isEditableTemplate = (template: ScoreTemplateResponse | undefined): boolean =>
  template?.status === DRAFT_STATUS;
