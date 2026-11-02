"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import type { ScoreTemplateItemDraft } from "@/features/scoretemplate/types";
import { EXAM_STUDIO_TEXT, NEW_QUESTION_ROUTE } from "../constants";
import { withoutTaskType } from "../editTemplateItems";
import type { StudioTile } from "../types";

interface StudioDrawerFooterProps {
  tile: StudioTile;
  editable: boolean;
  isSaving: boolean;
  onEdit: (change: (items: ScoreTemplateItemDraft[]) => ScoreTemplateItemDraft[]) => void;
}

export const StudioDrawerFooter = ({
  tile,
  editable,
  isSaving,
  onEdit,
}: StudioDrawerFooterProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const { item } = tile;
  // The overall weight is the mean of the four skill weights, so it is above 0 when any skill carries weight.
  const weighted = item !== null && item.overallWeight > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={NEW_QUESTION_ROUTE}
          className="inline-flex items-center rounded-lg bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110"
        >
          {text.COMPOSE_QUESTION}
        </Link>
        {item !== null && (
          <Button
            className="ml-auto"
            variant="danger"
            appearance="outline"
            size="sm"
            disabled={!editable || isSaving || weighted}
            onClick={() => onEdit((items) => withoutTaskType(items, tile.key))}
          >
            {text.REMOVE_FROM_TEMPLATE}
          </Button>
        )}
      </div>
      {weighted && <p className="text-xs text-[var(--ink-muted)]">{text.CANNOT_REMOVE_WEIGHTED}</p>}
    </div>
  );
};
