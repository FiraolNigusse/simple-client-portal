import { useState } from "react";
import { FilePreviewModal } from "./FilePreviewModal";
import * as api from "../services/api";

export function FileList({ files, loading, onFileDeleted }) {
  const [previewState, setPreviewState] = useState({
    open: false,
    url: "",
    filename: "",
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
      const file = files.find(f => f.id === fileId);
      setPreviewState({
        open: true,
        url: res.data.url,
        filename: file?.name || "File",
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
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = res.data.url;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  if (loading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 py-3 px-4 animate-pulse bg-white/[0.02] rounded-lg">
            <div className="h-5 w-5 rounded bg-white/5" />
            <div className="h-4 w-1/3 rounded bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {files?.map(file => (
        <div 
          key={file.id} 
          className="group flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors rounded-lg cursor-default border border-transparent hover:border-white/[0.04]"
        >
          {/* File Icon */}
          <div className="text-white/40 group-hover:text-white/60 transition-colors">
            {getIcon(file.name)}
          </div>

          {/* File Name */}
          <div className="flex-1 min-w-0">
            <button 
              onClick={() => file.is_previewable ? handlePreview(file.id) : handleDownload(file.id)}
              className="text-sm font-medium text-white/90 hover:text-white truncate transition-colors text-left"
            >
              {file.name}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {file.is_previewable && (
              <button
                onClick={() => handlePreview(file.id)}
                className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
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
              className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
              title="Download"
              disabled={actionLoading === file.id}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(file.id)}
              className="p-1.5 rounded text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete"
              disabled={actionLoading === file.id}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      
      {(!files || files.length === 0) && (
        <div className="py-12 text-center text-white/30 text-sm border border-dashed border-white/[0.06] rounded-xl">
          No files shared yet.
        </div>
      )}

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={previewState.open}
        onClose={() => setPreviewState(prev => ({ ...prev, open: false }))}
        url={previewState.url}
        filename={previewState.filename}
        onDownload={() => handleDownload(previewState.fileId)}
      />
    </div>
  );
}
