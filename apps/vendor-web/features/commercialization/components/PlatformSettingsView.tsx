"use client";

import { useMemo, useRef, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  DashboardPanel,
  FormActions,
  InfoIcon,
  PageHeader,
  SlidersHorizontalIcon,
  useToast,
  UnsavedChangesGuard,
  useLeaveAfterSave,
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
  const leaveAfterSave = useLeaveAfterSave();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

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
  // Every field already holds its default: nothing to restore.
  const atDefaults = editableSettings.every((setting) => (values[setting.key] ?? setting.value) === setting.defaultValue);
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
      leaveAfterSave.settle();
    } catch (error) {
      showToast(getUserFacingApiErrorMessage(error, T.ERROR), { tone: "error" });
    }
  };

  // Only fills the fields, so the defaults can be checked before Save writes anything.
  const resetToDefaults = (): void => {
    setValues(
      Object.fromEntries(editableSettings.map((setting) => [setting.key, setting.defaultValue])),
    );
    update.reset();
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
      <div className="space-y-2">
        <PageHeader title={T.TITLE} />
        <p className="text-sm text-[var(--ink-secondary)]">{T.DESCRIPTION}</p>
      </div>
      <DashboardPanel
        title={T.PANEL_TITLE}
        subtitle={T.PANEL_SUBTITLE}
        icon={<SlidersHorizontalIcon className="h-4 w-4" />}
        divided
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
        <form ref={formRef} className="flex flex-col gap-5" onSubmit={(event) => void save(event)}>
          <div className="divide-y divide-[var(--shell-border)]">
            {editableSettings.map((setting) => {
              const presentation = presentations[setting.key as PlatformSettingKey];
              if (!presentation) return null;

              return (
                <PlatformSettingRow
                  key={setting.key}
                  setting={setting}
                  presentation={presentation}
                  text={T}
                  value={values[setting.key] ?? setting.value}
                  onChange={(value) =>
                    setValues((current) => ({ ...current, [setting.key]: value }))
                  }
                />
              );
            })}
          </div>
          <p className="flex items-start gap-2 rounded-lg border border-[var(--sky-action)]/25 bg-[var(--sky-tint)]/60 px-3.5 py-3 text-sm text-[var(--ink-secondary)]">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sky-action)]" />
            {T.IMPACT_NOTE}
          </p>
          <FormActions align="between">
            <span className={`inline-flex items-center gap-2 text-sm ${hasChanges ? "text-[var(--ink-secondary)]" : "text-[var(--mint-action)]"}`}>
              {hasChanges ? (
                <>
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--cream-action)]" />
                  {T.UNSAVED}
                </>
              ) : (
                <>✓ {T.UP_TO_DATE}</>
              )}
            </span>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <Button type="button" variant="secondary" disabled={update.isPending || atDefaults} onClick={resetToDefaults}>
                {T.RESET}
              </Button>
              <Button type="submit" isLoading={update.isPending} disabled={!hasChanges}>
                {update.isPending ? T.SAVING : T.SAVE}
              </Button>
            </div>
          </FormActions>
        </form>
        <UnsavedChangesGuard
          isDirty={hasChanges}
          isSaving={update.isPending}
          onSaveAndLeave={(proceed) => leaveAfterSave.request(proceed, () => formRef.current?.requestSubmit())}
          onNavigate={(href) => router.push(href)}
        />
      </DashboardPanel>
    </div>
  );
};
