import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import type { AiStatusResponse } from "@pte/api-client";
import { Badge, DashboardPanel, LockIcon } from "@pte/ui";
import { AI_PROMPTS_PATH, type AiAdminCopy } from "../constants";

interface AiStatusPanelProps {
  status: AiStatusResponse;
  copy: AiAdminCopy;
}

const fill = (template: string, values: Record<string, string | number>): string =>
  Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);

const LABEL = "text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]";

/** One short fact: a small label over its value. */
const Fact = ({ label, children }: { label: string; children: ReactNode }): ReactElement => (
  <div className="min-w-0">
    <dt className={LABEL}>{label}</dt>
    <dd className="mt-1.5 text-sm font-medium text-[var(--ink-primary)]">{children}</dd>
  </div>
);

interface ProviderBoxProps {
  label: string;
  host: string;
  /** The provider's web page, sent by the server without any user info or query. */
  webUrl: string;
  keyPresent: boolean;
  copy: AiAdminCopy;
}

/** A provider in a box of its own: its name and key state on top, its host below as a technical value. */
const ProviderBox = ({ label, host, webUrl, keyPresent, copy }: ProviderBoxProps): ReactElement => (
  <div className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-subtle)] px-4 py-3">
    <div className="flex items-center justify-between gap-3">
      <span className={LABEL}>{label}</span>
      <Badge variant={keyPresent ? "success" : "warning"}>{keyPresent ? copy.KEY_SET : copy.KEY_MISSING}</Badge>
    </div>
    <p className="mt-2 break-all font-mono text-sm text-[var(--ink-primary)]">
      {host && webUrl ? (
        <Link href={webUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-[var(--action)] hover:underline">
          {host}
        </Link>
      ) : (
        host || copy.NOT_SET
      )}
    </p>
  </div>
);

/** How question generation is set up: the status beside the title, four short facts, the two providers, the key note. */
export const AiStatusPanel = ({ status, copy }: AiStatusPanelProps): ReactElement => (
  <DashboardPanel
    title={copy.STATUS_PANEL}
    actions={
      <Badge variant={status.generationEnabled ? "success" : "neutral"}>
        {status.generationEnabled ? copy.ENABLED : copy.DISABLED}
      </Badge>
    }
  >
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
        <Fact label={copy.TASK_TYPES}>{fill(copy.TASK_TYPES_VALUE, { count: status.supportedTaskTypes })}</Fact>
        <Fact label={copy.PROMPT_VERSION}>
          <Link href={AI_PROMPTS_PATH} className="text-[var(--action)] hover:underline">
            {fill(copy.PROMPT_VERSION_VALUE, { version: status.promptVersion })} ↗
          </Link>
        </Fact>
        <Fact label={copy.GENERATOR_MODEL}>{status.generatorModel}</Fact>
        <Fact label={copy.REVIEWER_MODEL}>{status.reviewerModel}</Fact>
      </dl>
      <div className="grid gap-4 md:grid-cols-2">
        <ProviderBox label={copy.PROVIDER} host={status.providerHost} webUrl={status.providerWebUrl} keyPresent={status.providerKeyConfigured} copy={copy} />
        <ProviderBox label={copy.SPEECH} host={status.speechHost} webUrl={status.speechWebUrl} keyPresent={status.speechKeyConfigured} copy={copy} />
      </div>
      <p className="flex items-start gap-2 rounded-lg bg-[var(--surface-subtle)] px-3.5 py-3 text-sm text-[var(--ink-secondary)]">
        <LockIcon className="mt-0.5 h-4 w-4 shrink-0" />
        {copy.SECRETS_NOTE}
      </p>
    </div>
  </DashboardPanel>
);
