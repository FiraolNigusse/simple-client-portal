import React from "react";

export function Logo({ className = "", iconOnly = false, size = "md" }) {
  const sizes = {
    sm: { icon: "h-5 w-5", text: "text-sm" },
    md: { icon: "h-8 w-8", text: "text-xl" },
    lg: { icon: "h-12 w-12", text: "text-3xl" },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Premium Colorful Logo Icon */}
      <div className={`${currentSize.icon} relative flex items-center justify-center shrink-0`}>
        {/* Gradient Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] rounded-xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-indigo-500/20" />
        
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-xl" />

        {/* The 'M' path */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="relative z-10 w-[60%] h-[60%] text-white drop-shadow-sm" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M6 17V7L12 13L18 7V17" />
        </svg>
      </div>

      {!iconOnly && (
        <span className={`${currentSize.text} font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70`}>
          Mela
        </span>
      )}
    </div>
  );
}
