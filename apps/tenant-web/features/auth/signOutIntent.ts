/**
 * Set by an explicit sign-out: that user goes straight to the login page instead of seeing the 401 page
 * that a signed-out visitor of a protected page gets. Cleared once a session exists again.
 */
let signingOut = false;

export function markSigningOut(): void {
  signingOut = true;
}

export function clearSigningOut(): void {
  signingOut = false;
}

export function isSigningOut(): boolean {
  return signingOut;
}
