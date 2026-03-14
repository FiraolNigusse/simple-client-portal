export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  loading = false,
  ...props 
}) {
  const variants = {
    primary: "bg-primary hover:bg-[#6B6FF7] text-white shadow-xl shadow-primary/25 active:scale-[0.98]",
    secondary: "bg-surface hover:bg-white/5 text-portal-text border border-white/10 active:scale-[0.98]",
    outline: "bg-transparent border border-white/10 text-portal-text hover:bg-white/5",
    ghost: "bg-transparent text-portal-muted hover:text-portal-text hover:bg-white/5",
    danger: "bg-portal-error/10 text-portal-error hover:bg-portal-error hover:text-white border border-portal-error/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
    md: "px-5 py-2.5 text-sm font-bold",
    lg: "px-8 py-4 text-base font-bold",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
