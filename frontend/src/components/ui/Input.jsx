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
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-portal-text transition-all placeholder:text-portal-muted/40 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-primary/20 ${
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
      <select
        id={id}
        className={`w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-portal-text transition-all focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-primary/20 ${
          error ? "border-portal-error ring-portal-error/20" : "focus:border-primary/50"
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-portal-error">{error}</p>}
    </div>
  );
}
