import { useEffect, useState } from "react";
import * as api from "../services/api";
import { getDashboardSummary } from "../services/api";
import { StatsCard, Card } from "../components/ui/Card";
import { Badge, Skeleton } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const icons = {
  clients: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  projects: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  invoices: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  tasks: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  trend: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
};

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Independent fetching to ensure partial data still renders
    getDashboardSummary()
      .then(res => {
        console.log("Dashboard Summary:", res.data);
        setData(res.data);
      })
      .catch(err => console.error("Summary error:", err.response?.data || err.message));

    api.getInvoiceMetrics()
      .then(res => {
        console.log("Invoice Metrics:", res.data);
        setMetrics(res.data);
      })
      .catch(err => console.error("Metrics error:", err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} height="100px" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton height="300px" />
          <Skeleton height="300px" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          label="Total Clients" 
          value={data?.total_clients || 0} 
          icon={icons.clients} 
        />
        <StatsCard 
          label="Outstanding" 
          value={`$${metrics?.total_outstanding || 0}`} 
          icon={icons.invoices} 
          trend={{ value: metrics?.overdue_balance > 0 ? "Check Invoices" : "Healthy", color: metrics?.overdue_balance > 0 ? "red" : "green" }}
        />
        <StatsCard 
          label="Paid (Month)" 
          value={`$${metrics?.paid_this_month || 0}`} 
          icon={icons.trend} 
        />
        <StatsCard 
          label="Tasks Completed" 
          value={data?.completed_tasks || 0} 
          icon={icons.tasks} 
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Projects */}
        <div className="fin-card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
            <h3 className="text-sm font-semibold text-white">Recent Projects</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>View all</Button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {data?.recent_projects?.length > 0 ? (
              data.recent_projects.map(proj => (
                <div key={proj.id} className="flex items-center justify-between px-6 py-4 list-row-hover cursor-pointer group" onClick={() => navigate(`/projects/${proj.id}`)}>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-white transition-colors">{proj.title}</p>
                    <p className="text-xs text-[#8B93A1] mt-0.5">
                      {new Date(proj.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={proj.status === "active" ? "success" : "default"}>
                    {proj.status.toUpperCase()}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-[#8B93A1] text-sm">
                No recent projects.
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="fin-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
            <h3 className="text-sm font-semibold text-white">Recent Invoices</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>View all</Button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {data?.recent_invoices?.length > 0 ? (
              data.recent_invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between px-6 py-4 list-row-hover group">
                  <div>
                    <p className="text-sm font-semibold text-white tracking-tight">${inv.amount}</p>
                    <p className="text-xs text-[#8B93A1] mt-0.5">
                      {inv.client__name}
                    </p>
                  </div>
                  <Badge variant={inv.status === "paid" ? "success" : "warning"}>
                    {inv.status.toUpperCase()}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-[#8B93A1] text-sm">
                No recent invoices.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
