"use client";

import type { ReactElement } from "react";
import { Badge, Drawer } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import type { ScoreTemplateItemDraft } from "@/features/scoretemplate/types";
import { EXAM_STUDIO_TEXT } from "../constants";
import type { StudioTile } from "../types";
import { StudioDrawerFooter } from "./_StudioDrawerFooter";
import { QuestionsSection } from "./_QuestionsSection";
import { TemplateSection } from "./_TemplateSection";

interface StudioDrawerProps {
  tile: StudioTile | null;
  templatePublicId: string;
  editable: boolean;
  isSaving: boolean;
  onEdit: (change: (items: ScoreTemplateItemDraft[]) => ScoreTemplateItemDraft[]) => void;
  onClose: () => void;
}

/** One panel for the task type: where it stands in the template, then its questions, then the actions. */
export const StudioDrawer = ({
  tile,
  templatePublicId,
  editable,
  isSaving,
  onEdit,
  onClose,
}: StudioDrawerProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);

  return (
    <Drawer
      open={tile !== null}
      onClose={onClose}
      title={tile?.type.displayName ?? ""}
      description={text.DRAWER_DESCRIPTION}
      footer={tile && <StudioDrawerFooter tile={tile} editable={editable} isSaving={isSaving} onEdit={onEdit} />}
    >
      {tile && (
        <div className="space-y-6">
          <section className="space-y-3" aria-label={text.IN_TEMPLATE}>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
              {text.IN_TEMPLATE}
              {tile.item !== null && (
                <Badge variant={tile.state === "ready" ? "success" : "warning"}>
                  {tile.available}/{tile.required}
                </Badge>
              )}
            </h3>
            <TemplateSection tile={tile} editable={editable} isSaving={isSaving} onEdit={onEdit} />
          </section>
          <section className="border-t border-[var(--shell-border)] pt-4" aria-label={text.QUESTIONS_SECTION}>
            <QuestionsSection tile={tile} templatePublicId={templatePublicId} />
          </section>
          <p className="text-xs text-[var(--ink-muted)]">{text.FOOTER_NOTE}</p>
        </div>
      )}
    </Drawer>
  );
};
