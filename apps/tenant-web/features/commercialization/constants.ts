export const TENANT_PLANS_QUERY_KEY = ["commercialization", "tenant-plans"] as const;
export const ORDERS_QUERY_KEY = ["commercialization", "orders"] as const;
export const SUBSCRIPTIONS_QUERY_KEY = ["commercialization", "subscriptions"] as const;
export const STUDENT_QUOTA_QUERY_KEY = ["commercialization", "student-quota"] as const;

export const REDEEM_ERROR_MESSAGES: Record<string, string> = {
  LICENSE_CODE_NOT_FOUND: "License code was not found. Check the code and try again.",
  LICENSE_CODE_ALREADY_REDEEMED: "This license code has already been redeemed.",
  LICENSE_CODE_REVOKED: "This license code was revoked. Contact the issuer.",
  LICENSE_CODE_EXPIRED: "This license code has expired.",
  LICENSE_CODE_NOT_REDEEMABLE: "This license code cannot be redeemed.",
};
