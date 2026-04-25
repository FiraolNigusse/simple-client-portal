import React from "react";

export function Logo({ className = "", iconOnly = false, size = "md" }) {
  const sizes = {
    sm: { icon: "h-6 w-6", text: "text-sm" },
    md: { icon: "h-10 w-10", text: "text-xl" },
    lg: { icon: "h-14 w-14", text: "text-3xl" },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Futuristic Cyber-Neon Logo Icon */}
      <div className={`${currentSize.icon} relative flex items-center justify-center shrink-0`}>
        {/* Dark Container with soft inner glow */}
        <div className="absolute inset-0 bg-[#0F1115] border border-white/5 rounded-xl shadow-2xl group-hover:border-indigo-500/30 transition-all duration-500" />
        
        {/* The Cyber M Icon */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="relative z-10 w-[70%] h-[70%] transition-transform duration-500 group-hover:scale-110"
        >
          <defs>
            <linearGradient id="neon-m-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22D3EE" /> {/* Cyan */}
              <stop offset="1" stopColor="#A855F7" /> {/* Purple */}
            </linearGradient>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Shadow M for depth */}
          <path 
            d="M5 17V7L12 14L19 7V17" 
            stroke="#A855F7" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="opacity-20 blur-[1px]"
          />

          {/* Main Neon M */}
          <path 
            d="M5 17V7L12 14L19 7V17" 
            stroke="url(#neon-m-grad)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            filter="url(#neon-glow)"
          />

          {/* The Lightning Slash / Cut */}
          <path 
            d="M10 5L14 19" 
            stroke="#0F1115" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          <path 
            d="M10.5 4.5L13.5 19.5" 
            stroke="url(#neon-m-grad)" 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            opacity="0.9"
            filter="url(#neon-glow)"
          />
        </svg>

        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all duration-500" />
      </div>

      {!iconOnly && (
        <span className={`${currentSize.text} font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70`}>
          Mela
        </span>
      )}
    </div>
  );
}
