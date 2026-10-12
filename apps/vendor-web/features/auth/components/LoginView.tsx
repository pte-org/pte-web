"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EyeIcon,
  LockIcon,
  MailIcon,
  Select,
  normalizeSessionRoles,
  useSessionManager,
} from "@pte/ui";
import {
  decodeAccessTokenClaims,
  type LoginOrganizationOption,
  type JwtTokenResponse,
} from "@pte/api-client";
import { useLoginAdmin, useLoginHost, useLoginOrganizationOptions } from "../api";
import { ADMIN_ROLES, AUTH_ROUTES, AUTH_TEXT as RAW_AUTH_TEXT, HOST_ROLES } from "../constants";
import { useAdminCopy } from "../../i18n/adminCopy";
import { hasAnyRole } from "../permissions";
import type { VendorRole } from "../types";
import { getLoginErrorMessage } from "../loginError";
import { AuthBrandPanel } from "./_AuthBrandPanel";

function resolveRole(raw: string | null): VendorRole {
  return raw === "host" ? "host" : "admin";
}

const FIELD_WRAP_CLASS =
  "flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100";
const INPUT_CLASS = "w-full bg-transparent py-2.5 text-sm outline-none";
const LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide text-gray-500";

export const LoginView = (): ReactElement => {
  const T = useAdminCopy(RAW_AUTH_TEXT);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = resolveRole(searchParams.get("role"));
  const { saveSession } = useSessionManager();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organizationOptions, setOrganizationOptions] = useState<LoginOrganizationOption[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const adminMutation = useLoginAdmin();
  const hostMutation = useLoginHost();
  const isHost = role === "host";
  const mutation = isHost ? hostMutation : adminMutation;
  const organizationMutation = useLoginOrganizationOptions();

  const handleLoginSuccess = (data: JwtTokenResponse): void => {
    const claims = decodeAccessTokenClaims(data.accessToken);
    const roles = claims ? normalizeSessionRoles(claims.roles) : [];
    if (!claims || roles.length === 0) {
      setErrorMessage(T.GENERIC_ERROR);
      return;
    }
    const isAdminRole = hasAnyRole(roles, ADMIN_ROLES);
    const isHostRole = roles.some((role) => HOST_ROLES.includes(role));
    if (!isAdminRole && !isHostRole) {
      setErrorMessage(T.UNSUPPORTED_ROLE);
      return;
    }
    saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      roles,
      tenantId: claims.tenantId,
      expiresAt: claims.expiresAt || Date.now() + data.expiresInSeconds * 1000,
    });
    router.replace(isAdminRole ? AUTH_ROUTES.adminDashboard : AUTH_ROUTES.hostDashboard);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage(T.EMPTY_FIELDS);
      return;
    }
    if (organizationOptions.length > 0 && !organizationId) {
      setErrorMessage(T.ORGANIZATION_REQUIRED);
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
            <span className="text-lg font-bold">{T.BRAND}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{T.WELCOME_TITLE}</h1>
            <p className="mt-1 text-sm text-gray-500">{T.WELCOME_SUBTITLE}</p>
          </div>

          {errorMessage && (
            <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className={LABEL_CLASS}>
                {T.USERNAME_LABEL}
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
                  placeholder={T.USERNAME_PLACEHOLDER}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className={LABEL_CLASS}>
                  {T.PASSWORD_LABEL}
                </label>
                <Link href="#" className="text-xs font-medium text-blue-700 hover:underline">
                  {T.FORGOT}
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
                  aria-label={showPassword ? T.HIDE_PASSWORD : T.SHOW_PASSWORD}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon closed={showPassword} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {organizationOptions.length > 0 && (
              <div className="flex flex-col gap-1">
                <label htmlFor="organization" className={LABEL_CLASS}>
                  {T.ORGANIZATION_LABEL}
                </label>
                <Select
                  id="organization"
                  value={organizationId}
                  onChange={(event) => setOrganizationId(event.target.value)}
                  placeholder={T.ORGANIZATION_PLACEHOLDER}
                  options={organizationOptions.map((option) => ({
                    value: option.tenantId,
                    label: `${option.organizationName} (${option.tenantCode})`,
                  }))}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending || organizationMutation.isPending}
              className="rounded-md bg-action py-2.5 text-sm font-medium text-white shadow-sm shadow-action/25 transition-colors hover:bg-action-hover disabled:opacity-60"
            >
              {mutation.isPending || organizationMutation.isPending ? T.LOGGING_IN : T.LOGIN_BUTTON}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};
