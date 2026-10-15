"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  Button,
  ConfirmDialog,
  DashboardPanel,
  FormActions,
  PageHeader,
  useToast,
} from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { usePlatformSettingsQuery, useUpdatePlatformSettings } from "../api";
import { PlatformSettingRow } from "./PlatformSettingRow";
import {
  PLATFORM_SETTING_CATEGORY,
  PLATFORM_SETTING_PRESENTATION,
  type PlatformSettingKey,
  PLATFORM_SETTINGS_TEXT as RAW_PLATFORM_SETTINGS_TEXT,
} from "../constants";
import { useAdminCopy } from "@/features/i18n/adminCopy";

type DraftValues = Record<string, string>;

export const PlatformSettingsView = (): ReactElement => {
  const T = useAdminCopy(RAW_PLATFORM_SETTINGS_TEXT);
  const presentations = useAdminCopy(PLATFORM_SETTING_PRESENTATION);
  const { showToast } = useToast();
  const {
    data: settings = [],
    isLoading,
    isError,
    refetch,
  } = usePlatformSettingsQuery();
  const update = useUpdatePlatformSettings();
  const [values, setValues] = useState<DraftValues>({});
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const editableSettings = useMemo(
    () =>
      settings.filter(
        (setting) =>
          setting.editable &&
          setting.category === PLATFORM_SETTING_CATEGORY &&
          setting.key in PLATFORM_SETTING_PRESENTATION,
      ),
    [settings],
  );

  const hasChanges = editableSettings.some(
    (setting) => values[setting.key] !== undefined && values[setting.key] !== setting.value,
  );
  const updateError = update.error
    ? getUserFacingApiErrorMessage(update.error, T.ERROR)
    : undefined;

  const save = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (update.isPending || !hasChanges) return;

    update.reset();
    try {
      await update.mutateAsync({
        settings: editableSettings.map((setting) => ({
          key: setting.key,
          value: values[setting.key] ?? setting.value,
        })),
      });
      showToast(T.SAVED, { tone: "success" });
    } catch (error) {
      showToast(getUserFacingApiErrorMessage(error, T.ERROR), { tone: "error" });
    }
  };

  const resetToDefaults = (): void => {
    setValues(
      Object.fromEntries(editableSettings.map((setting) => [setting.key, setting.defaultValue])),
    );
    update.reset();
    setIsResetDialogOpen(false);
  };

  const panelStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : editableSettings.length === 0
        ? "empty"
        : "content";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={T.TITLE} />
      <DashboardPanel
        title={T.PANEL_TITLE}
        subtitle={T.PANEL_SUBTITLE}
        status={panelStatus}
        loadingLabel={T.LOADING}
        error={{
          title: T.ERROR,
          description: T.ERROR,
          retryLabel: T.RETRY,
          onRetry: () => void refetch(),
        }}
        empty={{ title: T.NO_SETTINGS }}
      >
        {updateError && <Alert tone="error">{updateError}</Alert>}
        <form className="flex flex-col gap-5" onSubmit={(event) => void save(event)}>
          <div className="divide-y divide-[var(--shell-border)]">
            {editableSettings.map((setting) => {
              const presentation = presentations[setting.key as PlatformSettingKey];
              if (!presentation) return null;

              return (
                <PlatformSettingRow
                  key={setting.key}
                  setting={setting}
                  presentation={presentation}
                  value={values[setting.key] ?? setting.value}
                  onChange={(value) =>
                    setValues((current) => ({ ...current, [setting.key]: value }))
                  }
                />
              );
            })}
          </div>
          <FormActions align="between">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={update.isPending}
                onClick={() => setIsResetDialogOpen(true)}
              >
                {T.RESET}
              </Button>
              <span className="text-xs text-[var(--ink-muted)]">
                {hasChanges ? T.UNSAVED : T.UP_TO_DATE}
              </span>
            </div>
            <Button type="submit" isLoading={update.isPending} disabled={!hasChanges}>
              {update.isPending ? T.SAVING : T.SAVE}
            </Button>
          </FormActions>
        </form>
      </DashboardPanel>
      <ConfirmDialog
        open={isResetDialogOpen}
        title={T.RESET_TITLE}
        description={T.RESET_DESCRIPTION}
        confirmLabel={T.RESET_CONFIRM}
        cancelLabel={T.RESET_CANCEL}
        tone="warning"
        onConfirm={resetToDefaults}
        onClose={() => setIsResetDialogOpen(false)}
      />
    </div>
  );
};
