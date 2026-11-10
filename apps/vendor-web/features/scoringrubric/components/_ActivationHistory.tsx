"use client";
import type { ReactElement } from "react";
import {
  Disclosure,
  ErrorState,
  LoadingState,
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@pte/ui";
import { useRubricActivationHistory } from "../versionApi";
import type { RubricEditText } from "../versionTypes";

interface ActivationHistoryProps {
  id: string;
  text: RubricEditText;
}
export const ActivationHistory = ({ id, text: T }: ActivationHistoryProps): ReactElement => {
  const query = useRubricActivationHistory(id);
  return (
    <Disclosure
      title={`${T.history}${query.data ? ` (${query.data.length})` : ""}`}
      className="rounded-xl border border-[var(--shell-border)] px-5 py-3"
    >
      <div className="mt-3 space-y-3">
        {query.isLoading && <LoadingState rows={2} />}
        {query.isError && <ErrorState title={T.error} />}
        {query.data?.length === 0 && (
          <p className="text-sm text-[var(--ink-secondary)]">{T.emptyHistory}</p>
        )}
        {Boolean(query.data?.length) && (
          <TableRoot>
            <TableHeader>
              <TableRow>
                <TableHead>{T.actor}</TableHead>
                <TableHead>{T.time}</TableHead>
                <TableHead>{T.reasonColumn}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.map((row) => (
                <TableRow key={row.publicId}>
                  <TableCell>{row.actorUserPublicId}</TableCell>
                  <TableCell>{row.activatedAt}</TableCell>
                  <TableCell>{row.reason ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        )}
      </div>
    </Disclosure>
  );
};
