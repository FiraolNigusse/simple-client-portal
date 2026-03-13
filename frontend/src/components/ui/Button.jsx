export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  loading = false,
  ...props 
}) {
  const variants = {
    primary: "bg-primary hover:bg-indigo-600 text-white shadow-lg shadow-primary/20",
    secondary: "bg-surface hover:bg-slate-800 text-portal-text border border-slate-700",
    outline: "bg-transparent border border-slate-700 text-portal-text hover:bg-slate-800",
    ghost: "bg-transparent text-portal-muted hover:text-portal-text hover:bg-slate-800",
    danger: "bg-portal-error/10 text-portal-error hover:bg-portal-error hover:text-white border border-portal-error/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
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
