import { useState, useMemo } from "react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { AddLeadModal } from "./AddLeadModal";
import { leadsService } from "../services/leadsService";

const STAGES = [
  { value: "lead",      label: "Lead",      color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "sent",      label: "Sent",      color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { value: "replied",   label: "Replied",   color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { value: "demo",      label: "Demo",      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { value: "converted", label: "Converted", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "lost",      label: "Lost",      color: "bg-red-500/10 text-red-400 border-red-500/20" },
];

const WARMTH_LABELS = { cold: "Cold ❄️", warm: "Warm ☀️", hot: "Hot 🔥" };
const WARMTH_COLORS = { cold: "text-blue-300", warm: "text-orange-300", hot: "text-red-400" };

export function LeadsTable({ leads, loading, onRefresh }) {
  const [search, setSearch]               = useState("");
  const [warmthFilter, setWarmthFilter]   = useState("all");
  const [stageFilter, setStageFilter]     = useState("all");
  const [editLead, setEditLead]           = useState(null);
  const [deletingId, setDeletingId]       = useState(null);
  const [stageUpdating, setStageUpdating] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(l => {
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.role.toLowerCase().includes(q) || l.niche.toLowerCase().includes(q);
      const matchWarmth = warmthFilter === "all" || l.warmth === warmthFilter;
      const matchStage  = stageFilter  === "all" || l.stage  === stageFilter;
      return matchSearch && matchWarmth && matchStage;
    });
  }, [leads, search, warmthFilter, stageFilter]);

  const handleStageChange = async (lead, newStage) => {
    setStageUpdating(lead.id);
    try {
      await leadsService.update(lead.id, { stage: newStage });
      onRefresh();
    } finally {
      setStageUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await leadsService.destroy(id);
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSave = async (form) => {
    await leadsService.update(editLead.id, form);
    onRefresh();
    setEditLead(null);
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-portal-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, role, or niche…"
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className={sel} value={warmthFilter} onChange={e => setWarmthFilter(e.target.value)}>
            <option value="all">All Warmth</option>
            <option value="hot">Hot 🔥</option>
            <option value="warm">Warm ☀️</option>
            <option value="cold">Cold ❄️</option>
          </select>
          <select className={sel} value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
            <option value="all">All Stages</option>
            {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-white/[0.04] p-0 bg-[#0F1115]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasSearch={!!search || warmthFilter !== "all" || stageFilter !== "all"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                  {["Contact Info", "Niche & Role", "Warmth", "Pipeline", "Stage", "Actions"].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-portal-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(lead => (
                  <tr key={lead.id} className="group hover:bg-white/[0.01] transition-colors">
                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white mb-0.5">{lead.name}</span>
                        <span className="text-[11px] text-portal-muted flex items-center gap-1.5 font-medium">
                          <span className="opacity-60">{lead.platform || "—"}</span>
                          {lead.contact && <><span className="h-1 w-1 rounded-full bg-white/20" /><span className="opacity-80">{lead.contact}</span></>}
                        </span>
                      </div>
                    </td>
                    {/* Niche */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-portal-text mb-0.5">{lead.role || "—"}</span>
                        <span className="text-[11px] text-portal-muted font-medium opacity-70">{lead.niche || "—"}</span>
                      </div>
                    </td>
                    {/* Warmth */}
                    <td className="px-5 py-4">
                      <div className={`text-xs font-black uppercase tracking-tight ${WARMTH_COLORS[lead.warmth]}`}>
                        {WARMTH_LABELS[lead.warmth]}
                      </div>
                      {lead.audience_size && <span className="text-[10px] text-portal-muted opacity-50 font-bold">{lead.audience_size} Audience</span>}
                    </td>
                    {/* Pipeline dots */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <PipelineDot active={lead.sent}      label="Sent" />
                        <PipelineDot active={lead.replied}   label="Reply" />
                        <PipelineDot active={lead.demo}      label="Demo" />
                        <PipelineDot active={lead.converted} label="Won" highlight={lead.converted} />
                      </div>
                    </td>
                    {/* Stage badge */}
                    <td className="px-5 py-4">
                      <Badge className={STAGES.find(s => s.value === lead.stage)?.color}>
                        {STAGES.find(s => s.value === lead.stage)?.label}
                      </Badge>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="bg-white/[0.02] border border-white/[0.1] rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-1 focus:outline-none hover:border-primary/50 transition-colors disabled:opacity-40"
                          value={lead.stage}
                          disabled={stageUpdating === lead.id}
                          onChange={e => handleStageChange(lead, e.target.value)}
                        >
                          {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <button
                          onClick={() => setEditLead(lead)}
                          className="p-1.5 text-portal-muted hover:text-white rounded hover:bg-white/5 transition-colors"
                          title="Edit"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deletingId === lead.id}
                          className="p-1.5 text-portal-muted hover:text-red-400 rounded hover:bg-red-400/5 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit modal */}
      {editLead && (
        <AddLeadModal
          initial={editLead}
          onClose={() => setEditLead(null)}
          onSaved={handleEditSave}
        />
      )}
    </>
  );
}

function PipelineDot({ active, label, highlight }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-2 w-2 rounded-full transition-all ${active ? (highlight ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-primary shadow-[0_0_6px_rgba(59,130,246,0.3)]") : "bg-white/10"}`} />
      <span className={`text-[7px] font-black uppercase tracking-[0.1em] ${active ? "text-white" : "text-portal-muted opacity-40"}`}>{label}</span>
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.99 7.99 0 01-2.343 5.657z" />
        </svg>
      </div>
      <p className="text-sm font-bold text-portal-text mb-1">
        {hasSearch ? "No leads match your filters" : "No leads yet"}
      </p>
      <p className="text-xs text-portal-muted max-w-xs">
        {hasSearch ? "Try adjusting your search or filters." : "Click 'Add Lead' to start tracking your outreach pipeline."}
      </p>
    </div>
  );
}

const sel = "bg-[#151821] border border-white/[0.06] rounded-xl py-2 px-4 text-sm focus:outline-none text-white";
