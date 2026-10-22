"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthBrandLockup,
  AuthBrandShell,
  AuthSubmitButton,
  AuthTextField,
  EyeIcon,
  LocaleSwitcher,
  LockIcon,
  MailIcon,
  Select,
  normalizeSessionRoles,
  useSessionManager,
  type AuthFooterItem,
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

const LABEL_CLASS = "text-[13px] font-semibold text-[var(--ink-secondary)]";
const LOGO_WIDTH = 482;
const LOGO_HEIGHT = 567;

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
  const footerItems: readonly AuthFooterItem[] = [
    { label: T.FOOTER_COPYRIGHT.replace("{year}", String(new Date().getFullYear())) },
    { label: T.FOOTER_TERMS },
    { label: T.FOOTER_PRIVACY },
    { label: T.FOOTER_SUPPORT },
  ];

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
      mustChangePassword: data.mustChangePassword,
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
    <AuthBrandShell
      artwork={<AuthBrandPanel />}
      brand={
        <AuthBrandLockup
          logo={
            <Image
              src="/logo-mark.png"
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              priority
              className="h-12 w-auto"
            />
          }
          name={T.BRAND}
          portalLabel={isHost ? T.PORTAL_HOST_LABEL : T.PORTAL_ADMIN_LABEL}
        />
      }
      toolbar={<LocaleSwitcher />}
      footerItems={footerItems}
      footerLabel={T.FOOTER_LABEL}
    >
      <div>
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink-primary)]">
          {T.WELCOME_TITLE}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-secondary)]">
          {T.WELCOME_SUBTITLE}
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-md bg-[var(--blush-tint)] px-3 py-2 text-sm text-[var(--blush-action)]"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
        {/* type="text", NOT type="email": a STUDENT's username is
            `{tenant.code}.{random}`, which the browser would reject
            as an invalid email before the request is ever sent. */}
        <AuthTextField
          id="username"
          type="text"
          autoComplete="username"
          label={T.USERNAME_LABEL}
          icon={<MailIcon />}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setOrganizationOptions([]);
            setOrganizationId("");
          }}
          placeholder={T.USERNAME_PLACEHOLDER}
        />

        <div className="flex flex-col gap-2">
          <AuthTextField
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            label={T.PASSWORD_LABEL}
            icon={<LockIcon />}
            placeholder={T.PASSWORD_PLACEHOLDER}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setOrganizationOptions([]);
              setOrganizationId("");
            }}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? T.HIDE_PASSWORD : T.SHOW_PASSWORD}
                className="shrink-0 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
              >
                <EyeIcon closed={showPassword} className="h-[18px] w-[18px]" />
              </button>
            }
          />
          <Link
            href="#"
            className="self-end text-[13px] font-semibold text-[var(--brand-ink)] hover:underline"
          >
            {T.FORGOT}
          </Link>
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

        <AuthSubmitButton disabled={mutation.isPending || organizationMutation.isPending}>
          {mutation.isPending || organizationMutation.isPending ? T.LOGGING_IN : T.LOGIN_BUTTON}
        </AuthSubmitButton>
      </form>
    </AuthBrandShell>
  );
};
