import { useState, useMemo } from "react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

const STAGES = [
  { value: "lead", label: "Lead", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "contacted", label: "Sent", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { value: "replied", label: "Replied", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { value: "demo", label: "Demo", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { value: "converted", label: "Converted", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "lost", label: "Lost", color: "bg-red-500/10 text-red-400 border-red-500/20" },
];

const WARMTH_LEVELS = [
  { value: "cold", label: "Cold ❄️", color: "text-blue-300" },
  { value: "warm", label: "Warm ☀️", color: "text-orange-300" },
  { value: "hot", label: "Hot 🔥", color: "text-red-400" },
];

const MOCK_LEADS = [
  {
    id: 1,
    name: "Alex Thompson",
    platform: "LinkedIn",
    role: "Marketing Director",
    niche: "SaaS / Fintech",
    contact: "alex.t@finflow.io",
    audienceSize: "50k+",
    warmth: "hot",
    stage: "demo",
    sent: true,
    replied: true,
    demo: true,
    converted: false,
    notes: "Very interested in the client portal features.",
  },
  {
    id: 2,
    name: "Sarah Chen",
    platform: "Twitter",
    role: "Founder",
    niche: "E-commerce",
    contact: "@sarahc_dev",
    audienceSize: "12k",
    warmth: "warm",
    stage: "contacted",
    sent: true,
    replied: false,
    demo: false,
    converted: false,
    notes: "Followed back, sent DM about project management.",
  },
  {
    id: 3,
    name: "Michael Roberts",
    platform: "Instagram",
    role: "Creative Lead",
    niche: "Design Agency",
    contact: "michael@pixelperfect.com",
    audienceSize: "120k",
    warmth: "cold",
    stage: "lead",
    sent: false,
    replied: false,
    demo: false,
    converted: false,
    notes: "Potential for agency-wide deployment.",
  },
  {
    id: 4,
    name: "Elena Rodriguez",
    platform: "LinkedIn",
    role: "CEO",
    niche: "Consulting",
    contact: "elena@rodriguez.consulting",
    audienceSize: "5k",
    warmth: "hot",
    stage: "converted",
    sent: true,
    replied: true,
    demo: true,
    converted: true,
    notes: "Onboarded for Pro plan.",
  },
];

export function LeadsTable() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [searchTerm, setSearchTerm] = useState("");
  const [warmthFilter, setWarmthFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           lead.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.niche.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWarmth = warmthFilter === "all" || lead.warmth === warmthFilter;
      const matchesStage = stageFilter === "all" || lead.stage === stageFilter;
      return matchesSearch && matchesWarmth && matchesStage;
    });
  }, [leads, searchTerm, warmthFilter, stageFilter]);

  const updateLeadStage = (id, newStage) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        return { 
          ...l, 
          stage: newStage,
          sent: ["contacted", "replied", "demo", "converted"].includes(newStage),
          replied: ["replied", "demo", "converted"].includes(newStage),
          demo: ["demo", "converted"].includes(newStage),
          converted: newStage === "converted"
        };
      }
      return l;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-portal-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search leads by name, role, or niche..."
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="bg-[#151821] border border-white/[0.06] rounded-xl py-2 px-4 text-sm focus:outline-none"
            value={warmthFilter}
            onChange={(e) => setWarmthFilter(e.target.value)}
          >
            <option value="all">All Warmth</option>
            <option value="hot">Hot 🔥</option>
            <option value="warm">Warm ☀️</option>
            <option value="cold">Cold ❄️</option>
          </select>

          <select 
            className="bg-[#151821] border border-white/[0.06] rounded-xl py-2 px-4 text-sm focus:outline-none"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="all">All Stages</option>
            {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <Card className="overflow-hidden border-white/[0.04] p-0 bg-[#0F1115]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-portal-muted">Contact Info</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-portal-muted">Niche & Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-portal-muted">Warmth</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-portal-muted">Pipeline</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-portal-muted">Stage</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-portal-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white mb-0.5">{lead.name}</span>
                      <span className="text-[11px] text-portal-muted flex items-center gap-1.5 font-medium">
                        <span className="opacity-60">{lead.platform}</span>
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="opacity-80">{lead.contact}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-portal-text mb-0.5">{lead.role}</span>
                      <span className="text-[11px] text-portal-muted font-medium opacity-70">{lead.niche}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`text-xs font-black uppercase tracking-tighter ${WARMTH_LEVELS.find(w => w.value === lead.warmth)?.color}`}>
                      {WARMTH_LEVELS.find(w => w.value === lead.warmth)?.label}
                    </div>
                    <span className="text-[10px] text-portal-muted opacity-50 font-bold">{lead.audienceSize} Audience</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <PipelineStep active={lead.sent} label="Sent" />
                      <PipelineStep active={lead.replied} label="Replied" />
                      <PipelineStep active={lead.demo} label="Demo" />
                      <PipelineStep active={lead.converted} label="Won" highlight={lead.converted} />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge className={STAGES.find(s => s.value === lead.stage)?.color}>
                      {STAGES.find(s => s.value === lead.stage)?.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      className="bg-white/[0.02] border border-white/[0.1] rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-1 focus:outline-none hover:border-primary/50 transition-colors"
                      value={lead.stage}
                      onChange={(e) => updateLeadStage(lead.id, e.target.value)}
                    >
                      {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-portal-muted font-medium">No leads match your search filters.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function PipelineStep({ active, label, highlight }) {
  return (
    <div className="flex flex-col items-center gap-1 group/step">
      <div className={`h-2 w-2 rounded-full transition-all duration-500 ${active ? (highlight ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-primary shadow-[0_0_6px_rgba(59,130,246,0.3)]') : 'bg-white/10'}`} />
      <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${active ? 'text-white' : 'text-portal-muted opacity-40'}`}>{label}</span>
    </div>
  );
}
