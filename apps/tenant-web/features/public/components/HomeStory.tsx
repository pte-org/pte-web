"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { CheckCircleIcon, ChevronRightIcon } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { HOME_LAYOUT } from "../homeConstants";
import { useHomeCopy } from "../useHomeCopy";

export const HomeWorkflow = (): ReactElement => {
  const { HOME_TEXT, HOME_STEPS } = useHomeCopy();
  return (
    <section
      id="workflow"
      aria-labelledby="workflow-title"
      className={`${HOME_LAYOUT.container} py-14 lg:py-24`}
    >
      <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end lg:gap-10">
        <div>
          <p className={HOME_LAYOUT.eyebrow}>{HOME_TEXT.workflowEyebrow}</p>
          <h2 id="workflow-title" className={`${HOME_LAYOUT.heading} max-w-xl`}>
            {HOME_TEXT.workflowTitle}
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-7 text-slate-600">{HOME_TEXT.workflowDescription}</p>
      </div>
      <ol className="grid gap-8 md:grid-cols-3">
        {HOME_STEPS.map((step) => (
          <li key={step.label} className="border-t border-[var(--home-border)] pt-6">
            <p className="text-[11px] tracking-wider text-action">{step.label}</p>
            <h3 className="mb-3 mt-6 text-xl font-medium tracking-tight text-[var(--home-navy)]">
              {step.title}
            </h3>
            <p className="max-w-sm text-sm leading-7 text-slate-600">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export const HomeTeam = (): ReactElement => {
  const { HOME_TEXT, HOME_PREVIEW } = useHomeCopy();
  return (
    <section
      id="value"
      aria-labelledby="team-title"
      className="border-y border-[var(--home-border)] bg-[var(--home-paper)] py-14 lg:py-24"
    >
      <div
        className={`${HOME_LAYOUT.container} grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20`}
      >
        <figure>
          <div className="rounded-xl border border-[var(--home-border)] bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <p className="text-sm font-semibold text-[var(--home-navy)]">
                {HOME_PREVIEW.rosterTitle}
              </p>
              <span className="shrink-0 text-[10px] text-slate-500">
                {HOME_PREVIEW.rosterCount}
              </span>
            </div>
            {HOME_PREVIEW.students.map((student) => (
              <div
                key={student.initials}
                className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0 last:pb-0"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-action-tint text-[10px] font-semibold text-action">
                  {student.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--home-navy)]">{student.name}</p>
                  <p className="mt-1 text-[10px] text-slate-600">{HOME_PREVIEW.className}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-700">
                  <CheckCircleIcon className="h-3 w-3" />
                  {HOME_PREVIEW.enrolled}
                </span>
              </div>
            ))}
          </div>
          <figcaption className="mt-4 text-[9px] uppercase tracking-wide text-slate-500">
            {HOME_PREVIEW.rosterLabel}
          </figcaption>
        </figure>
        <div>
          <p className={HOME_LAYOUT.eyebrow}>{HOME_TEXT.teamEyebrow}</p>
          <h2 id="team-title" className={HOME_LAYOUT.heading}>
            {HOME_TEXT.teamTitle}
          </h2>
          <p className="mb-6 mt-6 text-sm leading-7 text-slate-600">{HOME_TEXT.teamDescription}</p>
          <Link href="#plans" className={HOME_LAYOUT.textLink}>
            {HOME_TEXT.teamLink}
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export const HomeClosing = (): ReactElement => {
  const { HOME_TEXT } = useHomeCopy();
  return (
    <section aria-labelledby="closing-title" className="bg-[var(--home-navy)] py-14 text-white">
      <div
        className={`${HOME_LAYOUT.container} flex flex-col justify-between gap-7 lg:flex-row lg:items-center`}
      >
        <div>
          <h2 id="closing-title" className="text-3xl font-medium tracking-tight">
            {HOME_TEXT.closingTitle}
          </h2>
          <p className="mt-3 text-sm text-slate-300">{HOME_TEXT.closingDescription}</p>
        </div>
        <Link
          href={AUTH_ROUTES.register}
          className={`${HOME_LAYOUT.secondaryLink} shrink-0 self-start`}
        >
          {HOME_TEXT.register}
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};
