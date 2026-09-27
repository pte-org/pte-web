"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpenIcon,
  BuildingIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardIcon,
  ShieldIcon,
  UsersIcon,
  useSessionManager,
} from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PublicShell } from "./PublicShell";
import { MOCK_HOME_PLANS, type HomePlan } from "./home.mock";

const money = (plan: HomePlan): string =>
  `${Number(plan.price).toLocaleString("en-US")} ${plan.currency}`;

const planTerm = (plan: HomePlan): string =>
  plan.durationDays ? `${plan.durationDays} days` : "Permanent access";

const ValueRow = ({
  icon,
  title,
  description,
}: {
  icon: ReactElement;
  title: string;
  description: string;
}): ReactElement => (
  <article className="grid gap-4 border-t border-slate-200 py-6 sm:grid-cols-[3.25rem_minmax(0,1fr)] sm:items-start sm:gap-6">
    <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#e8f2f9] text-action">
      {icon}
    </span>
    <div>
      <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">{description}</p>
    </div>
  </article>
);

const PlanCard = ({
  plan,
  isOrganizationRegistered,
}: {
  plan: HomePlan;
  isOrganizationRegistered: boolean;
}): ReactElement => {
  const actionHref = isOrganizationRegistered
    ? `/host/checkout?planId=${encodeURIComponent(plan.publicId)}`
    : AUTH_ROUTES.register;
  const actionLabel = isOrganizationRegistered ? "Choose this plan" : "Register organization";

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border p-6 ${
        plan.featured
          ? "border-[#0d2f51] bg-[#0d2f51] text-white"
          : "border-slate-200 bg-white text-slate-950"
      }`}
    >
      {plan.featured && (
        <span className="absolute right-5 top-5 rounded-full bg-[#b7f0d7] px-3 py-1 text-[11px] font-bold text-[#0b5e4c]">
          Recommended
        </span>
      )}

      <p
        className={`pr-24 text-sm font-semibold ${plan.featured ? "text-[#98d6ff]" : "text-action"}`}
      >
        {plan.label}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{plan.name}</h3>
      <p
        className={`mt-2 min-h-12 text-sm leading-6 ${plan.featured ? "text-slate-200" : "text-slate-600"}`}
      >
        {plan.description}
      </p>

      <div className="mt-6 flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-[-0.04em]">{money(plan)}</span>
        <span className={`pb-1 text-xs ${plan.featured ? "text-slate-300" : "text-slate-500"}`}>
          {planTerm(plan)}
        </span>
      </div>

      <div
        className={`mt-5 flex items-center gap-3 rounded-xl p-3 ${
          plan.featured ? "bg-white/10" : "bg-[#f2f6fa]"
        }`}
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
            plan.featured ? "bg-white/10 text-[#b7f0d7]" : "bg-white text-action"
          }`}
        >
          {plan.type === "EXAM_PACKAGE" ? (
            <BookOpenIcon className="h-5 w-5" />
          ) : (
            <UsersIcon className="h-5 w-5" />
          )}
        </span>
        <p className={`text-sm font-semibold ${plan.featured ? "text-white" : "text-slate-800"}`}>
          {plan.audience}
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={`flex items-start gap-2 text-sm leading-6 ${
              plan.featured ? "text-slate-200" : "text-slate-600"
            }`}
          >
            <CheckCircleIcon
              className={`mt-1 h-4 w-4 shrink-0 ${plan.featured ? "text-[#b7f0d7]" : "text-[#0b8b70]"}`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={actionHref}
        className={`mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-[background-color,transform] duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 ${
          plan.featured
            ? "bg-white text-[#0d2f51] hover:bg-[#e8f2f9] focus-visible:ring-white"
            : "bg-action text-white hover:bg-action-hover"
        }`}
      >
        {actionLabel}
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
    </article>
  );
};

