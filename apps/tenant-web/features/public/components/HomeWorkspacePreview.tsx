"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { BookOpenIcon, CalendarIcon, CheckCircleIcon, UsersIcon, BuildingIcon } from "@pte/ui";
import { useHomeCopy } from "../useHomeCopy";
import { PUBLIC_TEXT } from "../constants";
import styles from "./HomeDesign.module.css";

const PREVIEW_ICONS = [BuildingIcon, UsersIcon, CalendarIcon, BookOpenIcon];

export const HomeWorkspacePreview = (): ReactElement => {
  const { HOME_PREVIEW } = useHomeCopy();
  return (
    <figure className={styles.artwork} aria-label={HOME_PREVIEW.label}>
      <div className={styles.previewFrame}>
        <div className="relative flex h-8 items-center gap-1 border-b border-slate-200 bg-slate-50 px-3">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="absolute left-1/3 text-[8px] text-slate-500">
            {HOME_PREVIEW.windowTitle}
          </span>
        </div>
        <div className="grid min-h-80 grid-cols-[78px_minmax(0,1fr)] sm:grid-cols-[105px_minmax(0,1fr)]">
          <div className="border-r border-slate-100 bg-slate-50/50 px-1.5 py-4 sm:px-2.5">
            <div className="mb-7 flex items-center gap-1 text-[10px] font-bold text-[var(--home-navy)]">
              <Image src="/logo-ppte.png" width={19} height={19} alt="" />
              {PUBLIC_TEXT.BRAND}
            </div>
            {HOME_PREVIEW.navigation.map((label, index) => {
              const Icon = PREVIEW_ICONS[index];
              return (
                <div
                  key={label}
                  className={`mb-1 flex items-center gap-1.5 rounded p-1.5 text-[8px] ${index === 0 ? "bg-action-tint font-semibold text-action" : "text-slate-500"}`}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  {label}
                </div>
              );
            })}
          </div>
          <div className="min-w-0 px-3 py-6 sm:px-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] uppercase text-slate-500">{HOME_PREVIEW.workspace}</p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-[var(--home-navy)] sm:text-base">
                  {HOME_PREVIEW.title}
                </p>
              </div>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[8px] text-[var(--home-navy)]">
                {HOME_PREVIEW.avatar}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 border-b border-slate-100 pb-5">
              {HOME_PREVIEW.metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="text-[8px] text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-2xl font-medium tracking-tight text-[var(--home-navy)]">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mb-2 mt-4 text-[9px] font-semibold text-[var(--home-navy)]">
              {HOME_PREVIEW.upcoming}
            </p>
            {HOME_PREVIEW.sessions.map((session, index) => (
              <div
                key={session.day}
                className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 border-t border-slate-100 py-3"
              >
                <div className="rounded bg-slate-50 py-1 text-center text-[7px] text-slate-500">
                  {HOME_PREVIEW.month}
                  <span className="block text-[11px] font-semibold text-[var(--home-navy)]">
                    {session.day}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-[var(--home-navy)]">
                    {session.title}
                  </p>
                  <p className="mt-1 text-[7px] text-slate-500">{session.detail}</p>
                </div>
                <span
                  className={`rounded px-1.5 py-1 text-[7px] ${index === 0 ? "bg-[var(--home-success-bg)] text-[var(--home-success)]" : "bg-[var(--home-draft-bg)] text-[var(--home-draft)]"}`}
                >
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative z-10 -mt-3 ml-2 flex w-fit max-w-[95%] rotate-1 items-center gap-3 rounded-lg border border-[var(--home-border)] bg-white px-4 py-3 sm:ml-10">
        <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-700" />
        <div>
          <p className="text-[11px] font-semibold text-[var(--home-navy)]">
            {HOME_PREVIEW.annotation}
          </p>
          <p className="mt-1 text-[9px] text-slate-600">{HOME_PREVIEW.annotationDetail}</p>
        </div>
      </div>
      <figcaption className="relative mt-4 pr-2 text-right text-[9px] uppercase tracking-wide text-blue-100">
        {HOME_PREVIEW.sampleLabel}
      </figcaption>
    </figure>
  );
};
