import type { ReactElement } from "react";

const LOADING_LABEL = "Loading";

export const AuthLoading = (): ReactElement => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div
      role="status"
      aria-label={LOADING_LABEL}
      className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
    />
  </div>
);
