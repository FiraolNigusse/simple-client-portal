import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * Full-screen file preview modal (Google Drive-style).
 *
 * Props:
 *   - isOpen: boolean
 *   - onClose: () => void
 *   - previewUrl: string (signed URL)
 *   - filename: string
 *   - extension: string (jpg, pdf, etc.)
 *   - onDownload: () => void
 */
export function FilePreviewModal({ isOpen, onClose, previewUrl, filename, extension, onDownload }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !previewUrl) return null;

  const ext = (extension || "").toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  const isPdf = ext === "pdf";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col" id="file-preview-modal">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
            {isImage ? (
              <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : isPdf ? (
              <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium text-white truncate">{filename || "File Preview"}</span>
          {ext && (
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider bg-white/[0.04] px-2 py-0.5 rounded shrink-0">
              {ext}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
              title="Download"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Close (Esc)"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 overflow-auto">
        {isImage && (
          <img
            src={previewUrl}
            alt={filename}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          />
        )}

        {isPdf && (
          <iframe
            src={previewUrl}
            title={filename}
            className="w-full h-full rounded-lg border border-white/[0.06]"
            style={{ maxHeight: "calc(100vh - 120px)", minHeight: "500px" }}
          />
        )}

        {!isImage && !isPdf && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="h-20 w-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <svg className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-white mb-1">{filename}</p>
              <p className="text-sm text-white/40">This file type cannot be previewed in the browser.</p>
            </div>
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-black bg-white hover:bg-neutral-200 transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
