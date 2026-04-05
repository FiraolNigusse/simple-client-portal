export function Card({ children, className = "", noPadding = false, ...props }) {
  return (
    <div 
      className={`rounded-2xl border border-white/5 bg-card shadow-sm transition-all duration-200 ${!noPadding ? "p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatsCard({ label, value, icon: Icon, trend, trendValue }) {
  return (
    <Card className="flex items-center gap-5">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/5">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <div>
        <p className="text-xs font-bold text-portal-muted uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-portal-text">{value}</h3>
          {trend && (
            <span className={`text-xs font-bold ${trend === "up" ? "text-portal-success" : "text-portal-error"}`}>
              {trend === "up" ? "↑" : "↓"} {trendValue}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
