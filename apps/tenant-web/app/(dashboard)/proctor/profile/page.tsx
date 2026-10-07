import type { ReactElement } from "react";

/**
 * Phase 01 placeholder for the proctor profile page.
 *
 * Phase 04 replaces this with `<ProctorProfileView />` (read-only
 * profile of the current user). Phase 04 wires the import via the
 * page file per spec §S4 add-only exception.
 *
 * This placeholder exists so:
 * - `/proctor` redirects to a real page (no infinite redirect).
 * - Reviewers can verify the flag + redirect works end-to-end.
 */
export default function ProctorProfilePlaceholder(): ReactElement {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">Proctor profile</h1>
      <p className="mt-2 text-sm text-gray-600">
        Phase 01 placeholder. Phase 04 wires the read-only fields.
      </p>
    </div>
  );
}