"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, PageHeader } from "@pte/ui";
import { CommercialPanel } from "./CommercialPanel";

export const PlatformSettingsView = (): ReactElement => {
  const [freeLimit, setFreeLimit] = useState("100");
  const [suspensionDays, setSuspensionDays] = useState("14");
  const [saved, setSaved] = useState(false);

  const save = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Platform settings"
        subtitle="Set the defaults used by tenant subscriptions and quota checks."
      />
      {saved && <Alert tone="success">Settings saved for this preview.</Alert>}
      <CommercialPanel
        title="Commercial defaults"
        subtitle="These values can be changed by platform administrators."
      >
        <form className="max-w-xl space-y-5" onSubmit={save}>
          <Input
            id="free-student-limit"
            label="Free student limit"
            helperText="Students included for every approved tenant before add-ons."
            type="number"
            min="0"
            value={freeLimit}
            onChange={(event) => setFreeLimit(event.target.value)}
          />
          <Input
            id="suspension-default-days"
            label="Default suspension period"
            helperText="Number of days used when a tenant is suspended."
            type="number"
            min="1"
            value={suspensionDays}
            onChange={(event) => setSuspensionDays(event.target.value)}
          />
          <Button type="submit">Save settings</Button>
        </form>
      </CommercialPanel>
      <CommercialPanel title="Business rules" subtitle="Reference rules for the onboarding flow.">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Approval", "A tenant must be approved before purchasing."],
            ["Exam package", "Each session uses the package student cap."],
            ["Capacity add-on", "Additional student slots do not expire."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </CommercialPanel>
    </div>
  );
};
