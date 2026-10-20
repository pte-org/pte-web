"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, LoadingState, Tabs, useSessionManager } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { useSubscriptionsQuery, useTenantPlansQuery } from "@/features/commercialization/api";
import { HOME_LAYOUT } from "../homeConstants";
import { useHomeCopy } from "../useHomeCopy";
import { toHomePlan } from "./homePlanPresentation";
import { HomePlanCard } from "./HomePlanCard";

export const HomePlans = (): ReactElement => {
  const { HOME_TEXT, locale } = useHomeCopy();
  const [category, setCategory] = useState("EXAM_PACKAGE");
  const { isReady, session } = useSessionManager();
  const { data: plans = [], isLoading, isError } = useTenantPlansQuery();
  const registered = isReady && Boolean(session?.tenantId);
  const { data: subscriptions = [] } = useSubscriptionsQuery(registered);
  const activePlanIds = new Set(
    registered
      ? subscriptions.filter((item) => item.status === "ACTIVE").map((item) => item.planId)
      : [],
  );
  const activePlans = plans
    .filter((plan) => plan.status === "ACTIVE")
    .map((plan) => toHomePlan(plan, locale));
  const groups = [
    {
      id: "EXAM_PACKAGE",
      label: HOME_TEXT.examPackages,
      description: HOME_TEXT.examDescription,
    },
    {
      id: "STUDENT_CAPACITY",
      label: HOME_TEXT.studentCapacity,
      description: HOME_TEXT.capacityDescription,
    },
  ].filter((group) => activePlans.some((plan) => plan.type === group.id));
  const selected = groups.find((group) => group.id === category) ?? groups[0];
  const visiblePlans = activePlans.filter((plan) => plan.type === selected?.id);
  const gridClass =
    visiblePlans.length === 1
      ? "mx-auto max-w-md"
      : visiblePlans.length === 2
        ? "mx-auto max-w-4xl md:grid-cols-2"
        : "md:grid-cols-2 xl:grid-cols-3";
  return (
    <section
      id="plans"
      aria-labelledby="plans-title"
      className={`${HOME_LAYOUT.container} py-14 lg:py-24`}
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-action">
          {HOME_TEXT.plansEyebrow}
        </p>
        <h2 id="plans-title" className={HOME_LAYOUT.heading}>
          {HOME_TEXT.plansTitle}
        </h2>
        <p className="mt-5 text-base leading-7 text-slate-600">{HOME_TEXT.plansDescription}</p>
      </div>
      <div className="mt-10">
        {isLoading ? (
          <LoadingState rows={4} label={HOME_TEXT.plansLoading} />
        ) : isError ? (
          <Alert tone="error">{HOME_TEXT.plansError}</Alert>
        ) : !selected ? (
          <Alert tone="info">{HOME_TEXT.plansEmpty}</Alert>
        ) : (
          <>
            {groups.length > 1 && (
              <div className="mb-7 flex justify-center">
                <Tabs
                  id="home-plans"
                  items={groups}
                  value={selected.id}
                  onChange={setCategory}
                  ariaLabel={HOME_TEXT.plans}
                  variant="minimal"
                />
              </div>
            )}
            {groups
              .filter((group) => group.id !== selected.id)
              .map((group) => (
                <div
                  key={group.id}
                  id={`home-plans-panel-${group.id}`}
                  role="tabpanel"
                  aria-labelledby={`home-plans-tab-${group.id}`}
                  hidden
                />
              ))}
            <div
              id={`home-plans-panel-${selected.id}`}
              role={groups.length > 1 ? "tabpanel" : undefined}
              aria-labelledby={groups.length > 1 ? `home-plans-tab-${selected.id}` : undefined}
            >
              <p className="mb-8 text-center text-sm text-slate-600">{selected.description}</p>
              <ul className={`grid gap-6 ${gridClass}`}>
                {visiblePlans.map((plan) => (
                  <li key={plan.publicId} className="min-w-0">
                    <HomePlanCard
                      plan={plan}
                      isOrganizationRegistered={registered}
                      isActive={activePlanIds.has(plan.publicId)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
      {!registered && (
        <p className="mt-7 text-center text-xs text-slate-600">
          {HOME_TEXT.existingOrganization}{" "}
          <Link href={AUTH_ROUTES.login} className={HOME_LAYOUT.textLink}>
            {HOME_TEXT.manageSubscriptions}
          </Link>
        </p>
      )}
    </section>
  );
};
