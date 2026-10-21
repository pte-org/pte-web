"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { BookOpenIcon, CalendarIcon, CheckCircleIcon, ChevronRightIcon, UsersIcon } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { HOME_LAYOUT } from "../homeConstants";
import { useHomeCopy } from "../useHomeCopy";
import { HomeWorkspacePreview } from "./HomeWorkspacePreview";
import styles from "./HomeDesign.module.css";

const ROLE_ICONS = [UsersIcon, CalendarIcon, BookOpenIcon];

export const HomeHero = (): ReactElement => {
  const { HOME_TEXT } = useHomeCopy();
  return (
    <section id="platform" aria-labelledby="hero-title" className={styles.banner}>
      <div
        className={`${HOME_LAYOUT.container} relative grid items-center gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-20`}
      >
        <div>
          <p className={HOME_LAYOUT.eyebrow}>{HOME_TEXT.eyebrow}</p>
          <h1
            id="hero-title"
            className="text-[44px] font-medium leading-[1.06] tracking-[-0.055em] text-[var(--home-navy)] sm:text-6xl"
          >
            {HOME_TEXT.title}
            <br />
            <span className="text-action-hover">{HOME_TEXT.titleAccent}</span>
          </h1>
          <p className="mb-7 mt-7 max-w-md text-[15px] leading-7 text-slate-600">
            {HOME_TEXT.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={AUTH_ROUTES.register} className={HOME_LAYOUT.primaryLink}>
              {HOME_TEXT.register}
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
            <Link href="#workflow" className={HOME_LAYOUT.secondaryLink}>
              {HOME_TEXT.workflow}
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-slate-600">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            {HOME_TEXT.reassurance}
          </p>
        </div>
        <HomeWorkspacePreview />
      </div>
      <div className="relative border-t border-[var(--home-border)] bg-[var(--home-banner-foot)] py-6">
        <div
          className={`${HOME_LAYOUT.container} flex flex-wrap items-center justify-between gap-5`}
        >
          <p className="w-full text-[10px] uppercase tracking-widest text-slate-600 lg:w-auto">
            {HOME_TEXT.rolesLabel}
          </p>
          {HOME_TEXT.roles.map((role, index) => {
            const Icon = ROLE_ICONS[index];
            return (
              <span
                key={role}
                className="flex items-center gap-2 text-xs font-medium text-[var(--home-navy)]"
              >
                <Icon className="h-4 w-4 text-action" />
                {role}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
};
