"use client";

import type { ReactElement } from "react";
import { EyeIcon } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_SECTION_LABELS } from "@/features/scoretemplate/constants";
import { sectionTone } from "@/lib/chipTones";
import { QUESTION_EDITOR_TEXT as RAW_QUESTION_EDITOR_TEXT } from "../constants";

/** Colour of the dot by skill, the same one the skill tabs and chips use. */
const DOT_CLASS: Record<string, string> = {
  sky: "bg-[var(--sky-action)]",
  mint: "bg-[var(--mint-action)]",
  cream: "bg-[var(--cream-action)]",
  blush: "bg-[var(--blush-action)]",
};

/** The label over the student's screen: it says this side is a simulation, and of which skill. */
export const PreviewHeader = ({ section }: { section?: string }): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_EDITOR_TEXT);
  const sectionLabels = useAdminCopy(SCORE_TEMPLATE_SECTION_LABELS);
  const label = section ? sectionLabels[section as keyof typeof sectionLabels] : undefined;

  return (
    <div className="flex items-center justify-between gap-3 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
      <span className="inline-flex items-center gap-1.5">
        <EyeIcon className="h-4 w-4" />
        {T.PREVIEW_TITLE}
      </span>
      {label && (
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${DOT_CLASS[sectionTone(section)] ?? "bg-[var(--ink-muted)]"}`}
          />
          {label}
        </span>
      )}
    </div>
  );
};
