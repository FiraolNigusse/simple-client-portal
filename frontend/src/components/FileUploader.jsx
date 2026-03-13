import { useState, useRef, useCallback } from "react";
import { useApi } from "../hooks/useApi";

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export function FileUploader({ projectId, onUploaded }) {
  const api = useApi();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null); // filename being uploaded

  const upload = useCallback(
    async (file) => {
      setUploading(true);
      setError(null);
      setProgress(file.name);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("project", projectId);
        const response = await api.post("/files/upload/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onUploaded?.(response.data);
      } catch (err) {
        const msg =
          err?.response?.data?.file?.[0] ||
          err?.response?.data?.detail ||
          "Upload failed. Please try again.";
        setError(msg);
      } finally {
        setUploading(false);
        setProgress(null);
      }
    },
    [api, projectId, onUploaded]
  );

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;
    upload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onInputChange = (e) => handleFiles(e.target.files);

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
          px-6 py-8 text-center transition-all cursor-pointer select-none
          ${dragging
            ? "border-emerald-500/70 bg-emerald-500/10"
            : "border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/40"
          }
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={onInputChange}
          disabled={uploading}
          id="file-input"
        />

        {/* Upload icon */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors
            ${dragging ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        {uploading ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-emerald-400 animate-pulse">
              Uploading {progress}…
            </p>
            <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-full origin-left animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-emerald-500/30 via-emerald-400 to-emerald-500/30 bg-[length:200%_100%]" />
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-slate-200">
              {dragging ? "Drop file here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-[11px] text-slate-500">Any file type · max 50 MB</p>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
