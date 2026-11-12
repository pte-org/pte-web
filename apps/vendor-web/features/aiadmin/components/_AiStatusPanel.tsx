import type { ReactElement } from "react";
import Link from "next/link";
import type { AiStatusResponse } from "@pte/api-client";
import { Badge, DashboardPanel, DescriptionList } from "@pte/ui";
import type { AiAdminCopy } from "../constants";

interface AiStatusPanelProps {
  status: AiStatusResponse;
  copy: AiAdminCopy;
}

const KeyBadge = ({ present, copy }: { present: boolean; copy: AiAdminCopy }): ReactElement => (
  <Badge variant={present ? "success" : "warning"}>{present ? copy.KEY_SET : copy.KEY_MISSING}</Badge>
);

interface ProviderValueProps {
  host: string;
  /** The provider's web page, sent by the server without any user info or query. */
  webUrl: string;
  keyPresent: boolean;
  copy: AiAdminCopy;
}

const ProviderValue = ({ host, webUrl, keyPresent, copy }: ProviderValueProps): ReactElement => (
  <span className="flex flex-wrap items-center gap-2">
    {host && webUrl ? (
      <Link href={webUrl} target="_blank" rel="noopener noreferrer"
        className="text-[var(--action)] underline-offset-2 hover:underline">{host}</Link>
    ) : (
      <span>{host || copy.NOT_SET}</span>
    )}
    <KeyBadge present={keyPresent} copy={copy} />
  </span>
);

export const AiStatusPanel = ({ status, copy }: AiStatusPanelProps): ReactElement => (
  <DashboardPanel title={copy.STATUS_PANEL}>
    <DescriptionList
      items={[
        {
          label: copy.STATUS_PANEL,
          value: (
            <Badge variant={status.generationEnabled ? "success" : "neutral"}>
              {status.generationEnabled ? copy.ENABLED : copy.DISABLED}
            </Badge>
          ),
        },
        { label: copy.TASK_TYPES, value: status.supportedTaskTypes },
        { label: copy.GENERATOR_MODEL, value: status.generatorModel },
        { label: copy.REVIEWER_MODEL, value: status.reviewerModel },
        {
          label: copy.PROVIDER,
          value: <ProviderValue host={status.providerHost} webUrl={status.providerWebUrl} keyPresent={status.providerKeyConfigured} copy={copy} />,
        },
        {
          label: copy.SPEECH,
          value: <ProviderValue host={status.speechHost} webUrl={status.speechWebUrl} keyPresent={status.speechKeyConfigured} copy={copy} />,
        },
        { label: copy.PROMPT_VERSION, value: status.promptVersion },
      ]}
    />
    <p className="mt-4 text-sm text-[var(--ink-secondary)]">{copy.SECRETS_NOTE}</p>
  </DashboardPanel>
);
