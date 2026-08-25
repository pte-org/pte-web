"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  GradCapIcon,
  LockIcon,
  MailIcon,
  SsoButtons,
  useSessionManager,
  type SessionRole,
} from "@aptis/ui";
import { decodeAccessTokenClaims } from "@aptis/api-client";
import { useLoginHost } from "../api";
import { AUTH_ROUTES, AUTH_TEXT } from "../constants";
import { getLoginErrorMessage } from "../loginError";
import { AuthBrandPanel } from "./_AuthBrandPanel";

const SESSION_ROLES: readonly SessionRole[] = [
  "PLATFORM_ADMIN",
  "PLATFORM_AUTHOR",
  "HOST_ADMIN",
  "HOST_AUTHOR",
  "PROCTOR",
  "STUDENT",
];

function toSessionRoles(rawRoles: string[]): SessionRole[] {
  return rawRoles.filter((role): role is SessionRole =>
    (SESSION_ROLES as readonly string[]).includes(role),
  );
}

const FIELD_WRAP_CLASS =
  "flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 focus-within:border-blue-500";
const INPUT_CLASS = "w-full bg-transparent py-2.5 text-sm outline-none";
const LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-wide text-gray-500";

export const LoginView = (): ReactElement => {
  const router = useRouter();
  const { saveSession } = useSessionManager();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const mutation = useLoginHost();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage(AUTH_TEXT.EMPTY_FIELDS);
      return;
    }
    setErrorMessage(undefined);
    mutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (data) => {
          const claims = decodeAccessTokenClaims(data.accessToken);
          const roles = claims ? toSessionRoles(claims.roles) : [];
          if (!claims || roles.length === 0) {
            // Decode failure and "decoded but no recognized role" must fail
            // the same way — an empty-roles session would still pass
            // isAuthenticated while every hasRole() check silently returns
            // false forever, instead of a clear error.
            setErrorMessage(AUTH_TEXT.GENERIC_ERROR);
            return;
          }
          saveSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            roles,
            tenantId: claims.tenantId,
            expiresAt: claims.expiresAt || Date.now() + data.expiresInSeconds * 1000,
          });
          router.replace(AUTH_ROUTES.hostDashboard);
        },
        onError: (error) => setErrorMessage(getLoginErrorMessage(error)),
      },
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <AuthBrandPanel />
        <div className="flex flex-col justify-center gap-6 p-8 md:p-10">
          <div className="flex items-center gap-2 text-blue-800">
            <GradCapIcon className="h-6 w-6" />
            <span className="text-lg font-bold">{AUTH_TEXT.BRAND}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {AUTH_TEXT.WELCOME_TITLE}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {AUTH_TEXT.WELCOME_SUBTITLE}
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className={LABEL_CLASS}>
                {AUTH_TEXT.EMAIL_LABEL}
              </label>
              <div className={FIELD_WRAP_CLASS}>
                <MailIcon className="h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={AUTH_TEXT.EMAIL_PLACEHOLDER}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className={LABEL_CLASS}>
                  {AUTH_TEXT.PASSWORD_LABEL}
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  {AUTH_TEXT.FORGOT}
                </a>
              </div>
              <div className={FIELD_WRAP_CLASS}>
                <LockIcon className="h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? AUTH_TEXT.HIDE_PASSWORD
                      : AUTH_TEXT.SHOW_PASSWORD
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon closed={showPassword} className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-blue-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-950 disabled:opacity-60"
            >
              {mutation.isPending
                ? AUTH_TEXT.LOGGING_IN
                : AUTH_TEXT.LOGIN_BUTTON}
            </button>
          </form>

          <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            {AUTH_TEXT.OR_CONTINUE}
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <SsoButtons
            googleLabel={AUTH_TEXT.SSO_GOOGLE}
            microsoftLabel={AUTH_TEXT.SSO_MICROSOFT}
          />

        </div>
      </div>
    </main>
  );
};
