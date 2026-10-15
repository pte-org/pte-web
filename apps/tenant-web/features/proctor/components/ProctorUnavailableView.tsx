"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ShieldIcon, useLocale } from "@pte/ui";

export function ProctorUnavailableView(): ReactElement {
  const { t } = useLocale();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-sm">
        <ShieldIcon className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-xl font-bold tracking-tight text-[var(--ink-primary)] sm:text-2xl">
        {t("proctor.unavailable.title", "Khu vực Giám thị chưa khả dụng")}
      </h1>
      <p className="mt-2.5 max-w-md text-sm text-[var(--ink-secondary)] leading-relaxed">
        {t(
          "proctor.unavailable.description",
          "Tính năng giám sát thi trực tiếp hiện đang được bảo trì hoặc chưa kích hoạt. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.",
        )}
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[var(--surface-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-muted)]"
        >
          {t("common.backToHome", "Về trang chủ")}
        </Link>
      </div>
    </div>
  );
}
