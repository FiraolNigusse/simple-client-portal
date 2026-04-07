import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Premium full-screen file preview modal (Google Drive-style).
 */
export function FilePreviewModal({ isOpen, onClose, url, filename, onDownload }) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsLoaded(false);
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

  if (!isOpen || !url) return null;

  const ext = (filename || "").split('.').pop().toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  const isPdf = ext === "pdf";
  const isVideo = ["mp4", "webm", "ogg", "mov"].includes(ext);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col animate-in fade-in duration-300" id="file-preview-modal">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0C10]/95 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex h-16 items-center justify-between px-6 bg-white/[0.02] border-b border-white/[0.04]">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white/90 truncate">{filename || "File Preview"}</span>
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">{ext}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.06] transition-all"
              title="Download"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8 transition-all duration-500">
        {!isLoaded && (isImage || isPdf || isVideo) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {isImage && (
          <img
            src={url}
            alt={filename}
            onLoad={() => setIsLoaded(true)}
            className={`max-w-full max-h-full object-contain rounded-sm transition-all duration-700 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            style={{ maxHeight: "calc(100vh - 128px)" }}
          />
        )}

        {isVideo && (
          <video
            src={url}
            controls
            autoPlay
            onLoadedData={() => setIsLoaded(true)}
            className={`max-w-full max-h-full rounded-lg shadow-2xl transition-all duration-700 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            style={{ maxHeight: "calc(100vh - 128px)" }}
          />
        )}

        {isPdf && (
          <div className={`w-full h-full max-w-5xl transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <iframe
              src={`${url}#toolbar=0`}
              title={filename}
              onLoad={() => setIsLoaded(true)}
              className="w-full h-full rounded-lg border border-white/[0.06] bg-white/[0.02]"
              style={{ maxHeight: "calc(100vh - 128px)" }}
            />
          </div>
        )}

        {!isImage && !isPdf && !isVideo && (
          <div className="flex flex-col items-center gap-8 text-center animate-in zoom-in-95 duration-300">
            <div className="h-24 w-24 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shadow-2xl shadow-black/40">
              <svg className="h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-white/90">{filename}</p>
              <p className="text-sm text-white/40 max-w-xs mx-auto leading-relaxed">
                We can't preview this file type in the browser. Download it to view the content.
              </p>
            </div>
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-bold text-black bg-white hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download to View
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
