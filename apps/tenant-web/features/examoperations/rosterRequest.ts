import type { BulkCreateUsersRequest } from "@pte/api-client";
import type { RosterCreateInput } from "./types";

/**
 * One mapping for every roster import (session roster, class page, student search): the parser-only fields
 * `programName` and `sourceRow` stay in the browser, and blank cells are sent as null.
 */
export function buildBulkCreateRequest({ rows, sendCredentialsEmail }: RosterCreateInput): BulkCreateUsersRequest {
  return {
    rows: rows.map((row) => ({
      email: row.email || null,
      fullName: row.fullName || null,
      studentCode: row.studentCode || null,
      className: row.className || null,
      phone: row.phone || null,
      dateOfBirth: row.dateOfBirth || null,
    })),
    tenantId: null,
    sendCredentialsEmail,
  };
}
