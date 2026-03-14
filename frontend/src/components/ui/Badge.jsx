export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 text-gray-600 border border-gray-200",
    success: "bg-green-50 text-accent border border-green-100",
    warning: "bg-yellow-50 text-yellow-600 border border-yellow-100",
    error: "bg-red-50 text-portal-error border border-red-100",
    indigo: "bg-indigo-50 text-primary border border-indigo-100",
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
      className={`animate-shimmer bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] ${circle ? "rounded-full" : "rounded-xl"} ${className}`} 
      style={{ height }}
    />
  );
}
