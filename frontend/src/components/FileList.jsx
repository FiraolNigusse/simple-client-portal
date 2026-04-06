import { useState } from "react";
import { Card } from "./ui/Card";
import { FilePreviewModal } from "./FilePreviewModal";
import * as api from "../services/api";

export function FileList({ files, loading, onFileDeleted }) {
  const [previewState, setPreviewState] = useState({
    open: false,
    url: "",
    filename: "",
    extension: "",
    fileId: null,
  });
  const [actionLoading, setActionLoading] = useState(null);

  const getIcon = (filename) => {
    const ext = (filename || "").split('.').pop().toLowerCase();
    if (['jpg', 'png', 'svg', 'jpeg', 'gif', 'webp'].includes(ext)) return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
    if (ext === 'pdf') return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const handlePreview = async (fileId) => {
    setActionLoading(fileId);
    try {
      const res = await api.getFilePreviewUrl(fileId);
      setPreviewState({
        open: true,
        url: res.data.url,
        filename: res.data.filename,
        extension: res.data.extension,
        fileId,
      });
    } catch (err) {
      console.error("Preview error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (fileId) => {
    setActionLoading(fileId);
    try {
      const res = await api.getFileDownloadUrl(fileId);
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Delete this file?")) return;
    setActionLoading(fileId);
    try {
      await api.deleteFile(fileId);
      onFileDeleted?.(fileId);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const closePreview = () => {
    setPreviewState({ open: false, url: "", filename: "", extension: "", fileId: null });
  };

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="flex items-center gap-4 py-4 animate-pulse">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-white/5" />
              <div className="h-2 w-1/2 rounded bg-white/5" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files?.map(file => (
          <Card key={file.id} className="group flex items-center gap-4 py-4 hover:border-white/10 transition-all">
            {/* File Icon */}
            <div
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/[0.03] text-white/40 group-hover:bg-white/[0.06] group-hover:text-white/60 transition-colors cursor-pointer"
              onClick={() => file.is_previewable ? handlePreview(file.id) : handleDownload(file.id)}
              title={file.is_previewable ? "Preview" : "Download"}
            >
              {getIcon(file.filename)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.filename}</p>
              <p className="text-[11px] text-white/40 mt-0.5">
                {file.size ? `${Math.round(file.size / 1024)} KB` : ""}{file.size ? " · " : ""}
                {new Date(file.uploaded_at || file.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {file.is_previewable && (
                <button
                  onClick={() => handlePreview(file.id)}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
                  title="Preview"
                  disabled={actionLoading === file.id}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => handleDownload(file.id)}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
                title="Download"
                disabled={actionLoading === file.id}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Delete"
                disabled={actionLoading === file.id}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </Card>
        ))}
        {(!files || files.length === 0) && (
          <div className="col-span-full py-12 text-center text-white/30 text-sm border border-dashed border-white/[0.06] rounded-xl">
            No files shared yet.
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={previewState.open}
        onClose={closePreview}
        previewUrl={previewState.url}
        filename={previewState.filename}
        extension={previewState.extension}
        onDownload={() => handleDownload(previewState.fileId)}
      />
    </>
  );
}