const PlanGroup = ({
  title,
  description,
  icon,
  plans,
  isOrganizationRegistered,
}: {
  title: string;
  description: string;
  icon: ReactElement;
  plans: readonly HomePlan[];
  isOrganizationRegistered: boolean;
}): ReactElement => (
  <div>
    <div className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8f2f9] text-action">
        {icon}
      </span>
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
    <div className="mt-5 grid gap-4">
      {plans.map((plan) => (
        <PlanCard
          key={plan.publicId}
          plan={plan}
          isOrganizationRegistered={isOrganizationRegistered}
        />
      ))}
    </div>
  </div>
);

const WORKFLOW_STEPS = [
  {
    number: "01",
    icon: <BuildingIcon className="h-5 w-5" />,
    title: "Register your organization",
    description: "Tell us who you are and create a workspace for your team.",
  },
  {
    number: "02",
    icon: <ClipboardIcon className="h-5 w-5" />,
    title: "Set up exam access",
    description: "Choose the package and capacity that fit your next exam plan.",
  },
  {
    number: "03",
    icon: <CheckCircleIcon className="h-5 w-5" />,
    title: "Run with clarity",
    description: "Keep learners, sessions, and progress in view as the day moves.",
  },
] as const;

export const HomeView = (): ReactElement => {
  const { isReady, session } = useSessionManager();
  const isOrganizationRegistered = isReady && Boolean(session?.tenantId);
  const examPlans = MOCK_HOME_PLANS.filter((plan) => plan.type === "EXAM_PACKAGE");
  const capacityPlans = MOCK_HOME_PLANS.filter((plan) => plan.type === "STUDENT_CAPACITY");

  return (
    <PublicShell>
      <section
        aria-labelledby="hero-title"
        className="relative isolate min-h-[44rem] overflow-hidden bg-[#0d2f51] text-white lg:min-h-[calc(100svh-4.5rem)]"
      >
        <Image
          src="/home/pte-operations-hero.png"
          alt="A PTE exam planning workspace with a laptop schedule, learner roster, calendar, and graduation cap."
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_50%] lg:object-center"
        />
        <div className="absolute inset-0 bg-[#081f36]/55 lg:bg-[#081f36]/15" aria-hidden="true" />

        <div className="relative mx-auto flex min-h-[44rem] max-w-7xl items-center px-5 py-16 lg:min-h-[calc(100svh-4.5rem)] lg:px-8 lg:py-20">
          <div className="home-rise max-w-2xl">
            <p className="text-sm font-semibold text-[#98d6ff]">
              PTE operations, without the guesswork.
            </p>
            <h1
              id="hero-title"
              className="mt-5 max-w-[11ch] text-[clamp(2.75rem,5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-balance"
            >
              From roster to result, keep every exam moving.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              PTE Prep gives organizations one clear place to prepare learners, plan access, and run
              exam days with confidence.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={AUTH_ROUTES.register}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#0d2f51] transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#e8f2f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d2f51]"
              >
                Register organization
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href={AUTH_ROUTES.login}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 px-5 text-sm font-semibold text-white transition-[background-color,border-color] duration-150 hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d2f51]"
              >
                Sign in
              </Link>
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#b7f0d7]" />
                <span>Plan access around real exam capacity.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#b7f0d7]" />
                <span>Keep the next operational step visible.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="value" aria-labelledby="value-title" className="bg-white py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[minmax(16rem,0.74fr)_minmax(0,1fr)] lg:gap-24 lg:px-8">
          <div className="home-rise self-start lg:sticky lg:top-28">
            <p className="text-sm font-semibold text-action">What gets easier</p>
            <h2
              id="value-title"
              className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 text-balance sm:text-4xl"
            >
              A calmer operating layer for every exam day.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
              The public starting point is simple: understand the path, choose the right access, and
              give your team a workspace that keeps the details together.
            </p>
          </div>

          <div className="home-rise home-rise-delay-1">
            <ValueRow
              icon={<UsersIcon className="h-5 w-5" />}
              title="See the whole learner picture"
              description="Keep your roster and exam capacity connected so planning decisions are based on the same view."
            />
            <ValueRow
              icon={<BookOpenIcon className="h-5 w-5" />}
              title="Choose access with context"
              description="Compare exam packages and student capacity add-ons in language your organization can act on."
            />
            <ValueRow
              icon={<ShieldIcon className="h-5 w-5" />}
              title="Make the next step obvious"
              description="From registration to an active workspace, the workflow keeps momentum without hiding the important details."
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="confidence-title" className="bg-white pb-20 lg:pb-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[minmax(0,1.06fr)_minmax(18rem,0.94fr)] lg:items-center lg:gap-20 lg:px-8">
          <div className="relative min-h-[22rem] overflow-hidden rounded-2xl bg-[#dce6ff] sm:min-h-[28rem]">
            <Image
              src="/home/team-planning.png"
              alt="Three education administrators reviewing an exam plan together in a bright training center."
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-[72%_50%]"
            />
            <div className="absolute bottom-5 left-5 rounded-xl bg-white/95 px-4 py-3 text-sm font-semibold text-[#0d2f51] shadow-[0_14px_30px_-20px_rgba(0,0,0,0.6)] sm:bottom-7 sm:left-7">
              People behind the plan
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-action">Built for real teams</p>
            <h2
              id="confidence-title"
              className="mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 text-balance sm:text-4xl"
            >
              Confidence comes from a shared view of the work.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              PTE Prep is designed for coordinators, teachers, and administrators who need the next
              decision to be clear — not buried in another tab or another spreadsheet.
            </p>
            <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              <li className="flex items-start gap-3 py-4 text-sm leading-6 text-slate-700">
                <CheckCircleIcon className="mt-1 h-4 w-4 shrink-0 text-[#0b8b70]" />
                <span>Practical information your team can use immediately.</span>
              </li>
              <li className="flex items-start gap-3 py-4 text-sm leading-6 text-slate-700">
                <CheckCircleIcon className="mt-1 h-4 w-4 shrink-0 text-[#0b8b70]" />
                <span>A calm starting point before the operational detail begins.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        id="workflow"
        aria-labelledby="workflow-title"
        className="border-y border-slate-200 bg-[#f2f6fa] py-20 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div>
              <p className="text-sm font-semibold text-action">How it works</p>
              <h2
                id="workflow-title"
                className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 text-balance sm:text-4xl"
              >
                Start with a clear path to exam day.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-slate-600">
              A short setup flow now, a better view of the work ahead later.
            </p>
          </div>

          <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-slate-200 lg:grid-cols-3">
            {WORKFLOW_STEPS.map((step) => (
              <li key={step.number} className="bg-white p-7 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f2f9] text-action">
                    {step.icon}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-slate-400">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-10 max-w-xs text-xl font-semibold leading-snug tracking-[-0.025em] text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="plans" aria-labelledby="plans-title" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-action">Access plans</p>
                <span className="rounded-full bg-[#fef5e5] px-3 py-1 text-xs font-semibold text-[#8a5700]">
                  Sample catalog
                </span>
              </div>
              <h2
                id="plans-title"
                className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 text-balance sm:text-4xl"
              >
                Choose the room your next exam needs.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              Start with exam access, add permanent student capacity when your roster grows, and
              keep the decision easy to revisit.
            </p>
          </div>

          <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <PlanGroup
              title="Exam packages"
              description="Time-bound access with a clear student cap per exam."
              icon={<BookOpenIcon className="h-5 w-5" />}
              plans={examPlans}
              isOrganizationRegistered={isOrganizationRegistered}
            />
            <PlanGroup
              title="Student capacity"
              description="Permanent quota add-ons, separate from exam packages."
              icon={<UsersIcon className="h-5 w-5" />}
              plans={capacityPlans}
              isOrganizationRegistered={isOrganizationRegistered}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="final-cta-title" className="bg-[#0d2f51] py-16 text-white lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-[#98d6ff]">Ready when you are</p>
            <h2
              id="final-cta-title"
              className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-balance sm:text-4xl"
            >
              Give your next exam day a clearer starting point.
            </h2>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href={AUTH_ROUTES.register}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#0d2f51] hover:bg-[#e8f2f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d2f51]"
            >
              Register organization
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href={AUTH_ROUTES.login}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/30 px-5 text-sm font-semibold text-white hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d2f51]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
};
