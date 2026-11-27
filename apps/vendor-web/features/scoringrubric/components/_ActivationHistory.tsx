"use client";
import type { ReactElement } from "react";
import {
  EmptyState,
  ErrorState,
  HistoryIcon,
  LoadingState,
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  formatShortDateTime,
  useLocale,
} from "@pte/ui";
import { useRubricActivationHistory } from "../versionApi";
import type { RubricEditText } from "../versionTypes";

interface ActivationHistoryProps {
  id: string;
  text: RubricEditText;
}

/** Every time this version was made active; a card of its own, always open, since it is short. */
export const ActivationHistory = ({ id, text: T }: ActivationHistoryProps): ReactElement => {
  const query = useRubricActivationHistory(id);
  const { locale } = useLocale();
  return (
    <section className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-card">
      <h2 className="mb-4 border-b border-[var(--shell-border)] pb-3 text-base font-semibold text-[var(--ink-primary)]">
        {T.history}{query.data ? ` (${query.data.length})` : ""}
      </h2>
      {query.isLoading && <LoadingState rows={2} />}
      {query.isError && <ErrorState title={T.error} />}
      {query.data?.length === 0 && (
        <EmptyState
          className="border-0 shadow-none"
          icon={<HistoryIcon className="h-8 w-8" />}
          title={T.emptyHistory}
          description={T.historyHint}
        />
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
                <TableCell>{formatShortDateTime(row.activatedAt, locale === "vi" ? "vi" : "en")}</TableCell>
                <TableCell>{row.reason ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      )}
    </section>
  );
};
