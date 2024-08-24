import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface FileUploadProps {
  id: string;
  label: string;
  infoLabel?: string;
  accept: string[];
  maxSize?: number;
  setFile: (file: File | undefined) => void;
  preview: (fileURL: string) => React.ReactNode;
  direction?: "row" | "column";
}

const FileUpload = ({
  id,
  label,
  infoLabel,
  accept,
  maxSize,
  setFile,
  preview,
  direction = "row",
}: FileUploadProps) => {
  const [fileURL, setFileURL] = useState<string | undefined>();
  const [drag, setDrag] = useState(false);

  const updateFile = (file: File | undefined) => {
    if (!file) return;

    if (!accept.includes(file.type)) {
      return toast.error("Invalid file type.");
    }

    if (maxSize && file.size > maxSize) {
      return toast.error("File size is too large.");
    }

    if (fileURL) {
      URL.revokeObjectURL(fileURL);
    }

    setFile(file);
    setFileURL(URL.createObjectURL(file));
  };

  return (
    <div className="flex w-full flex-col items-center justify-start">
      <label htmlFor={id} className="text-md w-full pb-2 font-semibold">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onDragOver={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragEnter={e => {
          e.preventDefault();
          e.stopPropagation();
          setDrag(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          e.stopPropagation();
          setDrag(false);
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          setDrag(false);

          const file = e.dataTransfer.files?.[0];

          updateFile(file);
        }}
        onClick={() => document.getElementById(id + "Input")?.click()}
        className={`flex min-h-60 w-full items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-neutral-800 p-8 text-white transition ${fileURL ? "" : "group"} ${fileURL && direction === "column" ? "flex-col" : ""} ${drag ? "border-sky-500 shadow-inner shadow-sky-500" : "border-white"}`}
      >
        {fileURL && (
          <div
            className={`pointer-events-noneflex items-center justify-center ${direction === "row" ? "h-32 w-32" : "h-16 w-full"}`}
          >
            {preview(fileURL)}
          </div>
        )}
        <div
          className={`pointer-events-none flex items-center justify-center gap-4 ${fileURL && direction === "column" ? "w-full flex-row" : "w-fit flex-col"}`}
        >
          {!fileURL && (
            <FontAwesomeIcon icon={faCloudArrowUp} className="text-6xl" />
          )}
          <div className="pointer-events-none w-full rounded-lg bg-white px-4 py-2 text-black transition hover:bg-white/50 group-hover:bg-white/50">
            Drag or Upload
          </div>
          {fileURL ? (
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();

                if (fileURL) {
                  URL.revokeObjectURL(fileURL);
                }

                setFile(undefined);
                setFileURL(undefined);
              }}
              className={`w-full rounded-lg bg-red-500 px-4 py-2 transition hover:bg-red-700 ${drag ? "pointer-events-none" : "pointer-events-auto"}`}
            >
              Remove
            </button>
          ) : (
            <>
              {infoLabel && (
                <span className="whitespace-pre-line text-xs text-gray-400">
                  {infoLabel}
                </span>
              )}
            </>
          )}
        </div>
      </button>
      <input
        type="file"
        accept={accept.toString()}
        id={id + "Input"}
        onChange={e => {
          const file = e.target.files?.[0];

          updateFile(file);

          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
