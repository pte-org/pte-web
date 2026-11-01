/** A reset link carries its token in the address, so no request these pages trigger may send the page address on. */
export const AUTH_PORTAL_METADATA = { referrer: "no-referrer" } as const;
