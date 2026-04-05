export function Card({ children, className = "", noPadding = false, ...props }) {
  return (
    <div 
      className={`fin-card ${!noPadding ? "p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatsCard({ label, value, icon: Icon, trend, trendValue, variant = "default" }) {
  return (
    <Card className="flex items-center gap-4 group">
      {Icon && (
        <div className="text-[#8B93A1]">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#8B93A1] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-semibold text-white tracking-tight">{value}</h3>
          {trend && (
            <span className={`text-[10px] font-medium uppercase ${trend === "up" ? "text-success" : "text-danger"}`}>
              {trend === "up" ? "↑" : "↓"} {trendValue}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
