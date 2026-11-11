"use client";

import type { ReactElement } from "react";
import { Button, Modal, useLocale } from "@pte/ui";
import { PROMPT_GUIDE_COPY } from "../promptGuide";
import type { DocumentSection } from "../promptText";

interface PromptGuideDialogProps {
  open: boolean;
  sections: readonly DocumentSection[];
  lockedIds: readonly string[];
  hasOutput: boolean;
  hasTokens: boolean;
  onClose: () => void;
}

/** Explains which parts of the prompt on screen are read-only and why, so nobody has to guess. */
export const PromptGuideDialog = ({
  open, sections, lockedIds, hasOutput, hasTokens, onClose,
}: PromptGuideDialogProps): ReactElement => {
  const { locale } = useLocale();
  const guide = PROMPT_GUIDE_COPY[locale === "vi" ? "vi" : "en"];
  // Locked sections, plus settings sections whose values may change but whose names are read by the system.
  const locked = sections.filter((section) => lockedIds.includes(section.id)
    || (section.fields !== null && section.id in guide.REASONS));
  return (
    <Modal open={open} onClose={onClose} title={guide.TITLE} size="lg"
      footer={<Button variant="secondary" onClick={onClose}>{guide.CLOSE}</Button>}>
      <div className="space-y-4 text-sm text-[var(--ink-primary)]">
        <p>{guide.INTRO}</p>
        <section className="space-y-2">
          <h3 className="font-semibold">{guide.LOCKED_TITLE}</h3>
          {locked.length === 0 ? <p className="text-[var(--ink-secondary)]">{guide.NO_LOCKED}</p> : (
            <ul className="list-disc space-y-1 pl-5">
              {locked.map((section) => (
                <li key={section.id}>
                  <strong>{section.title}</strong>: {guide.REASONS[section.id] ?? guide.FALLBACK_REASON}
                </li>
              ))}
            </ul>
          )}
        </section>
        {hasOutput && (
          <section className="space-y-1">
            <h3 className="font-semibold">{guide.OUTPUT_TITLE}</h3>
            <p>{guide.OUTPUT_BODY}</p>
          </section>
        )}
        {hasTokens && (
          <section className="space-y-1">
            <h3 className="font-semibold">{guide.TOKENS_TITLE}</h3>
            <p>{guide.TOKENS_BODY}</p>
          </section>
        )}
        <section className="space-y-1">
          <h3 className="font-semibold">{guide.TEST_TITLE}</h3>
          <p>{guide.TEST_BODY}</p>
        </section>
      </div>
    </Modal>
  );
};
