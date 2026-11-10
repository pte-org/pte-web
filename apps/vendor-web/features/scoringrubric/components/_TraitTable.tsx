"use client";

import type { ReactElement } from "react";
import {
  Disclosure,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@pte/ui";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { traitDisplayName } from "../rubricView";
import type { RubricTraitDetailsResponse } from "../types";
import { RubricSection } from "./_RubricSection";

interface TraitTableProps {
  traits: RubricTraitDetailsResponse[];
}

interface TraitLevelsProps {
  trait: RubricTraitDetailsResponse;
}

/** Long English level texts stay folded so a page with many traits remains readable. */
const TraitLevels = ({ trait }: TraitLevelsProps): ReactElement => {
  const { locale, messages: M, format } = useScoringRubricText();
  return (
    <Disclosure
      title={format("levelsSummary", { trait: traitDisplayName(trait, locale) })}
      className="rounded-lg border border-[var(--shell-border)] px-4 py-3"
    >
      <p className="mt-2 text-xs text-[var(--ink-muted)]">{M.levelsNote}</p>
      <ol className="mt-2 space-y-2">
        {[...trait.levels]
          .sort((left, right) => right.level - left.level)
          .map((level) => (
            <li key={level.level} className="text-sm text-[var(--ink-secondary)]">
              <span className="font-semibold text-[var(--ink-primary)]">
                {format("levelLabel", { level: level.level })}
              </span>{" "}
              {level.text}
            </li>
          ))}
      </ol>
    </Disclosure>
  );
};

/** Every trait with its scale, scorer, weight in the viewed version and Score Guide pages. */
export const TraitTable = ({ traits }: TraitTableProps): ReactElement => {
  const { locale, messages: M, codeLabel } = useScoringRubricText();

  return (
    <RubricSection title={M.traitsTitle} hint={M.traitsHint}>
      {traits.length === 0 ? (
        <p className="text-sm text-[var(--ink-secondary)]">{M.traitsEmpty}</p>
      ) : (
        <>
          <TableRoot>
            <TableHeader>
              <TableRow>
                <TableHead>{M.traitName}</TableHead>
                <TableHead>{M.traitMax}</TableHead>
                <TableHead>{M.traitSource}</TableHead>
                <TableHead>{M.traitWeight}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traits.map((trait) => (
                <TableRow key={trait.key}>
                  <TableCell>
                    <div className="font-medium text-[var(--ink-primary)]">
                      {traitDisplayName(trait, locale)}
                    </div>
                    <div className="font-mono text-xs text-[var(--ink-muted)]">{trait.key}</div>
                  </TableCell>
                  <TableCell>{trait.perWord ? M.perWordMax : trait.maxScore}</TableCell>
                  <TableCell>{codeLabel("source", trait.source)}</TableCell>
                  <TableCell>{trait.weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
          {traits
            .filter((trait) => trait.levels.length > 0)
            .map((trait) => (
              <TraitLevels key={trait.key} trait={trait} />
            ))}
        </>
      )}
    </RubricSection>
  );
};
