const CARD_CONFIGS = [
  {
    key: "total_clients",
    label: "Total Clients",
    iconBg: "bg-primary/10 text-primary border border-primary/10",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    key: "active_projects",
    label: "Active Projects",
    iconBg: "bg-accent/10 text-accent border border-accent/10",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
  },
  {
    key: "pending_invoices",
    label: "Pending Invoices",
    iconBg: "bg-portal-warning/10 text-portal-warning border border-portal-warning/10",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    key: "completed_tasks",
    label: "Completed Tasks",
    iconBg: "bg-portal-success/10 text-portal-success border border-portal-success/10",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/5 bg-card p-5">
      <div className="mb-4 h-10 w-10 rounded-xl bg-white/5" />
      <div className="mb-2 h-8 w-16 rounded-lg bg-white/5" />
      <div className="h-3 w-24 rounded bg-white/5" />
    </div>
  );
}

export function StatsCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CARD_CONFIGS.map(({ key, label, iconBg, icon }) => {
        const value = summary?.[key] ?? 0;
        return (
          <div
            key={key}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-card p-5 transition-all hover:scale-[1.01] hover:bg-white/[0.02] group shadow-sm"
          >
            <div className={`relative z-10 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} transition-all duration-200`}>
              {icon}
            </div>

            <p className="relative z-10 text-3xl font-black tracking-tight text-portal-text">
              {loading ? "—" : value.toLocaleString()}
            </p>
            <p className="relative z-10 mt-1 text-xs font-bold uppercase tracking-wider text-portal-muted">{label}</p>
          </div>
        );
      })}
    </div>
  );
}
