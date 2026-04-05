export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-white/5 text-portal-muted border border-white/10",
    success: "bg-success/10 text-success border border-success/10",
    warning: "bg-warning/10 text-warning border border-warning/10",
    error: "bg-danger/10 text-danger border border-danger/10",
    accent: "bg-accent/10 text-accent border border-accent/10",
    primary: "bg-primary/10 text-primary border border-primary/10",
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
