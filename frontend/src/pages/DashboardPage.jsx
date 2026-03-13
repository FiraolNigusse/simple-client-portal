import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { StatsCards } from "../components/StatsCards";
import { RecentActivity } from "../components/RecentActivity";

export function DashboardPage() {
  const api = useApi();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/summary/")
      .then((r) => setSummary(r.data))
      .finally(() => setLoading(false));
  }, [api]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Overview
          </h1>
          <p className="text-sm text-slate-400">
            Your freelance business at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </div>
      </div>

      {/* Stats grid */}
      <StatsCards summary={summary} loading={loading} />

      {/* Body — two columns on wide, stacked on narrow */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity — 2/3 width */}
        <div className="lg:col-span-2">
          <RecentActivity summary={summary} loading={loading} />
        </div>

        {/* Quick actions — 1/3 width */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Quick actions
          </p>

          {[
            {
              label: "New client",
              description: "Add a client to your roster",
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              ),
              to: "/clients",
            },
            {
              label: "View projects",
              description: "Manage your active work",
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              ),
              to: "/projects",
            },
            {
              label: "Create invoice",
              description: "Bill a client for your work",
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ),
              to: "/invoices",
            },
          ].map(({ label, description, icon, to }) => (
            <button
              key={to}
              type="button"
              onClick={() => navigate(to)}
              className="group flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3.5 text-left transition-all hover:border-slate-700 hover:bg-slate-900/60"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors group-hover:bg-emerald-500/15 group-hover:text-emerald-400">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
              <svg
                className="ml-auto h-4 w-4 shrink-0 text-slate-700 transition-colors group-hover:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}

          {/* Metric spotlight */}
          {!loading && summary && (
            <div className="mt-2 rounded-xl border border-slate-800 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 px-5 py-4">
              <p className="text-xs text-slate-500">Outstanding balance</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {summary.pending_invoices} invoice{summary.pending_invoices !== 1 ? "s" : ""}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                awaiting payment from clients
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

