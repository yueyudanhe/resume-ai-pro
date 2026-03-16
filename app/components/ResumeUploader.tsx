"use client";

import { useState, useCallback } from "react";
import { generateId, validateFileType } from "../lib/utils";
import { UploadedFile } from "../types";
import { Translations, Locale } from "../lib/i18n";

interface ResumeUploaderProps {
  t: Translations;
  locale: Locale;
  onUploadComplete: (file: UploadedFile) => void;
  onError: (error: string) => void;
}

export default function ResumeUploader({
  t,
  locale,
  onUploadComplete,
  onError,
}: ResumeUploaderProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File): Promise<void> => {
    if (!validateFileType(file)) {
      onError(t.errorInvalidType);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onError(t.errorFileTooLarge);
      return;
    }

    setIsUploading(true);
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const uploadedFile: UploadedFile = {
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        content: Buffer.from(arrayBuffer).toString("base64"),
      };

      onUploadComplete(uploadedFile);
    } catch {
      onError(t.errorParseFailed);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        void processFile(files[0]);
      }
    },
    [onUploadComplete, onError, t]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        void processFile(files[0]);
      }
    },
    [onUploadComplete, onError, t]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all
        ${isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        }
        ${isUploading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <input
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInput}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="pointer-events-none">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M24 8v24m0-24l-8 8m8-8l8 8M8 32h32"
          />
        </svg>

        {isUploading ? (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t.processing} {fileName}...
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              {t.dropTitle}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t.dropSubtitle}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {t.dropHint}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
