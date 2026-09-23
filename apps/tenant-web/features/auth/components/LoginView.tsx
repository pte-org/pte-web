"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, LockIcon, MailIcon, useSessionManager, type SessionRole } from "@pte/ui";
import {
  decodeAccessTokenClaims,
  type LoginOrganizationOption,
  type JwtTokenResponse,
} from "@pte/api-client";
import { useLoginHost, useLoginOrganizationOptions } from "../api";
import { AUTH_ROUTES, AUTH_TEXT } from "../constants";
import { getLoginErrorMessage } from "../loginError";
import { AuthBrandPanel } from "./_AuthBrandPanel";

const SESSION_ROLES: readonly SessionRole[] = [
  "PLATFORM_ADMIN",
  "PLATFORM_AUTHOR",
  "HOST_ADMIN",
  "EXAMINER",
  "PROCTOR",
  "STUDENT",
];

function toSessionRoles(rawRoles: string[]): SessionRole[] {
  return rawRoles.filter((role): role is SessionRole =>
    (SESSION_ROLES as readonly string[]).includes(role),
  );
}

const FIELD_WRAP_CLASS =
  "flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100";
const INPUT_CLASS = "w-full bg-transparent py-2.5 text-sm outline-none";
const LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide text-gray-500";

export const LoginView = (): ReactElement => {
  const router = useRouter();
  const { saveSession } = useSessionManager();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organizationOptions, setOrganizationOptions] = useState<LoginOrganizationOption[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const mutation = useLoginHost();
  const organizationMutation = useLoginOrganizationOptions();

  const handleLoginSuccess = (data: JwtTokenResponse): void => {
    const claims = decodeAccessTokenClaims(data.accessToken);
    const roles = claims ? toSessionRoles(claims.roles) : [];
    if (!claims || roles.length === 0) {
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
    router.replace(
      roles.includes("EXAMINER") && !roles.includes("HOST_ADMIN")
        ? AUTH_ROUTES.examinerWork
        : AUTH_ROUTES.hostDashboard,
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage(AUTH_TEXT.EMPTY_FIELDS);
      return;
    }
    if (organizationOptions.length > 0 && !organizationId) {
      setErrorMessage(AUTH_TEXT.ORGANIZATION_REQUIRED);
      return;
    }
    setErrorMessage(undefined);
    try {
      const trimmedUsername = username.trim();
      let selectedOrganizationId = organizationId || undefined;
      if (!selectedOrganizationId && organizationOptions.length === 0) {
        const options = await organizationMutation.mutateAsync({
          username: trimmedUsername,
          password,
        });
        if (options.length > 1) {
          setOrganizationOptions(options);
          return;
        }
        selectedOrganizationId = options[0]?.tenantId;
      }
      const data = await mutation.mutateAsync({
        username: trimmedUsername,
        password,
        ...(selectedOrganizationId ? { tenantId: selectedOrganizationId } : {}),
      });
      handleLoginSuccess(data);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-card md:grid-cols-2">
        <AuthBrandPanel />
        <div className="flex flex-col justify-center gap-6 p-8 md:p-10">
          <div className="flex items-center gap-2 text-blue-800">
            <Image
              src="/logo.png"
              alt="PTE Prep logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-md object-contain"
            />
            <span className="text-lg font-bold">{AUTH_TEXT.BRAND}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{AUTH_TEXT.WELCOME_TITLE}</h1>
            <p className="mt-1 text-sm text-gray-500">{AUTH_TEXT.WELCOME_SUBTITLE}</p>
          </div>

          {errorMessage && (
            <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className={LABEL_CLASS}>
                {AUTH_TEXT.USERNAME_LABEL}
              </label>
              <div className={FIELD_WRAP_CLASS}>
                <MailIcon className="h-4 w-4 text-gray-400" />
                {/* type="text", NOT type="email": a STUDENT's username is
                    `{tenant.code}.{random}`, which the browser would reject
                    as an invalid email before the request is ever sent. */}
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setOrganizationOptions([]);
                    setOrganizationId("");
                  }}
                  placeholder={AUTH_TEXT.USERNAME_PLACEHOLDER}
                  className={INPUT_CLASS}
                />
              </div>
              <p className="text-xs text-gray-500">{AUTH_TEXT.USERNAME_HINT}</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className={LABEL_CLASS}>
                  {AUTH_TEXT.PASSWORD_LABEL}
                </label>
                <Link href="#" className="text-xs font-medium text-blue-700 hover:underline">
                  {AUTH_TEXT.FORGOT}
                </Link>
              </div>
              <div className={FIELD_WRAP_CLASS}>
                <LockIcon className="h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setOrganizationOptions([]);
                    setOrganizationId("");
                  }}
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? AUTH_TEXT.HIDE_PASSWORD : AUTH_TEXT.SHOW_PASSWORD}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon closed={showPassword} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {organizationOptions.length > 0 && (
              <div className="flex flex-col gap-1">
                <label htmlFor="organization" className={LABEL_CLASS}>
                  {AUTH_TEXT.ORGANIZATION_LABEL}
                </label>
                <select
                  id="organization"
                  value={organizationId}
                  onChange={(event) => setOrganizationId(event.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">{AUTH_TEXT.ORGANIZATION_PLACEHOLDER}</option>
                  {organizationOptions.map((option) => (
                    <option key={option.tenantId} value={option.tenantId}>
                      {option.organizationName} ({option.tenantCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending || organizationMutation.isPending}
              className="rounded-md bg-action py-2.5 text-sm font-medium text-white shadow-sm shadow-action/25 transition-colors hover:bg-action-hover disabled:opacity-60"
            >
              {mutation.isPending || organizationMutation.isPending
                ? AUTH_TEXT.LOGGING_IN
                : AUTH_TEXT.LOGIN_BUTTON}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};
