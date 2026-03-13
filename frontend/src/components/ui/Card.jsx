export function Card({ children, className = "", noPadding = false }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-surface shadow-sm transition-all ${!noPadding ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function StatsCard({ label, value, icon: Icon, trend, trendValue }) {
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-portal-muted">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-portal-text">{value}</h3>
          {trend && (
            <span className={`text-xs font-medium ${trend === "up" ? "text-accent" : "text-portal-error"}`}>
              {trend === "up" ? "↑" : "↓"} {trendValue}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
