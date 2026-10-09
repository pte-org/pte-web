"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  ChevronRightIcon,
  Input,
  LicenseIcon,
  PageHeader,
} from "@pte/ui";
import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { AppBackButton } from "@/features/navigation/components/AppBackButton";
import { useRedeemLicense } from "../api";
import { BILLING_TEXT as T, REDEEM_ERROR_MESSAGES } from "../constants";
import { BillingPanel } from "./BillingPanel";

export const RedeemLicenseView = (): ReactElement => {
  const [code, setCode] = useState("");
  const redeem = useRedeemLicense();

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!code.trim()) return;
    await redeem.mutateAsync({ code: code.trim().toUpperCase() });
  };

  const error = redeem.error;
  const errorMessage = error instanceof ApiError
    ? error.status === 429
      ? T.TOO_MANY_REDEMPTIONS
      : (error.code ? REDEEM_ERROR_MESSAGES[error.code] : undefined) ??
        getUserFacingApiErrorMessage(error, T.REDEEM_ERROR)
    : error
      ? T.REDEEM_ERROR
      : undefined;

  return (
    <div className="flex flex-col gap-5">
      <AppBackButton href="/host/billing" label={T.BACK_TO_PLANS} />

      <PageHeader title={T.REDEEM_TITLE} subtitle={T.REDEEM_SUBTITLE} />
      {redeem.isSuccess && redeem.data && (
        <Alert tone="success" title={T.REDEEM_SUCCESS_TITLE}>
          {redeem.data.kind === "STUDENT_CAPACITY"
            ? T.STUDENT_SLOTS_ADDED(redeem.data.grantedStudentSlots ?? 0)
            : T.EXAM_PACKAGE_ACTIVATED(
                redeem.data.expiresAt
                  ? new Date(redeem.data.expiresAt).toLocaleDateString()
                  : undefined,
              )}
        </Alert>
      )}
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      <BillingPanel title={T.LICENSE_CODE_PANEL} subtitle={T.LICENSE_CODE_SUBTITLE}>
        <form className="max-w-xl space-y-4" onSubmit={(event) => void submit(event)}>
          <Input
            id="license-code"
            label={T.LICENSE_CODE_LABEL}
            placeholder={T.LICENSE_CODE_PLACEHOLDER}
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            required
          />
          <Button type="submit" isLoading={redeem.isPending} loadingText={T.REDEEMING}>
            {T.REDEEM}
          </Button>
        </form>
      </BillingPanel>
      <div className="pt-1">
        <Link
          href="/host/subscriptions"
          className="group inline-flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
            <LicenseIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-700">
              {T.VIEW_ACTIVE_ACCESS}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {T.ACTIVE_ACCESS_SUBTITLE}
            </p>
          </div>
          <ChevronRightIcon className="ml-3 h-4 w-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
        </Link>
      </div>
    </div>
  );
};
