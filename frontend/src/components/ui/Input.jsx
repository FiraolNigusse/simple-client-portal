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
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-portal-text transition-all placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/5 ${
          error ? "border-portal-error ring-portal-error/10" : "border-gray-200 focus:border-primary"
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
        <label htmlFor={id} className="text-[10px] font-bold text-portal-muted uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm text-portal-text transition-all focus:outline-none focus:ring-4 focus:ring-primary/5 ${
          error ? "border-portal-error ring-portal-error/10" : "border-gray-200 focus:border-primary"
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-portal-error">{error}</p>}
    </div>
  );
}
