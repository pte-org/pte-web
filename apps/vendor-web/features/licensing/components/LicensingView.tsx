"use client";

import type { ReactElement } from "react";
import { PageHeader } from "@aptis/ui";
import { LICENSING_TEXT } from "../constants";
import { useLicenseStats, useLicenses } from "../api";
import { LicenseStatGrid } from "./_LicenseStatGrid";
import { LicenseTable } from "./_LicenseTable";

export const LicensingView = (): ReactElement => {
  const { data: stats } = useLicenseStats();
  const { data: licenses } = useLicenses();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={LICENSING_TEXT.TITLE}
        subtitle={LICENSING_TEXT.SUBTITLE}
        actions={
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            {LICENSING_TEXT.EXPORT}
          </button>
        }
      />
      <LicenseStatGrid stats={stats} />
      <LicenseTable licenses={licenses ?? []} />
    </div>
  );
};
