import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

interface FileUploadProps {
  id: string;
  label: string;
  accept: string[];
  setFile: (file: File | undefined) => void;
  preview: (fileURL: string) => React.ReactNode;
  direction?: "row" | "column";
}

const FileUpload = ({
  id,
  label,
  accept,
  setFile,
  preview,
  direction = "row",
}: FileUploadProps) => {
  const [fileURL, setFileURL] = useState<string | undefined>();
  const [drag, setDrag] = useState(false);

  return (
    <div className="flex w-full flex-col items-center justify-start gap-2">
      <label htmlFor={id} className="text-md w-full font-semibold">
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

          if (!file) return;

          if (!accept.includes(file.type)) return;

          if (fileURL) {
            URL.revokeObjectURL(fileURL);
          }

          setFile(file);
          setFileURL(URL.createObjectURL(file));
        }}
        onClick={() => document.getElementById(id + "Input")?.click()}
        className={`flex min-h-52 w-full items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-neutral-800 p-8 text-white transition ${fileURL ? "" : "group"} ${fileURL && direction === "column" ? "flex-col" : ""} ${drag ? "border-sky-500" : "border-white"}`}
      >
        {fileURL && <div className="h-32 w-32">{preview(fileURL)}</div>}
        <div
          className={`flex items-center justify-center gap-4 ${fileURL && direction === "column" ? "w-full flex-row" : "w-fit flex-col"}`}
        >
          {!fileURL && (
            <FontAwesomeIcon icon={faCloudArrowUp} className="text-6xl" />
          )}
          <div className="w-full rounded-lg bg-white px-4 py-2 text-black transition hover:bg-white/50 group-hover:bg-white/50">
            Drag or Upload
          </div>
          {fileURL && (
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();

                if (fileURL) {
                  URL.revokeObjectURL(fileURL);
                }

                setFile(undefined);
                setFileURL(undefined);
              }}
              className="w-full rounded-lg bg-red-500 px-4 py-2 transition hover:bg-red-700"
            >
              Remove
            </button>
          )}
        </div>
      </button>
      <input
        type="file"
        accept={accept.toString()}
        id={id + "Input"}
        onChange={e => {
          const file = e.target.files?.[0];

          e.target.value = "";

          if (!file) return;

          if (fileURL) {
            URL.revokeObjectURL(fileURL);
          }

          setFile(file);
          setFileURL(URL.createObjectURL(file));
        }}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
