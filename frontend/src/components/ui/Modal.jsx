import { useEffect } from "react";
import { createPortal } from "react-dom";

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = "md" }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#060a13]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Container */}
      <div className={`relative w-full ${maxWidths[maxWidth]} transform rounded-2xl border border-slate-800 bg-surface p-6 shadow-2xl transition-all`}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-portal-text">{title}</h2>
          <button 
            onClick={onClose} 
            className="rounded-lg p-1 text-portal-muted hover:bg-slate-800 hover:text-portal-text transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
