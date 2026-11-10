"use client";

import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import type { PromptBlock } from "@pte/api-client";
import { fill } from "../utils/presentation";
import { levelsDescending } from "../utils/promptPresentation";
import { levelDot } from "../utils/promptTone";
import type { PromptCopy } from "../promptConstants";
import { PromptExampleView } from "./_PromptExampleView";
import { FIELD_BOX_CLASS, PromptField } from "./_PromptField";

interface PromptBlockViewProps {
  block: PromptBlock;
  copy: PromptCopy;
}

/** One block of a prompt section as form fields: a text box, a list of field boxes, an example reply or levels. */
export const PromptBlockView = ({ block, copy }: PromptBlockViewProps): ReactElement => (
  <div className="space-y-3">
    {block.label && block.type !== "LEVELS" && (
      <p className="text-xs font-medium text-[var(--ink-secondary)]">{block.label}</p>
    )}
    {block.type === "TEXT" && <div className={FIELD_BOX_CLASS}>{block.text}</div>}
    {block.type === "LIST" && (
      <div className="space-y-3">
        {block.items.map((item) => (
          <PromptField key={item} entry={item} copy={copy} />
        ))}
      </div>
    )}
    {block.type === "CODE" && <PromptExampleView text={block.text} copy={copy} />}
    {block.type === "LEVELS" && (
      <section className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]">
        <header className="flex flex-wrap items-center gap-2 border-b border-[var(--shell-border)] px-5 py-3">
          <h4 className="text-sm font-semibold text-[var(--ink-primary)]">{block.label}</h4>
          <Badge variant={block.sentToAi ? "success" : "neutral"}>
            {block.sentToAi ? copy.SENT_TO_AI : copy.REFERENCE_ONLY}
          </Badge>
        </header>
        <ol className={`divide-y divide-[var(--shell-border)] ${block.sentToAi ? "" : "opacity-70"}`}>
          {levelsDescending(block.levels).map((row, _index, rows) => (
            <li key={row.level} className="flex gap-4 px-5 py-3">
              <span className="flex w-20 shrink-0 items-center gap-2 text-sm font-semibold text-[var(--ink-primary)]">
                <span className={`h-2.5 w-2.5 rounded-full ${levelDot(row.level, rows[0].level)}`} aria-hidden="true" />
                {fill(copy.LEVEL, { level: row.level })}
              </span>
              <span className="text-sm text-[var(--ink-secondary)]">{row.text}</span>
            </li>
          ))}
        </ol>
      </section>
    )}
  </div>
);
