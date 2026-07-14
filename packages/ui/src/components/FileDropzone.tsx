"use client";

import type { ChangeEvent, DragEvent, ReactElement } from "react";
import { cn } from "../utils/cn";
import { UploadIcon } from "./icons";

interface FileDropzoneProps {
  id?: string;
  label?: string;
  description?: string;
  accept?: string;
  disabled?: boolean;
  error?: string;
  file?: File | null;
  onFileSelect: (file: File) => void;
}

const DEFAULT_LABEL = "Tai tep len";
const DEFAULT_DESCRIPTION = "Keo tha tep vao day hoac chon tu may tinh";

export const FileDropzone = ({
  id = "file-dropzone",
  label = DEFAULT_LABEL,
  description = DEFAULT_DESCRIPTION,
  accept,
  disabled = false,
  error,
  file,
  onFileSelect,
}: FileDropzoneProps): ReactElement => {
  const handleFiles = (files: FileList | null): void => {
    const selectedFile = files?.item(0);
    if (selectedFile) onFileSelect(selectedFile);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleFiles(event.target.files);
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-white px-4 py-8 text-center transition-colors",
          error ? "border-red-400" : "border-gray-300 hover:border-blue-400",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <UploadIcon className="h-8 w-8 text-gray-400" />
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        <span className="text-sm text-gray-500">{description}</span>
        {file && (
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            {file.name}
          </span>
        )}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={onChange}
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
};
