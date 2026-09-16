"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, Input, PageHeader } from "@pte/ui";
import { BillingPanel } from "./BillingPanel";

export const RedeemLicenseView = (): ReactElement => {
  const [code, setCode] = useState("");
  const [redeemed, setRedeemed] = useState(false);

  const redeem = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!code.trim()) return;
    setRedeemed(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Redeem license code"
        subtitle="Activate an exam package provided by the platform team."
      />
      {redeemed && (
        <Alert tone="success" title="License redeemed">
          Exam Starter is active for 30 days.
        </Alert>
      )}
      <BillingPanel title="License code" subtitle="Enter the code exactly as provided.">
        <form className="max-w-xl space-y-4" onSubmit={redeem}>
          <Input
            id="license-code"
            label="License code"
            placeholder="PTE-START-7K2M-9Q4R"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            required
          />
          <Button type="submit">Redeem code</Button>
        </form>
      </BillingPanel>
      <Link
        href="/host/subscriptions"
        className="text-sm font-semibold text-action hover:underline"
      >
        View active access
      </Link>
    </div>
  );
};
