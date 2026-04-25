import React from "react";

export function Logo({ className = "", iconOnly = false, size = "md" }) {
  const sizes = {
    sm: { icon: "h-5 w-5", text: "text-sm" },
    md: { icon: "h-8 w-8", text: "text-xl" },
    lg: { icon: "h-12 w-12", text: "text-3xl" },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Premium Logo Icon */}
      <div className={`${currentSize.icon} relative flex items-center justify-center`}>
        {/* Background stylized shape */}
        <div className="absolute inset-0 bg-white rounded-xl rotate-45 transform transition-transform group-hover:rotate-90 duration-500 opacity-100" />
        
        {/* The 'M' path inside the rotated square */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="relative z-10 w-[60%] h-[60%] text-black" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M6 17V7L12 13L18 7V17" />
        </svg>
      </div>

      {!iconOnly && (
        <span className={`${currentSize.text} font-bold tracking-tight text-white`}>
          Mela
        </span>
      )}
    </div>
  );
}
