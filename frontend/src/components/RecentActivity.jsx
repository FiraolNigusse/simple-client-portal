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

const PROJECT_STATUS_STYLE = {
  active: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-slate-700/60 text-slate-400",
};

const INVOICE_STATUS_STYLE = {
  pending: "bg-amber-500/15 text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-400",
};

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-4 py-3">
      <div className="h-8 w-8 rounded-lg bg-slate-800" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 rounded bg-slate-800" />
        <div className="h-2.5 w-20 rounded bg-slate-800" />
      </div>
      <div className="h-2.5 w-10 rounded bg-slate-800" />
    </div>
  );
}

export function RecentActivity({ summary, loading }) {
  const navigate = useNavigate();

  const projectItems = (summary?.recent_projects ?? []).map((p) => ({
    type: "project",
    id: p.id,
    primary: p.title,
    secondary: p.status,
    badge: p.status,
    badgeStyle: PROJECT_STATUS_STYLE[p.status] ?? PROJECT_STATUS_STYLE.active,
    time: p.created_at,
    onClick: () => navigate(`/projects/${p.id}`),
  }));

  const invoiceItems = (summary?.recent_invoices ?? []).map((inv) => ({
    type: "invoice",
    id: inv.id,
    primary: inv["client__name"] || `Invoice #${inv.id}`,
    secondary: formatCurrency(inv.amount),
    badge: inv.status,
    badgeStyle: INVOICE_STATUS_STYLE[inv.status] ?? INVOICE_STATUS_STYLE.pending,
    time: inv.created_at,
    onClick: () => navigate("/invoices"),
  }));

  // Merge and sort by time descending, take top 8
  const items = [...projectItems, ...invoiceItems]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <p className="text-sm font-semibold text-slate-100">Recent Activity</p>
        <span className="text-[10px] text-slate-600 uppercase tracking-wider">
          Last 5 projects &amp; invoices
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-800/60">
        {loading ? (
          [1, 2, 3, 4].map((n) => <SkeletonRow key={n} />)
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">No recent activity yet</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-900/60"
            >
              {/* Type icon */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                  ${item.type === "project" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
              >
                {item.type === "project" ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">
                  {item.primary}
                </p>
                <p className="text-xs text-slate-500">{item.secondary}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${item.badgeStyle}`}>
                  {item.badge}
                </span>
                <span className="text-[10px] text-slate-600">{timeAgo(item.time)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
