import type { ReactElement } from "react";
import { Mascot } from "@aptis/ui";
import { AUTH_TEXT } from "../constants";

export const AuthBrandPanel = (): ReactElement => (
  <div className="hidden flex-col items-center justify-center gap-4 bg-indigo-100/70 p-10 text-center md:flex">
    <Mascot className="h-44 w-44 drop-shadow-sm" />
    <h2 className="text-2xl font-bold text-indigo-900">
      {AUTH_TEXT.PANEL_HEADING}
    </h2>
    <p className="max-w-xs text-sm text-indigo-700">{AUTH_TEXT.PANEL_TEXT}</p>
  </div>
);
