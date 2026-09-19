import type { ReactElement } from "react";
import Image from "next/image";
import { AUTH_TEXT } from "../constants";

export const AuthBrandPanel = (): ReactElement => (
  <div className="relative hidden overflow-hidden flex-col items-center justify-center gap-6 bg-blue-50 p-10 text-center md:flex">
    <div className="relative h-48 w-48" aria-hidden="true">
      <div className="absolute left-4 top-8 h-32 w-32 rotate-12 rounded-3xl bg-blue-100" />
      <div className="absolute bottom-5 right-2 h-24 w-24 -rotate-12 rounded-2xl bg-sky-100" />
      <div className="absolute inset-8 grid place-items-center rounded-2xl bg-white shadow-card">
        <Image
          src="/logo.png"
          alt="PTE Prep logo"
          width={128}
          height={128}
          priority
          className="h-full w-full rounded-2xl object-contain"
        />
      </div>
    </div>
    <h2 className="text-2xl font-semibold text-blue-900">{AUTH_TEXT.PANEL_HEADING}</h2>
    <p className="max-w-xs text-sm leading-6 text-blue-700">{AUTH_TEXT.PANEL_TEXT}</p>
  </div>
);
