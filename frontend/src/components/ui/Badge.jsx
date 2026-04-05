export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "status-badge",
    success: "status-badge status-active",
    warning: "status-badge status-pending",
    error: "status-badge text-red-400",
    accent: "status-badge text-blue-400",
    primary: "status-badge status-active",
  };

  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Skeleton({ className = "", circle = false, height = "1rem" }) {
  return (
    <div 
      className={`animate-pulse bg-white/5 ${circle ? "rounded-full" : "rounded-lg"} ${className}`} 
      style={{ height }}
    />
  );
}
