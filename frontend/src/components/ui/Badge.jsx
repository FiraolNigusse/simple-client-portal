export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-white/5 text-portal-muted border border-white/10",
    success: "bg-portal-success/10 text-portal-success border border-portal-success/10",
    warning: "bg-secondary/10 text-secondary border border-secondary/10",
    error: "bg-portal-error/10 text-portal-error border border-portal-error/10",
    indigo: "bg-primary/10 text-primary border border-primary/10",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Skeleton({ className = "", circle = false, height = "1rem" }) {
  return (
    <div 
      className={`animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] ${circle ? "rounded-full" : "rounded-xl"} ${className}`} 
      style={{ height }}
    />
  );
}
