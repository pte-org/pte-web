"use client";

import { type ReactElement } from "react";
import { CLASSES_LIST_TEXT } from "../constants";

export interface ProgramOption {
  value: string;
  label: string;
}

export interface PickProgramToAddClassProps {
  programs: ProgramOption[];
  classLabel: string;
  programLabel: string;
  onRequestCreateClass: (programPublicId: string) => void;
}

export const PickProgramToAddClass = ({
  programs,
  classLabel,
  programLabel,
  onRequestCreateClass,
}: PickProgramToAddClassProps): ReactElement => (
  <div className="flex flex-col gap-5">
    <div className="flex flex-col gap-1">
      <h3 className="text-base font-semibold text-slate-900">
        {CLASSES_LIST_TEXT.pickProgramHeading(classLabel)}
      </h3>
      <p className="text-sm text-slate-500">
        {CLASSES_LIST_TEXT.pickProgramSubheading(programLabel)}
      </p>
    </div>

    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {programs.map((program) => (
        <li
          key={program.value}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <span className="text-sm font-medium text-slate-900">{program.label}</span>
          <button
            type="button"
            onClick={() => onRequestCreateClass(program.value)}
            className="rounded-md bg-action px-3 py-1.5 text-sm font-semibold text-white hover:bg-action-hover"
          >
            {CLASSES_LIST_TEXT.pickProgramRowCta}
          </button>
        </li>
      ))}
    </ul>
  </div>
);