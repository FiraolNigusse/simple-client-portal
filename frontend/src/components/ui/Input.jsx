export function Input({ label, error, className = "", ...props }) {
  const id = props.id || props.name;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[10px] font-black text-portal-muted uppercase tracking-[0.2em] ml-2">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-portal-text transition-all placeholder:text-portal-muted/40 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-primary-glow ${
          error ? "border-portal-error ring-portal-error/20" : "focus:border-primary/50"
        }`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-portal-error">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  const id = props.id || props.name;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[10px] font-black text-portal-muted uppercase tracking-[0.2em] ml-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-portal-text transition-all focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-primary-glow ${
            error ? "border-portal-error ring-portal-error/20" : "focus:border-primary/50"
          } ${className}`}
          style={{ colorScheme: 'dark' }}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-portal-muted">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs font-medium text-portal-error">{error}</p>}
    </div>
  );
}
