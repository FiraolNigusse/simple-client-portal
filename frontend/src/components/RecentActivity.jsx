import { useNavigate } from "react-router-dom";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-4 px-6 py-4">
      <div className="h-4 w-4 rounded bg-white/5" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-white/5" />
        <div className="h-2 w-20 rounded bg-white/5" />
      </div>
      <div className="h-2 w-10 rounded bg-white/5" />
    </div>
  );
}

export function RecentActivity({ summary, loading }) {
  const navigate = useNavigate();

  const items = [
    ...(summary?.recent_projects ?? []).map((p) => ({
      type: "project",
      id: p.id,
      primary: p.title,
      secondary: p.status,
      time: p.created_at,
      onClick: () => navigate(`/projects/${p.id}`),
    })),
    ...(summary?.recent_invoices ?? []).map((inv) => ({
      type: "invoice",
      id: inv.id,
      primary: inv["client__name"] || `Invoice #${inv.id}`,
      secondary: formatCurrency(inv.amount),
      time: inv.created_at,
      onClick: () => navigate("/invoices"),
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8);

  return (
    <div className="fin-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
      </div>

      {/* List */}
      <div className="divide-y divide-white/[0.04]">
        {loading ? (
          [1, 2, 3, 4].map((n) => <SkeletonRow key={n} />)
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-[#8B93A1]">
            <p className="text-xs font-medium">No recent activity</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
            >
              {/* Type icon */}
              <div className="text-[#8B93A1]">
                {item.type === "project" ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {item.primary}
                </p>
                <p className="text-xs font-medium text-[#8B93A1] mt-0.5">{item.secondary}</p>
              </div>

              <div className="flex shrink-0 items-center">
                <span className="text-[11px] font-medium text-[#8B93A1]">{timeAgo(item.time)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

