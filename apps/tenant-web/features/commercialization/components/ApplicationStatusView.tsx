"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, CheckCircleIcon, GlobeIcon, Input } from "@pte/ui";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { PublicShell } from "@/features/public/components";

export const ApplicationStatusView = (): ReactElement => {
  const [reference, setReference] = useState("APP-2026-104821");
  const [searched, setSearched] = useState(true);

  const search = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSearched(Boolean(reference.trim()));
  };

  return (
    <PublicShell>
      <section className="mx-auto max-w-2xl px-5 py-12 sm:py-16 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <GlobeIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-action">
                Application status
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Track your organization request
              </h1>
            </div>
          </div>
          <form className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={search}>
            <div className="flex-1">
              <Input
                id="application-reference"
                label="Application reference"
                placeholder="APP-2026-104821"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </div>
            <Button type="submit">Check status</Button>
          </form>

          {searched && (
            <div className="mt-7 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Bright English Center</p>
                  <p className="mt-1 text-xs text-slate-500">Submitted Sep 16, 2026</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  PENDING
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Submitted", true],
                  ["Under review", true],
                  ["Workspace access", false],
                ].map(([label, complete]) => (
                  <div key={String(label)} className="flex items-center gap-2 text-sm">
                    <CheckCircleIcon
                      className={`h-4 w-4 ${complete ? "text-emerald-600" : "text-slate-300"}`}
                    />
                    <span className={complete ? "text-slate-900" : "text-slate-400"}>{label}</span>
                  </div>
                ))}
              </div>
              <Alert className="mt-6" tone="info">
                We will email the representative when the review is complete.
              </Alert>
            </div>
          )}
          <div className="mt-7 flex flex-wrap gap-4 text-sm">
            <Link href={AUTH_ROUTES.register} className="font-semibold text-action hover:underline">
              Register another organization
            </Link>
            <Link href={AUTH_ROUTES.login} className="font-semibold text-action hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
};
