"use client";

import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import { ROSTER_TEMPLATE_TEXT } from "../constants";
import { downloadRosterTemplate } from "../rosterTemplate";

interface RosterTemplateButtonProps {
  showHint?: boolean;
}

export const RosterTemplateButton = ({
  showHint = true,
}: RosterTemplateButtonProps): ReactElement => (
  <div className="flex flex-wrap items-center gap-3">
    <Button type="button" variant="secondary" onClick={() => downloadRosterTemplate()}>
      {ROSTER_TEMPLATE_TEXT.BUTTON}
    </Button>
    {showHint && <span className="text-xs text-gray-500">{ROSTER_TEMPLATE_TEXT.HINT}</span>}
  </div>
);
