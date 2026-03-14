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
        className="absolute inset-0 bg-sidebar/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Container */}
      <div className={`relative w-full ${maxWidths[maxWidth]} transform rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl transition-all`}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-portal-text">{title}</h2>
          <button 
            onClick={onClose} 
            className="rounded-xl p-2 text-portal-muted hover:bg-gray-100 hover:text-portal-text transition-colors"
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
          <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
