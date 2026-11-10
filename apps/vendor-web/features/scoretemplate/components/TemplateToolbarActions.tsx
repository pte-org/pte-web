"use client";

import type { ReactElement } from "react";
import { ActionMenu, Button } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";

interface TemplateToolbarActionsProps {
  onSave: () => void;
  onOpenTimeFrame: () => void;
  onOpenCefrMix: () => void;
  isSaving: boolean;
  /** Reviewers only; the entry is left out of the menu for everyone else. */
  canActivate: boolean;
  /** False until the template is ready to go live; the menu entry is then disabled. */
  isActivatable: boolean;
  onActivate: () => void;
}

/**
 * What the editor can do to the template. Save stays a visible button because it is used
 * constantly; the rest is rare, so it lives in the actions menu: the time frame and the CEFR mix, and
 * activating (which retires the current ACTIVE template) for reviewers only.
 * Task types are added by dragging them in.
 */
export const TemplateToolbarActions = ({
  onSave,
  onOpenTimeFrame,
  onOpenCefrMix,
  isSaving,
  canActivate,
  isActivatable,
  onActivate,
}: TemplateToolbarActionsProps): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);

  return (
    <>
      <Button variant="primary" isLoading={isSaving} onClick={onSave}>
        {T.SAVE_DRAFT}
      </Button>
      <ActionMenu
        label={T.TEMPLATE_ACTIONS_LABEL}
        items={[
          { label: T.MENU_TIME_FRAME, onSelect: onOpenTimeFrame },
          { label: T.MENU_CEFR_MIX, onSelect: onOpenCefrMix },
          ...(canActivate
            ? [{ label: T.ACTIVATE_ACTION, onSelect: onActivate, disabled: !isActivatable }]
            : []),
        ]}
      />
    </>
  );
};
