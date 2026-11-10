"use client";

import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { traitDisplayName } from "../rubricView";
import type { RubricGateTraitResponse, RubricTraitDetailsResponse } from "../types";
import { RubricSection } from "./_RubricSection";

interface GateListProps {
  gates: RubricGateTraitResponse[];
  traits: RubricTraitDetailsResponse[];
}

/** Gate traits of the viewed version and whether each is switched on. */
export const GateList = ({ gates, traits }: GateListProps): ReactElement => {
  const { locale, messages: M } = useScoringRubricText();
  const nameOf = (traitKey: string): string => {
    const trait = traits.find((candidate) => candidate.key === traitKey);
    return trait ? traitDisplayName(trait, locale) : traitKey;
  };

  return (
    <RubricSection title={M.gatesTitle} hint={M.gatesHint}>
      {gates.length === 0 ? (
        <p className="text-sm text-[var(--ink-secondary)]">{M.gatesEmpty}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {gates.map((gate) => (
            <li
              key={gate.traitKey}
              className="flex items-center gap-2 rounded-lg border border-[var(--shell-border)] px-3 py-2 text-sm"
            >
              <span className="text-[var(--ink-primary)]">{nameOf(gate.traitKey)}</span>
              <Badge variant={gate.enabled ? "warning" : "neutral"}>
                {gate.enabled ? M.gateOn : M.gateOff}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </RubricSection>
  );
};
