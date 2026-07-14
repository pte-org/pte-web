"use client";

import { useState, type ReactElement } from "react";
import { CheckCircleIcon, CopyIcon, InfoIcon, Modal, cn } from "@aptis/ui";
import {
  TENANT_CREATED_TEXT,
  TENANT_LOGIN_CREDENTIAL_TEXT,
} from "../constants";
import type { TenantCreationResult } from "../types";

interface TenantCreatedModalProps {
  /** The creation result; `null` keeps the modal closed. */
  result: TenantCreationResult | null;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

const T = TENANT_CREATED_TEXT;
const COPIED_LABEL = "Copied";

const fallbackCopyToClipboard = (text: string): boolean => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back for browsers that expose Clipboard API but reject the call.
  }

  return fallbackCopyToClipboard(text);
};

const CopyField = ({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string;
  isLink?: boolean;
}): ReactElement => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <span
        className={cn(
          "flex-1 truncate text-sm",
          isLink ? "text-blue-600" : "font-mono text-gray-800",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={T.COPY_ARIA}
        onClick={() => {
          void copyToClipboard(value);
        }}
        className="text-gray-400 hover:text-gray-600"
      >
        <CopyIcon className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export const TenantCreatedModal = ({
  result,
  onClose,
  title = T.TITLE,
  subtitle = T.SUBTITLE,
}: TenantCreatedModalProps): ReactElement => {
  const [copiedAll, setCopiedAll] = useState(false);

  const copyAll = async (): Promise<void> => {
    if (!result) return;
    const copied = await copyToClipboard(
      `${T.NAME_LABEL}: ${result.tenant.name}\n` +
        `${TENANT_LOGIN_CREDENTIAL_TEXT.EMAIL_LABEL}: ${result.loginEmail}\n` +
        `${T.ACTIVATION_LABEL}: ${result.activationCode}\n` +
        `${T.LOGIN_URL_LABEL}: ${result.loginUrl}`,
    );
    if (!copied) return;

    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 1800);
  };

  return (
    <Modal
      open={result !== null}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.CLOSE}
          </button>
          <button
            type="button"
            onClick={() => {
              void copyAll();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <CopyIcon className="h-4 w-4" />
            {copiedAll ? COPIED_LABEL : T.COPY_ALL}
          </button>
        </>
      }
    >
      {result && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="max-w-sm text-sm text-gray-500">{subtitle}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">{T.NAME_LABEL}</p>
            <p className="font-semibold text-gray-900">{result.tenant.name}</p>
            <hr className="my-3 border-gray-200" />
            <div className="flex flex-col gap-3">
              <CopyField
                label={TENANT_LOGIN_CREDENTIAL_TEXT.EMAIL_LABEL}
                value={result.loginEmail}
              />
              <CopyField
                label={TENANT_LOGIN_CREDENTIAL_TEXT.PASSWORD_LABEL}
                value={result.activationCode}
              />
              <CopyField label={T.LOGIN_URL_LABEL} value={result.loginUrl} isLink />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <span>{T.NOTICE}</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
