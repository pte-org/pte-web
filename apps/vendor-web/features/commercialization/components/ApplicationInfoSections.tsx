"use client";

import { useState, type ReactElement } from "react";
import {
  useLocale,
  OfficeBuildingIcon,
  UserCircleIcon,
  ClockIcon,
  ShieldIcon,
  CheckIcon,
  InfoIcon,
  CopyIcon,
} from "@pte/ui";
import type { TenantApplicationResponse } from "@pte/api-client";
import { ADMIN_APPLICATION_DETAIL_TEXT as RAW_TEXT } from "../constants";
import { formatDateTime, hoursUntil } from "../applicationFormat";

type DetailText = typeof RAW_TEXT;

interface ApplicationInfoSectionsProps {
  application: TenantApplicationResponse;
  text: DetailText;
  organizationTypeLabels: Record<string, string>;
  /** Captured once per mount so the elapsed and remaining times do not shift while rendering. */
  nowMs: number;
}

const CopyButton = ({ value }: { value: string }): ReactElement => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Đã sao chép" : "Sao chép"}
      className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      aria-label="Sao chép"
    >
      {copied ? (
        <CheckIcon className="h-3.5 w-3.5 stroke-[2.5] text-emerald-600" />
      ) : (
        <CopyIcon className="h-3.5 w-3.5" />
      )}
    </button>
  );
};

export const ApplicationInfoSections = ({
  application,
  text: T,
  organizationTypeLabels,
  nowMs,
}: ApplicationInfoSectionsProps): ReactElement => {
  const { locale } = useLocale();
  const empty = T.EMPTY_VALUE;

  const SLA_TOTAL_HOURS = 72;
  const hoursLeft = application.responseDueAt ? hoursUntil(application.responseDueAt, nowMs) : null;
  const slaPercent =
    hoursLeft !== null
      ? Math.max(0, Math.min(100, Math.round((hoursLeft / SLA_TOTAL_HOURS) * 100)))
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.85fr_1.15fr]">
      {/* Cột trái: Thông tin đăng ký chi tiết (Card lớn duy nhất) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        {/* Phần 1: Thông tin tổ chức */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            <OfficeBuildingIcon className="h-5 w-5 text-slate-500" />
            <span>{T.ORGANIZATION_SECTION}</span>
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {T.ORGANIZATION_NAME}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{application.orgName}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {T.ORGANIZATION_TYPE}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {organizationTypeLabels[application.orgType] ?? application.orgType}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {T.REQUESTED_TENANT_CODE}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-800">
                  {application.requestedCode}
                </span>
                <CopyButton value={application.requestedCode} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {T.TAX_CODE}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="font-mono text-sm font-medium text-slate-900">
                  {application.taxCode || empty}
                </span>
                {application.taxCode && <CopyButton value={application.taxCode} />}
              </div>
            </div>
          </div>
        </div>

        {/* Phân cách */}
        <div className="my-6 border-t border-slate-100" />

        {/* Phần 2: Người đại diện */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            <UserCircleIcon className="h-5 w-5 text-slate-500" />
            <span>{T.REPRESENTATIVE_SECTION}</span>
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {T.WORK_EMAIL}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <a
                  href={`mailto:${application.contactEmail}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {application.contactEmail}
                </a>
                <CopyButton value={application.contactEmail} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {T.PHONE}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                {application.contactPhone ? (
                  <>
                    <a
                      href={`tel:${application.contactPhone}`}
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      {application.contactPhone}
                    </a>
                    <CopyButton value={application.contactPhone} />
                  </>
                ) : (
                  <span className="text-sm text-slate-400">{empty}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Sidebar Thẩm định & Tiến độ */}
      <div className="flex flex-col gap-5">
        {/* Card 1: Tiến độ xử lý SLA */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClockIcon className="h-4 w-4 text-slate-500" />
              <span>{T.SLA_SECTION_TITLE}</span>
            </h3>
            {hoursLeft !== null && (
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  hoursLeft > 24
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : hoursLeft > 0
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {hoursLeft >= 0
                  ? `${T.SLA_REMAINING_PREFIX} ${hoursLeft}h / 72h`
                  : `${T.RESPONSE_OVERDUE} ${Math.abs(hoursLeft)}h`}
              </span>
            )}
          </div>

          {/* SLA Progress Bar */}
          {slaPercent !== null && (
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    slaPercent > 33
                      ? "bg-emerald-500"
                      : slaPercent > 15
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${Math.max(5, Math.min(100, slaPercent))}%` }}
                />
              </div>
            </div>
          )}

          {/* Mini Timeline */}
          <div className="mt-4 flex flex-col gap-3.5 border-t border-slate-100 pt-3.5 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
              <div className="flex-1">
                <p className="font-semibold text-slate-800">
                  {formatDateTime(application.submittedAt, locale)}
                </p>
                <p className="text-slate-400">{T.TIMELINE_SUBMITTED}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  application.status === "PENDING"
                    ? "animate-pulse bg-amber-400 ring-4 ring-amber-50"
                    : application.status === "APPROVED"
                      ? "bg-emerald-500 ring-4 ring-emerald-50"
                      : "bg-red-500 ring-4 ring-red-50"
                }`}
              />
              <div className="flex-1">
                <p className="font-semibold text-slate-800">
                  {application.status === "PENDING"
                    ? T.TIMELINE_PENDING
                    : application.status === "APPROVED"
                      ? T.TIMELINE_APPROVED
                      : T.TIMELINE_REJECTED}
                </p>
                {application.reviewedAt && (
                  <p className="text-slate-400">
                    {formatDateTime(application.reviewedAt, locale)}
                    {application.reviewedBy ? ` • ${application.reviewedBy}` : ""}
                  </p>
                )}
                {application.rejectReason && (
                  <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs leading-relaxed text-red-700">
                    <span className="font-semibold">{T.REJECTION_REASON_LABEL}: </span>
                    {application.rejectReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Kiểm tra thẩm định */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldIcon className="h-4 w-4 text-slate-500" />
            <span>{T.COMPLIANCE_TITLE}</span>
          </h3>
          <ul className="flex flex-col gap-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckIcon className="h-2.5 w-2.5 stroke-[2.5]" />
              </span>
              <span className="font-medium text-slate-700">{T.COMPLIANCE_CODE_VALID}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckIcon className="h-2.5 w-2.5 stroke-[2.5]" />
              </span>
              <span className="font-medium text-slate-700">{T.COMPLIANCE_TAX_VALID}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                <InfoIcon className="h-2.5 w-2.5" />
              </span>
              <span className="text-slate-600">{T.COMPLIANCE_REVIEW_NOTE}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
