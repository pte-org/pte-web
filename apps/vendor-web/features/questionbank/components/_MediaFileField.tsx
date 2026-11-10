"use client";

import { useRef, type ChangeEvent, type ReactElement } from "react";
import { Button } from "@pte/ui";

interface MediaFileFieldProps {
  id: string;
  label: string;
  accept: string;
  /** What the file already uploaded is called, or null while there is none. */
  uploadedLabel: string | null;
  isUploading: boolean;
  chooseLabel: string;
  replaceLabel: string;
  noFileLabel: string;
  uploadingLabel: string;
  onSelect: (file: File) => void;
}

/** A labelled button that opens the file picker, with the chosen file's state beside it. */
export const MediaFileField = ({
  id,
  label,
  accept,
  uploadedLabel,
  isUploading,
  chooseLabel,
  replaceLabel,
  noFileLabel,
  uploadingLabel,
  onSelect,
}: MediaFileFieldProps): ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    // Clearing the value lets the same file be picked again after a failed upload.
    event.target.value = "";
    if (file) onSelect(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploadedLabel ? replaceLabel : chooseLabel}
        </Button>
        <span
          className={
            uploadedLabel && !isUploading
              ? "truncate text-xs text-green-700"
              : "truncate text-xs text-[var(--ink-muted)]"
          }
        >
          {isUploading ? uploadingLabel : (uploadedLabel ?? noFileLabel)}
        </span>
      </div>
      <input
        ref={inputRef}
        id={id}
        className="sr-only"
        type="file"
        accept={accept}
        aria-label={label}
        tabIndex={-1}
        onChange={handleChange}
      />
    </div>
  );
};
