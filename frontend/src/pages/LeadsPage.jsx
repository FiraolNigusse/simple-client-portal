import { useEffect, useState, useCallback } from "react";
import { LeadsTable } from "../components/LeadsTable";
import { AddLeadModal } from "../components/AddLeadModal";
import { leadsService } from "../services/leadsService";

export function LeadsPage() {
  const [leads,   setLeads]   = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, metricsRes] = await Promise.all([
        leadsService.list(),
        leadsService.metrics(),
      ]);
      setLeads(leadsRes.data?.results ?? leadsRes.data);
      setMetrics(metricsRes.data);
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddSave = async (form) => {
    await leadsService.create(form);
    fetchAll();
  };

  const convRate = metrics?.conversion_rate ?? 0;
  const activePipeline = metrics?.active_pipeline ?? 0;
  const total = metrics?.total ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
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
          <p className="text-sm text-portal-muted font-medium ml-11">Track your outreach pipeline and convert leads into clients.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Stat strip */}
          {!loading && (
            <>
              <Stat label="Conversion Rate" value={`${convRate}%`} color="text-emerald-400" />
              <div className="h-10 w-[1px] bg-white/10" />
              <Stat label="Active Pipeline" value={`${activePipeline} Leads`} color="text-white" />
              <div className="h-10 w-[1px] bg-white/10" />
              <Stat label="Total" value={total} color="text-white" />
            </>
          )}

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add Lead
          </button>
        </div>
      </div>

      {/* Table */}
      <LeadsTable leads={leads} loading={loading} onRefresh={fetchAll} />

      {/* Bottom stats */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Sent Outreach"   value={leads.filter(l => l.sent).length}      sub={`of ${total} leads`} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />} />
          <StatCard label="Got Replies"     value={leads.filter(l => l.replied).length}   sub={`${leads.length > 0 ? Math.round(leads.filter(l => l.replied).length / total * 100) : 0}% reply rate`} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />} />
          <StatCard label="Demos Completed" value={leads.filter(l => l.demo).length}      sub="scheduled or held" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />} />
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <AddLeadModal
          onClose={() => setShowAdd(false)}
          onSaved={handleAddSave}
        />
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-black text-portal-muted uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="p-6 rounded-[20px] border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-portal-muted">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
        </div>
        <p className="text-[10px] font-black text-portal-muted uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-[11px] text-portal-muted font-bold opacity-60 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
