export function Card({ children, className = "", noPadding = false }) {
  return (
    <div className={`rounded-xl border border-white/[0.05] bg-surface shadow-2xl shadow-black/20 transition-all duration-300 hover:border-white/10 hover:shadow-black/40 ${!noPadding ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function StatsCard({ label, value, icon: Icon, trend, trendValue }) {
  return (
    <Card className="flex items-center gap-5">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
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
