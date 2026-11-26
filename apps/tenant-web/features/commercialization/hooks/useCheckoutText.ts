"use client";

import { useLocale } from "@pte/ui";
import { CHECKOUT_TEXT } from "../constants";

type CheckoutTextKey = keyof typeof CHECKOUT_TEXT;
type CheckoutValues = Record<string, string | number>;

export interface CheckoutText {
  text: Record<CheckoutTextKey, string>;
  /** A message with `{name}` placeholders filled in. */
  format: (key: CheckoutTextKey, values: CheckoutValues) => string;
}

/** The checkout copy in the language of the screen; English comes from the constants. */
export const useCheckoutText = (): CheckoutText => {
  const { t } = useLocale();
  const text = Object.fromEntries(
    Object.entries(CHECKOUT_TEXT).map(([key, fallback]) => [key, t(`tenant.billing.checkout.${key}`, fallback)]),
  ) as Record<CheckoutTextKey, string>;
  return {
    text,
    format: (key, values) => t(`tenant.billing.checkout.${key}`, CHECKOUT_TEXT[key], values),
  };
};
