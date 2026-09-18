"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, Input, PageHeader } from "@pte/ui";
import { ApiError } from "@pte/api-client";
import { useRedeemLicense } from "../api";
import { REDEEM_ERROR_MESSAGES } from "../constants";
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
      ? "Too many redemption attempts. Try again in a few minutes."
      : REDEEM_ERROR_MESSAGES[error.message] ?? error.message
    : error
      ? "The license code could not be redeemed."
      : undefined;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Redeem license code" subtitle="Activate an exam package provided by the platform team." />
      {redeem.isSuccess && redeem.data && <Alert tone="success" title="License redeemed">{redeem.data.kind === "STUDENT_CAPACITY" ? `Added ${redeem.data.grantedStudentSlots ?? 0} student slots. Check Student capacity for the new limit.` : `Exam package activated${redeem.data.expiresAt ? ` until ${new Date(redeem.data.expiresAt).toLocaleDateString()}` : ""}. Check Active access for the subscription.`}</Alert>}
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      <BillingPanel title="License code" subtitle="Enter the code exactly as provided.">
        <form className="max-w-xl space-y-4" onSubmit={(event) => void submit(event)}>
          <Input id="license-code" label="License code" placeholder="PTE-START-7K2M-9Q4R" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} required />
          <Button type="submit" isLoading={redeem.isPending} loadingText="Redeeming...">Redeem code</Button>
        </form>
      </BillingPanel>
      <Link href="/host/subscriptions" className="text-sm font-semibold text-action hover:underline">View active access</Link>
    </div>
  );
};
