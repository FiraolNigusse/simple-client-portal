import { LeadsTable } from "../components/LeadsTable";

export function LeadsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.99 7.99 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14l.879 2.121z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-portal-text uppercase tracking-[0.1em]">Lead Management</h1>
          </div>
          <p className="text-sm text-portal-muted font-medium ml-11">Track your outreach pipeline and convert high-value leads into active clients.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-portal-muted uppercase tracking-widest mb-1">Conversion Rate</p>
            <p className="text-2xl font-black text-emerald-400">24.5%</p>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] font-black text-portal-muted uppercase tracking-widest mb-1">Active Pipeline</p>
            <p className="text-2xl font-black text-white">42 Leads</p>
          </div>
        </div>
      </div>

      <LeadsTable />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Top Platform" 
          value="LinkedIn" 
          sub="60% of leads"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />}
        />
        <StatCard 
          label="Avg. Response" 
          value="4.2 Hours" 
          sub="Fast Response ⚡"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard 
          label="Outreach ROI" 
          value="12.4x" 
          sub="Based on Pro plan"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="p-6 rounded-[24px] border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-portal-muted">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <p className="text-[10px] font-black text-portal-muted uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-[11px] text-portal-muted font-bold opacity-60 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
