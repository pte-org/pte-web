"use client";

import type { ReactElement } from "react";
import { Button, useLocale } from "@pte/ui";
import { ROSTER_TEMPLATE_TEXT, ROSTER_TEMPLATE_TEXT_VI } from "../constants";
import { downloadRosterTemplate } from "../rosterTemplate";

interface RosterTemplateButtonProps {
  showHint?: boolean;
}

export const RosterTemplateButton = ({
  showHint = true,
}: RosterTemplateButtonProps): ReactElement => {
  const { locale, t } = useLocale();
  const buttonLabel = t(
    "tenant.rosterTemplate.button",
    locale === "vi" ? ROSTER_TEMPLATE_TEXT_VI.BUTTON : ROSTER_TEMPLATE_TEXT.BUTTON,
  );
  const hint = t(
    "tenant.rosterTemplate.hint",
    locale === "vi" ? ROSTER_TEMPLATE_TEXT_VI.HINT : ROSTER_TEMPLATE_TEXT.HINT,
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="secondary" onClick={() => downloadRosterTemplate()}>
        {buttonLabel}
      </Button>
      {showHint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
};
