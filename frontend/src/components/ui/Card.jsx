export function Card({ children, className = "", noPadding = false, ...props }) {
  return (
    <div 
      className={`fin-card ${!noPadding ? "p-8" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatsCard({ label, value, icon: Icon, trend, trendValue, variant = "default" }) {
  const variantColors = {
    default: "bg-primary/10 text-primary border-primary/5",
    success: "bg-success/10 text-success border-success/5",
    warning: "bg-warning/10 text-warning border-warning/5",
    danger: "bg-danger/10 text-danger border-danger/5",
  };

  return (
    <Card className="flex items-center gap-6 overflow-hidden relative group">
      {/* Decorative Glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 blur-[80px] opacity-20 -mr-12 -mt-12 transition-opacity group-hover:opacity-40 ${
        variant === 'success' ? 'bg-success' : 
        variant === 'warning' ? 'bg-warning' : 
        variant === 'danger' ? 'bg-danger' : 'bg-primary'
      }`} />
      
      {Icon && (
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110 ${variantColors[variant]}`}>
          <Icon className="h-8 w-8" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-portal-muted uppercase tracking-[0.2em] mb-1 opacity-60">{label}</p>
        <div className="flex items-baseline gap-3">
          <h3 className="text-3xl font-black text-portal-text tracking-tighter">{value}</h3>
          {trend && (
            <span className={`text-[10px] font-black uppercase tracking-widest ${trend === "up" ? "text-success" : "text-danger"}`}>
              {trend === "up" ? "↑" : "↓"} {trendValue}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
