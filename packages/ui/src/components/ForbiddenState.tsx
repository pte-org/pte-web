"use client";

import type { ReactElement, ReactNode } from "react";
import { useLocale } from "../i18n";
import { ShieldIcon } from "./icons";

interface ForbiddenStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export const ForbiddenState = ({
  title,
  description,
  action,
}: ForbiddenStateProps): ReactElement => {
  const { t } = useLocale();
  const resolvedTitle = title ?? t("common.forbiddenTitle", "You do not have access");
  const resolvedDescription = description ?? t(
    "common.forbiddenDescription",
    "The current account is not allowed to perform this action.",
  );

  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--shell-border)] bg-[var(--surface-card)] p-8 text-center">
      <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-[var(--cream-tint)] text-[var(--cream-action)]">
        <ShieldIcon className="h-5 w-5" />
      </span>
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">{resolvedTitle}</h2>
      <p className="mt-1 max-w-md text-sm text-[var(--ink-secondary)]">{resolvedDescription}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
