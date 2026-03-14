import { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/api";
import { StatsCard, Card } from "../components/ui/Card";
import { Badge, Skeleton } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardSummary()
      .then(res => setData(res.data))
      .catch(err => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, []);

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
    )
  };

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          label="Total Clients" 
          value={data?.total_clients || 0} 
          icon={icons.clients} 
          trend="up" 
          trendValue={12} 
        />
        <StatsCard 
          label="Active Projects" 
          value={data?.active_projects || 0} 
          icon={icons.projects} 
        />
        <StatsCard 
          label="Pending Invoices" 
          value={data?.pending_invoices || 0} 
          icon={icons.invoices} 
          trend="down" 
          trendValue={5} 
        />
        <StatsCard 
          label="Tasks Completed" 
          value={data?.completed_tasks || 0} 
          icon={icons.tasks} 
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <Card noPadding className="lg:col-span-2 shadow-2xl shadow-black/40 aurora-glow">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <h3 className="font-black text-portal-text uppercase tracking-widest text-xs">Recent Projects</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>View all</Button>
          </div>
          <div className="divide-y divide-white/5">
            {data?.recent_projects?.length > 0 ? (
              data.recent_projects.map(proj => (
                <div key={proj.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-all duration-300 cursor-pointer group" onClick={() => navigate(`/projects/${proj.id}`)}>
                  <div>
                    <p className="text-sm font-bold text-portal-text group-hover:text-accent transition-colors">{proj.title}</p>
                    <p className="text-[10px] text-portal-muted uppercase tracking-widest font-black opacity-60">
                      {new Date(proj.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={proj.status === "active" ? "success" : "default"}>
                    {proj.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-20 text-center text-portal-muted text-sm">
                No recent projects found.
              </div>
            )}
          </div>
        </Card>

        {/* Recent Invoices */}
        <Card noPadding className="shadow-2xl shadow-black/40 aurora-glow">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <h3 className="font-black text-portal-text uppercase tracking-widest text-xs">Recent Invoices</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>View all</Button>
          </div>
          <div className="divide-y divide-white/5">
            {data?.recent_invoices?.length > 0 ? (
              data.recent_invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-all duration-300 group">
                  <div>
                    <p className="text-sm font-bold text-portal-text tracking-tight group-hover:text-accent transition-colors">${inv.amount}</p>
                    <p className="text-[10px] text-portal-muted uppercase tracking-widest font-black opacity-60">
                      {inv.client__name}
                    </p>
                  </div>
                  <Badge variant={inv.status === "paid" ? "success" : "warning"}>
                    {inv.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-20 text-center text-portal-muted text-sm">
                No recent invoices found.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
