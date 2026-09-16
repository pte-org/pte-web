"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { BookOpenIcon, CheckCircleIcon, UsersIcon } from "@pte/ui";
import { useSessionManager } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PublicShell } from "./PublicShell";

const EXAM_PACKAGES = [
  {
    name: "Exam Starter",
    term: "30 days",
    limit: "Up to 500 students / exam",
    note: "For a focused exam cycle",
    tone: "border-slate-200",
  },
  {
    name: "Exam Growth",
    term: "90 days",
    limit: "Up to 2,000 students / exam",
    note: "For multiple exam sessions",
    tone: "border-blue-200 ring-1 ring-blue-100",
  },
] as const;

const CAPACITY_PACKAGES = [
  {
    name: "Capacity +500",
    term: "Permanent add-on",
    limit: "+500 students",
    note: "Extend your tenant capacity",
  },
  {
    name: "Capacity +1,000",
    term: "Permanent add-on",
    limit: "+1,000 students",
    note: "For growing organizations",
  },
] as const;

const PackageCard = ({
  name,
  term,
  limit,
  note,
  tone = "border-slate-200",
  isOrganizationRegistered,
}: {
  name: string;
  term: string;
  limit: string;
  note: string;
  tone?: string;
  isOrganizationRegistered: boolean;
}): ReactElement => (
  <article className={`rounded-xl border bg-white p-5 shadow-sm ${tone}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-slate-950">{name}</h3>
        <p className="mt-1 text-xs text-slate-500">{term}</p>
      </div>
      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
        Preview
      </span>
    </div>
    <div className="mt-6 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-blue-700 shadow-sm">
        <CheckCircleIcon className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-slate-900">{limit}</p>
    </div>
    <p className="mt-4 text-sm text-slate-500">{note}</p>
    <Link
      href={isOrganizationRegistered ? AUTH_ROUTES.hostDashboard : AUTH_ROUTES.register}
      className="mt-5 inline-flex text-sm font-semibold text-action hover:underline"
    >
      {isOrganizationRegistered ? "Buy now" : "Register organization"}{" "}
      <span className="ml-1" aria-hidden="true">
        →
      </span>
    </Link>
  </article>
);

export const HomeView = (): ReactElement => {
  const { isReady, session } = useSessionManager();
  const isOrganizationRegistered = isReady && Boolean(session?.tenantId);

  return (
    <PublicShell>
      <section id="plans" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-blue-700">
              <BookOpenIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Exam packages</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {EXAM_PACKAGES.map((plan) => (
              <PackageCard
                key={plan.name}
                {...plan}
                isOrganizationRegistered={isOrganizationRegistered}
              />
            ))}
          </div>

          <div className="mt-12 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-700">
              <UsersIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Student capacity add-ons</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {CAPACITY_PACKAGES.map((plan) => (
              <PackageCard
                key={plan.name}
                {...plan}
                isOrganizationRegistered={isOrganizationRegistered}
              />
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
};
