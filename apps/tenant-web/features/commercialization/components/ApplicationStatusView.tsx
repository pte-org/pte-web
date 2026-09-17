"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { CheckCircleIcon, GlobeIcon } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PublicShell } from "@/features/public/components";

export const ApplicationStatusView = (): ReactElement => (
  <PublicShell>
    <section className="mx-auto max-w-2xl px-5 py-12 sm:py-16 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><GlobeIcon className="h-5 w-5" /></span>
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-action">Application status</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">What happens after registration?</h1></div>
        </div>
        <div className="mt-7 space-y-4">
          {[
            ["Application received", "Your organization details are stored and assigned an application ID."],
            ["Platform review", "A platform administrator validates the organization and requested tenant code."],
            ["Workspace access", "After approval, the platform administrator provides the one-time host admin credentials."],
          ].map(([title, description]) => <div key={title} className="flex gap-3"><CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div></div>)}
        </div>
        <div className="mt-7 rounded-md bg-sky-50 px-4 py-3 text-sm text-sky-700">There is no public status lookup endpoint yet. Keep the application ID and monitor the contact email supplied in the form.</div>
        <div className="mt-7 flex flex-wrap gap-4 text-sm"><Link href={AUTH_ROUTES.register} className="font-semibold text-action hover:underline">Register another organization</Link><Link href={AUTH_ROUTES.login} className="font-semibold text-action hover:underline">Sign in</Link></div>
      </div>
    </section>
  </PublicShell>
);
