"use client";

import type { ReactElement } from "react";
import { ActionMenu, Button } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";

interface TemplateToolbarActionsProps {
  onSave: () => void;
  isSaving: boolean;
  onAddTaskType: () => void;
  /** Reviewers only; the entry is left out of the menu for everyone else. */
  canActivate: boolean;
  /** False until the template is ready to go live; the menu entry is then disabled. */
  isActivatable: boolean;
  onActivate: () => void;
}

/**
 * What the editor can do to the template. Save stays a visible button because it is used
 * constantly; adding a task type and activating are rare (and activating retires the
 * current ACTIVE template), so they live in the actions menu.
 */
export const TemplateToolbarActions = ({
  onSave,
  isSaving,
  onAddTaskType,
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
          { label: T.ADD_TYPE, onSelect: onAddTaskType },
          ...(canActivate
            ? [{ label: T.ACTIVATE_ACTION, onSelect: onActivate, disabled: !isActivatable }]
            : []),
        ]}
      />
    </>
  );
};
