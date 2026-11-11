/** The query parameter carrying the page to return to after signing in. */
export const RETURN_PATH_PARAM = "next";

const HOME_PATH = "/";

/** The sign-in address that brings the user back to {@code path} afterwards. */
export function signInHref(loginPath: string, path: string): string {
  return isAppPath(path) && path !== HOME_PATH && !path.startsWith(loginPath)
    ? `${loginPath}?${RETURN_PATH_PARAM}=${encodeURIComponent(path)}`
    : loginPath;
}

/** The requested page of this app after signing in, or null when there is none; other sites are never followed. */
export function returnPath(search: string, loginPath: string): string | null {
  const requested = new URLSearchParams(search).get(RETURN_PATH_PARAM);
  return requested && isAppPath(requested) && !requested.startsWith(loginPath) ? requested : null;
}

// One leading slash only: "//host" and "/\host" are read by browsers as another site.
function isAppPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");
}
