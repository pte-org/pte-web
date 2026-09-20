"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, PageHeader } from "@pte/ui";
import { ApiError, type PlatformSettingResponse } from "@pte/api-client";
import { usePlatformSettingsQuery, useUpdatePlatformSetting } from "../api";
import { CommercialPanel } from "./CommercialPanel";

const SETTING_KEYS = ["free_student_limit", "suspension_default_days"] as const;

export const PlatformSettingsView = (): ReactElement => {
  const { data: settings = [], isLoading, isError } = usePlatformSettingsQuery();
  const update = useUpdatePlatformSetting();
  const error = update.error;
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState("");

  const errorMessage = error instanceof ApiError ? error.message : error ? "Settings could not be loaded or saved." : isError ? "Settings could not be loaded or saved." : undefined;

  const save = async (event: FormEvent<HTMLFormElement>, setting: PlatformSettingResponse): Promise<void> => {
    event.preventDefault();
    await update.mutateAsync({ key: setting.key, payload: { value: values[setting.key] ?? setting.value, description: setting.description ?? undefined } });
    setSaved(setting.key);
  };
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Platform settings" subtitle="Set defaults used by tenant subscriptions and quota checks." />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {saved && <Alert tone="success">Setting {saved} saved.</Alert>}
      <CommercialPanel title="Commercial defaults" subtitle="These values are controlled by platform administrators.">
        {isLoading && <p className="text-sm text-slate-500">Loading settings...</p>}
        <div className="space-y-5">
          {settings.filter((setting) => SETTING_KEYS.includes(setting.key as (typeof SETTING_KEYS)[number])).map((setting) => (
            <form key={setting.key} className="grid gap-4 border-b border-slate-100 pb-5 last:border-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={(event) => void save(event, setting)}>
              <Input
                id={`setting-${setting.key}`}
                label={setting.key}
                helperText={setting.description ?? undefined}
                type="number"
                min="0"
                value={values[setting.key] ?? setting.value}
                onChange={(event) => setValues({ ...values, [setting.key]: event.target.value })}
              />
              <Button type="submit" isLoading={update.isPending}>Save</Button>
            </form>
          ))}
        </div>
      </CommercialPanel>
    </div>
  );
};
