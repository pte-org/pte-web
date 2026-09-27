"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, PageHeader } from "@pte/ui";
import { getUserFacingApiErrorMessage, type PlatformSettingResponse } from "@pte/api-client";
import { usePlatformSettingsQuery, useUpdatePlatformSetting } from "../api";
import { PLATFORM_SETTINGS_TEXT as T } from "../constants";
import { CommercialPanel } from "./CommercialPanel";

const SETTING_KEYS = ["free_student_limit", "suspension_default_days"] as const;

export const PlatformSettingsView = (): ReactElement => {
  const { data: settings = [], isLoading, isError } = usePlatformSettingsQuery();
  const update = useUpdatePlatformSetting();
  const error = update.error;
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState("");

  const errorMessage = error
    ? getUserFacingApiErrorMessage(error, T.ERROR)
    : isError
      ? T.ERROR
      : undefined;

  const save = async (event: FormEvent<HTMLFormElement>, setting: PlatformSettingResponse): Promise<void> => {
    event.preventDefault();
    await update.mutateAsync({ key: setting.key, payload: { value: values[setting.key] ?? setting.value, description: setting.description ?? undefined } });
    setSaved(setting.key);
  };
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {saved && <Alert tone="success">{T.SAVED(saved)}</Alert>}
      <CommercialPanel title={T.PANEL_TITLE} subtitle={T.PANEL_SUBTITLE}>
        {isLoading && <p className="text-sm text-slate-500">{T.LOADING}</p>}
        <div className="space-y-5">
          {settings.filter((setting) => SETTING_KEYS.includes(setting.key as (typeof SETTING_KEYS)[number])).map((setting) => (
            <form key={setting.key} className="grid gap-4 border-b border-slate-100 pb-5 last:border-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-start" onSubmit={(event) => void save(event, setting)}>
              <Input
                id={`setting-${setting.key}`}
                label={setting.key}
                helperText={setting.description ?? undefined}
                type="number"
                min="0"
                value={values[setting.key] ?? setting.value}
                onChange={(event) => setValues({ ...values, [setting.key]: event.target.value })}
              />
              <div className="flex flex-col">
                <span aria-hidden="true" className="h-5" />
                <Button type="submit" className="sm:w-28" isLoading={update.isPending}>
                  {T.SAVE}
                </Button>
              </div>
            </form>
          ))}
        </div>
      </CommercialPanel>
    </div>
  );
};
