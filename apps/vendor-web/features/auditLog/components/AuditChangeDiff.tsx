"use client";

import type { ReactElement } from "react";
import {
  Alert,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
  useLocale,
} from "@pte/ui";
import { PLATFORM_AUDIT_LOG_COPY } from "../constants";
import { diffAuditState } from "../utils/diffAuditState";
import { formatAuditPath, formatAuditValue } from "../utils/formatAuditField";

interface AuditChangeDiffProps {
  before: unknown;
  after: unknown;
}

/** Field-by-field comparison of two snapshots: only the fields that differ are listed. */
export const AuditChangeDiff = ({ before, after }: AuditChangeDiffProps): ReactElement => {
  const { locale } = useLocale();
  const T = PLATFORM_AUDIT_LOG_COPY[locale];
  const diff = diffAuditState(before, after);

  if (diff.truncated) return <Alert tone="info">{T.TRUNCATED}</Alert>;
  if (diff.changes.length === 0) {
    return <p className="text-sm text-[var(--ink-secondary)]">{T.NO_FIELD_CHANGES}</p>;
  }

  return (
    <TableRoot>
      <TableHeader>
        <TableRow>
          <TableHead>{T.FIELD}</TableHead>
          <TableHead>{T.BEFORE}</TableHead>
          <TableHead>{T.AFTER}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {diff.changes.map((change) => (
          <TableRow key={change.path.join(".")}>
            <TableCell className="font-medium">{formatAuditPath(change.path)}</TableCell>
            <TableCell className="break-words text-red-600 line-through">
              {formatAuditValue(change.before, T.EMPTY_VALUE)}
            </TableCell>
            <TableCell className="break-words text-emerald-700">
              {formatAuditValue(change.after, T.EMPTY_VALUE)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableRoot>
  );
};
