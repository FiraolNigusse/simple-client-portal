import { memo } from "react";

export const Button = memo(function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  loading = false,
  ...props 
}) {
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200 transition-colors",
    secondary: "bg-transparent border border-white/10 text-white hover:bg-white/5",
    outline: "bg-transparent border border-white/10 text-[#8B93A1] hover:text-white hover:border-white/20",
    ghost: "bg-transparent text-[#8B93A1] hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});
