export function Input({ label, error, className = "", ...props }) {
  const id = props.id || props.name;
  
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-portal-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border bg-[#0B1220] px-4 py-2.5 text-sm text-portal-text transition-all placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? "border-portal-error ring-portal-error/10" : "border-slate-800 focus:border-primary"
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
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-portal-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full appearance-none rounded-lg border bg-[#0B1220] px-4 py-2.5 text-sm text-portal-text transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? "border-portal-error ring-portal-error/10" : "border-slate-800 focus:border-primary"
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-portal-error">{error}</p>}
    </div>
  );
}
