export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-slate-800 text-slate-300",
    success: "bg-accent/10 text-accent border border-accent/20",
    warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
    error: "bg-portal-error/10 text-portal-error border border-portal-error/20",
    indigo: "bg-primary/10 text-primary border border-primary/20",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Skeleton({ className = "", circle = false, height = "1rem" }) {
  return (
    <div 
      className={`animate-shimmer bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-[length:200%_100%] ${circle ? "rounded-full" : "rounded-lg"} ${className}`} 
      style={{ height }}
    />
  );
}
