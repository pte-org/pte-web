"use client";
import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import type { RubricFormBandResponse } from "@pte/api-client";
import { RUBRIC_EDIT_CONFIG } from "../versionConstants";
import type { RubricEditText } from "../versionTypes";

interface FormBandEditorProps {
  bands: RubricFormBandResponse[];
  maxBand: number;
  disabled: boolean;
  text: RubricEditText;
  onChange: (bands: RubricFormBandResponse[]) => void;
}
export const FormBandEditor = ({ bands, maxBand, disabled, text: T, onChange }: FormBandEditorProps): ReactElement => {
  const change = (index: number, field: keyof RubricFormBandResponse, value: number): void => {
    onChange(bands.map((band, position) => position === index ? { ...band, [field]: value } : band));
  };
  return <div className="space-y-4">{bands.map((band, index) => <fieldset key={index} disabled={disabled} className="space-y-3 rounded border p-4">
    <Select label={T.band} value={String(band.band)} disabled={disabled}
      options={Array.from({ length: maxBand + 1 }, (_, value) => ({ value: String(value), label: String(value) }))}
      onChange={(event) => change(index, "band", Number(event.target.value))} />
    <label className="block">{T.words} · {T.min}: {band.minWords}
      <input type="range" className="w-full" min={0} max={RUBRIC_EDIT_CONFIG.maxWords} step={1} value={band.minWords}
        aria-label={`${T.min} ${index + 1}`} onChange={(event) => change(index, "minWords", Number(event.target.value))} />
    </label>
    <label className="block">{T.words} · {T.max}: {band.maxWords}
      <input type="range" className="w-full" min={0} max={RUBRIC_EDIT_CONFIG.maxWords} step={1} value={band.maxWords}
        aria-label={`${T.max} ${index + 1}`} onChange={(event) => change(index, "maxWords", Number(event.target.value))} />
    </label>
  </fieldset>)}</div>;
};
