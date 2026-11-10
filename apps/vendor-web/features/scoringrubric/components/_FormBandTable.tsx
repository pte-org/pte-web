"use client";

import type { ReactElement } from "react";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import type { RubricFormBandResponse } from "../types";
import { RubricSection } from "./_RubricSection";

interface FormBandTableProps {
  bands: RubricFormBandResponse[];
}

/** Word-count ranges and the Form score each earns, exactly as the version declares them. */
export const FormBandTable = ({ bands }: FormBandTableProps): ReactElement => {
  const { messages: M, format } = useScoringRubricText();

  return (
    <RubricSection title={M.formTitle} hint={M.formHint}>
      <TableRoot>
        <TableHeader>
          <TableRow>
            <TableHead>{M.formWords}</TableHead>
            <TableHead>{M.formBand}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bands.map((band) => (
            <TableRow key={`${band.minWords}-${band.maxWords}`}>
              <TableCell>{format("formRange", { min: band.minWords, max: band.maxWords })}</TableCell>
              <TableCell>{band.band}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </RubricSection>
  );
};
