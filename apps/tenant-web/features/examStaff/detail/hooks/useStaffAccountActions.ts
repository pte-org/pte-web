"use client";

import { useState } from "react";
import type { ExamStaffAccountResponse } from "@pte/api-client";
import { BanIcon, MailIcon, ShieldIcon, type DropdownItem } from "@pte/ui";
import {
  useGenerateStudentCredentials, useSendUserCredentials, type GeneratedCredentials,
} from "@/features/userManagement";
import { useReactivateExamStaff, useSuspendExamStaff } from "../../api";
import type { StaffDetailText } from "./useStaffDetailText";

type AccountCommand = "send" | "suspend" | "reactivate";

export const useStaffAccountActions = (
  account: ExamStaffAccountResponse | undefined, text: StaffDetailText,
): {
  items: DropdownItem[]; command: AccountCommand | null; pending: boolean;
  error: string | null; sent: boolean; confirm: () => void; close: () => void;
  credentials: GeneratedCredentials | null; closeCredentials: () => void;
} => {
  const [command, setCommand] = useState<AccountCommand | null>(null);
  const [sent, setSent] = useState(false);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const generate = useGenerateStudentCredentials();
  const send = useSendUserCredentials();
  const suspend = useSuspendExamStaff();
  const reactivate = useReactivateExamStaff();
  const pending = generate.isPending || send.isPending || suspend.isPending || reactivate.isPending;
  const reset = (): void => {
    generate.reset(); send.reset(); suspend.reset(); reactivate.reset(); setSent(false);
  };
  const select = (value: AccountCommand): void => { reset(); setCommand(value); };
  const error = generate.error ? text.generateFailed
    : send.error ? text.credentialsFailed
      : suspend.error || reactivate.error ? text.genericError : null;
  const confirm = (): void => {
    if (!account || pending || !command) return;
    // The emailed password is never shown on screen; only the generate action reveals it.
    if (command === "send") send.mutate(account.publicId, { onSuccess: () => {
      setCommand(null); setSent(true);
    } });
    else (command === "suspend" ? suspend : reactivate).mutate(account.publicId, {
      onSuccess: () => setCommand(null),
    });
  };
  return {
    command, pending, error, sent, confirm, credentials,
    close: () => { if (!pending) { setCommand(null); reset(); } },
    closeCredentials: () => setCredentials(null),
    items: [
      { label: text.generatePassword, icon: ShieldIcon, disabled: !account || pending,
        onSelect: () => {
          if (!account) return;
          reset();
          generate.mutate(account.publicId, { onSuccess: setCredentials });
        } },
      { label: text.sendCredentials, icon: MailIcon, disabled: !account?.canSendCredentials || pending,
        title: account?.canSendCredentials ? undefined : text.sendNoEmail,
        onSelect: () => select("send") },
      { separator: true, key: "staff-lifecycle-separator" },
      account?.status === "SUSPENDED"
        ? { label: text.reactivate, icon: ShieldIcon, disabled: pending, onSelect: () => select("reactivate") }
        : { label: text.suspend, icon: BanIcon, danger: true, disabled: pending, onSelect: () => select("suspend") },
    ],
  };
};
